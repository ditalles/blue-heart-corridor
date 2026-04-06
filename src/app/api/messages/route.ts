import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { relayMessage, getOrCreateConversation } from "@/lib/messaging/relay";

// Send a message
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { hostel_id, content } = await request.json();

  if (!hostel_id || !content?.trim()) {
    return NextResponse.json({ error: "hostel_id and content required" }, { status: 400 });
  }

  // Get or create conversation
  const conversationId = await getOrCreateConversation(user.id, hostel_id);
  if (!conversationId) {
    return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 });
  }

  // Determine sender type
  const { data: hostel } = await supabase
    .from("hostels")
    .select("name, owner_id")
    .eq("id", hostel_id)
    .single();

  const senderType = hostel?.owner_id === user.id ? "host" : "traveler";

  // Relay the message
  const result = await relayMessage(conversationId, content.trim(), senderType as "traveler" | "host", hostel?.name || "");

  return NextResponse.json({
    success: result.success,
    conversation_id: conversationId,
    error: result.error,
  });
}

// Get messages for a conversation
export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const hostelId = searchParams.get("hostel_id");
  const conversationId = searchParams.get("conversation_id");

  if (!hostelId && !conversationId) {
    return NextResponse.json({ error: "hostel_id or conversation_id required" }, { status: 400 });
  }

  let convId = conversationId;

  if (!convId && hostelId) {
    const { data } = await supabase
      .from("conversations")
      .select("id")
      .eq("traveler_id", user.id)
      .eq("hostel_id", hostelId)
      .single();
    convId = data?.id;
  }

  if (!convId) {
    return NextResponse.json({ messages: [], conversation_id: null });
  }

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", convId)
    .order("created_at", { ascending: true })
    .limit(100);

  // Mark as read
  await supabase
    .from("conversations")
    .update({ unread_traveler: 0 })
    .eq("id", convId)
    .eq("traveler_id", user.id);

  return NextResponse.json({ messages: messages || [], conversation_id: convId });
}
