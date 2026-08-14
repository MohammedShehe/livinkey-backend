const db = require("../config/db");
const bcrypt = require("bcrypt");

// Get Guest Profile
exports.getProfile = async (req, res) => {
    try {
        const guestId = req.guest.id;

        const connection = await db.getConnection();
        const [guests] = await connection.execute(
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
            WHERE id = ? AND role = 'guest' AND is_active = 1
            `,
            [guestId]
        );
        connection.release();

        if (guests.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Guest profile not found."
            });
        }

        const guest = guests[0];

        return res.json({
            success: true,
            data: guest
        });

    } catch (error) {
        console.error("Get Guest Profile Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};

// Update Guest Profile
exports.updateProfile = async (req, res) => {
    try {
        const guestId = req.guest.id;
        const {
            full_name,
            nationality,
            country_code,
            phone
        } = req.body;

        if (!full_name || !nationality || !country_code || !phone) {
            return res.status(400).json({
                success: false,
                message: "Full name, nationality, country code, and phone are required."
            });
        }

        const connection = await db.getConnection();

        const [existingPhone] = await connection.execute(
            `SELECT id FROM tenants WHERE country_code = ? AND phone = ? AND id != ? AND role = 'guest'`,
            [country_code, phone, guestId]
        );

        if (existingPhone.length > 0) {
            connection.release();
            return res.status(400).json({
                success: false,
                message: "Phone number already registered by another user."
            });
        }

        await connection.execute(
            `
            UPDATE tenants 
            SET 
                full_name = ?,
                nationality = ?,
                country_code = ?,
                phone = ?
            WHERE id = ? AND role = 'guest'
            `,
            [full_name, nationality, country_code, phone, guestId]
        );

        connection.release();

        const updatedGuest = await db.execute(
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
            WHERE id = ? AND role = 'guest'
            `,
            [guestId]
        );

        return res.json({
            success: true,
            message: "Profile updated successfully.",
            data: updatedGuest[0][0]
        });

    } catch (error) {
        console.error("Update Guest Profile Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};

// Change Guest Password
exports.changePassword = async (req, res) => {
    try {
        const guestId = req.guest.id;
        const { current_password, new_password, confirm_password } = req.body;

        if (!current_password || !new_password || !confirm_password) {
            return res.status(400).json({
                success: false,
                message: "Current password, new password, and confirm password are required."
            });
        }

        if (new_password !== confirm_password) {
            return res.status(400).json({
                success: false,
                message: "New password and confirm password do not match."
            });
        }

        if (new_password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters long."
            });
        }

        const connection = await db.getConnection();

        const [guests] = await connection.execute(
            `SELECT id, password FROM tenants WHERE id = ? AND role = 'guest'`,
            [guestId]
        );

        if (guests.length === 0) {
            connection.release();
            return res.status(404).json({
                success: false,
                message: "Guest not found."
            });
        }

        const guest = guests[0];

        const matched = await bcrypt.compare(current_password, guest.password);

        if (!matched) {
            connection.release();
            return res.status(401).json({
                success: false,
                message: "Current password is incorrect."
            });
        }

        const hashedPassword = await bcrypt.hash(new_password, 12);

        await connection.execute(
            `UPDATE tenants SET password = ? WHERE id = ?`,
            [hashedPassword, guestId]
        );

        connection.release();

        return res.json({
            success: true,
            message: "Password changed successfully."
        });

    } catch (error) {
        console.error("Change Guest Password Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};

// Get Guest Dashboard (NEW)
exports.getGuestDashboard = async (req, res) => {
    try {
        const guestId = req.guest.id;

        const connection = await db.getConnection();
        const [guests] = await connection.execute(
            `
            SELECT 
                full_name,
                email,
                nationality
            FROM tenants 
            WHERE id = ? AND role = 'guest' AND is_active = 1
            `,
            [guestId]
        );
        connection.release();

        if (guests.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Guest not found"
            });
        }

        const guest = guests[0];
        const hours = new Date().getHours();
        let greeting = '';
        if (hours >= 5 && hours < 12) greeting = 'Good Morning';
        else if (hours >= 12 && hours < 17) greeting = 'Good Afternoon';
        else if (hours >= 17 && hours < 21) greeting = 'Good Evening';
        else greeting = 'Good Night';

        return res.json({
            success: true,
            data: {
                greeting: greeting,
                name: guest.full_name,
                email: guest.email,
                nationality: guest.nationality,
                message: `Welcome back, ${guest.full_name}! Explore PGs and find your perfect stay.`
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