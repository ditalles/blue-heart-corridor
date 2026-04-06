/**
 * Viber Business API Client
 * Docs: https://developers.viber.com/docs/api/rest-bot-api/
 */

const VIBER_API_URL = "https://chatapi.viber.com/pa";
const VIBER_AUTH_TOKEN = process.env.VIBER_AUTH_TOKEN || "";

interface ViberMessage {
  receiver: string;
  type: "text";
  text: string;
  sender?: {
    name: string;
    avatar?: string;
  };
}

export async function sendViberMessage(
  receiverId: string,
  text: string,
  senderName: string = "BalkanHostels"
): Promise<{ success: boolean; messageToken?: string; error?: string }> {
  if (!VIBER_AUTH_TOKEN) {
    console.warn("[Viber] No auth token configured — message not sent");
    return { success: false, error: "Viber not configured" };
  }

  const message: ViberMessage = {
    receiver: receiverId,
    type: "text",
    text,
    sender: { name: senderName },
  };

  try {
    const res = await fetch(`${VIBER_API_URL}/send_message`, {
      method: "POST",
      headers: {
        "X-Viber-Auth-Token": VIBER_AUTH_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    const data = await res.json();

    if (data.status === 0) {
      return { success: true, messageToken: data.message_token?.toString() };
    }

    return { success: false, error: data.status_message };
  } catch (err) {
    console.error("[Viber] Send error:", err);
    return { success: false, error: "Network error" };
  }
}

export async function setViberWebhook(webhookUrl: string): Promise<boolean> {
  if (!VIBER_AUTH_TOKEN) return false;

  try {
    const res = await fetch(`${VIBER_API_URL}/set_webhook`, {
      method: "POST",
      headers: {
        "X-Viber-Auth-Token": VIBER_AUTH_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: webhookUrl,
        event_types: ["message", "delivered", "seen"],
      }),
    });

    const data = await res.json();
    return data.status === 0;
  } catch {
    return false;
  }
}

export function parseViberWebhook(body: Record<string, unknown>): {
  type: string;
  senderId?: string;
  message?: string;
  timestamp?: number;
} | null {
  const event = body.event as string;

  if (event === "message") {
    return {
      type: "message",
      senderId: (body.sender as Record<string, string>)?.id,
      message: (body.message as Record<string, string>)?.text,
      timestamp: body.timestamp as number,
    };
  }

  if (event === "delivered" || event === "seen") {
    return { type: event };
  }

  return null;
}
