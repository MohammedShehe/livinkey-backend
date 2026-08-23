const db = require("../config/db");

exports.getProfile = async (req, res) => {
    try {
        const tenantId = req.tenant.id;

        const connection = await db.getConnection();
        const [tenants] = await connection.execute(
            `
            SELECT 
                t.id,
                t.full_name,
                t.email,
                t.nationality,
                t.country_code,
                t.phone,
                t.gender,
                t.is_active,
                t.created_at,
                td.pg_id,
                td.room_id,
                td.residency,
                td.aadhaar_id,
                td.father_aadhaar_id,
                td.c_form_number,
                td.efrro_from,
                td.efrro_till,
                td.rent,
                td.security_fee,
                td.payment_date,
                td.arrival_date,
                td.paid_from,
                td.paid_till,
                p.name as pg_name,
                r.room_number,
                r.capacity,
                -- ============================================================
                -- FIXED: Get profile picture from passport_photo document
                -- ============================================================
                (
                    SELECT document_url 
                    FROM tenant_documents 
                    WHERE tenant_id = t.id 
                    AND document_type = 'passport_photo' 
                    LIMIT 1
                ) as profile_picture
            FROM tenants t
            LEFT JOIN tenant_details td ON t.id = td.tenant_id
            LEFT JOIN pgs p ON td.pg_id = p.id
            LEFT JOIN rooms r ON td.room_id = r.id
            WHERE t.id = ? AND t.role = 'tenant' AND t.is_active = 1
            `,
            [tenantId]
        );
        connection.release();

        if (tenants.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Tenant profile not found."
            });
        }

        const tenant = tenants[0];

        // ============================================================
        // FIXED: Format dates without time
        // ============================================================
        const formatDateString = (dateStr) => {
            if (!dateStr) return null;
            try {
                const d = new Date(dateStr);
                if (isNaN(d.getTime())) return null;
                return d.getFullYear() + '-' + 
                       String(d.getMonth() + 1).padStart(2, '0') + '-' + 
                       String(d.getDate()).padStart(2, '0');
            } catch (e) {
                return null;
            }
        };

        // Remove sensitive data and format dates
        delete tenant.password;

        tenant.paid_from = formatDateString(tenant.paid_from);
        tenant.paid_till = formatDateString(tenant.paid_till);
        tenant.arrival_date = formatDateString(tenant.arrival_date);
        tenant.efrro_from = formatDateString(tenant.efrro_from);
        tenant.efrro_till = formatDateString(tenant.efrro_till);

        return res.json({
            success: true,
            data: tenant
        });

    } catch (error) {
        console.error("Get Profile Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};