-- PUCCA DOLLZ Whitelist Table
-- Run this in Supabase SQL Editor (https://supabase.com → SQL Editor)

CREATE TABLE IF NOT EXISTS whitelist (
    id BIGSERIAL PRIMARY KEY,
    x_username TEXT NOT NULL,
    wallet TEXT NOT NULL,
    reply_url TEXT,
    task_follow BOOLEAN DEFAULT FALSE,
    task_like BOOLEAN DEFAULT FALSE,
    task_repost BOOLEAN DEFAULT FALSE,
    task_tag BOOLEAN DEFAULT FALSE,
    task_wallet BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique constraints to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_whitelist_username ON whitelist (LOWER(x_username));
CREATE UNIQUE INDEX IF NOT EXISTS idx_whitelist_wallet ON whitelist (LOWER(wallet));

-- Enable Row Level Security
ALTER TABLE whitelist ENABLE ROW LEVEL SECURITY;

-- Policy: Allow inserts from the service role (server-side only)
CREATE POLICY "Service role can do everything" ON whitelist
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Index for faster date queries (admin dashboard)
CREATE INDEX IF NOT EXISTS idx_whitelist_created ON whitelist (created_at DESC);
