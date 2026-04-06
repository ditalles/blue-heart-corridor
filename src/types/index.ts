export type UserRole = "traveler" | "owner" | "admin";

export type HostelStatus = "draft" | "pending_review" | "active" | "suspended";

export type SubscriptionTier = "free" | "verified" | "featured";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "checked_in"
  | "completed"
  | "cancelled"
  | "no_show";

export type RoomType = "dorm" | "private" | "female_dorm";

export type CancellationPolicy = "flexible" | "moderate" | "strict";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  role: UserRole;
  preferred_currency: string;
  stripe_customer_id: string | null;
  created_at: string;
}

export interface Hostel {
  id: string;
  owner_id: string;
  slug: string;
  name: string;
  description: string | null;
  country: string;
  city: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  website: string | null;
  check_in_from: string;
  check_in_until: string;
  check_out_until: string;
  cancellation_policy: CancellationPolicy;
  status: HostelStatus;
  subscription_tier: SubscriptionTier;
  commission_rate: number;
  stripe_account_id: string | null;
  avg_rating: number;
  review_count: number;
  is_verified: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface HostelImage {
  id: string;
  hostel_id: string;
  url: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
}

export interface Room {
  id: string;
  hostel_id: string;
  name: string;
  room_type: RoomType;
  capacity: number;
  base_price_cents: number;
  currency: string;
  description: string | null;
  is_active: boolean;
}

export interface Availability {
  id: string;
  room_id: string;
  date: string;
  total_beds: number;
  booked_beds: number;
  price_cents: number;
  is_blocked: boolean;
}

export interface Booking {
  id: string;
  booking_ref: string;
  traveler_id: string;
  hostel_id: string;
  room_id: string;
  check_in: string;
  check_out: string;
  num_guests: number;
  total_price_cents: number;
  commission_cents: number;
  hostel_payout_cents: number;
  currency: string;
  status: BookingStatus;
  stripe_payment_intent_id: string | null;
  guest_name: string;
  guest_email: string;
  special_requests: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  booking_id: string;
  traveler_id: string;
  hostel_id: string;
  rating_overall: number;
  rating_location: number | null;
  rating_cleanliness: number | null;
  rating_staff: number | null;
  rating_atmosphere: number | null;
  rating_value: number | null;
  comment: string | null;
  owner_reply: string | null;
  owner_replied_at: string | null;
  is_published: boolean;
  created_at: string;
}

export interface HostelWithDetails extends Hostel {
  images: HostelImage[];
  rooms: (Room & { available_beds?: number; price_cents?: number })[];
  amenities: Amenity[];
}

export interface Amenity {
  id: number;
  name: string;
  icon: string | null;
  category: string;
}

export interface SearchParams {
  country?: string;
  city?: string;
  checkin?: string;
  checkout?: string;
  guests?: number;
  min_price?: number;
  max_price?: number;
  sort?: "price_asc" | "price_desc" | "rating" | "reviews";
  page?: number;
}

export interface BookingWithDetails extends Booking {
  hostel: Pick<Hostel, "name" | "slug" | "city" | "country">;
  room: Pick<Room, "name" | "room_type">;
}

export interface ReviewWithTraveler extends Review {
  traveler: Pick<User, "name" | "avatar_url">;
}

export const BALKAN_COUNTRIES = {
  AL: "Albania",
  BA: "Bosnia & Herzegovina",
  BG: "Bulgaria",
  HR: "Croatia",
  GR: "Greece",
  XK: "Kosovo",
  ME: "Montenegro",
  MK: "North Macedonia",
  RO: "Romania",
  RS: "Serbia",
  SI: "Slovenia",
} as const;

export type CountryCode = keyof typeof BALKAN_COUNTRIES;
