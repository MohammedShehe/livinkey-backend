-- Tenant Archive / Soft-delete support
-- Adds history for checked-out and archived tenants without hard-deleting data.
-- Safe to run multiple times (column existence checks are handled by migrate.js patterns;
-- this file uses IF NOT EXISTS style where possible via ALTER that may be guarded).

-- Archive status on tenants
-- status: active | checked_out | archived
ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS status ENUM('active','checked_out','archived') NOT NULL DEFAULT 'active' AFTER is_active,
  ADD COLUMN IF NOT EXISTS checkout_date DATE NULL DEFAULT NULL AFTER status,
  ADD COLUMN IF NOT EXISTS archived_at DATETIME NULL DEFAULT NULL AFTER checkout_date,
  ADD COLUMN IF NOT EXISTS archive_reason TEXT NULL DEFAULT NULL AFTER archived_at,
  ADD COLUMN IF NOT EXISTS archived_by INT NULL DEFAULT NULL AFTER archive_reason,
  ADD COLUMN IF NOT EXISTS original_email VARCHAR(255) NULL DEFAULT NULL AFTER archived_by,
  ADD COLUMN IF NOT EXISTS original_phone VARCHAR(20) NULL DEFAULT NULL AFTER original_email;

-- Indexes for archive queries
-- (MySQL 8+ supports IF NOT EXISTS on indexes in some versions; migrate runner may guard)

-- Soft-delete support on tenant_documents
ALTER TABLE tenant_documents
  ADD COLUMN IF NOT EXISTS deleted_at DATETIME NULL DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS deleted_by INT NULL DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS delete_reason TEXT NULL DEFAULT NULL;

-- Permission module for archive (view / restore / permanent delete)
INSERT INTO admin_permissions (admin_id, module_name, can_view, can_add, can_edit, can_delete, can_message, can_export)
SELECT a.id, 'archive', 1, 0, 1, 1, 0, 1
FROM admins a
WHERE a.role = 'admin'
  AND NOT EXISTS (
    SELECT 1 FROM admin_permissions ap
    WHERE ap.admin_id = a.id AND ap.module_name = 'archive'
  );

-- Super-admin style: ensure all existing admins who have tenants delete also get archive
UPDATE admin_permissions ap
INNER JOIN admin_permissions t ON t.admin_id = ap.admin_id AND t.module_name = 'tenants'
SET ap.can_view = GREATEST(ap.can_view, t.can_view),
    ap.can_edit = GREATEST(ap.can_edit, t.can_edit),
    ap.can_delete = GREATEST(ap.can_delete, t.can_delete),
    ap.can_export = GREATEST(ap.can_export, t.can_export)
WHERE ap.module_name = 'archive';
