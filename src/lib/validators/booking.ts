import { z } from "zod";

export const bookingSchema = z.object({
  hostel_id: z.string().uuid(),
  room_id: z.string().uuid(),
  check_in: z.string(),
  check_out: z.string(),
  num_guests: z.number().int().min(1).max(20),
  guest_name: z.string().min(2).max(255),
  guest_email: z.string().email(),
  special_requests: z.string().max(1000).optional(),
});

export const reviewSchema = z.object({
  booking_id: z.string().uuid(),
  rating_overall: z.number().int().min(1).max(10),
  rating_location: z.number().int().min(1).max(10).optional(),
  rating_cleanliness: z.number().int().min(1).max(10).optional(),
  rating_staff: z.number().int().min(1).max(10).optional(),
  rating_atmosphere: z.number().int().min(1).max(10).optional(),
  rating_value: z.number().int().min(1).max(10).optional(),
  comment: z.string().max(2000).optional(),
});

export type BookingInput = z.infer<typeof bookingSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
