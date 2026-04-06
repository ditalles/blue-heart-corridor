import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateICal } from "@/lib/sync/ical";

// Export iCal feed for a room (OTAs import this)
// GET /api/hostels/[id]/availability/ical?room_id=xxx
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: hostelId } = await params;
  const { searchParams } = new URL(request.url);
  const roomId = searchParams.get("room_id");

  if (!roomId) {
    return NextResponse.json({ error: "room_id required" }, { status: 400 });
  }

  const supabase = await createClient();

  // Get room info
  const { data: room } = await supabase
    .from("rooms")
    .select("name, hostel_id")
    .eq("id", roomId)
    .eq("hostel_id", hostelId)
    .single();

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  // Get confirmed bookings for this room
  const { data: bookings } = await supabase
    .from("bookings")
    .select("booking_ref, check_in, check_out, guest_name")
    .eq("room_id", roomId)
    .in("status", ["confirmed", "confirmed_pay_on_arrival", "checked_in"])
    .gte("check_out", new Date().toISOString().split("T")[0]);

  const ical = generateICal(room.name, bookings || []);

  return new Response(ical, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${roomId}.ics"`,
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}
