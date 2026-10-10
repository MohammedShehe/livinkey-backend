-- Livinkey tenant agreement + stay expiry migration
ALTER TABLE pgs
  ADD COLUMN tenant_agreement_enabled TINYINT(1) NOT NULL DEFAULT 1 AFTER payment_upi_id,
  ADD COLUMN tenant_agreement_text TEXT NULL AFTER tenant_agreement_enabled;

CREATE TABLE IF NOT EXISTS tenant_agreement_acceptances (
  id INT NOT NULL AUTO_INCREMENT,
  tenant_id INT NOT NULL,
  pg_id INT NOT NULL,
  agreement_hash CHAR(64) NOT NULL,
  agreement_text TEXT NOT NULL,
  accepted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(64) DEFAULT NULL,
  user_agent TEXT DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_tenant_agreement_hash (tenant_id, agreement_hash),
  KEY idx_tenant_agreement_tenant (tenant_id),
  KEY idx_tenant_agreement_pg (pg_id),
  CONSTRAINT fk_tenant_agreement_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  CONSTRAINT fk_tenant_agreement_pg FOREIGN KEY (pg_id) REFERENCES pgs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS tenant_stay_expiry_notifications (
  id INT NOT NULL AUTO_INCREMENT, tenant_id INT NOT NULL, stay_end_date DATE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(id),
  UNIQUE KEY uq_tenant_stay_expiry (tenant_id, stay_end_date),
  CONSTRAINT fk_tenant_stay_expiry_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
