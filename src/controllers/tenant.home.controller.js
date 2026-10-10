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
                td.period_of_stay,
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
            FROM bills b
            WHERE (b.tenant_id = ? OR EXISTS (SELECT 1 FROM bill_group_members bgm INNER JOIN bill_groups bg ON bg.id=bgm.bill_group_id WHERE bg.bill_id=b.id AND bgm.tenant_id=?))
              AND b.deleted_at IS NULL
            ORDER BY created_at DESC 
            LIMIT 1
            `,
            [tenantId, tenantId]
        );

        const currentBill = billData[0] || null;

        // Complete outstanding balance across all unpaid bills. This is
        // intentionally independent of current_bill so a paid current bill
        // does not hide older unpaid bills from the tenant dashboard.
        const [outstandingData] = await connection.execute(
            `
            SELECT
                COUNT(*) AS bill_count,
                COALESCE(SUM(GREATEST(b.total_amount + b.fine_amount - b.paid_amount, 0)), 0) AS total_amount
            FROM bills b
            WHERE b.deleted_at IS NULL
              AND (b.total_amount + b.fine_amount - b.paid_amount) > 0
              AND (
                b.tenant_id = ?
                OR EXISTS (
                    SELECT 1
                    FROM bill_group_members bgm
                    INNER JOIN bill_groups bg ON bg.id = bgm.bill_group_id
                    WHERE bg.bill_id = b.id AND bgm.tenant_id = ?
                )
              )
            `,
            [tenantId, tenantId]
        );
        const outstanding = outstandingData[0] || {};

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

        // ============================================================
        // RENT STATUS (production)
        // Source of truth: tenant_details.paid_till (set by admin when
        // payments are approved). Do NOT recalculate coverage from
        // SUM(paid_amount) — that drifts from admin-entered periods.
        // ============================================================
        const MS_PER_DAY = 1000 * 60 * 60 * 24;

        const toDateOnly = (value) => {
            if (!value) return null;
            const d = value instanceof Date ? new Date(value) : new Date(value);
            if (isNaN(d.getTime())) return null;
            d.setHours(0, 0, 0, 0);
            return d;
        };

        const daysBetween = (from, to) => {
            // Whole calendar days from `from` to `to` (can be negative)
            return Math.round((to.getTime() - from.getTime()) / MS_PER_DAY);
        };

        const addMonthsClamped = (date, months) => {
            const d = new Date(date);
            const day = d.getDate();
            d.setDate(1);
            d.setMonth(d.getMonth() + months);
            const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
            d.setDate(Math.min(day, lastDay));
            d.setHours(0, 0, 0, 0);
            return d;
        };

        const nextPaymentDateFromDay = (fromDate, paymentDayOfMonth) => {
            // Next occurrence of paymentDayOfMonth on or after fromDate
            const day = parseInt(paymentDayOfMonth, 10);
            if (!day || day < 1 || day > 31) return null;

            let candidate = new Date(fromDate);
            const lastThisMonth = new Date(candidate.getFullYear(), candidate.getMonth() + 1, 0).getDate();
            candidate.setDate(Math.min(day, lastThisMonth));
            candidate.setHours(0, 0, 0, 0);

            if (candidate < fromDate) {
                candidate = addMonthsClamped(candidate, 1);
                const lastNext = new Date(candidate.getFullYear(), candidate.getMonth() + 1, 0).getDate();
                candidate.setDate(Math.min(day, lastNext));
                candidate.setHours(0, 0, 0, 0);
            }
            return candidate;
        };

        const calendarMonthsBetween = (from, to) => {
            // Full calendar months crossed from from→to (minimum 1 if to > from)
            if (to <= from) return 0;
            let months = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
            if (to.getDate() > from.getDate()) months += 1;
            return Math.max(months, 1);
        };

        const today = toDateOnly(new Date());

        const monthlyRent = parseFloat(tenant.rent) || 0;
        const paidFromValid = isValidDate(tenant.paid_from);
        const paidTillValid = isValidDate(tenant.paid_till);

        let rentStatus = 'unpaid';
        let dueDays = 0;       // days overdue when unpaid; 0 when paid
        let nextPaymentDate = null;
        let daysLeft = 0;      // days until coverage ends / next due
        let amountOwed = 0;
        let totalPaid = 0;
        let expectedPayment = 0;
        let monthsPaid = 0;
        let rentStatusMessage = 'Payment period not set';

        // Total paid across direct bills + shared group bills (consistent with outstanding)
        const [paidData] = await connection.execute(
            `
            SELECT COALESCE(SUM(b.paid_amount), 0) AS total_paid
            FROM bills b
            WHERE b.deleted_at IS NULL
              AND (
                b.tenant_id = ?
                OR EXISTS (
                    SELECT 1
                    FROM bill_group_members bgm
                    INNER JOIN bill_groups bg ON bg.id = bgm.bill_group_id
                    WHERE bg.bill_id = b.id AND bgm.tenant_id = ?
                )
              )
            `,
            [tenantId, tenantId]
        );
        totalPaid = parseFloat(paidData[0]?.total_paid) || 0;

        const paidFrom = paidFromValid ? toDateOnly(tenant.paid_from) : null;
        const paidTill = paidTillValid ? toDateOnly(tenant.paid_till) : null;

        if (paidFrom && monthlyRent > 0) {
            // months covered by recorded payments (informational only)
            monthsPaid = Math.floor(totalPaid / monthlyRent);
            if (today >= paidFrom) {
                const monthsElapsed = calendarMonthsBetween(paidFrom, today);
                expectedPayment = monthlyRent * monthsElapsed;
            } else {
                expectedPayment = 0;
            }
        }

        if (paidTill) {
            // Coverage is inclusive of paid_till (admin sets the last covered day)
            if (today.getTime() <= paidTill.getTime()) {
                rentStatus = 'paid';
                daysLeft = daysBetween(today, paidTill); // remaining covered days
                dueDays = 0;
                amountOwed = 0;
                rentStatusMessage = daysLeft === 0
                    ? 'Paid — coverage ends today'
                    : `Paid — covered for ${daysLeft} more day${daysLeft === 1 ? '' : 's'}`;

                // Next payment: day after coverage ends, aligned to payment_date if set
                const dayAfterCoverage = new Date(paidTill);
                dayAfterCoverage.setDate(dayAfterCoverage.getDate() + 1);
                dayAfterCoverage.setHours(0, 0, 0, 0);

                if (tenant.payment_date) {
                    nextPaymentDate = nextPaymentDateFromDay(dayAfterCoverage, tenant.payment_date);
                } else {
                    nextPaymentDate = dayAfterCoverage;
                }
                // daysLeft for "Next Payment" card should reflect time until next due
                if (nextPaymentDate) {
                    daysLeft = Math.max(0, daysBetween(today, nextPaymentDate));
                }
            } else {
                rentStatus = 'unpaid';
                dueDays = daysBetween(paidTill, today); // days past coverage
                rentStatusMessage = dueDays === 1
                    ? 'Overdue by 1 day'
                    : `Overdue by ${dueDays} days`;

                // Prefer real outstanding bill balance; fall back to period estimate
                const outstandingAmt = Number(outstanding.total_amount || 0);
                if (outstandingAmt > 0) {
                    amountOwed = outstandingAmt;
                } else if (monthlyRent > 0) {
                    const overdueMonths = calendarMonthsBetween(paidTill, today);
                    amountOwed = overdueMonths * monthlyRent;
                }

                // Next payment is effectively due now (or next scheduled day if still ahead)
                if (tenant.payment_date) {
                    const scheduled = nextPaymentDateFromDay(today, tenant.payment_date);
                    nextPaymentDate = scheduled;
                } else {
                    nextPaymentDate = today;
                }
                daysLeft = 0;
            }
        } else {
            // No paid_till on record — cannot claim coverage
            rentStatus = 'unpaid';
            dueDays = 0;
            amountOwed = Number(outstanding.total_amount || 0);
            rentStatusMessage = paidFrom
                ? 'Payment coverage not recorded'
                : 'Payment period not set';

            if (tenant.payment_date) {
                nextPaymentDate = nextPaymentDateFromDay(today, tenant.payment_date);
                if (nextPaymentDate) {
                    daysLeft = Math.max(0, daysBetween(today, nextPaymentDate));
                }
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

        // ============================================================
        // Format dates properly without time
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
                monthly_rent: monthlyRent,
                message: rentStatusMessage
            },
            outstanding: {
                total_amount: Number(outstanding.total_amount || 0),
                bill_count: Number(outstanding.bill_count || 0)
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