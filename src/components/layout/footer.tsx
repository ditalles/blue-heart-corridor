import Link from "next/link";
import { MapPin } from "lucide-react";
import { BALKAN_COUNTRIES } from "@/lib/constants/countries";

export function Footer() {
  const popularCountries = ["HR", "RS", "AL", "ME", "BA", "GR"] as const;

  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-primary" />
              <span className="text-lg font-bold">BalkanHostels</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Find the best youth hostels across the Balkans. No booking fees for travelers.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-sm">Destinations</h4>
            <ul className="space-y-2">
              {popularCountries.map((code) => (
                <li key={code}>
                  <Link
                    href={`/${code}`}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {BALKAN_COUNTRIES[code].name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-sm">For Hostels</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/auth/register/hostel" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  List Your Hostel
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Why BalkanHostels?
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-sm">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} BalkanHostels. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
