import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCountryName } from "@/lib/constants/countries";
import { AdminHostelActions } from "./actions";

export default async function AdminHostelsPage() {
  const supabase = await createClient();

  const { data: hostels } = await supabase
    .from("hostels")
    .select("*, profiles:owner_id (name, email)")
    .order("created_at", { ascending: false });

  const pendingCount = hostels?.filter((h) => h.status === "pending_review").length ?? 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Hostels</h1>
          <p className="text-sm text-muted-foreground">
            {pendingCount} pending review
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {hostels?.map((hostel) => (
          <Card key={hostel.id}>
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{hostel.name}</h3>
                  <Badge
                    variant={
                      hostel.status === "active"
                        ? "default"
                        : hostel.status === "pending_review"
                        ? "outline"
                        : "secondary"
                    }
                  >
                    {hostel.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {hostel.city}, {getCountryName(hostel.country)} &middot;
                  Owner: {(hostel.profiles as unknown as { name: string })?.name}
                </p>
              </div>
              <AdminHostelActions hostelId={hostel.id} currentStatus={hostel.status} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
