export const SUBSCRIPTION_TIERS = {
  free: {
    name: "Free",
    price_eur: 0,
    commission_rate: 5.0,
    features: [
      "Basic listing",
      "Up to 10 photos",
      "Receive bookings",
      "View reviews",
    ],
  },
  verified: {
    name: "Verified",
    price_eur: 20,
    commission_rate: 2.0,
    stripe_price_id: "price_verified_monthly",
    features: [
      "Everything in Free",
      "Verified badge",
      "Priority in search results",
      "Reply to reviews publicly",
      "Analytics dashboard",
      "Up to 30 photos",
    ],
  },
  featured: {
    name: "Featured",
    price_eur: 50,
    commission_rate: 1.0,
    stripe_price_id: "price_featured_monthly",
    features: [
      "Everything in Verified",
      "Homepage spotlight",
      "Featured tag in city results",
      "Booking conversion insights",
      "Promotional tools",
      "Unlimited photos",
      "Priority support",
    ],
  },
} as const;

export type TierKey = keyof typeof SUBSCRIPTION_TIERS;
