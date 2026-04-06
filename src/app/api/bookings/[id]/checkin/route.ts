import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: bookingId } = await params;
  const body = await request.json();
  const { booking_ref } = body;

  if (!booking_ref || typeof booking_ref !== "string") {
    return NextResponse.json(
      { error: "booking_ref is required" },
      { status: 400 }
    );
  }

  const serviceClient = await createServiceClient();

  // Look up the booking by ID and verify the reference matches
  const { data: booking, error: fetchError } = await serviceClient
    .from("bookings")
    .select(`
      id, booking_ref, guest_name, guest_email, check_in, check_out,
      num_guests, total_price_cents, currency, status,
      hostels:hostel_id (name, slug),
      rooms:room_id (name, room_type)
    `)
    .eq("id", bookingId)
    .eq("booking_ref", booking_ref.toUpperCase().trim())
    .single();

  if (fetchError || !booking) {
    return NextResponse.json(
      { error: "Booking not found. Please check your reference code." },
      { status: 404 }
    );
  }

  // Only allow check-in for confirmed or confirmed_pay_on_arrival bookings
  if (
    booking.status !== "confirmed" &&
    booking.status !== "confirmed_pay_on_arrival"
  ) {
    return NextResponse.json(
      {
        error: `Cannot check in. Booking status is "${booking.status}".`,
      },
      { status: 400 }
    );
  }

  // Update status to checked_in
  const { error: updateError } = await serviceClient
    .from("bookings")
    .update({ status: "checked_in", updated_at: new Date().toISOString() })
    .eq("id", bookingId);

  if (updateError) {
    console.error("Check-in update error:", updateError);
    return NextResponse.json(
      { error: "Failed to update booking status" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    booking: {
      ...booking,
      status: "checked_in",
    },
  });
}
