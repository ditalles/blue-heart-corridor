import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { fetchExternalCalendar, getBlockedDates } from "@/lib/sync/ical";

// Sync external iCal calendars into our availability
// POST /api/hostels/[id]/availability/sync
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: hostelId } = await params;
  const supabase = await createClient();

  // Verify ownership
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: hostel } = await supabase
    .from("hostels")
    .select("id, owner_id")
    .eq("id", hostelId)
    .eq("owner_id", user.id)
    .single();

  if (!hostel) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { room_id, ical_url } = await request.json();

  if (!room_id || !ical_url) {
    return NextResponse.json({ error: "room_id and ical_url required" }, { status: 400 });
  }

  // Fetch external calendar
  const { events, error } = await fetchExternalCalendar(ical_url);

  if (error) {
    return NextResponse.json({ error: `Failed to fetch calendar: ${error}` }, { status: 400 });
  }

  // Get blocked dates from external bookings
  const blockedDates = getBlockedDates(events);

  if (blockedDates.size === 0) {
    return NextResponse.json({ synced: 0, message: "No external bookings found" });
  }

  // Update availability in our database
  const serviceClient = await createServiceClient();
  let synced = 0;

  for (const date of blockedDates) {
    // Check if we have an availability row for this date
    const { data: existing } = await serviceClient
      .from("availability")
      .select("id, total_beds, booked_beds")
      .eq("room_id", room_id)
      .eq("date", date)
      .single();

    if (existing) {
      // Mark as fully booked (external booking)
      await serviceClient
        .from("availability")
        .update({
          booked_beds: existing.total_beds,
          is_blocked: true,
        })
        .eq("id", existing.id);
      synced++;
    } else {
      // Get room capacity for creating new availability row
      const { data: room } = await serviceClient
        .from("rooms")
        .select("capacity, base_price_cents")
        .eq("id", room_id)
        .single();

      if (room) {
        await serviceClient.from("availability").insert({
          room_id,
          date,
          total_beds: room.capacity,
          booked_beds: room.capacity,
          price_cents: room.base_price_cents,
          is_blocked: true,
        });
        synced++;
      }
    }
  }

  return NextResponse.json({
    synced,
    total_external_bookings: events.length,
    blocked_dates: blockedDates.size,
  });
}
