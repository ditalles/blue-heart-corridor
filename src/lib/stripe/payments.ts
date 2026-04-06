import { stripe } from "./client";

interface CreateBookingPaymentParams {
  amountCents: number;
  commissionCents: number;
  currency: string;
  hostelStripeAccountId: string;
  bookingRef: string;
  customerEmail: string;
  hostelName: string;
}

export async function createBookingPaymentIntent({
  amountCents,
  commissionCents,
  currency,
  hostelStripeAccountId,
  bookingRef,
  customerEmail,
  hostelName,
}: CreateBookingPaymentParams) {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountCents,
    currency: currency.toLowerCase(),
    capture_method: "manual",
    application_fee_amount: commissionCents,
    transfer_data: {
      destination: hostelStripeAccountId,
    },
    metadata: {
      booking_ref: bookingRef,
    },
    receipt_email: customerEmail,
    description: `Booking ${bookingRef} at ${hostelName}`,
  });

  return {
    clientSecret: paymentIntent.client_secret!,
    paymentIntentId: paymentIntent.id,
  };
}

export async function capturePayment(paymentIntentId: string) {
  return stripe.paymentIntents.capture(paymentIntentId);
}

export async function cancelPayment(paymentIntentId: string) {
  return stripe.paymentIntents.cancel(paymentIntentId);
}

export async function createRefund(
  paymentIntentId: string,
  amountCents?: number
) {
  return stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount: amountCents,
  });
}
