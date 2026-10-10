-- Livinkey: Period of Stay migration
-- Run this once on an existing database before creating new tenants.
ALTER TABLE tenant_details
  ADD COLUMN period_of_stay TINYINT UNSIGNED NULL
  COMMENT 'Duration of stay in months (1-12)'
  AFTER arrival_date;

-- New tenant creation is validated by the API to accept only 1-12 months.
