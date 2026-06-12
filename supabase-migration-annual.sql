-- Annual billing support
-- Run this in the Supabase SQL editor.

-- Track whether a subscriber pays monthly or annually.
-- Annual subscribers get their monthly credits reset by the server's
-- credit reset checker (credits-reset.js) instead of the Stripe webhook.
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS plan_interval TEXT NOT NULL DEFAULT 'monthly';
