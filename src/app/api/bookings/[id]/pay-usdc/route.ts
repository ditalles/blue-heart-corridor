import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { createBookingPayment, verifyPayment } from "@/lib/payments/solana";

// Generate USDC payment request for a booking
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: bookingId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get booking
  const { data: booking } = await supabase
    .from("bookings")
    .select("*, hostels:hostel_id (name, metadata)")
    .eq("id", bookingId)
    .eq("traveler_id", user.id)
    .single();

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (booking.status !== "confirmed_pay_on_arrival" && booking.status !== "pending") {
    return NextResponse.json({ error: "Booking not in payable state" }, { status: 400 });
  }

  const hostel = booking.hostels as unknown as { name: string; metadata: Record<string, string> };
  const hostelWallet = hostel?.metadata?.solana_wallet;

  const payment = createBookingPayment(
    booking.booking_ref,
    booking.total_price_cents,
    hostel?.name || "BalkanHostels",
    hostelWallet
  );

  // Store payment reference on booking
  const serviceClient = await createServiceClient();
  await serviceClient
    .from("bookings")
    .update({
      metadata: { usdc_reference: payment.reference, usdc_amount: payment.amountUSDC },
      updated_at: new Date().toISOString(),
    })
    .eq("id", bookingId);

  return NextResponse.json({
    pay_url: payment.payUrl,
    qr_data: payment.qrData,
    amount_usdc: payment.amountUSDC,
    reference: payment.reference,
  });
}

// Verify USDC payment
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: bookingId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: booking } = await supabase
    .from("bookings")
    .select("booking_ref, status")
    .eq("id", bookingId)
    .single();

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const result = await verifyPayment(booking.booking_ref);

  if (result.verified) {
    // Update booking status
    const serviceClient = await createServiceClient();
    await serviceClient
      .from("bookings")
      .update({
        status: "confirmed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId);

    return NextResponse.json({
      verified: true,
      signature: result.signature,
      status: "confirmed",
    });
  }

  return NextResponse.json({
    verified: false,
    status: booking.status,
  });
}
