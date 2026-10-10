-- Livinkey: multi-bill payment scope + allocation ledger.
-- Idempotent-friendly when applied via scripts/migrate.js (preferred).
-- Safe to run manually; existing payment_proofs rows default to scope='bill'.

-- 1. Allocation ledger for auditable multi-bill proof allocation
CREATE TABLE IF NOT EXISTS payment_allocations (
  id INT NOT NULL AUTO_INCREMENT,
  payment_proof_id INT NULL,
  bill_payment_id INT NULL,
  tenant_id INT NOT NULL,
  bill_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  allocation_order INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_payment_allocations_proof (payment_proof_id),
  KEY idx_payment_allocations_bill (bill_id),
  KEY idx_payment_allocations_tenant (tenant_id),
  CONSTRAINT fk_payment_allocations_proof
    FOREIGN KEY (payment_proof_id) REFERENCES payment_proofs(id) ON DELETE SET NULL,
  CONSTRAINT fk_payment_allocations_bill_payment
    FOREIGN KEY (bill_payment_id) REFERENCES bill_payments(id) ON DELETE SET NULL,
  CONSTRAINT fk_payment_allocations_tenant
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  CONSTRAINT fk_payment_allocations_bill
    FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Payment scope on proofs (bill | outstanding)
-- Run only if the column does not already exist:
-- ALTER TABLE payment_proofs
--   ADD COLUMN payment_scope ENUM('bill','outstanding') NOT NULL DEFAULT 'bill' AFTER bill_id;
--
-- ALTER TABLE payment_proofs
--   ADD COLUMN payment_target_bill_id INT NULL AFTER payment_scope;
--
-- ALTER TABLE payment_proofs
--   ADD COLUMN due_before_payment DECIMAL(10,2) NULL AFTER is_partial;
--
-- ALTER TABLE payment_proofs
--   ADD COLUMN due_after_payment DECIMAL(10,2) NULL AFTER due_before_payment;
--
-- ALTER TABLE payment_proofs
--   ADD KEY idx_payment_proofs_scope_target (tenant_id, payment_scope, payment_target_bill_id);

-- Prefer: npm run migrate  (scripts/migrate.js applies these changes idempotently)
