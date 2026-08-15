// middleware/permission.middleware.js
const db = require("../config/db");

/**
 * Permission Middleware - Checks if admin has specific permission for a module
 * @param {string} moduleName - The module name (tenants, bills, pgs, etc.)
 * @param {string} action - The action (view, add, edit, delete)
 * @returns {Function} Express middleware
 */
const permissionMiddleware = (moduleName, action) => {
    return async (req, res, next) => {
        try {
            // Super admin bypasses all permission checks
            if (req.admin.role === 'super_admin') {
                return next();
            }

            const adminId = req.admin.id;

            // Query the admin_permissions table
            const [rows] = await db.execute(
                `SELECT 
                    can_view, 
                    can_add, 
                    can_edit, 
                    can_delete 
                FROM admin_permissions 
                WHERE admin_id = ? AND module_name = ?`,
                [adminId, moduleName]
            );

            // If no permission row exists, deny access
            if (rows.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: `You don't have permission to ${action} ${moduleName}.`
                });
            }

            const perm = rows[0];
            let hasPermission = false;

            // Check the specific action
            switch (action) {
                case 'view':
                    hasPermission = perm.can_view === 1;
                    break;
                case 'add':
                    hasPermission = perm.can_add === 1;
                    break;
                case 'edit':
                    hasPermission = perm.can_edit === 1;
                    break;
                case 'delete':
                    hasPermission = perm.can_delete === 1;
                    break;
                default:
                    hasPermission = false;
            }

            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    message: `You don't have permission to ${action} ${moduleName}.`
                });
            }

            next();
        } catch (error) {
            console.error(`Permission Middleware Error [${moduleName}.${action}]:`, error);
            return res.status(500).json({
                success: false,
                message: "Internal server error while checking permissions."
            });
        }
    };
};

module.exports = permissionMiddleware;