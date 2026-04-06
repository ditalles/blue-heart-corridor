import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RatingDisplay, RatingBar } from "@/components/review/rating-display";
import { getCountryName } from "@/lib/constants/countries";
import {
  MapPin,
  Star,
  CheckCircle,
  Clock,
  Wifi,
  Users,
  BedDouble,
  Calendar,
  MessageCircle,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { ChatWidget } from "@/components/messaging/chat-widget";
import type { Metadata } from "next";

interface HostelPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: HostelPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: hostel } = await supabase
    .from("hostels")
    .select("name, city, country, description, avg_rating")
    .eq("slug", slug)
    .eq("status", "active")
    .single();

  if (!hostel) return { title: "Hostel Not Found" };

  return {
    title: `${hostel.name} — ${hostel.city}, ${getCountryName(hostel.country)}`,
    description: hostel.description?.substring(0, 160),
  };
}

export default async function HostelDetailPage({ params }: HostelPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // Fetch hostel with related data
  const { data: hostel } = await supabase
    .from("hostels")
    .select(`
      *,
      hostel_images (*),
      rooms (*),
      hostel_amenities (
        amenity_id,
        amenities (*)
      )
    `)
    .eq("slug", slug)
    .eq("status", "active")
    .single();

  if (!hostel) notFound();

  // Check if user is logged in (for chat widget)
  const { data: { user: authUser } } = await supabase.auth.getUser();

  // Fetch reviews
  const { data: reviews } = await supabase
    .from("reviews")
    .select(`
      *,
      profiles:traveler_id (name, avatar_url)
    `)
    .eq("hostel_id", hostel.id)
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(10);

  const amenities = hostel.hostel_amenities?.map((ha: { amenities: unknown }) => ha.amenities) ?? [];
  const images = hostel.hostel_images ?? [];
  const primaryImage = images.find((i: { is_primary: boolean }) => i.is_primary) || images[0];
  const activeRooms = (hostel.rooms ?? []).filter((r: { is_active: boolean }) => r.is_active);

  return (
    <div className="container py-8">
      {/* Image Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 rounded-xl overflow-hidden mb-8">
        <div className="md:col-span-2 md:row-span-2 relative aspect-[4/3] md:aspect-auto bg-muted">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={hostel.name}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <MapPin className="h-16 w-16 text-muted-foreground/20" />
            </div>
          )}
        </div>
        {images.slice(1, 5).map((img: { id: string; url: string; alt_text: string | null }) => (
          <div key={img.id} className="relative aspect-[4/3] bg-muted hidden md:block">
            <Image src={img.url} alt={img.alt_text || hostel.name} fill className="object-cover" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header */}
          <div>
            <div className="flex items-start gap-3 flex-wrap">
              <h1 className="text-3xl font-bold">{hostel.name}</h1>
              {hostel.is_verified && (
                <Badge variant="secondary" className="mt-1">
                  <CheckCircle className="h-3 w-3 mr-1" /> Verified
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground flex items-center gap-1 mt-2">
              <MapPin className="h-4 w-4" />
              {hostel.address}, {hostel.city}, {getCountryName(hostel.country)}
            </p>
            {hostel.avg_rating > 0 && (
              <div className="mt-3">
                <RatingDisplay rating={Number(hostel.avg_rating)} size="lg" />
                <span className="text-sm text-muted-foreground ml-2">
                  ({hostel.review_count} reviews)
                </span>
              </div>
            )}
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h2 className="text-xl font-semibold mb-3">About</h2>
            <p className="text-muted-foreground whitespace-pre-line">{hostel.description}</p>
          </div>

          {/* Amenities */}
          {amenities.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-3">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {amenities.map((amenity: { id: number; name: string }) => (
                  <div key={amenity.id} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {amenity.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Rooms */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Available Rooms</h2>
            <div className="space-y-4">
              {activeRooms.map((room: {
                id: string;
                name: string;
                room_type: string;
                capacity: number;
                base_price_cents: number;
                description: string | null;
              }) => (
                <Card key={room.id}>
                  <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold flex items-center gap-2">
                        <BedDouble className="h-4 w-4" />
                        {room.name}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {room.capacity} {room.room_type === "dorm" ? "beds" : "guests"}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {room.room_type === "female_dorm" ? "Female Dorm" : room.room_type === "dorm" ? "Dorm" : "Private"}
                        </Badge>
                      </div>
                      {room.description && (
                        <p className="text-sm text-muted-foreground mt-1">{room.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold">
                          &euro;{(room.base_price_cents / 100).toFixed(0)}
                        </p>
                        <p className="text-xs text-muted-foreground">per night</p>
                      </div>
                      <Button asChild>
                        <Link href={`/hostels/${slug}/book?room=${room.id}`}>
                          Book Now
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {activeRooms.length === 0 && (
                <p className="text-muted-foreground text-center py-8">
                  No rooms available at this time.
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Reviews */}
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Reviews {hostel.review_count > 0 && `(${hostel.review_count})`}
            </h2>

            {hostel.avg_rating > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {reviews?.[0]?.rating_location != null && (
                  <RatingBar label="Location" value={
                    reviews.reduce((sum: number, r: { rating_location: number }) => sum + (r.rating_location || 0), 0) / reviews.length
                  } />
                )}
                {reviews?.[0]?.rating_cleanliness != null && (
                  <RatingBar label="Cleanliness" value={
                    reviews.reduce((sum: number, r: { rating_cleanliness: number }) => sum + (r.rating_cleanliness || 0), 0) / reviews.length
                  } />
                )}
                {reviews?.[0]?.rating_staff != null && (
                  <RatingBar label="Staff" value={
                    reviews.reduce((sum: number, r: { rating_staff: number }) => sum + (r.rating_staff || 0), 0) / reviews.length
                  } />
                )}
                {reviews?.[0]?.rating_atmosphere != null && (
                  <RatingBar label="Atmosphere" value={
                    reviews.reduce((sum: number, r: { rating_atmosphere: number }) => sum + (r.rating_atmosphere || 0), 0) / reviews.length
                  } />
                )}
                {reviews?.[0]?.rating_value != null && (
                  <RatingBar label="Value" value={
                    reviews.reduce((sum: number, r: { rating_value: number }) => sum + (r.rating_value || 0), 0) / reviews.length
                  } />
                )}
              </div>
            )}

            <div className="space-y-6">
              {reviews?.map((review: {
                id: string;
                rating_overall: number;
                comment: string | null;
                created_at: string;
                owner_reply: string | null;
                profiles: { name: string; avatar_url: string | null };
              }) => (
                <div key={review.id} className="border-b pb-6 last:border-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                      {review.profiles?.name?.charAt(0) ?? "?"}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{review.profiles?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString("en-US", {
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <RatingDisplay rating={review.rating_overall} size="sm" />
                  </div>
                  {review.comment && (
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                  )}
                  {review.owner_reply && (
                    <div className="mt-3 pl-4 border-l-2 border-primary/20">
                      <p className="text-xs font-medium text-primary">Owner reply:</p>
                      <p className="text-sm text-muted-foreground">{review.owner_reply}</p>
                    </div>
                  )}
                </div>
              ))}
              {(!reviews || reviews.length === 0) && (
                <p className="text-muted-foreground text-center py-8">
                  No reviews yet. Be the first to review!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="text-lg">Hostel Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Check-in: {hostel.check_in_from} - {hostel.check_in_until}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Check-out: before {hostel.check_out_until}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  Cancellation: {hostel.cancellation_policy.charAt(0).toUpperCase() + hostel.cancellation_policy.slice(1)}
                </span>
              </div>
              {hostel.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Phone:</span>
                  <span>{hostel.phone}</span>
                </div>
              )}
              {hostel.website && (
                <div className="flex items-center gap-2 text-sm">
                  <a
                    href={hostel.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Visit website
                  </a>
                </div>
              )}

              <Separator />

              {activeRooms.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">From</p>
                  <p className="text-3xl font-bold">
                    &euro;{(Math.min(...activeRooms.map((r: { base_price_cents: number }) => r.base_price_cents)) / 100).toFixed(0)}
                    <span className="text-sm font-normal text-muted-foreground"> /night</span>
                  </p>
                </div>
              )}

              <Button className="w-full" size="lg" asChild>
                <a href="#rooms">View Rooms & Book</a>
              </Button>

              {hostel.phone && (
                <Button
                  className="w-full bg-[#25D366] hover:bg-[#1DA851] text-white"
                  size="lg"
                  asChild
                >
                  <a
                    href={`https://wa.me/${hostel.phone.replace(/\D/g, "")}?text=${encodeURIComponent("Hi! I found your hostel on BalkanHostels and would like to book.")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <WhatsAppIcon className="mr-2 h-4 w-4" />
                    Contact on WhatsApp
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Chat Widget */}
      <ChatWidget
        hostelId={hostel.id}
        hostelName={hostel.name}
        isLoggedIn={!!authUser}
      />
    </div>
  );
}
