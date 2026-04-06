import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hostelSchema } from "@/lib/validators/hostel";

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify owner role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "owner" && profile.role !== "admin")) {
    return NextResponse.json({ error: "Not authorized as hostel owner" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = hostelSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { amenity_ids, ...hostelData } = parsed.data;

  // Generate slug
  const slug = `${hostelData.name}-${hostelData.city}`
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .substring(0, 200);

  // Check slug uniqueness
  const { data: existing } = await supabase
    .from("hostels")
    .select("id")
    .eq("slug", slug)
    .single();

  const finalSlug = existing ? `${slug}-${Date.now().toString(36)}` : slug;

  // Create hostel
  const { data: hostel, error } = await supabase
    .from("hostels")
    .insert({
      ...hostelData,
      owner_id: user.id,
      slug: finalSlug,
      status: "pending_review",
    })
    .select()
    .single();

  if (error) {
    console.error("Hostel creation error:", error);
    return NextResponse.json({ error: "Failed to create hostel" }, { status: 500 });
  }

  // Add amenities
  if (amenity_ids.length > 0) {
    await supabase.from("hostel_amenities").insert(
      amenity_ids.map((amenity_id) => ({
        hostel_id: hostel.id,
        amenity_id,
      }))
    );
  }

  return NextResponse.json(hostel, { status: 201 });
}
