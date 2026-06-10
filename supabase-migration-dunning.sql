-- Step 11: Add past_due_since column for grace period tracking
-- Run this in the Supabase SQL Editor

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS past_due_since TIMESTAMPTZ;
