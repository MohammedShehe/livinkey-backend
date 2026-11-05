-- v3 migration (optional – the server also applies this automatically on start-up
-- through config/schema.bootstrap.js; run it by hand only if you prefer to).
-- Safe to run once. If a column already exists MySQL will say so; just skip that line.

-- 1) Offers: end time for the live countdown
ALTER TABLE pg_offers ADD COLUMN valid_until_time TIME NULL AFTER valid_until;

-- 2) Manual room counts shown on the website / guest app
ALTER TABLE pgs ADD COLUMN manual_rooms_enabled TINYINT(1) NOT NULL DEFAULT 0;
ALTER TABLE pgs ADD COLUMN manual_total_rooms INT NULL;
ALTER TABLE pgs ADD COLUMN manual_vacant_rooms INT NULL;

-- 3) Electricity: one meter or two meters (main + inverter)
ALTER TABLE pg_electricity_settings ADD COLUMN meter_mode ENUM('single','dual') NOT NULL DEFAULT 'single';
ALTER TABLE bills ADD COLUMN meter_mode ENUM('single','dual') NULL;
ALTER TABLE bills ADD COLUMN inverter_previous_reading DECIMAL(12,2) NULL;
ALTER TABLE bills ADD COLUMN inverter_current_reading DECIMAL(12,2) NULL;
ALTER TABLE bills ADD COLUMN inverter_units DECIMAL(12,2) NULL;
ALTER TABLE bills ADD COLUMN main_units DECIMAL(12,2) NULL;
