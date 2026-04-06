/**
 * BalkanSync — iCal Channel Manager
 *
 * Syncs availability between BalkanHostels and OTAs (Booking.com, Airbnb, Hostelworld)
 * using the iCal protocol (RFC 5545).
 *
 * How it works:
 * 1. Import: Fetch iCal feeds from OTAs → parse booked dates → mark as unavailable
 * 2. Export: Generate iCal feed from BalkanHostels bookings → OTAs import our feed
 * 3. Two-way sync prevents overbookings
 */

interface ICalEvent {
  uid: string;
  summary: string;
  dtstart: string; // YYYYMMDD
  dtend: string;
  description?: string;
}

/**
 * Parse an iCal feed into structured events
 */
export function parseICal(icalText: string): ICalEvent[] {
  const events: ICalEvent[] = [];
  const eventBlocks = icalText.split("BEGIN:VEVENT");

  for (let i = 1; i < eventBlocks.length; i++) {
    const block = eventBlocks[i].split("END:VEVENT")[0];

    const uid = extractField(block, "UID") || `unknown-${i}`;
    const summary = extractField(block, "SUMMARY") || "Booked";
    const dtstart = extractField(block, "DTSTART") || "";
    const dtend = extractField(block, "DTEND") || "";
    const description = extractField(block, "DESCRIPTION");

    if (dtstart) {
      events.push({
        uid,
        summary,
        dtstart: normalizeDate(dtstart),
        dtend: normalizeDate(dtend || dtstart),
        description: description || undefined,
      });
    }
  }

  return events;
}

/**
 * Generate an iCal feed from bookings
 */
export function generateICal(
  roomName: string,
  bookings: Array<{
    booking_ref: string;
    check_in: string;
    check_out: string;
    guest_name: string;
  }>
): string {
  const events = bookings.map(
    (b) => `BEGIN:VEVENT
UID:${b.booking_ref}@balkanhostels.com
DTSTART;VALUE=DATE:${formatICalDate(b.check_in)}
DTEND;VALUE=DATE:${formatICalDate(b.check_out)}
SUMMARY:${b.guest_name} - BalkanHostels
DESCRIPTION:Booking ${b.booking_ref} via BalkanHostels
STATUS:CONFIRMED
END:VEVENT`
  );

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//BalkanHostels//BalkanSync//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:${roomName} - BalkanHostels
${events.join("\n")}
END:VCALENDAR`;
}

/**
 * Fetch and parse an external iCal feed
 */
export async function fetchExternalCalendar(
  url: string
): Promise<{ events: ICalEvent[]; error?: string }> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "BalkanSync/1.0" },
    });

    if (!res.ok) {
      return { events: [], error: `HTTP ${res.status}` };
    }

    const text = await res.text();
    const events = parseICal(text);
    return { events };
  } catch (err) {
    return { events: [], error: "Failed to fetch calendar" };
  }
}

/**
 * Get blocked dates from external calendars
 * Returns a set of date strings (YYYY-MM-DD) that are booked externally
 */
export function getBlockedDates(events: ICalEvent[]): Set<string> {
  const blocked = new Set<string>();

  for (const event of events) {
    const start = parseICalDate(event.dtstart);
    const end = parseICalDate(event.dtend);

    if (!start || !end) continue;

    const current = new Date(start);
    while (current < end) {
      blocked.add(current.toISOString().split("T")[0]);
      current.setDate(current.getDate() + 1);
    }
  }

  return blocked;
}

// Helper functions
function extractField(block: string, field: string): string | null {
  // Handle folded lines (RFC 5545 line folding)
  const unfolded = block.replace(/\r?\n[ \t]/g, "");
  const regex = new RegExp(`^${field}[;:](.*)$`, "m");
  const match = unfolded.match(regex);
  if (!match) return null;

  // Remove VALUE=DATE: prefix if present
  let value = match[1];
  value = value.replace(/^VALUE=DATE:/i, "");
  return value.trim();
}

function normalizeDate(dateStr: string): string {
  // Convert various iCal date formats to YYYYMMDD
  return dateStr.replace(/[-T:Z]/g, "").substring(0, 8);
}

function formatICalDate(dateStr: string): string {
  // Convert YYYY-MM-DD to YYYYMMDD
  return dateStr.replace(/-/g, "");
}

function parseICalDate(dateStr: string): Date | null {
  if (dateStr.length < 8) return null;
  const year = parseInt(dateStr.substring(0, 4));
  const month = parseInt(dateStr.substring(4, 6)) - 1;
  const day = parseInt(dateStr.substring(6, 8));
  return new Date(year, month, day);
}
