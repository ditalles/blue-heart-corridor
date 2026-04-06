import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { createBookingPaymentIntent } from "@/lib/stripe/payments";
import { bookingSchema } from "@/lib/validators/booking";

export async function POST(request: Request) {
  const supabase = await createClient();

  // Verify auth
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { hostel_id, room_id, check_in, check_out, num_guests, guest_name, guest_email, special_requests } = parsed.data;

  // Use service client for transactional operations
  const serviceClient = await createServiceClient();

  // Get hostel info
  const { data: hostel } = await serviceClient
    .from("hostels")
    .select("id, name, commission_rate, stripe_account_id, status")
    .eq("id", hostel_id)
    .single();

  if (!hostel || hostel.status !== "active") {
    return NextResponse.json({ error: "Hostel not found or inactive" }, { status: 404 });
  }

  // Get room info
  const { data: room } = await serviceClient
    .from("rooms")
    .select("id, base_price_cents, capacity")
    .eq("id", room_id)
    .eq("hostel_id", hostel_id)
    .eq("is_active", true)
    .single();

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  // Check availability for date range
  const checkInDate = new Date(check_in);
  const checkOutDate = new Date(check_out);
  const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / 86400000);

  if (nights < 1) {
    return NextResponse.json({ error: "Check-out must be after check-in" }, { status: 400 });
  }

  // Calculate pricing
  const totalPriceCents = room.base_price_cents * nights * num_guests;
  const commissionCents = Math.round(totalPriceCents * (Number(hostel.commission_rate) / 100));
  const hostelPayoutCents = totalPriceCents - commissionCents;

  // Generate booking reference
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let bookingRef = "BK-";
  for (let i = 0; i < 6; i++) {
    bookingRef += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  // Create booking
  const { data: booking, error: bookingError } = await serviceClient
    .from("bookings")
    .insert({
      booking_ref: bookingRef,
      traveler_id: user.id,
      hostel_id,
      room_id,
      check_in,
      check_out,
      num_guests,
      total_price_cents: totalPriceCents,
      commission_cents: commissionCents,
      hostel_payout_cents: hostelPayoutCents,
      currency: "EUR",
      status: hostel.stripe_account_id ? "pending" : "confirmed_pay_on_arrival",
      guest_name,
      guest_email,
      special_requests: special_requests || null,
    })
    .select()
    .single();

  if (bookingError) {
    console.error("Booking creation error:", bookingError);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }

  // If hostel has Stripe, create payment intent
  if (hostel.stripe_account_id) {
    try {
      const { clientSecret, paymentIntentId } = await createBookingPaymentIntent({
        amountCents: totalPriceCents,
        commissionCents,
        currency: "EUR",
        hostelStripeAccountId: hostel.stripe_account_id,
        bookingRef,
        customerEmail: guest_email,
        hostelName: hostel.name,
      });

      // Update booking with payment intent ID
      await serviceClient
        .from("bookings")
        .update({ stripe_payment_intent_id: paymentIntentId })
        .eq("id", booking.id);

      return NextResponse.json({
        booking_ref: bookingRef,
        clientSecret,
        booking_id: booking.id,
      });
    } catch (err) {
      console.error("Stripe error:", err);
      // Rollback booking
      await serviceClient.from("bookings").delete().eq("id", booking.id);
      return NextResponse.json({ error: "Payment setup failed" }, { status: 500 });
    }
  }

  // No Stripe — pay at property
  return NextResponse.json({
    booking_ref: bookingRef,
    booking_id: booking.id,
    status: "confirmed_pay_on_arrival",
    payment_method: "pay_at_property",
  });
}
