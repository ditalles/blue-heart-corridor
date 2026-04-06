"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  CheckCircle,
  Wifi,
  Clock,
  Calendar,
  Users,
  BedDouble,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface CheckinPageProps {
  params: Promise<{ slug: string }>;
}

interface Hostel {
  id: string;
  name: string;
  slug: string;
  check_in_from: string;
  check_in_until: string;
  check_out_until: string;
  metadata: Record<string, unknown> | null;
  hostel_amenities: Array<{ amenities: { name: string; icon: string } }>;
}

interface BookingResult {
  id: string;
  booking_ref: string;
  guest_name: string;
  check_in: string;
  check_out: string;
  num_guests: number;
  total_price_cents: number;
  currency: string;
  status: string;
  hostels: { name: string; slug: string };
  rooms: { name: string; room_type: string };
}

export default function CheckinPage({ params }: CheckinPageProps) {
  const supabase = createClient();
  const [hostel, setHostel] = useState<Hostel | null>(null);
  const [bookingRef, setBookingRef] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [checkedIn, setCheckedIn] = useState<BookingResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const { slug } = await params;
      const { data } = await supabase
        .from("hostels")
        .select(`
          id, name, slug, check_in_from, check_in_until, check_out_until, metadata,
          hostel_amenities (
            amenities (name, icon)
          )
        `)
        .eq("slug", slug)
        .eq("status", "active")
        .single();

      if (data) {
        setHostel(data as unknown as Hostel);
      }
      setLoading(false);
    }
    load();
  }, [params, supabase]);

  const handleCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingRef.trim() || !hostel) return;

    setSubmitting(true);
    setError("");

    try {
      // We need to find the booking by ref first to get its ID
      const { data: bookingData } = await supabase
        .from("bookings")
        .select("id")
        .eq("booking_ref", bookingRef.toUpperCase().trim())
        .eq("hostel_id", hostel.id)
        .single();

      if (!bookingData) {
        setError("Booking not found. Please check your reference code.");
        setSubmitting(false);
        return;
      }

      const res = await fetch(`/api/bookings/${bookingData.id}/checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ booking_ref: bookingRef.trim() }),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || "Check-in failed. Please try again.");
        setSubmitting(false);
        return;
      }

      setCheckedIn(result.booking as BookingResult);
      toast.success("Checked in successfully!");
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="container py-20 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
      </div>
    );
  }

  if (!hostel) {
    return (
      <div className="container py-20 text-center">
        <p className="text-muted-foreground">Hostel not found.</p>
      </div>
    );
  }

  const wifiPasswordRaw =
    hostel.metadata && typeof hostel.metadata === "object"
      ? (hostel.metadata as Record<string, unknown>).wifi_password
      : null;
  const wifiPassword = wifiPasswordRaw ? String(wifiPasswordRaw) : null;

  const amenities = hostel.hostel_amenities?.map((ha) => ha.amenities) ?? [];

  return (
    <div className="container py-8 max-w-lg mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome to {hostel.name}</h1>
        <p className="text-muted-foreground">
          Enter your booking reference to check in
        </p>
      </div>

      {!checkedIn ? (
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleCheckin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="booking-ref">Booking Reference</Label>
                <Input
                  id="booking-ref"
                  placeholder="e.g. BK-ABC123"
                  value={bookingRef}
                  onChange={(e) => setBookingRef(e.target.value)}
                  className="text-center text-lg tracking-widest uppercase"
                  required
                />
              </div>
              {error && (
                <p className="text-sm text-red-600 text-center">{error}</p>
              )}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={submitting || !bookingRef.trim()}
              >
                {submitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                {submitting ? "Checking in..." : "Check In"}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <h2 className="text-xl font-bold text-green-800 mb-1">
                You are checked in!
              </h2>
              <p className="text-green-700">
                Welcome, {checkedIn.guest_name}. Enjoy your stay!
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Booking Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <BedDouble className="h-4 w-4 text-muted-foreground" />
                <span>{checkedIn.rooms?.name}</span>
                <Badge variant="outline" className="text-xs">
                  {checkedIn.rooms?.room_type === "female_dorm"
                    ? "Female Dorm"
                    : checkedIn.rooms?.room_type === "dorm"
                      ? "Dorm"
                      : "Private"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  {new Date(checkedIn.check_in).toLocaleDateString()} &mdash;{" "}
                  {new Date(checkedIn.check_out).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>
                  {checkedIn.num_guests} guest
                  {checkedIn.num_guests !== 1 ? "s" : ""}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Hostel Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Check-out before {hostel.check_out_until}</span>
              </div>
              {wifiPassword && (
                <div className="flex items-center gap-2">
                  <Wifi className="h-4 w-4 text-muted-foreground" />
                  <span>
                    WiFi Password:{" "}
                    <span className="font-mono font-bold">
                      {String(wifiPassword)}
                    </span>
                  </span>
                </div>
              )}
              {amenities.length > 0 && (
                <>
                  <Separator />
                  <p className="font-medium">Amenities</p>
                  <div className="grid grid-cols-2 gap-2">
                    {amenities.map((a) => (
                      <div
                        key={a.name}
                        className="flex items-center gap-1.5 text-muted-foreground"
                      >
                        <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                        {a.name}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
