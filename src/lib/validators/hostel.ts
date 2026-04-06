import { z } from "zod";

export const hostelSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(255),
  description: z.string().min(50, "Description must be at least 50 characters").max(5000),
  country: z.string().length(2, "Invalid country code"),
  city: z.string().min(2).max(100),
  address: z.string().min(5).max(500),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  phone: z.string().max(50).optional(),
  website: z.string().url().max(500).optional().or(z.literal("")),
  check_in_from: z.string().default("14:00"),
  check_in_until: z.string().default("22:00"),
  check_out_until: z.string().default("11:00"),
  cancellation_policy: z.enum(["flexible", "moderate", "strict"]).default("flexible"),
  amenity_ids: z.array(z.number()).default([]),
});

export const roomSchema = z.object({
  name: z.string().min(2).max(255),
  room_type: z.enum(["dorm", "private", "female_dorm"]),
  capacity: z.number().int().min(1).max(50),
  base_price_cents: z.number().int().min(100),
  description: z.string().max(1000).optional(),
});

export const availabilityUpdateSchema = z.object({
  room_id: z.string().uuid(),
  start_date: z.string(),
  end_date: z.string(),
  price_cents: z.number().int().min(100).optional(),
  is_blocked: z.boolean().optional(),
  total_beds: z.number().int().min(0).optional(),
});

export type HostelInput = z.infer<typeof hostelSchema>;
export type RoomInput = z.infer<typeof roomSchema>;
export type AvailabilityUpdateInput = z.infer<typeof availabilityUpdateSchema>;
