"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, BedDouble, Calendar, MessageSquare, CreditCard, QrCode, Download } from "lucide-react";
import { getQRCodeUrl } from "@/lib/utils/qr";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default function EditHostelPage({ params }: EditPageProps) {
  const router = useRouter();
  const supabase = createClient();
  const [hostelId, setHostelId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hostel, setHostel] = useState<Record<string, string | null>>({});

  useEffect(() => {
    async function load() {
      const { id } = await params;
      setHostelId(id);

      const { data } = await supabase
        .from("hostels")
        .select("*")
        .eq("id", id)
        .single();

      if (data) {
        setHostel(data);
      }
      setLoading(false);
    }
    load();
  }, [params, supabase]);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("hostels")
      .update({
        name: hostel.name,
        description: hostel.description,
        address: hostel.address,
        phone: hostel.phone,
        website: hostel.website,
        updated_at: new Date().toISOString(),
      })
      .eq("id", hostelId);

    if (error) {
      toast.error("Failed to save changes");
    } else {
      toast.success("Changes saved!");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="container py-20 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{hostel.name}</h1>
          <Badge variant="outline" className="mt-1">{hostel.status}</Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="rooms">
            <BedDouble className="h-4 w-4 mr-1" /> Rooms
          </TabsTrigger>
          <TabsTrigger value="bookings">
            <Calendar className="h-4 w-4 mr-1" /> Bookings
          </TabsTrigger>
          <TabsTrigger value="reviews">
            <MessageSquare className="h-4 w-4 mr-1" /> Reviews
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label>Hostel Name</Label>
                <Input
                  value={hostel.name || ""}
                  onChange={(e) => setHostel({ ...hostel, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={hostel.description || ""}
                  onChange={(e) => setHostel({ ...hostel, description: e.target.value })}
                  rows={6}
                />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input
                  value={hostel.address || ""}
                  onChange={(e) => setHostel({ ...hostel, address: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={hostel.phone || ""}
                    onChange={(e) => setHostel({ ...hostel, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input
                    value={hostel.website || ""}
                    onChange={(e) => setHostel({ ...hostel, website: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {hostel.slug && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  QR Check-in Code
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Print this and place it at your reception. Guests scan it to check in.
                </p>
                <div className="flex flex-col items-center gap-4 rounded-lg border p-6 bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getQRCodeUrl(
                      `${typeof window !== "undefined" ? window.location.origin : ""}/hostels/${hostel.slug}/checkin`
                    )}
                    alt="QR Code for guest check-in"
                    width={200}
                    height={200}
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    Scan to check in at {hostel.name}
                  </p>
                </div>
                <a
                  href={getQRCodeUrl(
                    `${typeof window !== "undefined" ? window.location.origin : ""}/hostels/${hostel.slug}/checkin`
                  )}
                  download={`checkin-qr-${hostel.slug}.png`}
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Download className="h-4 w-4" />
                  Download QR Code
                </a>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="rooms">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Rooms</CardTitle>
              <Button asChild>
                <Link href={`/manage/hostels/${hostelId}/rooms`}>Manage Rooms</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Go to the rooms page to add, edit, or remove rooms.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <HostelBookings hostelId={hostelId} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <CardTitle>Guest Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <HostelReviews hostelId={hostelId} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function HostelBookings({ hostelId }: { hostelId: string }) {
  const [bookings, setBookings] = useState<Array<Record<string, unknown>>>([]);
  const supabase = createClient();

  useEffect(() => {
    supabase
      .from("bookings")
      .select("*")
      .eq("hostel_id", hostelId)
      .order("check_in", { ascending: false })
      .limit(20)
      .then(({ data }) => {
        if (data) setBookings(data);
      });
  }, [hostelId, supabase]);

  if (bookings.length === 0) {
    return <p className="text-muted-foreground">No bookings yet.</p>;
  }

  return (
    <div className="space-y-3">
      {bookings.map((b) => (
        <div key={b.id as string} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div>
            <p className="font-medium">{b.guest_name as string}</p>
            <p className="text-sm text-muted-foreground">
              {new Date(b.check_in as string).toLocaleDateString()} — {new Date(b.check_out as string).toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            <p className="font-medium">&euro;{((b.hostel_payout_cents as number) / 100).toFixed(2)}</p>
            <Badge variant="outline">{b.status as string}</Badge>
          </div>
        </div>
      ))}
    </div>
  );
}

function HostelReviews({ hostelId }: { hostelId: string }) {
  const [reviews, setReviews] = useState<Array<Record<string, unknown>>>([]);
  const supabase = createClient();

  useEffect(() => {
    supabase
      .from("reviews")
      .select("*, profiles:traveler_id (name)")
      .eq("hostel_id", hostelId)
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => {
        if (data) setReviews(data);
      });
  }, [hostelId, supabase]);

  if (reviews.length === 0) {
    return <p className="text-muted-foreground">No reviews yet.</p>;
  }

  return (
    <div className="space-y-4">
      {reviews.map((r) => (
        <div key={r.id as string} className="border-b pb-4">
          <div className="flex items-center justify-between mb-1">
            <p className="font-medium">{(r.profiles as unknown as { name: string })?.name}</p>
            <Badge>{(r.rating_overall as number).toFixed(1)}/10</Badge>
          </div>
          {r.comment ? <p className="text-sm text-muted-foreground">{String(r.comment)}</p> : null}
          {r.owner_reply ? (
            <div className="mt-2 pl-3 border-l-2 text-sm text-muted-foreground">
              <span className="font-medium">Your reply:</span> {String(r.owner_reply)}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
