import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Calendar, MapPin, Star, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  // Get upcoming bookings
  const { data: bookings } = await supabase
    .from("bookings")
    .select(`
      *,
      hostels:hostel_id (name, slug, city, country),
      rooms:room_id (name, room_type)
    `)
    .eq("traveler_id", user!.id)
    .in("status", ["confirmed", "pending"])
    .order("check_in", { ascending: true })
    .limit(5);

  // Get past bookings that need reviews
  const { data: reviewableBookings } = await supabase
    .from("bookings")
    .select(`
      id, booking_ref, hostel_id, check_out,
      hostels:hostel_id (name, slug),
      reviews:id (id)
    `)
    .eq("traveler_id", user!.id)
    .in("status", ["completed", "confirmed"])
    .lt("check_out", new Date().toISOString().split("T")[0])
    .limit(5);

  const needsReview = reviewableBookings?.filter((b) => !b.reviews?.length) ?? [];

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {profile?.name}</h1>
          <p className="text-muted-foreground">Here&apos;s what&apos;s happening with your trips</p>
        </div>
        {profile?.role === "owner" && (
          <Button asChild>
            <Link href="/manage/hostels">Manage Hostels <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upcoming Bookings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Upcoming Stays</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/bookings">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {bookings && bookings.length > 0 ? (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {(booking.hostels as unknown as { name: string })?.name}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(booking.check_in).toLocaleDateString()} — {new Date(booking.check_out).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={booking.status === "confirmed" ? "default" : "secondary"}>
                      {booking.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-10 w-10 mx-auto mb-2 opacity-20" />
                <p>No upcoming bookings</p>
                <Button variant="link" asChild className="mt-2">
                  <Link href="/hostels">Find a hostel</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Review Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Leave a Review</CardTitle>
          </CardHeader>
          <CardContent>
            {needsReview.length > 0 ? (
              <div className="space-y-4">
                {needsReview.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">
                        {(booking.hostels as unknown as { name: string })?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">Ref: {booking.booking_ref}</p>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/dashboard/reviews?booking=${booking.id}`}>
                        <Star className="h-3 w-3 mr-1" /> Review
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Star className="h-10 w-10 mx-auto mb-2 opacity-20" />
                <p>No reviews pending</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
