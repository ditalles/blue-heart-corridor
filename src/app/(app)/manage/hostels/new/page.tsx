"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { BALKAN_COUNTRIES, type CountryCode } from "@/lib/constants/countries";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function NewHostelPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [amenities, setAmenities] = useState<{ id: number; name: string; category: string }[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<number[]>([]);

  const [form, setForm] = useState({
    name: "",
    description: "",
    country: "",
    city: "",
    address: "",
    phone: "",
    website: "",
    cancellation_policy: "flexible",
  });

  const cities = form.country
    ? BALKAN_COUNTRIES[form.country as CountryCode]?.cities ?? []
    : [];

  useEffect(() => {
    supabase
      .from("amenities")
      .select("*")
      .order("category")
      .then(({ data }) => {
        if (data) setAmenities(data);
      });
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/hostels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        amenity_ids: selectedAmenities,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      toast.error(data.error?.toString() || "Failed to create hostel");
      setLoading(false);
      return;
    }

    const hostel = await res.json();
    toast.success("Hostel created! Add rooms next.");
    router.push(`/manage/hostels/${hostel.id}/rooms`);
  };

  const updateField = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  return (
    <div className="container py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">List a New Hostel</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Basic Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Hostel Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="e.g., Downtown Party Hostel"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Tell travelers about your hostel, the vibe, what makes it special..."
                rows={5}
                required
                minLength={50}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Country *</Label>
                <Select value={form.country} onValueChange={(v) => { updateField("country", v ?? ""); updateField("city", ""); }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(BALKAN_COUNTRIES).map(([code, { name }]) => (
                      <SelectItem key={code} value={code}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>City *</Label>
                <Select value={form.city} onValueChange={(v) => updateField("city", v ?? "")} disabled={!form.country}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Street Address *</Label>
              <Input
                value={form.address}
                onChange={(e) => updateField("address", e.target.value)}
                placeholder="Full street address"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="+381 ..."
                />
              </div>
              <div className="space-y-2">
                <Label>Website</Label>
                <Input
                  value={form.website}
                  onChange={(e) => updateField("website", e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Policies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Cancellation Policy</Label>
              <Select
                value={form.cancellation_policy}
                onValueChange={(v) => updateField("cancellation_policy", v ?? "flexible")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flexible">Flexible — Free cancellation up to 24h before</SelectItem>
                  <SelectItem value="moderate">Moderate — Free cancellation up to 5 days before</SelectItem>
                  <SelectItem value="strict">Strict — 50% refund up to 7 days before</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Amenities</CardTitle>
          </CardHeader>
          <CardContent>
            {["facilities", "services", "social"].map((category) => (
              <div key={category} className="mb-4">
                <p className="text-sm font-medium capitalize mb-2">{category}</p>
                <div className="grid grid-cols-2 gap-2">
                  {amenities
                    .filter((a) => a.category === category)
                    .map((amenity) => (
                      <label
                        key={amenity.id}
                        className="flex items-center gap-2 text-sm cursor-pointer"
                      >
                        <Checkbox
                          checked={selectedAmenities.includes(amenity.id)}
                          onCheckedChange={(checked) => {
                            setSelectedAmenities((prev) =>
                              checked
                                ? [...prev, amenity.id]
                                : prev.filter((id) => id !== amenity.id)
                            );
                          }}
                        />
                        {amenity.name}
                      </label>
                    ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Hostel & Add Rooms
        </Button>
      </form>
    </div>
  );
}
