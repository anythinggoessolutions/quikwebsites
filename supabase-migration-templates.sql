-- Step 15: Template gallery + recycling
-- Run this in the Supabase SQL Editor

-- Templates table (public gallery)
CREATE TABLE IF NOT EXISTS templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_site_id UUID REFERENCES sites(id) ON DELETE SET NULL,
  category TEXT NOT NULL DEFAULT 'general',
  html_content TEXT NOT NULL,
  preview_html TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_templates_category ON templates(category);

-- Public read access for template gallery (no auth required)
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Templates are publicly readable"
  ON templates FOR SELECT
  USING (true);

-- Track which sites have been recycled
ALTER TABLE sites ADD COLUMN IF NOT EXISTS recycled_at TIMESTAMPTZ;
