import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, CheckCircle } from "lucide-react";

interface HostelCardProps {
  slug: string;
  name: string;
  city: string;
  country: string;
  avgRating: number;
  reviewCount: number;
  minPriceCents: number | null;
  imageUrl: string | null;
  isVerified: boolean;
  subscriptionTier: string;
}

export function HostelCard({
  slug,
  name,
  city,
  country,
  avgRating,
  reviewCount,
  minPriceCents,
  imageUrl,
  isVerified,
  subscriptionTier,
}: HostelCardProps) {
  return (
    <Link href={`/hostels/${slug}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer h-full">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <MapPin className="h-12 w-12 opacity-20" />
            </div>
          )}
          {subscriptionTier === "featured" && (
            <Badge className="absolute top-2 left-2 bg-amber-500 text-white">
              Featured
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base truncate flex items-center gap-1.5">
                {name}
                {isVerified && (
                  <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />
                )}
              </h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3" />
                {city}, {country}
              </p>
            </div>
            {avgRating > 0 && (
              <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md flex-shrink-0">
                <Star className="h-3.5 w-3.5 fill-current" />
                <span className="text-sm font-bold">{avgRating.toFixed(1)}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t">
            {reviewCount > 0 && (
              <span className="text-xs text-muted-foreground">
                {reviewCount} review{reviewCount !== 1 ? "s" : ""}
              </span>
            )}
            {minPriceCents != null && (
              <div className="text-right">
                <span className="text-lg font-bold">
                  &euro;{(minPriceCents / 100).toFixed(0)}
                </span>
                <span className="text-xs text-muted-foreground"> /night</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
