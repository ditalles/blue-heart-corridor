/**
 * WhatsApp Business Cloud API Client
 * Docs: https://developers.facebook.com/docs/whatsapp/cloud-api
 */

const WHATSAPP_API_URL = "https://graph.facebook.com/v18.0";
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || "";
const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || "";

export async function sendWhatsAppMessage(
  recipientPhone: string,
  text: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_ID) {
    console.warn("[WhatsApp] Not configured — message not sent");
    return { success: false, error: "WhatsApp not configured" };
  }

  // Ensure phone number has country code, no +
  const phone = recipientPhone.replace(/\D/g, "");

  try {
    const res = await fetch(
      `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: phone,
          type: "text",
          text: { body: text },
        }),
      }
    );

    const data = await res.json();

    if (data.messages?.[0]?.id) {
      return { success: true, messageId: data.messages[0].id };
    }

    return {
      success: false,
      error: data.error?.message || "Unknown error",
    };
  } catch (err) {
    console.error("[WhatsApp] Send error:", err);
    return { success: false, error: "Network error" };
  }
}

export async function sendWhatsAppTemplate(
  recipientPhone: string,
  templateName: string,
  parameters: string[]
): Promise<{ success: boolean; error?: string }> {
  if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_ID) {
    return { success: false, error: "WhatsApp not configured" };
  }

  const phone = recipientPhone.replace(/\D/g, "");

  try {
    const res = await fetch(
      `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: phone,
          type: "template",
          template: {
            name: templateName,
            language: { code: "en" },
            components: [
              {
                type: "body",
                parameters: parameters.map((p) => ({
                  type: "text",
                  text: p,
                })),
              },
            ],
          },
        }),
      }
    );

    const data = await res.json();
    return { success: !!data.messages?.[0]?.id, error: data.error?.message };
  } catch {
    return { success: false, error: "Network error" };
  }
}

export function parseWhatsAppWebhook(body: Record<string, unknown>): {
  from: string;
  message: string;
  messageId: string;
  timestamp: number;
} | null {
  try {
    const entry = (body.entry as Array<Record<string, unknown>>)?.[0];
    const changes = (entry?.changes as Array<Record<string, unknown>>)?.[0];
    const value = changes?.value as Record<string, unknown>;
    const messages = value?.messages as Array<Record<string, unknown>>;

    if (!messages?.length) return null;

    const msg = messages[0];
    return {
      from: msg.from as string,
      message: (msg.text as Record<string, string>)?.body || "",
      messageId: msg.id as string,
      timestamp: Number(msg.timestamp),
    };
  } catch {
    return null;
  }
}
