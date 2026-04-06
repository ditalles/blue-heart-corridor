import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { parseViberWebhook } from "@/lib/messaging/viber";
import { parseWhatsAppWebhook } from "@/lib/messaging/whatsapp";
import { relayMessage } from "@/lib/messaging/relay";

// Webhook handler for incoming WhatsApp/Viber messages
export async function POST(request: Request) {
  const body = await request.json();
  const source = request.headers.get("x-message-source") || detectSource(body);

  const supabase = await createServiceClient();

  if (source === "viber") {
    const parsed = parseViberWebhook(body);
    if (!parsed || parsed.type !== "message" || !parsed.senderId || !parsed.message) {
      return NextResponse.json({ status: "ok" });
    }

    // Find the host's conversation by viber_id
    const { data: prefs } = await supabase
      .from("host_channel_preferences")
      .select("hostel_id")
      .eq("viber_id", parsed.senderId)
      .single();

    if (!prefs) {
      return NextResponse.json({ status: "unknown_sender" });
    }

    // Find the most recent active conversation for this hostel
    const { data: conversation } = await supabase
      .from("conversations")
      .select("id")
      .eq("hostel_id", prefs.hostel_id)
      .eq("status", "active")
      .order("last_message_at", { ascending: false })
      .limit(1)
      .single();

    if (conversation) {
      const { data: hostel } = await supabase
        .from("hostels")
        .select("name")
        .eq("id", prefs.hostel_id)
        .single();

      await relayMessage(conversation.id, parsed.message, "host", hostel?.name || "");
    }

    return NextResponse.json({ status: "ok" });
  }

  if (source === "whatsapp") {
    // WhatsApp webhook verification (GET is handled by next route, POST for messages)
    const parsed = parseWhatsAppWebhook(body);
    if (!parsed) {
      return NextResponse.json({ status: "ok" });
    }

    // Find traveler by phone number — would need phone stored on profile
    // For now, log and acknowledge
    console.log("[Webhook] WhatsApp message from:", parsed.from, parsed.message);

    return NextResponse.json({ status: "ok" });
  }

  return NextResponse.json({ status: "unknown_source" });
}

// WhatsApp webhook verification (GET)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}

function detectSource(body: Record<string, unknown>): string {
  if (body.event && body.sender) return "viber";
  if (body.object === "whatsapp_business_account") return "whatsapp";
  return "unknown";
}
