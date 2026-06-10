-- Step 12: Site version history table
-- Run this in the Supabase SQL Editor

CREATE TABLE IF NOT EXISTS site_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  html_content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_site_versions_site_id ON site_versions(site_id);

-- RLS: site owners can view their version history
ALTER TABLE site_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site owners can view their versions"
  ON site_versions FOR SELECT
  USING (
    site_id IN (
      SELECT id FROM sites WHERE user_id = auth.uid()
    )
  );
