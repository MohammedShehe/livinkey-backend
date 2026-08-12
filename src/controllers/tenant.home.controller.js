const db = require("../config/db");

const getTenantHomeData = async (req, res) => {
    try {
        const tenantId = req.tenant.id;

        const connection = await db.getConnection();

        // Get tenant basic info with profile picture
        const [tenantData] = await connection.execute(
            `
            SELECT 
                t.id,
                t.full_name,
                t.email,
                t.gender,
                td.pg_id,
                td.room_id,
                td.rent,
                td.payment_date,
                td.paid_from,
                td.paid_till,
                td.arrival_date,
                td.residency,
                p.name as pg_name,
                r.room_number,
                td.payment_date,
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

        if (tenantData.length === 0) {
            connection.release();
            return res.status(404).json({
                success: false,
                message: "Tenant not found"
            });
        }

        const tenant = tenantData[0];

        // Get current bill status
        const [billData] = await connection.execute(
            `
            SELECT 
                id,
                total_amount,
                paid_amount,
                fine_amount,
                status,
                valid_until,
                DATEDIFF(CURDATE(), sent_at) as days_since_sent,
                DATEDIFF(valid_until, CURDATE()) as days_until_valid
            FROM bills 
            WHERE tenant_id = ? 
            ORDER BY created_at DESC 
            LIMIT 1
            `,
            [tenantId]
        );

        const currentBill = billData[0] || null;

        // Get maintenance requests count - Handle if table doesn't exist
        let maintenance = {
            total: 0,
            pending: 0,
            in_progress: 0,
            completed: 0
        };

        try {
            const [maintenanceData] = await connection.execute(
                `
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                    SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
                    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
                FROM maintenance_requests 
                WHERE tenant_id = ?
                `,
                [tenantId]
            );

            if (maintenanceData && maintenanceData.length > 0) {
                maintenance = maintenanceData[0];
            }
        } catch (tableError) {
            // Table doesn't exist yet, use default values
            console.log("Maintenance table not found, using default values");
            maintenance = {
                total: 0,
                pending: 0,
                in_progress: 0,
                completed: 0
            };
        }

        connection.release();

        // Calculate rent status
        let rentStatus = 'unpaid';
        let dueDays = 0;
        let nextPaymentDate = null;
        let daysLeft = 0;

        if (tenant.paid_from && tenant.paid_till) {
            const today = new Date();
            const paidTill = new Date(tenant.paid_till);
            const paidFrom = new Date(tenant.paid_from);

            // Check if paid_till is a valid date and not '0000-00-00'
            if (!isNaN(paidTill.getTime()) && paidTill.getFullYear() > 1970) {
                if (paidTill >= today) {
                    rentStatus = 'paid';
                    const diffTime = paidTill.getTime() - today.getTime();
                    dueDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                } else {
                    rentStatus = 'unpaid';
                    const diffTime = today.getTime() - paidTill.getTime();
                    dueDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                }
            }

            // Calculate next payment date
            if (tenant.payment_date) {
                const nextDate = new Date(today);
                const currentMonth = today.getMonth();
                const currentYear = today.getFullYear();
                
                // Set to payment day
                let paymentDay = parseInt(tenant.payment_date);
                if (paymentDay > 28) {
                    // Handle months with fewer days
                    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
                    paymentDay = Math.min(paymentDay, lastDayOfMonth);
                }
                
                nextDate.setDate(paymentDay);
                
                // If payment date already passed this month, go to next month
                if (nextDate < today) {
                    nextDate.setMonth(nextDate.getMonth() + 1);
                }
                
                // If we're in the next month, set to that month's payment day
                const nextMonth = nextDate.getMonth();
                const nextYear = nextDate.getFullYear();
                let nextPaymentDay = parseInt(tenant.payment_date);
                const lastDayOfNextMonth = new Date(nextYear, nextMonth + 1, 0).getDate();
                nextPaymentDay = Math.min(nextPaymentDay, lastDayOfNextMonth);
                nextDate.setDate(nextPaymentDay);
                
                nextPaymentDate = nextDate;
                const diffTime = nextDate.getTime() - today.getTime();
                daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (daysLeft < 0) daysLeft = 0;
            }
        }

        // Get greeting based on time
        const hours = new Date().getHours();
        let greeting = '';
        if (hours >= 5 && hours < 12) {
            greeting = 'Good Morning';
        } else if (hours >= 12 && hours < 17) {
            greeting = 'Good Afternoon';
        } else if (hours >= 17 && hours < 21) {
            greeting = 'Good Evening';
        } else {
            greeting = 'Good Night';
        }

        // Get initials for placeholder
        const nameParts = tenant.full_name.split(' ');
        let initials = '';
        if (nameParts.length >= 2) {
            initials = nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0);
        } else {
            initials = tenant.full_name.substring(0, 2).toUpperCase();
        }

        // Prepare response
        const response = {
            greeting: greeting,
            tenant: {
                id: tenant.id,
                full_name: tenant.full_name,
                email: tenant.email,
                gender: tenant.gender,
                pg_name: tenant.pg_name || 'Not Assigned',
                room_number: tenant.room_number || 'Not Assigned',
                profile_picture: tenant.profile_picture || null,
                placeholder_initials: initials.toUpperCase(),
                residency: tenant.residency
            },
            rent_status: {
                status: rentStatus, // 'paid' or 'unpaid'
                due_days: dueDays,
                next_payment_date: nextPaymentDate ? nextPaymentDate.toISOString().split('T')[0] : null,
                days_left: daysLeft,
                payment_date_of_month: tenant.payment_date || null,
                paid_from: tenant.paid_from || null,
                paid_till: tenant.paid_till || null
            },
            current_bill: currentBill ? {
                id: currentBill.id,
                total_amount: parseFloat(currentBill.total_amount),
                paid_amount: parseFloat(currentBill.paid_amount || 0),
                fine_amount: parseFloat(currentBill.fine_amount || 0),
                status: currentBill.status,
                due_amount: parseFloat(currentBill.total_amount) + parseFloat(currentBill.fine_amount || 0) - parseFloat(currentBill.paid_amount || 0),
                valid_until: currentBill.valid_until,
                days_until_valid: currentBill.days_until_valid || 0,
                is_overdue: currentBill.status === 'unpaid' && currentBill.days_until_valid < 0
            } : null,
            maintenance: {
                total: maintenance.total || 0,
                pending: maintenance.pending || 0,
                in_progress: maintenance.in_progress || 0,
                completed: maintenance.completed || 0
            }
        };

        return res.json({
            success: true,
            data: response
        });

    } catch (error) {
        console.error("Get Tenant Home Data Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = {
    getTenantHomeData
};