-- =============================================================
-- Seed Data: Tirana -> Kotor -> Mostar -> Sarajevo corridor
-- =============================================================
-- Run with: psql <connection_string> -f scripts/seed.sql
-- Or paste into Supabase SQL Editor
--
-- NOTE: In production, profiles are created via auth.users trigger.
-- For seed data we insert directly into profiles, bypassing auth.
-- These UUIDs are fictional and only for local/dev use.
-- =============================================================

-- ============================================
-- 1. PROFILES (3 owners + 2 travelers)
-- ============================================
INSERT INTO profiles (id, email, name, role) VALUES
    ('a1000000-0000-0000-0000-000000000001', 'marko@example.com',   'Marko Petrovic',   'owner'),
    ('a1000000-0000-0000-0000-000000000002', 'elira@example.com',   'Elira Hoxha',      'owner'),
    ('a1000000-0000-0000-0000-000000000003', 'lejla@example.com',   'Lejla Dzeko',       'owner'),
    ('a2000000-0000-0000-0000-000000000001', 'sarah@example.com',   'Sarah Thompson',   'traveler'),
    ('a2000000-0000-0000-0000-000000000002', 'jonas@example.com',   'Jonas Muller',     'traveler')
ON CONFLICT (id) DO NOTHING;


-- ============================================
-- 2. HOSTELS (8 across 4 cities)
-- ============================================
INSERT INTO hostels (
    id, owner_id, slug, name, description,
    country, city, address, latitude, longitude,
    phone, website, check_in_from, check_in_until, check_out_until,
    cancellation_policy, status, subscription_tier, commission_rate,
    avg_rating, review_count, is_verified
) VALUES
-- TIRANA (AL) - 2 hostels
(
    'b1000000-0000-0000-0000-000000000001',
    'a1000000-0000-0000-0000-000000000002',
    'tirana-backpackers-tirana',
    'Tirana Backpackers',
    'A vibrant social hostel in the heart of the Blloku district. Walking distance to all major sights, with a lively bar and regular events. The perfect base for exploring Albania''s colourful capital.',
    'AL', 'Tirana',
    'Rruga Ibrahim Rugova 12, Tirana 1001',
    41.3233, 19.8187,
    '+355 69 123 4567', 'https://tiranabackpackers.example.com',
    '14:00', '22:00', '11:00',
    'flexible', 'active', 'featured', 3.50,
    9.10, 3, TRUE
),
(
    'b1000000-0000-0000-0000-000000000002',
    'a1000000-0000-0000-0000-000000000002',
    'hostel-albania-tirana',
    'Hostel Albania',
    'A quiet, family-run guesthouse near the Grand Park. Clean rooms, home-cooked breakfast, and a peaceful garden courtyard. Ideal for travellers who prefer calm over chaos.',
    'AL', 'Tirana',
    'Rruga Myslym Shyri 45, Tirana 1001',
    41.3195, 19.8225,
    '+355 69 234 5678', NULL,
    '15:00', '21:00', '10:00',
    'moderate', 'active', 'free', 5.00,
    7.80, 2, FALSE
),
-- KOTOR (ME) - 2 hostels
(
    'b1000000-0000-0000-0000-000000000003',
    'a1000000-0000-0000-0000-000000000001',
    'old-town-hostel-kotor',
    'Old Town Hostel Kotor',
    'Set inside a restored medieval building within Kotor''s UNESCO-listed Old Town walls. Stone rooms, a rooftop terrace with bay views, and a welcoming communal kitchen.',
    'ME', 'Kotor',
    'Stari Grad 150, Kotor 85330',
    42.4247, 18.7712,
    '+382 32 456 789', 'https://oldtownkotor.example.com',
    '14:00', '23:00', '11:00',
    'flexible', 'active', 'verified', 4.00,
    9.40, 2, TRUE
),
(
    'b1000000-0000-0000-0000-000000000004',
    'a1000000-0000-0000-0000-000000000001',
    'bay-view-hostel-kotor',
    'Bay View Hostel',
    'Modern hostel just outside the Old Town with stunning views of Boka Bay. Features a pool, sunset terrace, and an in-house tour desk for day trips to Perast and Budva.',
    'ME', 'Kotor',
    'Jadranski put bb, Dobrota, Kotor 85330',
    42.4310, 18.7625,
    '+382 32 567 890', 'https://bayviewkotor.example.com',
    '13:00', '22:00', '11:00',
    'moderate', 'pending_review', 'verified', 4.00,
    0, 0, FALSE
),
-- MOSTAR (BA) - 2 hostels
(
    'b1000000-0000-0000-0000-000000000005',
    'a1000000-0000-0000-0000-000000000003',
    'bridge-view-hostel-mostar',
    'Bridge View Hostel',
    'A charming Ottoman-era house converted into a hostel, perched above the Neretva river with direct views of the Stari Most. Home-made Bosnian food, tea garden, and live music on weekends.',
    'BA', 'Mostar',
    'Kujundziluk 8, Mostar 88000',
    43.3373, 17.8150,
    '+387 36 123 456', 'https://bridgeviewmostar.example.com',
    '14:00', '22:00', '10:30',
    'flexible', 'active', 'featured', 3.50,
    9.00, 2, TRUE
),
(
    'b1000000-0000-0000-0000-000000000006',
    'a1000000-0000-0000-0000-000000000003',
    'neretva-hostel-mostar',
    'Neretva Hostel',
    'Budget-friendly hostel in a quiet residential street, ten minutes walk from the Old Bridge. Clean dorms, fast WiFi, and a chill lounge area. Great value for Mostar.',
    'BA', 'Mostar',
    'Brace Fejica 34, Mostar 88000',
    43.3420, 17.8098,
    '+387 36 234 567', NULL,
    '15:00', '21:00', '10:00',
    'strict', 'active', 'free', 5.00,
    7.20, 2, FALSE
),
-- SARAJEVO (BA) - 2 hostels
(
    'b1000000-0000-0000-0000-000000000007',
    'a1000000-0000-0000-0000-000000000003',
    'bascarsija-hostel-sarajevo',
    'Bascarsija Hostel',
    'Steps from the famous Sebilj fountain in the heart of Sarajevo''s Ottoman bazaar. A social hostel with nightly events, a cosy common room, and the best cevapi recommendations in town.',
    'BA', 'Sarajevo',
    'Saraci 42, Sarajevo 71000',
    43.8598, 18.4310,
    '+387 33 345 678', 'https://bascarsijahostel.example.com',
    '14:00', '23:00', '11:00',
    'flexible', 'active', 'verified', 4.00,
    8.50, 2, TRUE
),
(
    'b1000000-0000-0000-0000-000000000008',
    'a1000000-0000-0000-0000-000000000001',
    'sarajevo-soul-hostel-sarajevo',
    'Sarajevo Soul Hostel',
    'A newly opened boutique hostel in the Austro-Hungarian quarter. Design-forward interiors, pod-style bunks with privacy curtains, and a rooftop bar with panoramic views of the city.',
    'BA', 'Sarajevo',
    'Mula Mustafe Baseskije 65, Sarajevo 71000',
    43.8570, 18.4252,
    '+387 33 456 789', 'https://sarajevosoul.example.com',
    '14:00', '22:00', '11:00',
    'moderate', 'pending_review', 'free', 5.00,
    0, 0, FALSE
)
ON CONFLICT (id) DO NOTHING;


-- ============================================
-- 3. HOSTEL AMENITIES
-- ============================================
-- Amenity IDs from schema: 1=WiFi, 2=Kitchen, 3=Lockers, 4=Laundry,
-- 5=AC, 6=Heating, 7=Hot Showers, 8=Luggage Storage, 9=Parking,
-- 10=Elevator, 11=24h Reception, 12=Airport Shuttle, 13=Tour Desk,
-- 14=Bike Rental, 15=Breakfast, 16=Late Check-out, 17=Bar,
-- 18=Common Room, 19=Rooftop Terrace, 20=Garden, 21=Game Room,
-- 22=Movie Room, 23=BBQ Area, 24=Pool, 25=Live Music, 26=Pub Crawls

INSERT INTO hostel_amenities (hostel_id, amenity_id) VALUES
-- Tirana Backpackers (featured, social): WiFi, Lockers, AC, Bar, Common Room, Pub Crawls
('b1000000-0000-0000-0000-000000000001', 1),
('b1000000-0000-0000-0000-000000000001', 3),
('b1000000-0000-0000-0000-000000000001', 5),
('b1000000-0000-0000-0000-000000000001', 17),
('b1000000-0000-0000-0000-000000000001', 18),
-- Hostel Albania (quiet): WiFi, Kitchen, Hot Showers, Garden
('b1000000-0000-0000-0000-000000000002', 1),
('b1000000-0000-0000-0000-000000000002', 2),
('b1000000-0000-0000-0000-000000000002', 7),
('b1000000-0000-0000-0000-000000000002', 20),
-- Old Town Hostel Kotor: WiFi, Kitchen, Lockers, Rooftop Terrace, Tour Desk
('b1000000-0000-0000-0000-000000000003', 1),
('b1000000-0000-0000-0000-000000000003', 2),
('b1000000-0000-0000-0000-000000000003', 3),
('b1000000-0000-0000-0000-000000000003', 19),
('b1000000-0000-0000-0000-000000000003', 13),
-- Bay View Hostel: WiFi, AC, Pool, Tour Desk, Breakfast
('b1000000-0000-0000-0000-000000000004', 1),
('b1000000-0000-0000-0000-000000000004', 5),
('b1000000-0000-0000-0000-000000000004', 24),
('b1000000-0000-0000-0000-000000000004', 13),
('b1000000-0000-0000-0000-000000000004', 15),
-- Bridge View Hostel Mostar: WiFi, Kitchen, Lockers, Live Music, Common Room
('b1000000-0000-0000-0000-000000000005', 1),
('b1000000-0000-0000-0000-000000000005', 2),
('b1000000-0000-0000-0000-000000000005', 3),
('b1000000-0000-0000-0000-000000000005', 25),
('b1000000-0000-0000-0000-000000000005', 18),
-- Neretva Hostel: WiFi, Lockers, Laundry, Common Room
('b1000000-0000-0000-0000-000000000006', 1),
('b1000000-0000-0000-0000-000000000006', 3),
('b1000000-0000-0000-0000-000000000006', 4),
('b1000000-0000-0000-0000-000000000006', 18),
-- Bascarsija Hostel: WiFi, Lockers, Heating, Common Room, Pub Crawls
('b1000000-0000-0000-0000-000000000007', 1),
('b1000000-0000-0000-0000-000000000007', 3),
('b1000000-0000-0000-0000-000000000007', 6),
('b1000000-0000-0000-0000-000000000007', 18),
('b1000000-0000-0000-0000-000000000007', 26),
-- Sarajevo Soul Hostel: WiFi, AC, Lockers, Rooftop Terrace, Bar
('b1000000-0000-0000-0000-000000000008', 1),
('b1000000-0000-0000-0000-000000000008', 5),
('b1000000-0000-0000-0000-000000000008', 3),
('b1000000-0000-0000-0000-000000000008', 19),
('b1000000-0000-0000-0000-000000000008', 17)
ON CONFLICT DO NOTHING;


-- ============================================
-- 4. ROOMS (2-3 per hostel)
-- ============================================
INSERT INTO rooms (id, hostel_id, name, room_type, capacity, base_price_cents, currency, description) VALUES
-- Tirana Backpackers (3 rooms)
('c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001',
 '8-Bed Mixed Dorm',    'dorm',    8,  1000, 'EUR', 'Spacious dorm with personal reading lights and power outlets at every bunk.'),
('c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001',
 '6-Bed Female Dorm',   'female_dorm', 6, 1200, 'EUR', 'Women-only dorm with ensuite bathroom and hair dryers.'),
('c1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000001',
 'Double Private',      'private', 2,  3500, 'EUR', 'Private double room with balcony overlooking the street.'),

-- Hostel Albania (2 rooms)
('c1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000002',
 '6-Bed Mixed Dorm',    'dorm',    6,   800, 'EUR', 'Simple and clean dorm with wooden bunks and garden views.'),
('c1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000002',
 'Twin Private',        'private', 2,  3000, 'EUR', 'Cozy twin room with shared bathroom down the hall.'),

-- Old Town Hostel Kotor (3 rooms)
('c1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000003',
 '4-Bed Mixed Dorm',    'dorm',    4,  1800, 'EUR', 'Stone-walled dorm with original medieval ceiling beams.'),
('c1000000-0000-0000-0000-000000000007', 'b1000000-0000-0000-0000-000000000003',
 '6-Bed Mixed Dorm',    'dorm',    6,  1500, 'EUR', 'Larger dorm with bay-view window and ensuite shower.'),
('c1000000-0000-0000-0000-000000000008', 'b1000000-0000-0000-0000-000000000003',
 'Double with Bay View', 'private', 2, 5500, 'EUR', 'Private room on the top floor with panoramic Boka Bay views.'),

-- Bay View Hostel (2 rooms)
('c1000000-0000-0000-0000-000000000009', 'b1000000-0000-0000-0000-000000000004',
 '8-Bed Mixed Dorm',    'dorm',    8,  1400, 'EUR', 'Modern dorm with pod-style bunks, each with a privacy curtain.'),
('c1000000-0000-0000-0000-000000000010', 'b1000000-0000-0000-0000-000000000004',
 'Sea View Double',     'private', 2,  4800, 'EUR', 'Bright double with a terrace overlooking the bay.'),

-- Bridge View Hostel Mostar (3 rooms)
('c1000000-0000-0000-0000-000000000011', 'b1000000-0000-0000-0000-000000000005',
 '6-Bed Mixed Dorm',    'dorm',    6,  1000, 'EUR', 'Traditional Bosnian room with kilim rugs and river views.'),
('c1000000-0000-0000-0000-000000000012', 'b1000000-0000-0000-0000-000000000005',
 '4-Bed Female Dorm',   'female_dorm', 4, 1200, 'EUR', 'Women-only dorm overlooking the tea garden.'),
('c1000000-0000-0000-0000-000000000013', 'b1000000-0000-0000-0000-000000000005',
 'Bridge View Double',  'private', 2,  4000, 'EUR', 'The only room in Mostar with a direct Stari Most view from the bed.'),

-- Neretva Hostel (2 rooms)
('c1000000-0000-0000-0000-000000000014', 'b1000000-0000-0000-0000-000000000006',
 '8-Bed Mixed Dorm',    'dorm',    8,   800, 'EUR', 'No-frills dorm at a great price. Clean sheets and solid WiFi.'),
('c1000000-0000-0000-0000-000000000015', 'b1000000-0000-0000-0000-000000000006',
 'Twin Private',        'private', 2,  3000, 'EUR', 'Simple private room with a small desk and wardrobe.'),

-- Bascarsija Hostel (3 rooms)
('c1000000-0000-0000-0000-000000000016', 'b1000000-0000-0000-0000-000000000007',
 '10-Bed Mixed Dorm',   'dorm',   10,   900, 'EUR', 'Large social dorm in the heart of the bazaar. Meets fellow travellers easily.'),
('c1000000-0000-0000-0000-000000000017', 'b1000000-0000-0000-0000-000000000007',
 '4-Bed Female Dorm',   'female_dorm', 4, 1100, 'EUR', 'Quiet women-only dorm tucked away from the main common area.'),
('c1000000-0000-0000-0000-000000000018', 'b1000000-0000-0000-0000-000000000007',
 'Double Ensuite',      'private', 2,  4500, 'EUR', 'Private room with ensuite bathroom and traditional Bosnian decor.'),

-- Sarajevo Soul Hostel (2 rooms)
('c1000000-0000-0000-0000-000000000019', 'b1000000-0000-0000-0000-000000000008',
 '6-Bed Pod Dorm',      'dorm',    6,  1300, 'EUR', 'Design-forward pods with privacy curtains, USB charging, and LED reading lights.'),
('c1000000-0000-0000-0000-000000000020', 'b1000000-0000-0000-0000-000000000008',
 'Deluxe Double',       'private', 2,  6000, 'EUR', 'Boutique private room with rainfall shower and rooftop terrace access.')
ON CONFLICT (id) DO NOTHING;


-- ============================================
-- 5. AVAILABILITY (next 60 days for all rooms)
-- ============================================
-- Uses generate_series to create one row per room per day.
-- Prices vary slightly by day of week (weekends 10-20% higher).
-- Only generated for active hostels.

INSERT INTO availability (room_id, date, total_beds, booked_beds, price_cents, is_blocked)
SELECT
    r.id AS room_id,
    d::date AS date,
    r.capacity AS total_beds,
    -- Simulate some existing bookings (roughly 20% occupancy on weekdays, 40% weekends)
    LEAST(
        FLOOR(r.capacity * CASE WHEN EXTRACT(DOW FROM d) IN (0, 5, 6) THEN 0.4 ELSE 0.2 END)::int,
        r.capacity
    ) AS booked_beds,
    -- Weekend surcharge: +15%
    CASE WHEN EXTRACT(DOW FROM d) IN (0, 5, 6)
         THEN (r.base_price_cents * 1.15)::int
         ELSE r.base_price_cents
    END AS price_cents,
    FALSE AS is_blocked
FROM rooms r
JOIN hostels h ON r.hostel_id = h.id
CROSS JOIN generate_series(CURRENT_DATE, CURRENT_DATE + INTERVAL '59 days', '1 day') AS d
WHERE h.status IN ('active', 'pending_review')
ON CONFLICT (room_id, date) DO NOTHING;


-- ============================================
-- 6. SAMPLE BOOKINGS (for reviews)
-- ============================================
-- We need bookings before we can create reviews (reviews FK to bookings).
-- These are "completed" bookings in the past.

INSERT INTO bookings (
    id, booking_ref, traveler_id, hostel_id, room_id,
    check_in, check_out, num_guests,
    total_price_cents, commission_cents, hostel_payout_cents,
    currency, status, guest_name, guest_email, special_requests
) VALUES
-- Sarah at Tirana Backpackers
('d1000000-0000-0000-0000-000000000001', 'BK-TR1A01',
 'a2000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001',
 CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE - INTERVAL '27 days', 1,
 3000, 105, 2895, 'EUR', 'completed', 'Sarah Thompson', 'sarah@example.com', NULL),
-- Jonas at Tirana Backpackers
('d1000000-0000-0000-0000-000000000002', 'BK-TR1A02',
 'a2000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001',
 CURRENT_DATE - INTERVAL '20 days', CURRENT_DATE - INTERVAL '17 days', 1,
 3000, 105, 2895, 'EUR', 'completed', 'Jonas Muller', 'jonas@example.com', 'Late arrival around midnight'),
-- Sarah at Hostel Albania
('d1000000-0000-0000-0000-000000000003', 'BK-HA1B01',
 'a2000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000004',
 CURRENT_DATE - INTERVAL '25 days', CURRENT_DATE - INTERVAL '23 days', 1,
 1600, 80, 1520, 'EUR', 'completed', 'Sarah Thompson', 'sarah@example.com', NULL),
-- Jonas at Hostel Albania
('d1000000-0000-0000-0000-000000000004', 'BK-HA1B02',
 'a2000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000005',
 CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE - INTERVAL '13 days', 2,
 6000, 300, 5700, 'EUR', 'completed', 'Jonas Muller', 'jonas@example.com', NULL),
-- Sarah at Old Town Hostel Kotor
('d1000000-0000-0000-0000-000000000005', 'BK-KT1A01',
 'a2000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000006',
 CURRENT_DATE - INTERVAL '18 days', CURRENT_DATE - INTERVAL '15 days', 1,
 5400, 216, 5184, 'EUR', 'completed', 'Sarah Thompson', 'sarah@example.com', 'Top bunk please'),
-- Jonas at Old Town Hostel Kotor
('d1000000-0000-0000-0000-000000000006', 'BK-KT1A02',
 'a2000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000008',
 CURRENT_DATE - INTERVAL '14 days', CURRENT_DATE - INTERVAL '11 days', 2,
 16500, 660, 15840, 'EUR', 'completed', 'Jonas Muller', 'jonas@example.com', 'Anniversary trip'),
-- Sarah at Bridge View Hostel Mostar
('d1000000-0000-0000-0000-000000000007', 'BK-MS1A01',
 'a2000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000011',
 CURRENT_DATE - INTERVAL '12 days', CURRENT_DATE - INTERVAL '10 days', 1,
 2000, 70, 1930, 'EUR', 'completed', 'Sarah Thompson', 'sarah@example.com', NULL),
-- Jonas at Bridge View Hostel Mostar
('d1000000-0000-0000-0000-000000000008', 'BK-MS1A02',
 'a2000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000013',
 CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE - INTERVAL '8 days', 2,
 8000, 280, 7720, 'EUR', 'completed', 'Jonas Muller', 'jonas@example.com', NULL),
-- Sarah at Neretva Hostel
('d1000000-0000-0000-0000-000000000009', 'BK-NR1A01',
 'a2000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000014',
 CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE - INTERVAL '8 days', 1,
 1600, 80, 1520, 'EUR', 'completed', 'Sarah Thompson', 'sarah@example.com', NULL),
-- Jonas at Neretva Hostel
('d1000000-0000-0000-0000-000000000010', 'BK-NR1A02',
 'a2000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000014',
 CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE - INTERVAL '3 days', 1,
 1600, 80, 1520, 'EUR', 'completed', 'Jonas Muller', 'jonas@example.com', 'Bottom bunk if possible'),
-- Sarah at Bascarsija Hostel
('d1000000-0000-0000-0000-000000000011', 'BK-SA1A01',
 'a2000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000016',
 CURRENT_DATE - INTERVAL '8 days', CURRENT_DATE - INTERVAL '5 days', 1,
 2700, 108, 2592, 'EUR', 'completed', 'Sarah Thompson', 'sarah@example.com', NULL),
-- Jonas at Bascarsija Hostel
('d1000000-0000-0000-0000-000000000012', 'BK-SA1A02',
 'a2000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000018',
 CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE - INTERVAL '4 days', 2,
 13500, 540, 12960, 'EUR', 'completed', 'Jonas Muller', 'jonas@example.com', NULL)
ON CONFLICT (id) DO NOTHING;


-- ============================================
-- 7. REVIEWS
-- ============================================
-- Note: The on_review_change trigger will auto-update hostel avg_rating and review_count.
-- We set hostel ratings manually above to match; the trigger will recalculate on insert.

INSERT INTO reviews (
    id, booking_id, traveler_id, hostel_id,
    rating_overall, rating_location, rating_cleanliness, rating_staff, rating_atmosphere, rating_value,
    comment, owner_reply, owner_replied_at, is_published
) VALUES
-- Tirana Backpackers reviews
('e1000000-0000-0000-0000-000000000001',
 'd1000000-0000-0000-0000-000000000001', 'a2000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001',
 9, 9, 8, 10, 9, 8,
 'Amazing atmosphere and the bar is legendary. Staff went out of their way to help me find a local SIM card. Would stay again in a heartbeat.',
 'Thank you Sarah! So glad you enjoyed it. See you next time!', NOW() - INTERVAL '28 days', TRUE),

('e1000000-0000-0000-0000-000000000002',
 'd1000000-0000-0000-0000-000000000002', 'a2000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001',
 9, 9, 9, 10, 9, 9,
 'Best hostel in Tirana by far. The pub crawl was a highlight of my Balkans trip. Beds are comfortable and the lockers are huge.',
 NULL, NULL, TRUE),

-- Hostel Albania reviews
('e1000000-0000-0000-0000-000000000003',
 'd1000000-0000-0000-0000-000000000003', 'a2000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002',
 8, 7, 8, 9, 6, 9,
 'Quiet and clean, exactly what I needed after a week of partying. The home-cooked breakfast was a lovely touch. Not much of a social scene though.',
 NULL, NULL, TRUE),

('e1000000-0000-0000-0000-000000000004',
 'd1000000-0000-0000-0000-000000000004', 'a2000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000002',
 7, 7, 8, 8, 5, 9,
 'Good value for money. Very basic but clean. The garden is nice for reading. A bit far from the centre if you do not have transport.',
 'Thanks Jonas! We are working on improving our common areas. Hope to see you again.', NOW() - INTERVAL '12 days', TRUE),

-- Old Town Hostel Kotor reviews
('e1000000-0000-0000-0000-000000000005',
 'd1000000-0000-0000-0000-000000000005', 'a2000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000003',
 10, 10, 9, 10, 9, 8,
 'Unbelievable location inside the old walls. Waking up in a medieval building and stepping out to the square is magical. Rooftop views are spectacular.',
 'Thank you so much Sarah! The Old Town really is special.', NOW() - INTERVAL '14 days', TRUE),

('e1000000-0000-0000-0000-000000000006',
 'd1000000-0000-0000-0000-000000000006', 'a2000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000003',
 9, 10, 9, 9, 8, 7,
 'The private room with bay view was absolutely worth the splurge. Staff organised a boat trip to Perast that was the highlight of Montenegro.',
 NULL, NULL, TRUE),

-- Bridge View Hostel Mostar reviews
('e1000000-0000-0000-0000-000000000007',
 'd1000000-0000-0000-0000-000000000007', 'a2000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000005',
 9, 10, 8, 9, 9, 9,
 'Watching the bridge divers from the tea garden is an experience you cannot get anywhere else. The Bosnian food served here is better than most restaurants.',
 NULL, NULL, TRUE),

('e1000000-0000-0000-0000-000000000008',
 'd1000000-0000-0000-0000-000000000008', 'a2000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000005',
 9, 10, 9, 9, 8, 8,
 'The Bridge View Double lives up to its name. Fell asleep looking at Stari Most lit up at night. Live music on Saturday was a bonus.',
 'So happy you enjoyed the room Jonas! That night view never gets old.', NOW() - INTERVAL '7 days', TRUE),

-- Neretva Hostel reviews
('e1000000-0000-0000-0000-000000000009',
 'd1000000-0000-0000-0000-000000000009', 'a2000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000006',
 7, 6, 7, 8, 6, 9,
 'Does exactly what it says on the tin. Clean, cheap, and the WiFi works. Not the most exciting place but great if you are on a budget.',
 NULL, NULL, TRUE),

('e1000000-0000-0000-0000-000000000010',
 'd1000000-0000-0000-0000-000000000010', 'a2000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000006',
 7, 6, 8, 7, 6, 9,
 'Solid budget option. Nothing fancy but the beds are decent and staff are helpful with directions. Good enough for a night or two in Mostar.',
 NULL, NULL, TRUE),

-- Bascarsija Hostel reviews
('e1000000-0000-0000-0000-000000000011',
 'd1000000-0000-0000-0000-000000000011', 'a2000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000007',
 9, 10, 8, 9, 9, 8,
 'Location is absolutely perfect, right in the middle of Bascarsija. The nightly events meant I made friends from day one. Staff know all the best local spots.',
 NULL, NULL, TRUE),

('e1000000-0000-0000-0000-000000000012',
 'd1000000-0000-0000-0000-000000000012', 'a2000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000007',
 8, 10, 7, 8, 9, 7,
 'Great social hostel in an unbeatable location. The common room gets lively in the evenings. Only downside is the bathrooms could use a refresh.',
 'Thanks for the honest feedback Jonas! Bathroom renovation is planned for next month.', NOW() - INTERVAL '3 days', TRUE)
ON CONFLICT (id) DO NOTHING;


-- ============================================
-- Done! Summary:
-- ============================================
-- 5 profiles (3 owners, 2 travelers)
-- 8 hostels (6 active, 2 pending_review) across 4 cities
-- 20 rooms (mix of dorms, female dorms, privates)
-- ~1200 availability rows (20 rooms x 60 days)
-- 12 completed bookings
-- 12 reviews with varied ratings (7-10)
-- Hostel amenity associations (3-5 per hostel)
