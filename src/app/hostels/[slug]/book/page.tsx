"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, CreditCard, Shield, ArrowLeft, Banknote } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import Link from "next/link";

interface BookingPageProps {
  params: Promise<{ slug: string }>;
}

export default function BookingPage({ params }: BookingPageProps) {
  return (
    <Suspense fallback={<div className="container py-20 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></div>}>
      <BookingForm params={params} />
    </Suspense>
  );
}

function BookingForm({ params }: BookingPageProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  const roomId = searchParams.get("room");
  const checkin = searchParams.get("checkin") || "";
  const checkout = searchParams.get("checkout") || "";

  const [hostel, setHostel] = useState<{ id: string; name: string; city: string; slug: string; has_stripe: boolean } | null>(null);
  const [room, setRoom] = useState<{ id: string; name: string; base_price_cents: number; room_type: string } | null>(null);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [checkIn, setCheckIn] = useState(checkin);
  const [checkOut, setCheckOut] = useState(checkout);
  const [numGuests, setNumGuests] = useState(1);
  const [specialRequests, setSpecialRequests] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const resolvedParams = await params;

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push(`/auth/login?redirect=/hostels/${resolvedParams.slug}/book?room=${roomId}`);
        return;
      }

      // Get user profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("name, email")
        .eq("id", user.id)
        .single();
      if (profile) {
        setGuestName(profile.name);
        setGuestEmail(profile.email);
      }

      // Get hostel
      const { data: hostelData } = await supabase
        .from("hostels")
        .select("id, name, city, slug, stripe_account_id")
        .eq("slug", resolvedParams.slug)
        .single();
      if (hostelData) {
        setHostel({
          id: hostelData.id,
          name: hostelData.name,
          city: hostelData.city,
          slug: hostelData.slug,
          has_stripe: !!hostelData.stripe_account_id,
        });
      }

      // Get room
      if (roomId) {
        const { data: roomData } = await supabase
          .from("rooms")
          .select("id, name, base_price_cents, room_type")
          .eq("id", roomId)
          .single();
        setRoom(roomData);
      }

      setInitialLoading(false);
    }
    loadData();
  }, [params, roomId, router, supabase]);

  const nights =
    checkIn && checkOut
      ? Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))
      : 0;

  const totalCents = room ? room.base_price_cents * nights * numGuests : 0;

  const handleBooking = async () => {
    if (!hostel || !room || !checkIn || !checkOut) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hostel_id: hostel.id,
          room_id: room.id,
          check_in: checkIn,
          check_out: checkOut,
          num_guests: numGuests,
          guest_name: guestName,
          guest_email: guestEmail,
          special_requests: specialRequests || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to create booking");
        setLoading(false);
        return;
      }

      // Redirect to payment or confirmation
      if (data.clientSecret) {
        // TODO: Stripe payment flow
        toast.success("Booking created! Redirecting to payment...");
        router.push(`/dashboard/bookings`);
      } else if (data.payment_method === "pay_at_property") {
        toast.success(`Reservation confirmed! Reference: ${data.booking_ref}. Pay at check-in.`);
        router.push(`/dashboard/bookings`);
      } else {
        toast.success(`Booking confirmed! Reference: ${data.booking_ref}`);
        router.push(`/dashboard/bookings`);
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="container py-20 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-3xl">
      <Link
        href={`/hostels/${hostel?.slug}`}
        className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-6"
      >
        <ArrowLeft className="h-3 w-3" /> Back to {hostel?.name}
      </Link>

      <h1 className="text-2xl font-bold mb-6">Complete Your Booking</h1>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Booking Form */}
        <div className="md:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dates & Guests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Check-in</Label>
                  <Input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Check-out</Label>
                  <Input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    min={checkIn || new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Number of Guests</Label>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={numGuests}
                  onChange={(e) => setNumGuests(Number(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Guest Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Special Requests (optional)</Label>
                <Textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Any special requests for the hostel..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Button
            size="lg"
            className="w-full"
            onClick={handleBooking}
            disabled={loading || !checkIn || !checkOut || !guestName || !guestEmail}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : hostel?.has_stripe ? (
              <CreditCard className="mr-2 h-4 w-4" />
            ) : (
              <Banknote className="mr-2 h-4 w-4" />
            )}
            {loading
              ? "Processing..."
              : hostel?.has_stripe
                ? `Pay Now — €${(totalCents / 100).toFixed(2)}`
                : `Reserve Now — Pay at Property`}
          </Button>

          {hostel?.has_stripe ? (
            <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
              <Shield className="h-3 w-3" /> Secure payment powered by Stripe
            </p>
          ) : (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 text-center">
              <p className="font-medium">Pay at Check-in</p>
              <p className="text-xs mt-1">
                This hostel accepts payment on arrival. Your reservation will be confirmed immediately
                and you will pay the total of &euro;{(totalCents / 100).toFixed(2)} when you check in.
              </p>
            </div>
          )}
        </div>

        {/* Booking Summary */}
        <div className="md:col-span-2">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="text-lg">Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-semibold">{hostel?.name}</p>
                <p className="text-sm text-muted-foreground">{hostel?.city}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium">{room?.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{room?.room_type}</p>
              </div>
              {nights > 0 && (
                <>
                  <Separator />
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        &euro;{((room?.base_price_cents ?? 0) / 100).toFixed(2)} x {nights} night{nights !== 1 ? "s" : ""}
                        {numGuests > 1 ? ` x ${numGuests} guests` : ""}
                      </span>
                      <span>&euro;{(totalCents / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-green-600">
                      <span>Booking fee</span>
                      <span>Free!</span>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>&euro;{(totalCents / 100).toFixed(2)}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
