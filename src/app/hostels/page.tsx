import { createClient } from "@/lib/supabase/server";
import { SearchBar } from "@/components/search/search-bar";
import { HostelCard } from "@/components/hostel/hostel-card";
import { getCountryName } from "@/lib/constants/countries";
import type { Metadata } from "next";

interface SearchPageProps {
  searchParams: Promise<{
    country?: string;
    city?: string;
    checkin?: string;
    checkout?: string;
    guests?: string;
    min_price?: string;
    max_price?: string;
    sort?: string;
    page?: string;
  }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const params = await searchParams;
  const parts = [];
  if (params.city) parts.push(params.city);
  if (params.country) parts.push(getCountryName(params.country));

  const location = parts.length > 0 ? parts.join(", ") : "the Balkans";
  return {
    title: `Hostels in ${location}`,
    description: `Find and book the best youth hostels in ${location}. No booking fees.`,
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  const { data: hostels, error } = await supabase.rpc("search_hostels", {
    p_country: params.country || null,
    p_city: params.city || null,
    p_checkin: params.checkin || null,
    p_checkout: params.checkout || null,
    p_guests: params.guests ? parseInt(params.guests) : 1,
    p_min_price: params.min_price ? parseInt(params.min_price) * 100 : null,
    p_max_price: params.max_price ? parseInt(params.max_price) * 100 : null,
    p_sort: params.sort || "rating",
    p_limit: 20,
    p_offset: params.page ? (parseInt(params.page) - 1) * 20 : 0,
  });

  const totalCount = hostels?.[0]?.total_count ?? 0;
  const locationLabel = [params.city, params.country ? getCountryName(params.country) : null]
    .filter(Boolean)
    .join(", ") || "the Balkans";

  return (
    <div className="container py-8">
      <div className="mb-8">
        <SearchBar
          variant="compact"
          defaults={{
            country: params.country,
            city: params.city,
            checkin: params.checkin,
            checkout: params.checkout,
            guests: params.guests ? parseInt(params.guests) : 1,
          }}
        />
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Hostels in {locationLabel}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {totalCount} hostel{Number(totalCount) !== 1 ? "s" : ""} found
          </p>
        </div>
      </div>

      {hostels && hostels.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {hostels.map((hostel: any) => (
            <HostelCard
              key={hostel.id}
              slug={hostel.slug}
              name={hostel.name}
              city={hostel.city}
              country={getCountryName(hostel.country)}
              avgRating={Number(hostel.avg_rating)}
              reviewCount={hostel.review_count}
              minPriceCents={hostel.min_price_cents}
              imageUrl={hostel.primary_image_url}
              isVerified={hostel.is_verified}
              subscriptionTier={hostel.subscription_tier}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-xl font-semibold mb-2">No hostels found</p>
          <p className="text-muted-foreground">
            Try adjusting your search filters or check back later.
          </p>
        </div>
      )}
    </div>
  );
}
