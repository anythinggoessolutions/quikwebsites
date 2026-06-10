-- QuikWebsites — Stripe Integration Migration
-- Run this in the Supabase SQL Editor

-- Add plan_status column to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS plan_status TEXT NOT NULL DEFAULT 'active';

-- Fix monthly credit amounts to match spec (Starter=10, Pro=25)
CREATE OR REPLACE FUNCTION reset_monthly_credits(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_plan plan_tier;
  v_new_credits INT;
BEGIN
  SELECT plan INTO v_plan FROM profiles WHERE id = p_user_id;

  v_new_credits := CASE v_plan
    WHEN 'free' THEN 0
    WHEN 'starter' THEN 10
    WHEN 'pro' THEN 25
    ELSE 0
  END;

  UPDATE profiles
  SET monthly_credits = v_new_credits, credits_reset_at = NOW()
  WHERE id = p_user_id;

  INSERT INTO transactions (user_id, type, credits_amount, description)
  VALUES (p_user_id, 'monthly_reset', v_new_credits, v_plan || ' plan monthly reset');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
