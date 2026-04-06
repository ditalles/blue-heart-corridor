import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCountryName } from "@/lib/constants/countries";
import { Calendar, MapPin } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Bookings" };

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  confirmed_pay_on_arrival: "bg-amber-100 text-amber-800",
  checked_in: "bg-blue-100 text-blue-800",
  completed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
  no_show: "bg-red-100 text-red-800",
};

export default async function BookingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: bookings } = await supabase
    .from("bookings")
    .select(`
      *,
      hostels:hostel_id (name, slug, city, country),
      rooms:room_id (name, room_type)
    `)
    .eq("traveler_id", user!.id)
    .order("check_in", { ascending: false });

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">My Bookings</h1>

      {bookings && bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const hostel = booking.hostels as unknown as { name: string; slug: string; city: string; country: string };
            const room = booking.rooms as unknown as { name: string; room_type: string };
            return (
              <Card key={booking.id}>
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/hostels/${hostel?.slug}`}
                      className="font-semibold hover:text-primary transition-colors"
                    >
                      {hostel?.name}
                    </Link>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3" />
                      {hostel?.city}, {getCountryName(hostel?.country)}
                    </p>
                    <p className="text-sm mt-1">
                      {room?.name} &middot; {booking.num_guests} guest{booking.num_guests > 1 ? "s" : ""}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(booking.check_in).toLocaleDateString()} — {new Date(booking.check_out).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-bold">&euro;{(booking.total_price_cents / 100).toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">Ref: {booking.booking_ref}</p>
                    </div>
                    <Badge className={statusColors[booking.status] || ""}>
                      {booking.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-muted-foreground">No bookings yet</p>
        </div>
      )}
    </div>
  );
}
