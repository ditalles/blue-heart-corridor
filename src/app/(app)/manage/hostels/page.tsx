import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCountryName } from "@/lib/constants/countries";
import Link from "next/link";
import { Plus, Star, MapPin, Eye, Settings } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Manage Hostels" };

const statusBadge: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
  draft: { variant: "secondary", label: "Draft" },
  pending_review: { variant: "outline", label: "Pending Review" },
  active: { variant: "default", label: "Active" },
  suspended: { variant: "destructive", label: "Suspended" },
};

export default async function ManageHostelsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: hostels } = await supabase
    .from("hostels")
    .select("*, hostel_images(url, is_primary)")
    .eq("owner_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Hostels</h1>
        <Button asChild>
          <Link href="/manage/hostels/new">
            <Plus className="h-4 w-4 mr-1" /> Add Hostel
          </Link>
        </Button>
      </div>

      {hostels && hostels.length > 0 ? (
        <div className="space-y-4">
          {hostels.map((hostel) => {
            const badge = statusBadge[hostel.status] || statusBadge.draft;
            return (
              <Card key={hostel.id}>
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{hostel.name}</h3>
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      {hostel.city}, {getCountryName(hostel.country)}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {Number(hostel.avg_rating).toFixed(1)} ({hostel.review_count} reviews)
                      </span>
                      <span>Tier: {hostel.subscription_tier}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {hostel.status === "active" && (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/hostels/${hostel.slug}`}>
                          <Eye className="h-3 w-3 mr-1" /> View
                        </Link>
                      </Button>
                    )}
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/manage/hostels/${hostel.id}/edit`}>
                        <Settings className="h-3 w-3 mr-1" /> Manage
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-muted-foreground mb-4">You haven&apos;t listed any hostels yet</p>
            <Button asChild>
              <Link href="/manage/hostels/new">
                <Plus className="h-4 w-4 mr-1" /> List Your First Hostel
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
