-- QuikWebsites Database Schema
-- Step 1: Supabase Setup
-- Run this in the Supabase SQL Editor or via Management API

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE plan_tier AS ENUM ('free', 'starter', 'pro');
CREATE TYPE site_status AS ENUM ('draft', 'published', 'unpublished');
CREATE TYPE transaction_type AS ENUM ('generation', 'edit', 'purchase', 'monthly_reset', 'refund');

-- ============================================
-- PROFILES TABLE (extends auth.users)
-- ============================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  plan plan_tier NOT NULL DEFAULT 'free',
  monthly_credits INT NOT NULL DEFAULT 1,
  purchased_credits INT NOT NULL DEFAULT 0,
  credits_reset_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile when user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- SITES TABLE
-- ============================================

CREATE TABLE sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  business_type TEXT NOT NULL,
  description TEXT,
  html_content TEXT,
  custom_domain TEXT UNIQUE,
  status site_status NOT NULL DEFAULT 'draft',
  cloudflare_project_id TEXT,
  cloudflare_deployment_url TEXT,
  meta JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sites_user_id ON sites(user_id);
CREATE INDEX idx_sites_slug ON sites(slug);
CREATE INDEX idx_sites_status ON sites(status);

CREATE TRIGGER sites_updated_at
  BEFORE UPDATE ON sites
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- SITE VERSIONS (undo/rollback history)
-- ============================================

CREATE TABLE site_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  html_content TEXT NOT NULL,
  version_number INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_site_versions_site_id ON site_versions(site_id);

-- Auto-save version before site edit
CREATE OR REPLACE FUNCTION save_site_version()
RETURNS TRIGGER AS $$
DECLARE
  next_version INT;
BEGIN
  -- Only save a version if html_content actually changed
  IF OLD.html_content IS DISTINCT FROM NEW.html_content AND OLD.html_content IS NOT NULL THEN
    SELECT COALESCE(MAX(version_number), 0) + 1 INTO next_version
    FROM site_versions WHERE site_id = OLD.id;

    INSERT INTO site_versions (site_id, html_content, version_number)
    VALUES (OLD.id, OLD.html_content, next_version);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_site_html_update
  BEFORE UPDATE ON sites
  FOR EACH ROW
  EXECUTE FUNCTION save_site_version();

-- ============================================
-- TRANSACTIONS (credit ledger)
-- ============================================

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  site_id UUID REFERENCES sites(id) ON DELETE SET NULL,
  type transaction_type NOT NULL,
  credits_amount INT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);

-- ============================================
-- ATOMIC CREDIT DEDUCTION FUNCTION
-- Consumes monthly_credits first, then purchased_credits
-- Returns true if successful, false if insufficient
-- ============================================

CREATE OR REPLACE FUNCTION deduct_credits(
  p_user_id UUID,
  p_amount INT,
  p_type transaction_type,
  p_site_id UUID DEFAULT NULL,
  p_description TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_monthly INT;
  v_purchased INT;
  v_from_monthly INT;
  v_from_purchased INT;
BEGIN
  -- Lock the row to prevent race conditions
  SELECT monthly_credits, purchased_credits
  INTO v_monthly, v_purchased
  FROM profiles
  WHERE id = p_user_id
  FOR UPDATE;

  -- Check total balance
  IF (v_monthly + v_purchased) < p_amount THEN
    RETURN FALSE;
  END IF;

  -- Consume monthly first, then purchased
  v_from_monthly := LEAST(v_monthly, p_amount);
  v_from_purchased := p_amount - v_from_monthly;

  UPDATE profiles
  SET
    monthly_credits = monthly_credits - v_from_monthly,
    purchased_credits = purchased_credits - v_from_purchased
  WHERE id = p_user_id;

  -- Log the transaction
  INSERT INTO transactions (user_id, site_id, type, credits_amount, description)
  VALUES (p_user_id, p_site_id, p_type, -p_amount, p_description);

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ADD CREDITS FUNCTION (for purchases / monthly resets)
-- ============================================

CREATE OR REPLACE FUNCTION add_credits(
  p_user_id UUID,
  p_amount INT,
  p_type transaction_type,
  p_to_purchased BOOLEAN DEFAULT TRUE,
  p_description TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  IF p_to_purchased THEN
    UPDATE profiles
    SET purchased_credits = purchased_credits + p_amount
    WHERE id = p_user_id;
  ELSE
    UPDATE profiles
    SET monthly_credits = p_amount
    WHERE id = p_user_id;
  END IF;

  INSERT INTO transactions (user_id, type, credits_amount, description)
  VALUES (p_user_id, p_type, p_amount, p_description);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- MONTHLY CREDITS RESET FUNCTION
-- Called by a cron job or Stripe webhook
-- ============================================

CREATE OR REPLACE FUNCTION reset_monthly_credits(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_plan plan_tier;
  v_new_credits INT;
BEGIN
  SELECT plan INTO v_plan FROM profiles WHERE id = p_user_id;

  v_new_credits := CASE v_plan
    WHEN 'free' THEN 1
    WHEN 'starter' THEN 5
    WHEN 'pro' THEN 20
    ELSE 0
  END;

  UPDATE profiles
  SET monthly_credits = v_new_credits, credits_reset_at = NOW()
  WHERE id = p_user_id;

  INSERT INTO transactions (user_id, type, credits_amount, description)
  VALUES (p_user_id, 'monthly_reset', v_new_credits, v_plan || ' plan monthly reset');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- PROFILES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- SITES
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sites"
  ON sites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sites"
  ON sites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sites"
  ON sites FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sites"
  ON sites FOR DELETE
  USING (auth.uid() = user_id);

-- Published sites are viewable by anyone (for public site serving)
CREATE POLICY "Published sites are public"
  ON sites FOR SELECT
  USING (status = 'published');

-- SITE VERSIONS
ALTER TABLE site_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own site versions"
  ON site_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sites WHERE sites.id = site_versions.site_id AND sites.user_id = auth.uid()
    )
  );

-- TRANSACTIONS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- SERVICE ROLE PERMISSIONS
-- Backend (Cloudflare Workers) uses service_role key
-- which bypasses RLS for admin operations like:
-- - Credit deductions during generation
-- - Site publishing to Cloudflare
-- - Stripe webhook handling
-- - Monthly credit resets
-- ============================================
