import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { createServiceClient } from "@/lib/supabase/server";
import Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const serviceClient = await createServiceClient();

  switch (event.type) {
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const bookingRef = paymentIntent.metadata.booking_ref;

      if (bookingRef) {
        await serviceClient
          .from("bookings")
          .update({ status: "confirmed", updated_at: new Date().toISOString() })
          .eq("booking_ref", bookingRef);
      }
      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const bookingRef = paymentIntent.metadata.booking_ref;

      if (bookingRef) {
        await serviceClient
          .from("bookings")
          .update({ status: "cancelled", cancelled_at: new Date().toISOString(), updated_at: new Date().toISOString() })
          .eq("booking_ref", bookingRef);
      }
      break;
    }

    case "account.updated": {
      const account = event.data.object as Stripe.Account;
      if (account.charges_enabled && account.details_submitted) {
        await serviceClient
          .from("hostels")
          .update({ updated_at: new Date().toISOString() })
          .eq("stripe_account_id", account.id);
      }
      break;
    }

    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const hostelId = subscription.metadata.hostel_id;

      if (hostelId) {
        const tier = subscription.metadata.tier || "verified";
        const commissionRate = tier === "featured" ? 1.0 : tier === "verified" ? 2.0 : 5.0;

        await serviceClient
          .from("hostel_subscriptions")
          .upsert({
            hostel_id: hostelId,
            tier,
            stripe_subscription_id: subscription.id,
            status: subscription.status === "active" ? "active" : "past_due",
            current_period_start: new Date((subscription as unknown as { current_period_start: number }).current_period_start * 1000).toISOString(),
            current_period_end: new Date((subscription as unknown as { current_period_end: number }).current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          });

        await serviceClient
          .from("hostels")
          .update({
            subscription_tier: tier,
            commission_rate: commissionRate,
            is_verified: tier !== "free",
            updated_at: new Date().toISOString(),
          })
          .eq("id", hostelId);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const hostelId = subscription.metadata.hostel_id;

      if (hostelId) {
        await serviceClient
          .from("hostel_subscriptions")
          .update({ tier: "free", status: "cancelled", updated_at: new Date().toISOString() })
          .eq("hostel_id", hostelId);

        await serviceClient
          .from("hostels")
          .update({
            subscription_tier: "free",
            commission_rate: 5.0,
            is_verified: false,
            updated_at: new Date().toISOString(),
          })
          .eq("id", hostelId);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
