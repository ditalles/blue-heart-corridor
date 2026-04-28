import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SearchBar } from "@/components/search/search-bar";
import {
  MapPin,
  Star,
  Users,
  Shield,
  Zap,
  Heart,
  ArrowRight,
  CheckCircle,
  MessageCircle,
  Wallet,
  RefreshCw,
  Route,
} from "lucide-react";
import { BALKAN_COUNTRIES, type CountryCode } from "@/lib/constants/countries";

const FEATURED_DESTINATIONS: {
  code: CountryCode;
  city: string;
  tagline: string;
  hostelCount: number;
}[] = [
  { code: "HR", city: "Split", tagline: "Sun, sea & ancient walls", hostelCount: 24 },
  { code: "RS", city: "Belgrade", tagline: "The city that never sleeps", hostelCount: 18 },
  { code: "AL", city: "Tirana", tagline: "Europe's best-kept secret", hostelCount: 12 },
  { code: "ME", city: "Kotor", tagline: "Fjords meet Mediterranean", hostelCount: 9 },
  { code: "BA", city: "Sarajevo", tagline: "Where East meets West", hostelCount: 15 },
  { code: "BG", city: "Sofia", tagline: "Culture on a budget", hostelCount: 20 },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-primary/20 text-white">
        <div className="absolute inset-0 bg-[url('/images/hero-pattern.svg')] opacity-5" />
        <div className="container relative py-20 md:py-32">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <Badge variant="secondary" className="mb-4 text-sm px-4 py-1">
              No booking fees for travelers
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Explore the Balkans.
              <br />
              <span className="text-amber-400">Sleep for less.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto">
              Find, book, and review the best youth hostels across 11 Balkan countries.
              Zero booking fees. Real reviews from real travelers.
            </p>
          </div>
          <SearchBar variant="hero" />
        </div>
      </section>

      {/* Stats */}
      <section className="border-b bg-background">
        <div className="container py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-primary">11</p>
              <p className="text-sm text-muted-foreground">Countries</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">200+</p>
              <p className="text-sm text-muted-foreground">Hostels</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">0%</p>
              <p className="text-sm text-muted-foreground">Traveler Fees</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">10K+</p>
              <p className="text-sm text-muted-foreground">Happy Travelers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="container py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">Popular Destinations</h2>
            <p className="text-muted-foreground mt-1">
              Where backpackers are heading this season
            </p>
          </div>
          <Button variant="ghost" asChild>
            <Link href="/hostels">
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURED_DESTINATIONS.map(({ code, city, tagline, hostelCount }) => (
            <Link key={code} href={`/${code}/${city}`}>
              <Card className="overflow-hidden hover:shadow-lg transition-all group cursor-pointer h-full">
                <div className="relative h-48 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-primary mb-1">{city}</p>
                    <p className="text-sm text-muted-foreground">
                      {BALKAN_COUNTRIES[code].name}
                    </p>
                  </div>
                </div>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground italic">{tagline}</p>
                  <p className="text-sm font-medium mt-2">
                    {hostelCount} hostels available
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Blue Heart Corridor */}
      <section className="bg-gradient-to-b from-slate-50 to-blue-50 py-16">
        <div className="container">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-3">The Blue Heart Corridor</Badge>
            <h2 className="text-2xl md:text-3xl font-bold">
              Not just a booking site. A regional operating system.
            </h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              We solve the three problems global platforms ignore in the Balkans:
              communication, synchronization, and payments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center p-6 border-0 shadow-sm">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100 text-green-600 mb-4">
                <MessageCircle className="h-7 w-7" />
              </div>
              <h3 className="font-semibold text-base mb-2">Omnichannel Relay</h3>
              <p className="text-sm text-muted-foreground">
                You use WhatsApp. Hosts use Viber. We bridge both — no one changes how they work.
              </p>
            </Card>

            <Card className="text-center p-6 border-0 shadow-sm">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 text-blue-600 mb-4">
                <RefreshCw className="h-7 w-7" />
              </div>
              <h3 className="font-semibold text-base mb-2">BalkanSync</h3>
              <p className="text-sm text-muted-foreground">
                Auto-sync calendars across Booking.com, Airbnb, and direct bookings. No more overbookings.
              </p>
            </Card>

            <Card className="text-center p-6 border-0 shadow-sm">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-purple-100 text-purple-600 mb-4">
                <Wallet className="h-7 w-7" />
              </div>
              <h3 className="font-semibold text-base mb-2">Pay Anywhere</h3>
              <p className="text-sm text-muted-foreground">
                Card, cash, or USDC stablecoin. We make payments work where Stripe and PayPal don&apos;t.
              </p>
            </Card>

            <Card className="text-center p-6 border-0 shadow-sm">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-100 text-amber-600 mb-4">
                <Route className="h-7 w-7" />
              </div>
              <h3 className="font-semibold text-base mb-2">Corridor Travel</h3>
              <p className="text-sm text-muted-foreground">
                Book the full Tirana → Kotor → Mostar → Sarajevo route. Hostels + transport in one place.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Why BalkanHostels */}
      <section className="bg-muted/30 py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold">Why travelers choose us</h2>
            <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
              Built by Balkan travelers, for Balkan travelers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mb-4">
                <Shield className="h-7 w-7" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Zero Booking Fees</h3>
              <p className="text-sm text-muted-foreground">
                Unlike the big platforms, we never charge travelers. The price you see is the price you pay.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mb-4">
                <Star className="h-7 w-7" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Verified Reviews</h3>
              <p className="text-sm text-muted-foreground">
                Every review comes from a verified stay. No fake reviews, no manipulation. Just honest feedback.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mb-4">
                <Heart className="h-7 w-7" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Balkans-First</h3>
              <p className="text-sm text-muted-foreground">
                We know the region. Every hostel is hand-picked and we focus exclusively on the Balkans.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* For Hostels CTA */}
      <section className="container py-16">
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-8 md:p-12 text-white text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Own a hostel in the Balkans?
          </h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8">
            List your hostel for free and reach thousands of backpackers.
            Lower commissions than any other platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/auth/register/hostel">
                List Your Hostel — It&apos;s Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm opacity-80">
            <span className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4" /> Free to list
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4" /> Only 5% commission
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4" /> No setup fees
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
