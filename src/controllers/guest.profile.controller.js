const db = require("../config/db");
const bcrypt = require("bcrypt");

// ============================================================
// FIXED: Get Guest Dashboard - Works for BOTH guests AND tenants
// ============================================================
exports.getGuestDashboard = async (req, res) => {
    try {
        // ============================================================
        // Determine who is making the request
        // ============================================================
        let userId = null;
        let userName = 'Guest User';
        let userRole = 'guest';
        let isTenantViewingAsGuest = false;

        if (req.guest) {
            // Real guest login
            userId = req.guest.id;
            userRole = 'guest';
            
            const connection = await db.getConnection();
            const [users] = await connection.execute(
                `SELECT full_name FROM tenants WHERE id = ? AND role = 'guest' AND is_active = 1`,
                [userId]
            );
            connection.release();
            
            if (users.length > 0) {
                userName = users[0].full_name;
            }
        } else if (req.tenant) {
            // ============================================================
            // FIXED: Tenant entering as guest - show THEIR name
            // ============================================================
            userId = req.tenant.id;
            userRole = 'tenant';
            isTenantViewingAsGuest = true;
            
            const connection = await db.getConnection();
            const [users] = await connection.execute(
                `SELECT full_name FROM tenants WHERE id = ? AND role = 'tenant' AND is_active = 1`,
                [userId]
            );
            connection.release();
            
            if (users.length > 0) {
                userName = users[0].full_name;
            }
        }
        // If no user at all, use generic "Guest User"

        const hours = new Date().getHours();
        let greeting = '';
        if (hours >= 5 && hours < 12) greeting = 'Good Morning';
        else if (hours >= 12 && hours < 17) greeting = 'Good Afternoon';
        else if (hours >= 17 && hours < 21) greeting = 'Good Evening';
        else greeting = 'Good Night';

        // Get total PGs count (public data)
        const connection = await db.getConnection();
        const [pgCount] = await connection.execute(
            `SELECT COUNT(*) as total FROM pgs WHERE is_active = 1`
        );
        connection.release();

        // ============================================================
        // FIXED: Different message based on who is viewing
        // ============================================================
        let message = `Welcome to Livinkey, ${userName}!`;
        if (isTenantViewingAsGuest) {
            message = `Welcome back, ${userName}! You're viewing as guest.`;
        }

        return res.json({
            success: true,
            data: {
                greeting: greeting,
                name: userName,
                full_name: userName,
                role: userRole,
                is_tenant_viewing_as_guest: isTenantViewingAsGuest,
                total_pgs: pgCount[0]?.total || 0,
                message: message
            }
        });

    } catch (error) {
        console.error("Get Guest Dashboard Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// ============================================================
// FIXED: Get Guest Profile - Works for BOTH guests AND tenants
// ============================================================
exports.getProfile = async (req, res) => {
    try {
        let userId;
        let userRole;
        let isTenantViewingAsGuest = false;
        
        if (req.guest) {
            userId = req.guest.id;
            userRole = 'guest';
        } else if (req.tenant) {
            // ============================================================
            // FIXED: Tenant entering as guest - show THEIR profile
            // ============================================================
            userId = req.tenant.id;
            userRole = 'tenant';
            isTenantViewingAsGuest = true;
        } else {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const connection = await db.getConnection();
        const [users] = await connection.execute(
            `
            SELECT 
                id,
                full_name,
                email,
                nationality,
                country_code,
                phone,
                gender,
                is_active,
                created_at
            FROM tenants 
            WHERE id = ? AND is_active = 1
            `,
            [userId]
        );
        connection.release();

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const user = users[0];

        return res.json({
            success: true,
            data: {
                ...user,
                role: userRole,
                is_tenant_viewing_as_guest: isTenantViewingAsGuest
            }
        });

    } catch (error) {
        console.error("Get Profile Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// ============================================================
// Update Profile - Works for BOTH guests AND tenants
// BUT DISABLED for tenants viewing as guest
// ============================================================
exports.updateProfile = async (req, res) => {
    try {
        let userId;
        let isTenantViewingAsGuest = false;
        
        if (req.guest) {
            userId = req.guest.id;
        } else if (req.tenant) {
            // ============================================================
            // FIXED: Tenants viewing as guest cannot edit profile
            // ============================================================
            userId = req.tenant.id;
            isTenantViewingAsGuest = true;
        } else {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        // ============================================================
        // FIXED: Block profile edits for tenants viewing as guest
        // ============================================================
        if (isTenantViewingAsGuest) {
            return res.status(403).json({
                success: false,
                message: "Profile editing is disabled when viewing as a guest. Please switch back to tenant mode to edit your profile."
            });
        }

        const {
            full_name,
            email,
            nationality,
            country_code,
            phone
        } = req.body;

        if (!full_name || !email || !nationality || !country_code || !phone) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const connection = await db.getConnection();

        // Check if email exists for another user
        const [existingEmail] = await connection.execute(
            `SELECT id FROM tenants WHERE email = ? AND id != ?`,
            [email, userId]
        );
        if (existingEmail.length > 0) {
            connection.release();
            return res.status(400).json({
                success: false,
                message: "Email already registered by another user"
            });
        }

        // Check if phone exists for another user
        const [existingPhone] = await connection.execute(
            `SELECT id FROM tenants WHERE country_code = ? AND phone = ? AND id != ?`,
            [country_code, phone, userId]
        );
        if (existingPhone.length > 0) {
            connection.release();
            return res.status(400).json({
                success: false,
                message: "Phone number already registered by another user"
            });
        }

        await connection.execute(
            `
            UPDATE tenants 
            SET 
                full_name = ?,
                email = ?,
                nationality = ?,
                country_code = ?,
                phone = ?
            WHERE id = ?
            `,
            [full_name, email, nationality, country_code, phone, userId]
        );

        connection.release();

        const [updatedUser] = await db.execute(
            `
            SELECT 
                id,
                full_name,
                email,
                nationality,
                country_code,
                phone,
                gender,
                is_active
            FROM tenants 
            WHERE id = ?
            `,
            [userId]
        );

        return res.json({
            success: true,
            message: "Profile updated successfully",
            data: updatedUser[0]
        });

    } catch (error) {
        console.error("Update Profile Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// ============================================================
// Change Password - Works for BOTH guests AND tenants
// BUT DISABLED for tenants viewing as guest
// ============================================================
exports.changePassword = async (req, res) => {
    try {
        let userId;
        let isTenantViewingAsGuest = false;
        
        if (req.guest) {
            userId = req.guest.id;
        } else if (req.tenant) {
            userId = req.tenant.id;
            isTenantViewingAsGuest = true;
        } else {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        // ============================================================
        // FIXED: Block password change for tenants viewing as guest
        // ============================================================
        if (isTenantViewingAsGuest) {
            return res.status(403).json({
                success: false,
                message: "Changing password is disabled when viewing as a guest. Please switch back to tenant mode to change your password."
            });
        }

        const { current_password, new_password, confirm_password } = req.body;

        if (!current_password || !new_password || !confirm_password) {
            return res.status(400).json({
                success: false,
                message: "All password fields are required"
            });
        }

        if (new_password !== confirm_password) {
            return res.status(400).json({
                success: false,
                message: "New password and confirm password do not match"
            });
        }

        if (new_password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters long"
            });
        }

        const connection = await db.getConnection();

        const [users] = await connection.execute(
            `SELECT id, password FROM tenants WHERE id = ?`,
            [userId]
        );

        if (users.length === 0) {
            connection.release();
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const user = users[0];

        const matched = await bcrypt.compare(current_password, user.password);

        if (!matched) {
            connection.release();
            return res.status(401).json({
                success: false,
                message: "Current password is incorrect"
            });
        }

        const hashedPassword = await bcrypt.hash(new_password, 12);

        await connection.execute(
            `UPDATE tenants SET password = ? WHERE id = ?`,
            [hashedPassword, userId]
        );

        connection.release();

        return res.json({
            success: true,
            message: "Password changed successfully"
        });

    } catch (error) {
        console.error("Change Password Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};