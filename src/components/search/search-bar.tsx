"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, MapPin, Calendar, Users } from "lucide-react";
import { BALKAN_COUNTRIES, type CountryCode } from "@/lib/constants/countries";

interface SearchBarProps {
  variant?: "hero" | "compact";
  defaults?: {
    country?: string;
    city?: string;
    checkin?: string;
    checkout?: string;
    guests?: number;
  };
}

export function SearchBar({ variant = "hero", defaults }: SearchBarProps) {
  const router = useRouter();
  const [country, setCountry] = useState(defaults?.country ?? "");
  const [city, setCity] = useState(defaults?.city ?? "");
  const [checkin, setCheckin] = useState(defaults?.checkin ?? "");
  const [checkout, setCheckout] = useState(defaults?.checkout ?? "");
  const [guests, setGuests] = useState(defaults?.guests ?? 1);

  const cities = country ? BALKAN_COUNTRIES[country as CountryCode]?.cities ?? [] : [];

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (country) params.set("country", country);
    if (city) params.set("city", city);
    if (checkin) params.set("checkin", checkin);
    if (checkout) params.set("checkout", checkout);
    if (guests > 1) params.set("guests", guests.toString());
    router.push(`/hostels?${params.toString()}`);
  };

  if (variant === "compact") {
    return (
      <div className="flex flex-wrap gap-2 items-end">
        <div className="flex-1 min-w-[140px]">
          <Select value={country} onValueChange={(v) => { setCountry(v ?? ""); setCity(""); }}>
            <SelectTrigger>
              <SelectValue placeholder="Country" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(BALKAN_COUNTRIES).map(([code, { name }]) => (
                <SelectItem key={code} value={code}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 min-w-[140px]">
          <Select value={city} onValueChange={(v) => setCity(v ?? "")} disabled={!country}>
            <SelectTrigger>
              <SelectValue placeholder="City" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-[130px]">
          <Input type="date" value={checkin} onChange={(e) => setCheckin(e.target.value)} />
        </div>
        <div className="min-w-[130px]">
          <Input type="date" value={checkout} onChange={(e) => setCheckout(e.target.value)} />
        </div>
        <Button onClick={handleSearch}>
          <Search className="h-4 w-4 mr-1" /> Search
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-1 text-slate-700">
            <MapPin className="h-3.5 w-3.5" /> Country
          </Label>
          <Select value={country} onValueChange={(v) => { setCountry(v ?? ""); setCity(""); }}>
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
          <Label className="text-sm font-medium flex items-center gap-1 text-slate-700">
            <MapPin className="h-3.5 w-3.5" /> City
          </Label>
          <Select value={city} onValueChange={(v) => setCity(v ?? "")} disabled={!country}>
            <SelectTrigger>
              <SelectValue placeholder={country ? "Select city" : "Select country first"} />
            </SelectTrigger>
            <SelectContent>
              {cities.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-1 text-slate-700">
            <Calendar className="h-3.5 w-3.5" /> Check-in
          </Label>
          <Input
            type="date"
            value={checkin}
            onChange={(e) => setCheckin(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-1 text-slate-700">
            <Calendar className="h-3.5 w-3.5" /> Check-out
          </Label>
          <Input
            type="date"
            value={checkout}
            onChange={(e) => setCheckout(e.target.value)}
            min={checkin || new Date().toISOString().split("T")[0]}
          />
        </div>
      </div>

      <div className="flex items-end gap-4 mt-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-1 text-slate-700">
            <Users className="h-3.5 w-3.5" /> Guests
          </Label>
          <Input
            type="number"
            min={1}
            max={20}
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="w-24"
          />
        </div>
        <Button size="lg" className="flex-1 md:flex-none md:px-12" onClick={handleSearch}>
          <Search className="h-4 w-4 mr-2" />
          Search Hostels
        </Button>
      </div>
    </div>
  );
}
