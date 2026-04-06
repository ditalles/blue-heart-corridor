-- Balkan Hostel Marketplace — Full Database Schema
-- Run this in Supabase SQL Editor to set up the database

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES (extends Supabase auth.users)
-- ============================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    role VARCHAR(20) NOT NULL DEFAULT 'traveler'
        CHECK (role IN ('traveler', 'owner', 'admin')),
    preferred_currency VARCHAR(3) DEFAULT 'EUR',
    stripe_customer_id VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'traveler')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- HOSTELS
-- ============================================
CREATE TABLE hostels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    slug VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    country VARCHAR(2) NOT NULL,
    city VARCHAR(100) NOT NULL,
    address VARCHAR(500) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    phone VARCHAR(50),
    website VARCHAR(500),
    check_in_from TIME NOT NULL DEFAULT '14:00',
    check_in_until TIME NOT NULL DEFAULT '22:00',
    check_out_until TIME NOT NULL DEFAULT '11:00',
    cancellation_policy VARCHAR(20) NOT NULL DEFAULT 'flexible'
        CHECK (cancellation_policy IN ('flexible', 'moderate', 'strict')),
    status VARCHAR(20) NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'pending_review', 'active', 'suspended')),
    subscription_tier VARCHAR(20) NOT NULL DEFAULT 'free'
        CHECK (subscription_tier IN ('free', 'verified', 'featured')),
    commission_rate DECIMAL(4,2) NOT NULL DEFAULT 5.00,
    stripe_account_id VARCHAR(255),
    avg_rating DECIMAL(3,2) DEFAULT 0,
    review_count INT DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_hostels_country_city ON hostels(country, city) WHERE status = 'active';
CREATE INDEX idx_hostels_slug ON hostels(slug);
CREATE INDEX idx_hostels_owner ON hostels(owner_id);
CREATE INDEX idx_hostels_status ON hostels(status);

-- ============================================
-- HOSTEL IMAGES
-- ============================================
CREATE TABLE hostel_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hostel_id UUID NOT NULL REFERENCES hostels(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    sort_order INT NOT NULL DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_hostel_images_hostel ON hostel_images(hostel_id);

-- ============================================
-- AMENITIES
-- ============================================
CREATE TABLE amenities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(50),
    category VARCHAR(50) NOT NULL
        CHECK (category IN ('facilities', 'services', 'social'))
);

CREATE TABLE hostel_amenities (
    hostel_id UUID REFERENCES hostels(id) ON DELETE CASCADE,
    amenity_id INT REFERENCES amenities(id) ON DELETE CASCADE,
    PRIMARY KEY (hostel_id, amenity_id)
);

-- Seed amenities
INSERT INTO amenities (name, icon, category) VALUES
    ('Free WiFi', 'wifi', 'facilities'),
    ('Kitchen', 'cooking-pot', 'facilities'),
    ('Lockers', 'lock', 'facilities'),
    ('Laundry', 'shirt', 'facilities'),
    ('Air Conditioning', 'snowflake', 'facilities'),
    ('Heating', 'flame', 'facilities'),
    ('Hot Showers', 'shower-head', 'facilities'),
    ('Luggage Storage', 'luggage', 'facilities'),
    ('Parking', 'car', 'facilities'),
    ('Elevator', 'arrow-up-down', 'facilities'),
    ('24h Reception', 'clock', 'services'),
    ('Airport Shuttle', 'plane', 'services'),
    ('Tour Desk', 'map', 'services'),
    ('Bike Rental', 'bike', 'services'),
    ('Breakfast Included', 'coffee', 'services'),
    ('Late Check-out', 'clock', 'services'),
    ('Bar', 'beer', 'social'),
    ('Common Room', 'sofa', 'social'),
    ('Rooftop Terrace', 'sun', 'social'),
    ('Garden', 'trees', 'social'),
    ('Game Room', 'gamepad-2', 'social'),
    ('Movie Room', 'tv', 'social'),
    ('BBQ Area', 'flame', 'social'),
    ('Pool', 'waves', 'social'),
    ('Live Music', 'music', 'social'),
    ('Pub Crawls', 'party-popper', 'social');

-- ============================================
-- ROOMS
-- ============================================
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hostel_id UUID NOT NULL REFERENCES hostels(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    room_type VARCHAR(20) NOT NULL
        CHECK (room_type IN ('dorm', 'private', 'female_dorm')),
    capacity INT NOT NULL CHECK (capacity > 0),
    base_price_cents INT NOT NULL CHECK (base_price_cents > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rooms_hostel ON rooms(hostel_id);

-- ============================================
-- AVAILABILITY (date-based inventory)
-- ============================================
CREATE TABLE availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_beds INT NOT NULL CHECK (total_beds > 0),
    booked_beds INT NOT NULL DEFAULT 0 CHECK (booked_beds >= 0),
    price_cents INT NOT NULL CHECK (price_cents > 0),
    is_blocked BOOLEAN DEFAULT FALSE,
    UNIQUE(room_id, date)
);

CREATE INDEX idx_availability_room_date ON availability(room_id, date);
CREATE INDEX idx_availability_search ON availability(date, is_blocked)
    WHERE is_blocked = FALSE;

-- ============================================
-- BOOKINGS
-- ============================================
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_ref VARCHAR(12) UNIQUE NOT NULL,
    traveler_id UUID NOT NULL REFERENCES profiles(id),
    hostel_id UUID NOT NULL REFERENCES hostels(id),
    room_id UUID NOT NULL REFERENCES rooms(id),
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    num_guests INT NOT NULL DEFAULT 1 CHECK (num_guests > 0),
    total_price_cents INT NOT NULL CHECK (total_price_cents > 0),
    commission_cents INT NOT NULL DEFAULT 0,
    hostel_payout_cents INT NOT NULL DEFAULT 0,
    currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'confirmed', 'confirmed_pay_on_arrival', 'checked_in', 'completed', 'cancelled', 'no_show')),
    stripe_payment_intent_id VARCHAR(255),
    cancellation_reason TEXT,
    cancelled_at TIMESTAMPTZ,
    guest_name VARCHAR(255) NOT NULL,
    guest_email VARCHAR(255) NOT NULL,
    special_requests TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (check_out > check_in)
);

CREATE INDEX idx_bookings_traveler ON bookings(traveler_id);
CREATE INDEX idx_bookings_hostel ON bookings(hostel_id, check_in);
CREATE INDEX idx_bookings_status ON bookings(status)
    WHERE status IN ('pending', 'confirmed');
CREATE INDEX idx_bookings_ref ON bookings(booking_ref);

-- ============================================
-- REVIEWS
-- ============================================
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID UNIQUE NOT NULL REFERENCES bookings(id),
    traveler_id UUID NOT NULL REFERENCES profiles(id),
    hostel_id UUID NOT NULL REFERENCES hostels(id),
    rating_overall SMALLINT NOT NULL CHECK (rating_overall BETWEEN 1 AND 10),
    rating_location SMALLINT CHECK (rating_location BETWEEN 1 AND 10),
    rating_cleanliness SMALLINT CHECK (rating_cleanliness BETWEEN 1 AND 10),
    rating_staff SMALLINT CHECK (rating_staff BETWEEN 1 AND 10),
    rating_atmosphere SMALLINT CHECK (rating_atmosphere BETWEEN 1 AND 10),
    rating_value SMALLINT CHECK (rating_value BETWEEN 1 AND 10),
    comment TEXT,
    owner_reply TEXT,
    owner_replied_at TIMESTAMPTZ,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_hostel ON reviews(hostel_id) WHERE is_published = TRUE;
CREATE INDEX idx_reviews_traveler ON reviews(traveler_id);

-- Update hostel avg_rating on review insert/update
CREATE OR REPLACE FUNCTION update_hostel_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE hostels SET
        avg_rating = (
            SELECT COALESCE(AVG(rating_overall), 0)
            FROM reviews
            WHERE hostel_id = COALESCE(NEW.hostel_id, OLD.hostel_id)
            AND is_published = TRUE
        ),
        review_count = (
            SELECT COUNT(*)
            FROM reviews
            WHERE hostel_id = COALESCE(NEW.hostel_id, OLD.hostel_id)
            AND is_published = TRUE
        ),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.hostel_id, OLD.hostel_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_review_change
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_hostel_rating();

-- ============================================
-- HOSTEL SUBSCRIPTIONS
-- ============================================
CREATE TABLE hostel_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hostel_id UUID UNIQUE NOT NULL REFERENCES hostels(id) ON DELETE CASCADE,
    tier VARCHAR(20) NOT NULL DEFAULT 'free'
        CHECK (tier IN ('free', 'verified', 'featured')),
    stripe_subscription_id VARCHAR(255),
    stripe_price_id VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'past_due', 'cancelled')),
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Hostels
ALTER TABLE hostels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active hostels are viewable by everyone"
    ON hostels FOR SELECT
    USING (status = 'active' OR owner_id = auth.uid());

CREATE POLICY "Owners can insert hostels"
    ON hostels FOR INSERT
    WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update own hostels"
    ON hostels FOR UPDATE
    USING (owner_id = auth.uid());

-- Hostel Images
ALTER TABLE hostel_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Images viewable by everyone"
    ON hostel_images FOR SELECT
    USING (true);

CREATE POLICY "Owners can manage hostel images"
    ON hostel_images FOR ALL
    USING (
        hostel_id IN (SELECT id FROM hostels WHERE owner_id = auth.uid())
    );

-- Rooms
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Rooms viewable by everyone"
    ON rooms FOR SELECT
    USING (true);

CREATE POLICY "Owners can manage rooms"
    ON rooms FOR ALL
    USING (
        hostel_id IN (SELECT id FROM hostels WHERE owner_id = auth.uid())
    );

-- Availability
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Availability viewable by everyone"
    ON availability FOR SELECT
    USING (true);

CREATE POLICY "Owners can manage availability"
    ON availability FOR ALL
    USING (
        room_id IN (
            SELECT r.id FROM rooms r
            JOIN hostels h ON r.hostel_id = h.id
            WHERE h.owner_id = auth.uid()
        )
    );

-- Bookings
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Travelers can view own bookings"
    ON bookings FOR SELECT
    USING (
        traveler_id = auth.uid() OR
        hostel_id IN (SELECT id FROM hostels WHERE owner_id = auth.uid())
    );

CREATE POLICY "Travelers can create bookings"
    ON bookings FOR INSERT
    WITH CHECK (traveler_id = auth.uid());

-- Reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published reviews are viewable by everyone"
    ON reviews FOR SELECT
    USING (is_published = TRUE OR traveler_id = auth.uid());

CREATE POLICY "Travelers can create reviews"
    ON reviews FOR INSERT
    WITH CHECK (traveler_id = auth.uid());

-- Amenities (public read)
ALTER TABLE amenities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Amenities viewable by everyone" ON amenities FOR SELECT USING (true);

ALTER TABLE hostel_amenities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Hostel amenities viewable by everyone" ON hostel_amenities FOR SELECT USING (true);
CREATE POLICY "Owners can manage hostel amenities"
    ON hostel_amenities FOR ALL
    USING (hostel_id IN (SELECT id FROM hostels WHERE owner_id = auth.uid()));

-- Subscriptions
ALTER TABLE hostel_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners can view own subscriptions"
    ON hostel_subscriptions FOR SELECT
    USING (hostel_id IN (SELECT id FROM hostels WHERE owner_id = auth.uid()));

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Generate booking reference
CREATE OR REPLACE FUNCTION generate_booking_ref()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    result TEXT := 'BK-';
    i INT;
BEGIN
    FOR i IN 1..6 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Generate slug from name
CREATE OR REPLACE FUNCTION generate_slug(name TEXT, city TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN lower(
        regexp_replace(
            regexp_replace(name || '-' || city, '[^a-zA-Z0-9\s-]', '', 'g'),
            '\s+', '-', 'g'
        )
    );
END;
$$ LANGUAGE plpgsql;

-- Search hostels with availability
CREATE OR REPLACE FUNCTION search_hostels(
    p_country TEXT DEFAULT NULL,
    p_city TEXT DEFAULT NULL,
    p_checkin DATE DEFAULT NULL,
    p_checkout DATE DEFAULT NULL,
    p_guests INT DEFAULT 1,
    p_min_price INT DEFAULT NULL,
    p_max_price INT DEFAULT NULL,
    p_sort TEXT DEFAULT 'rating',
    p_limit INT DEFAULT 20,
    p_offset INT DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    slug VARCHAR,
    name VARCHAR,
    description TEXT,
    country VARCHAR,
    city VARCHAR,
    address VARCHAR,
    latitude DECIMAL,
    longitude DECIMAL,
    status VARCHAR,
    subscription_tier VARCHAR,
    avg_rating DECIMAL,
    review_count INT,
    is_verified BOOLEAN,
    min_price_cents INT,
    primary_image_url VARCHAR,
    total_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH hostel_prices AS (
        SELECT
            r.hostel_id,
            MIN(COALESCE(a.price_cents, r.base_price_cents)) as min_price
        FROM rooms r
        LEFT JOIN availability a ON a.room_id = r.id
            AND (p_checkin IS NULL OR a.date >= p_checkin)
            AND (p_checkout IS NULL OR a.date < p_checkout)
            AND a.is_blocked = FALSE
            AND (a.total_beds - a.booked_beds) >= p_guests
        WHERE r.is_active = TRUE
        GROUP BY r.hostel_id
        HAVING (p_checkin IS NULL OR COUNT(a.id) >= (p_checkout - p_checkin))
    ),
    primary_images AS (
        SELECT DISTINCT ON (hi.hostel_id)
            hi.hostel_id,
            hi.url
        FROM hostel_images hi
        ORDER BY hi.hostel_id, hi.is_primary DESC, hi.sort_order ASC
    )
    SELECT
        h.id,
        h.slug,
        h.name,
        h.description,
        h.country,
        h.city,
        h.address,
        h.latitude,
        h.longitude,
        h.status,
        h.subscription_tier,
        h.avg_rating,
        h.review_count,
        h.is_verified,
        hp.min_price::INT,
        pi.url,
        COUNT(*) OVER() as total_count
    FROM hostels h
    JOIN hostel_prices hp ON hp.hostel_id = h.id
    LEFT JOIN primary_images pi ON pi.hostel_id = h.id
    WHERE h.status = 'active'
        AND (p_country IS NULL OR h.country = p_country)
        AND (p_city IS NULL OR h.city = p_city)
        AND (p_min_price IS NULL OR hp.min_price >= p_min_price)
        AND (p_max_price IS NULL OR hp.min_price <= p_max_price)
    ORDER BY
        CASE WHEN h.subscription_tier = 'featured' THEN 0
             WHEN h.subscription_tier = 'verified' THEN 1
             ELSE 2 END,
        CASE p_sort
            WHEN 'price_asc' THEN hp.min_price
            WHEN 'price_desc' THEN -hp.min_price
            ELSE NULL
        END,
        CASE p_sort
            WHEN 'rating' THEN h.avg_rating
            WHEN 'reviews' THEN h.review_count::DECIMAL
            ELSE h.avg_rating
        END DESC NULLS LAST,
        h.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
