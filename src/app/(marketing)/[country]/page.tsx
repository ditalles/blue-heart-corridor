import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BALKAN_COUNTRIES, type CountryCode } from "@/lib/constants/countries";
import { createClient } from "@/lib/supabase/server";
import { HostelCard } from "@/components/hostel/hostel-card";
import { SearchBar } from "@/components/search/search-bar";
import { ArrowRight, MapPin } from "lucide-react";
import type { Metadata } from "next";

interface CountryPageProps {
  params: Promise<{ country: string }>;
}

export async function generateStaticParams() {
  return Object.keys(BALKAN_COUNTRIES).map((country) => ({ country }));
}

export async function generateMetadata({ params }: CountryPageProps): Promise<Metadata> {
  const { country } = await params;
  const countryData = BALKAN_COUNTRIES[country as CountryCode];
  if (!countryData) return { title: "Not Found" };

  return {
    title: `Hostels in ${countryData.name} — Best Youth Hostels`,
    description: `Find the best youth hostels in ${countryData.name}. Book hostels in ${countryData.cities.slice(0, 3).join(", ")} and more. No booking fees.`,
  };
}

export default async function CountryPage({ params }: CountryPageProps) {
  const { country } = await params;
  const countryData = BALKAN_COUNTRIES[country as CountryCode];
  if (!countryData) notFound();

  const supabase = await createClient();

  // Get featured hostels for this country
  const { data: hostels } = await supabase
    .from("hostels")
    .select("*, hostel_images(url, is_primary)")
    .eq("country", country)
    .eq("status", "active")
    .order("avg_rating", { ascending: false })
    .limit(8);

  // Get hostel count per city
  const { data: cityCounts } = await supabase
    .from("hostels")
    .select("city")
    .eq("country", country)
    .eq("status", "active");

  const cityMap = new Map<string, number>();
  cityCounts?.forEach((h) => {
    cityMap.set(h.city, (cityMap.get(h.city) || 0) + 1);
  });

  return (
    <div className="container py-8">
      {/* Hero */}
      <div className="text-center py-12 mb-8">
        <h1 className="text-4xl font-bold mb-4">
          Hostels in {countryData.name}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Discover the best youth hostels across {countryData.name}. Book with zero fees.
        </p>
        <SearchBar variant="hero" defaults={{ country }} />
      </div>

      {/* Cities */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Popular Cities</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {countryData.cities.map((city) => (
            <Link key={city} href={`/hostels?country=${country}&city=${city}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 text-center">
                  <MapPin className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <h3 className="font-semibold">{city}</h3>
                  <p className="text-xs text-muted-foreground">
                    {cityMap.get(city) || 0} hostels
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Hostels */}
      {hostels && hostels.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Top Hostels in {countryData.name}</h2>
            <Button variant="ghost" asChild>
              <Link href={`/hostels?country=${country}`}>
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {hostels.map((hostel) => {
              const primaryImage = hostel.hostel_images?.find((i: { is_primary: boolean }) => i.is_primary) || hostel.hostel_images?.[0];
              return (
                <HostelCard
                  key={hostel.id}
                  slug={hostel.slug}
                  name={hostel.name}
                  city={hostel.city}
                  country={countryData.name}
                  avgRating={Number(hostel.avg_rating)}
                  reviewCount={hostel.review_count}
                  minPriceCents={null}
                  imageUrl={primaryImage?.url || null}
                  isVerified={hostel.is_verified}
                  subscriptionTier={hostel.subscription_tier}
                />
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
