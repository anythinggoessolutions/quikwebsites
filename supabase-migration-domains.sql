-- Step 9: Add custom domain columns to sites table
-- Run this in the Supabase SQL Editor

ALTER TABLE sites ADD COLUMN IF NOT EXISTS custom_domain TEXT;
ALTER TABLE sites ADD COLUMN IF NOT EXISTS cloudflare_zone_id TEXT;
