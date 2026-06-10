-- Step 13: Pageview analytics table
-- Run this in the Supabase SQL Editor

CREATE TABLE IF NOT EXISTS pageviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  path TEXT NOT NULL DEFAULT '/',
  referrer TEXT,
  country TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_pageviews_site_id ON pageviews(site_id);
CREATE INDEX idx_pageviews_created_at ON pageviews(created_at);

ALTER TABLE pageviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site owners can view their pageviews"
  ON pageviews FOR SELECT
  USING (
    site_id IN (
      SELECT id FROM sites WHERE user_id = auth.uid()
    )
  );
