-- Add explanation text for other charges on bills
-- Run once against the production/staging database.
ALTER TABLE bills
  ADD COLUMN other_charges_note TEXT NULL AFTER other_charges;
