import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { roomSchema } from "@/lib/validators/hostel";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: hostelId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify ownership
  const { data: hostel } = await supabase
    .from("hostels")
    .select("id")
    .eq("id", hostelId)
    .eq("owner_id", user.id)
    .single();

  if (!hostel) {
    return NextResponse.json({ error: "Hostel not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = roomSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { data: room, error } = await supabase
    .from("rooms")
    .insert({
      ...parsed.data,
      hostel_id: hostelId,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to create room" }, { status: 500 });
  }

  return NextResponse.json(room, { status: 201 });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: hostelId } = await params;
  const supabase = await createClient();

  const { data: rooms } = await supabase
    .from("rooms")
    .select("*")
    .eq("hostel_id", hostelId)
    .order("created_at");

  return NextResponse.json(rooms ?? []);
}
