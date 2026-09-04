const db = require("../config/db");

const getTenantHomeData = async (req, res) => {
    try {
        const tenantId = req.tenant.id;

        const connection = await db.getConnection();

        // Get tenant basic info with profile picture and payment details
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
              AND deleted_at IS NULL
            ORDER BY created_at DESC 
            LIMIT 1
            `,
            [tenantId]
        );

        const currentBill = billData[0] || null;

        // Get maintenance requests count
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
            maintenance = {
                total: 0,
                pending: 0,
                in_progress: 0,
                completed: 0
            };
        }

        // ============================================================
        // Date helper functions
        // ============================================================
        const isValidDate = (dateStr) => {
            if (!dateStr) return false;
            if (typeof dateStr !== 'string') {
                if (dateStr instanceof Date) {
                    return !isNaN(dateStr.getTime());
                }
                return false;
            }
            if (dateStr === '0000-00-00') return false;
            if (dateStr === 'null') return false;
            if (dateStr.toLowerCase() === 'null') return false;
            if (dateStr.trim() === '') return false;
            try {
                const d = new Date(dateStr);
                return !isNaN(d.getTime()) && d.getFullYear() > 1970;
            } catch (e) {
                return false;
            }
        };

        const formatDate = (date) => {
            if (!date) return null;
            if (!(date instanceof Date)) return null;
            if (isNaN(date.getTime())) return null;
            return date.getFullYear() + '-' + 
                   String(date.getMonth() + 1).padStart(2, '0') + '-' + 
                   String(date.getDate()).padStart(2, '0');
        };

        // ============================================================
        // FIXED: Format date strings from database
        // ============================================================
        const formatDateString = (dateStr) => {
            if (!dateStr) return null;
            if (!isValidDate(dateStr)) return null;
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

        // Get today's date (start of day for accurate comparison)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const monthlyRent = parseFloat(tenant.rent) || 0;
        const paidFromValid = isValidDate(tenant.paid_from);
        const paidTillValid = isValidDate(tenant.paid_till);

        let rentStatus = 'unpaid';
        let dueDays = 0;
        let nextPaymentDate = null;
        let daysLeft = 0;
        let amountOwed = 0;
        let totalPaid = 0;
        let expectedPayment = 0;
        let monthsPaid = 0;

        if (paidFromValid && monthlyRent > 0) {
            try {
                const paidFrom = new Date(tenant.paid_from);
                paidFrom.setHours(0, 0, 0, 0);

                // Get total paid from bills table
                const [paidData] = await connection.execute(
                    `
                    SELECT COALESCE(SUM(paid_amount), 0) as total_paid
                    FROM bills 
                    WHERE tenant_id = ?
                    `,
                    [tenantId]
                );
                totalPaid = parseFloat(paidData[0]?.total_paid) || 0;

                // ============================================================
                // FIXED: Calculate months since paid_from safely
                // ============================================================
                let monthsSinceStart = 0;
                if (today >= paidFrom) {
                    monthsSinceStart = Math.floor((today - paidFrom) / (1000 * 60 * 60 * 24 * 30));
                    // Ensure at least 1 month
                    monthsSinceStart = Math.max(monthsSinceStart, 1);
                } else {
                    // paid_from is in the future - treat as not started yet
                    monthsSinceStart = 0;
                }
                
                expectedPayment = monthlyRent * monthsSinceStart;

                // ============================================================
                // Calculate paid_till date from totalPaid
                // ============================================================
                monthsPaid = Math.floor(totalPaid / monthlyRent);
                const calculatedPaidTill = new Date(paidFrom);
                calculatedPaidTill.setMonth(calculatedPaidTill.getMonth() + monthsPaid);
                calculatedPaidTill.setHours(0, 0, 0, 0);

                // Use the actual paid_till from database if available, otherwise use calculated
                const effectivePaidTill = paidTillValid ? new Date(tenant.paid_till) : calculatedPaidTill;
                effectivePaidTill.setHours(0, 0, 0, 0);

                // ============================================================
                // Check if today is beyond paid_till
                // ============================================================
                if (today <= effectivePaidTill) {
                    // Tenant is paid up to date
                    rentStatus = 'paid';
                    const diffTime = effectivePaidTill.getTime() - today.getTime();
                    dueDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                    if (dueDays < 0) dueDays = 0;
                } else {
                    // Tenant is overdue
                    rentStatus = 'unpaid';
                    const diffTime = today.getTime() - effectivePaidTill.getTime();
                    dueDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                    
                    // Calculate amount owed (rounded up to nearest month)
                    const overdueMonths = Math.ceil(dueDays / 30);
                    amountOwed = overdueMonths * monthlyRent;
                }

                // ============================================================
                // Calculate next payment date using payment_date
                // ============================================================
                if (tenant.payment_date) {
                    const nextDate = new Date(today);
                    const currentMonth = today.getMonth();
                    const currentYear = today.getFullYear();
                    
                    let paymentDay = parseInt(tenant.payment_date);
                    if (paymentDay > 28) {
                        const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
                        paymentDay = Math.min(paymentDay, lastDayOfMonth);
                    }
                    
                    nextDate.setDate(paymentDay);
                    
                    if (nextDate < today) {
                        nextDate.setMonth(nextDate.getMonth() + 1);
                    }
                    
                    const nextMonth = nextDate.getMonth();
                    const nextYear = nextDate.getFullYear();
                    let nextPaymentDay = parseInt(tenant.payment_date);
                    const lastDayOfNextMonth = new Date(nextYear, nextMonth + 1, 0).getDate();
                    nextPaymentDay = Math.min(nextPaymentDay, lastDayOfNextMonth);
                    nextDate.setDate(nextPaymentDay);
                    
                    nextPaymentDate = nextDate;
                    const diffTime = nextDate.getTime() - today.getTime();
                    daysLeft = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                    if (daysLeft < 0) daysLeft = 0;
                }

            } catch (dateError) {
                // If date calculation fails, use fallback values
                console.error("Date calculation error:", dateError);
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

        // Get total paid from bills for response
        const [paidData] = await connection.execute(
            `
            SELECT COALESCE(SUM(paid_amount), 0) as total_paid
            FROM bills 
            WHERE tenant_id = ?
            `,
            [tenantId]
        );
        totalPaid = parseFloat(paidData[0]?.total_paid) || 0;

        // ============================================================
        // FIXED: Format dates properly without time
        // ============================================================
        const formattedPaidFrom = tenant.paid_from && isValidDate(tenant.paid_from) 
            ? formatDateString(tenant.paid_from) 
            : null;
        const formattedPaidTill = tenant.paid_till && isValidDate(tenant.paid_till) 
            ? formatDateString(tenant.paid_till) 
            : null;

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
                residency: tenant.residency || 'national',
                monthly_rent: monthlyRent
            },
            rent_status: {
                status: rentStatus,
                due_days: dueDays,
                next_payment_date: formatDate(nextPaymentDate),
                days_left: daysLeft,
                payment_date_of_month: tenant.payment_date || null,
                paid_from: formattedPaidFrom,
                paid_till: formattedPaidTill,
                total_paid: totalPaid,
                expected_payment: expectedPayment,
                amount_owed: Math.max(amountOwed, 0),
                months_paid: monthsPaid,
                monthly_rent: monthlyRent
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

        connection.release();

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