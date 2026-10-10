-- Add conversations module permission for all existing admins
-- Super admins bypass permission checks; this is for role=admin users

INSERT INTO admin_permissions (admin_id, module_name, can_view, can_add, can_edit, can_delete, can_message, can_export)
SELECT a.id, 'conversations', 0, 0, 0, 0, 0, 0
FROM admins a
WHERE a.role = 'admin'
  AND NOT EXISTS (
    SELECT 1 FROM admin_permissions ap
    WHERE ap.admin_id = a.id AND ap.module_name = 'conversations'
  );
