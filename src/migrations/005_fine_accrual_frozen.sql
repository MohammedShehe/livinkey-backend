-- Freeze auto fine accrual after admin waive/reduce.
-- Prefer: npm run migrate  (scripts/migrate.js applies this idempotently)

ALTER TABLE bills
  ADD COLUMN fine_accrual_frozen TINYINT(1) NOT NULL DEFAULT 0 AFTER max_fine;
