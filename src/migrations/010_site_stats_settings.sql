-- Manual website stats (properties + happy tenants)
-- When enabled, public site shows: live_count + manual_count

CREATE TABLE IF NOT EXISTS site_settings (
  setting_key VARCHAR(64) NOT NULL PRIMARY KEY,
  setting_value TEXT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO site_settings (setting_key, setting_value) VALUES
  ('manual_stats_enabled', '0'),
  ('manual_properties_count', '0'),
  ('manual_happy_tenants_count', '0')
ON DUPLICATE KEY UPDATE setting_key = setting_key;
