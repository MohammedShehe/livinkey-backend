-- Add optional link URL to advertisements (for tenant app click-through)
ALTER TABLE livinkey_ads
  ADD COLUMN link_url VARCHAR(500) NULL AFTER display_order;
