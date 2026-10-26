-- Vehicle feature for tenants
-- Run once on production DB

-- has_vehicle toggle
SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'tenant_details'
    AND COLUMN_NAME = 'has_vehicle'
);
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE tenant_details ADD COLUMN has_vehicle TINYINT(1) NOT NULL DEFAULT 0',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- vehicle_number (plate)
SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'tenant_details'
    AND COLUMN_NAME = 'vehicle_number'
);
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE tenant_details ADD COLUMN vehicle_number VARCHAR(64) NULL DEFAULT NULL',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Index for filtering
SET @idx_exists := (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'tenant_details'
    AND INDEX_NAME = 'idx_tenant_details_has_vehicle'
);
SET @sql := IF(@idx_exists = 0,
  'CREATE INDEX idx_tenant_details_has_vehicle ON tenant_details (has_vehicle)',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
