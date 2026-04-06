-- Blue Heart Corridor — Omnichannel Messaging Schema
-- Bridges WhatsApp (travelers) ↔ Viber (hostel owners)

-- ============================================
-- CONVERSATIONS
-- ============================================
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    traveler_id UUID NOT NULL REFERENCES profiles(id),
    hostel_id UUID NOT NULL REFERENCES hostels(id),
    traveler_channel VARCHAR(20) NOT NULL DEFAULT 'whatsapp'
        CHECK (traveler_channel IN ('whatsapp', 'web')),
    host_channel VARCHAR(20) NOT NULL DEFAULT 'viber'
        CHECK (host_channel IN ('viber', 'whatsapp', 'web')),
    status VARCHAR(20) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'archived')),
    unread_host INT NOT NULL DEFAULT 0,
    unread_traveler INT NOT NULL DEFAULT 0,
    last_message_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_conversations_hostel ON conversations(hostel_id, status);
CREATE INDEX idx_conversations_traveler ON conversations(traveler_id);
CREATE UNIQUE INDEX idx_conversations_unique ON conversations(traveler_id, hostel_id);

-- ============================================
-- MESSAGES
-- ============================================
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_type VARCHAR(10) NOT NULL
        CHECK (sender_type IN ('traveler', 'host', 'system')),
    content TEXT NOT NULL,
    channel VARCHAR(20) NOT NULL
        CHECK (channel IN ('whatsapp', 'viber', 'web')),
    status VARCHAR(20) NOT NULL DEFAULT 'sent'
        CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at);

-- ============================================
-- HOST CHANNEL PREFERENCES
-- ============================================
CREATE TABLE host_channel_preferences (
    hostel_id UUID PRIMARY KEY REFERENCES hostels(id) ON DELETE CASCADE,
    preferred_channel VARCHAR(20) NOT NULL DEFAULT 'viber'
        CHECK (preferred_channel IN ('viber', 'whatsapp', 'web')),
    viber_id VARCHAR(255),
    whatsapp_number VARCHAR(50),
    auto_reply_enabled BOOLEAN DEFAULT TRUE,
    auto_reply_message TEXT DEFAULT 'Thanks for your message! We will get back to you shortly.',
    business_hours_start TIME DEFAULT '08:00',
    business_hours_end TIME DEFAULT '22:00',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations"
    ON conversations FOR SELECT
    USING (
        traveler_id = auth.uid() OR
        hostel_id IN (SELECT id FROM hostels WHERE owner_id = auth.uid())
    );

CREATE POLICY "Travelers can create conversations"
    ON conversations FOR INSERT
    WITH CHECK (traveler_id = auth.uid());

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in own conversations"
    ON messages FOR SELECT
    USING (
        conversation_id IN (
            SELECT id FROM conversations
            WHERE traveler_id = auth.uid()
            OR hostel_id IN (SELECT id FROM hostels WHERE owner_id = auth.uid())
        )
    );

CREATE POLICY "Users can send messages in own conversations"
    ON messages FOR INSERT
    WITH CHECK (
        conversation_id IN (
            SELECT id FROM conversations
            WHERE traveler_id = auth.uid()
            OR hostel_id IN (SELECT id FROM hostels WHERE owner_id = auth.uid())
        )
    );

ALTER TABLE host_channel_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage channel preferences"
    ON host_channel_preferences FOR ALL
    USING (hostel_id IN (SELECT id FROM hostels WHERE owner_id = auth.uid()));

CREATE POLICY "Public can view channel preferences"
    ON host_channel_preferences FOR SELECT
    USING (true);

-- ============================================
-- AUTO-UPDATE last_message_at
-- ============================================
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations SET
        last_message_at = NEW.created_at,
        unread_host = CASE WHEN NEW.sender_type = 'traveler' THEN unread_host + 1 ELSE unread_host END,
        unread_traveler = CASE WHEN NEW.sender_type = 'host' THEN unread_traveler + 1 ELSE unread_traveler END
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_message_insert
    AFTER INSERT ON messages
    FOR EACH ROW EXECUTE FUNCTION update_conversation_on_message();

-- Enable Supabase Realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
