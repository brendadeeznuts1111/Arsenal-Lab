-- White-label Sports Betting Database Schema
-- For operators who rent sports-books but own their customer data

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Customers table (your authoritative customer database)
CREATE TABLE customers (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tg_user_id    BIGINT UNIQUE,
    tg_username   TEXT,
    tg_first_name TEXT,
    tg_last_name  TEXT,
    email         CITEXT UNIQUE,          -- disposable identity from your service
    phone         TEXT,
    currency      TEXT DEFAULT 'USD',
    timezone      TEXT DEFAULT 'UTC',

    -- KYC/AML status
    kyc_status    TEXT CHECK (kyc_status IN ('none','pending','approved','rejected','expired'))
                          DEFAULT 'none',
    kyc_provider  TEXT,                   -- 'sumsub', 'jumio', etc.
    kyc_reference TEXT,                   -- provider's reference ID
    kyc_completed_at TIMESTAMPTZ,
    kyc_expires_at   TIMESTAMPTZ,

    -- Risk and compliance
    risk_profile  JSONB DEFAULT '{}',     -- AML risk scoring, jurisdiction restrictions
    jurisdiction TEXT,                    -- user's legal jurisdiction
    age_verified  BOOLEAN DEFAULT FALSE,
    terms_accepted BOOLEAN DEFAULT FALSE,
    terms_version  TEXT,

    -- Account status
    status        TEXT CHECK (status IN ('active','suspended','banned','closed'))
                          DEFAULT 'active',
    suspended_reason TEXT,
    suspended_until TIMESTAMPTZ,

    -- Metadata
    ip_address    INET,
    user_agent    TEXT,
    referrer      TEXT,
    utm_source    TEXT,
    utm_campaign  TEXT,
    utm_medium    TEXT,

    -- Audit
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ,
    login_count   INTEGER DEFAULT 0
);

-- Bets table (your authoritative bet tracking)
CREATE TABLE bets (
    id            BIGSERIAL PRIMARY KEY,
    customer_id   UUID REFERENCES customers(id) ON DELETE CASCADE,

    -- Renter integration
    renter_ref    TEXT UNIQUE,            -- ticket number returned by rented sports-book
    renter_market TEXT,                   -- market identifier from renter
    renter_event_id TEXT,                 -- event ID from renter

    -- Bet details
    stake         NUMERIC(12,2) NOT NULL CHECK (stake > 0),
    odds          NUMERIC(8,3) NOT NULL CHECK (odds > 1),
    currency      TEXT DEFAULT 'USD',
    market        TEXT NOT NULL,          -- 'moneyline', 'spread', 'over/under', etc.
    selection     TEXT NOT NULL,          -- team/player/outcome selected
    line          NUMERIC(8,2),           -- spread or total (e.g., -3.5, +150.5)

    -- Event details
    event_name    TEXT,
    event_start   TIMESTAMPTZ,
    sport         TEXT,
    league        TEXT,
    season        TEXT,

    -- Settlement
    status        TEXT CHECK (status IN ('pending','won','lost','void','cancelled','cashout'))
                          DEFAULT 'pending',
    payout        NUMERIC(12,2),          -- calculated payout amount
    settled_at    TIMESTAMPTZ,
    settled_by    TEXT,                   -- 'telegram-bot', 'manual', 'auto-settlement'

    -- Identity tracking
    identity_used TEXT NOT NULL,          -- full disposable email used for this bet

    -- Audit
    placed_via    TEXT DEFAULT 'telegram', -- 'telegram', 'web', 'api'
    ip_address    INET,
    user_agent    TEXT,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Identity tokens (for session management)
CREATE TABLE identity_tokens (
    id            BIGSERIAL PRIMARY KEY,
    customer_id   UUID REFERENCES customers(id) ON DELETE CASCADE,
    token         TEXT UNIQUE NOT NULL,   -- the disposable identity string
    expires_at    TIMESTAMPTZ NOT NULL,
    created_at    TIMESTAMPTZ DEFAULT NOW(),

    -- Usage tracking
    last_used_at  TIMESTAMPTZ,
    use_count     INTEGER DEFAULT 0,
    ip_address    INET
);

-- Telegram conversations (for bot context)
CREATE TABLE telegram_sessions (
    id            BIGSERIAL PRIMARY KEY,
    tg_user_id    BIGINT NOT NULL,
    tg_chat_id    BIGINT NOT NULL,
    customer_id   UUID REFERENCES customers(id) ON DELETE CASCADE,

    -- Session state
    state         JSONB DEFAULT '{}',     -- current conversation state
    last_activity TIMESTAMPTZ DEFAULT NOW(),

    -- Context
    current_bet   JSONB,                  -- pending bet being built
    language      TEXT DEFAULT 'en',
    timezone      TEXT DEFAULT 'UTC',

    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(tg_user_id, tg_chat_id)
);

-- KYC audit log
CREATE TABLE kyc_audit_log (
    id            BIGSERIAL PRIMARY KEY,
    customer_id   UUID REFERENCES customers(id) ON DELETE CASCADE,
    action        TEXT NOT NULL,          -- 'initiated', 'completed', 'rejected', 'expired'
    provider      TEXT,
    reference     TEXT,
    old_status    TEXT,
    new_status    TEXT,
    details       JSONB,
    performed_by  TEXT DEFAULT 'system', -- 'system', 'admin', 'user'
    ip_address    INET,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- API usage tracking
CREATE TABLE api_usage (
    id            BIGSERIAL PRIMARY KEY,
    endpoint      TEXT NOT NULL,
    method        TEXT NOT NULL,
    customer_id   UUID REFERENCES customers(id) ON DELETE SET NULL,
    ip_address    INET,
    user_agent    TEXT,
    response_code INTEGER,
    response_time INTEGER,                -- milliseconds
    request_size  INTEGER,                -- bytes
    response_size INTEGER,                -- bytes
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_customers_tg_user_id ON customers(tg_user_id);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_kyc_status ON customers(kyc_status);
CREATE INDEX idx_customers_status ON customers(status);

CREATE INDEX idx_bets_customer_id ON bets(customer_id);
CREATE INDEX idx_bets_renter_ref ON bets(renter_ref);
CREATE INDEX idx_bets_status ON bets(status);
CREATE INDEX idx_bets_event_start ON bets(event_start);
CREATE INDEX idx_bets_created_at ON bets(created_at);

CREATE INDEX idx_identity_tokens_token ON identity_tokens(token);
CREATE INDEX idx_identity_tokens_customer_id ON identity_tokens(customer_id);
CREATE INDEX idx_identity_tokens_expires_at ON identity_tokens(expires_at);

CREATE INDEX idx_telegram_sessions_tg_user_id ON telegram_sessions(tg_user_id);
CREATE INDEX idx_telegram_sessions_customer_id ON telegram_sessions(customer_id);

CREATE INDEX idx_api_usage_customer_id ON api_usage(customer_id);
CREATE INDEX idx_api_usage_created_at ON api_usage(created_at);
CREATE INDEX idx_api_usage_endpoint ON api_usage(endpoint, method);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bets_updated_at BEFORE UPDATE ON bets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_telegram_sessions_updated_at BEFORE UPDATE ON telegram_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Views for analytics
CREATE VIEW active_customers AS
SELECT
    c.*,
    COALESCE(bet_stats.total_bets, 0) as total_bets,
    COALESCE(bet_stats.total_stake, 0) as total_stake,
    COALESCE(bet_stats.total_payout, 0) as total_payout,
    COALESCE(bet_stats.win_rate, 0) as win_rate
FROM customers c
LEFT JOIN (
    SELECT
        customer_id,
        COUNT(*) as total_bets,
        SUM(stake) as total_stake,
        SUM(CASE WHEN status = 'won' THEN payout ELSE 0 END) as total_payout,
        ROUND(
            COUNT(CASE WHEN status = 'won' THEN 1 END)::numeric /
            NULLIF(COUNT(CASE WHEN status IN ('won', 'lost') THEN 1 END), 0) * 100, 2
        ) as win_rate
    FROM bets
    WHERE status IN ('won', 'lost')
    GROUP BY customer_id
) bet_stats ON c.id = bet_stats.customer_id
WHERE c.status = 'active';

-- RLS (Row Level Security) policies for multi-tenancy
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE identity_tokens ENABLE ROW LEVEL SECURITY;

-- Basic RLS policy (you can extend this for multi-tenant operations)
CREATE POLICY customers_policy ON customers FOR ALL USING (true);
CREATE POLICY bets_policy ON bets FOR ALL USING (true);
CREATE POLICY identity_tokens_policy ON identity_tokens FOR ALL USING (true);

-- Comments for documentation
COMMENT ON TABLE customers IS 'Authoritative customer database for white-label operations';
COMMENT ON TABLE bets IS 'Authoritative bet tracking - supersedes renter data';
COMMENT ON TABLE identity_tokens IS 'Disposable identity tokens for authentication';
COMMENT ON TABLE telegram_sessions IS 'Bot conversation state management';
COMMENT ON TABLE kyc_audit_log IS 'KYC compliance audit trail';
COMMENT ON TABLE api_usage IS 'API usage analytics and rate limiting data';

COMMENT ON COLUMN customers.kyc_status IS 'none, pending, approved, rejected, expired';
COMMENT ON COLUMN customers.risk_profile IS 'JSON object with AML risk scores and restrictions';
COMMENT ON COLUMN bets.renter_ref IS 'Ticket number from rented sports-book platform';
COMMENT ON COLUMN bets.identity_used IS 'Full disposable email used to place this bet';
