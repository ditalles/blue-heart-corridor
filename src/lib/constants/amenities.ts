export const AMENITIES = [
  // Facilities
  { name: "Free WiFi", icon: "wifi", category: "facilities" },
  { name: "Kitchen", icon: "cooking-pot", category: "facilities" },
  { name: "Lockers", icon: "lock", category: "facilities" },
  { name: "Laundry", icon: "shirt", category: "facilities" },
  { name: "Air Conditioning", icon: "snowflake", category: "facilities" },
  { name: "Heating", icon: "flame", category: "facilities" },
  { name: "Hot Showers", icon: "shower-head", category: "facilities" },
  { name: "Luggage Storage", icon: "luggage", category: "facilities" },
  { name: "Parking", icon: "car", category: "facilities" },
  { name: "Elevator", icon: "arrow-up-down", category: "facilities" },

  // Services
  { name: "24h Reception", icon: "clock", category: "services" },
  { name: "Airport Shuttle", icon: "plane", category: "services" },
  { name: "Tour Desk", icon: "map", category: "services" },
  { name: "Bike Rental", icon: "bike", category: "services" },
  { name: "Breakfast Included", icon: "coffee", category: "services" },
  { name: "Late Check-out", icon: "clock", category: "services" },

  // Social
  { name: "Bar", icon: "beer", category: "social" },
  { name: "Common Room", icon: "sofa", category: "social" },
  { name: "Rooftop Terrace", icon: "sun", category: "social" },
  { name: "Garden", icon: "trees", category: "social" },
  { name: "Game Room", icon: "gamepad-2", category: "social" },
  { name: "Movie Room", icon: "tv", category: "social" },
  { name: "BBQ Area", icon: "flame", category: "social" },
  { name: "Pool", icon: "waves", category: "social" },
  { name: "Live Music", icon: "music", category: "social" },
  { name: "Pub Crawls", icon: "party-popper", category: "social" },
] as const;

export type AmenityName = (typeof AMENITIES)[number]["name"];
