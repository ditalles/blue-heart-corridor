import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { reviewSchema } from "@/lib/validators/booking";

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Verify the booking belongs to this user and is completed
  const { data: booking } = await supabase
    .from("bookings")
    .select("id, hostel_id, traveler_id, status, check_out")
    .eq("id", parsed.data.booking_id)
    .single();

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (booking.traveler_id !== user.id) {
    return NextResponse.json({ error: "Not your booking" }, { status: 403 });
  }

  if (!["completed", "confirmed", "checked_in"].includes(booking.status)) {
    return NextResponse.json({ error: "Booking must be completed to review" }, { status: 400 });
  }

  // Check if review already exists
  const { data: existingReview } = await supabase
    .from("reviews")
    .select("id")
    .eq("booking_id", parsed.data.booking_id)
    .single();

  if (existingReview) {
    return NextResponse.json({ error: "Already reviewed" }, { status: 409 });
  }

  const { data: review, error } = await supabase
    .from("reviews")
    .insert({
      ...parsed.data,
      traveler_id: user.id,
      hostel_id: booking.hostel_id,
    })
    .select()
    .single();

  if (error) {
    console.error("Review creation error:", error);
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
  }

  return NextResponse.json(review, { status: 201 });
}
