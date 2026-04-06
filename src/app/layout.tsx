import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "BalkanHostels — Find Youth Hostels Across the Balkans",
    template: "%s | BalkanHostels",
  },
  description:
    "Discover and book the best youth hostels in the Balkans. No booking fees for travelers. Croatia, Serbia, Albania, Montenegro, Bosnia, and more.",
  keywords: [
    "balkans hostels",
    "youth hostels",
    "backpacking balkans",
    "hostel booking",
    "croatia hostels",
    "serbia hostels",
    "albania hostels",
    "montenegro hostels",
  ],
  openGraph: {
    title: "BalkanHostels — Find Youth Hostels Across the Balkans",
    description: "Discover and book the best youth hostels in the Balkans. No booking fees.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
