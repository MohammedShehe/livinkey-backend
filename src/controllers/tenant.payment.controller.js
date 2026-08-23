const db = require("../config/db");
const { uploadFile } = require("../services/upload.service");
const { generatePaymentReceipt } = require("../services/receipt.service");
// FIXED: needed to notify admins when a tenant submits a payment proof
const NotificationEventManager = require("../utils/notification.events");

const getBillDetails = async (req, res) => {
    try {
        const tenantId = req.tenant.id;

        const connection = await db.getConnection();

        // Get current bill for tenant
        const [bills] = await connection.execute(
            `
            SELECT 
                b.*,
                t.full_name as tenant_name,
                t.email as tenant_email,
                t.phone as tenant_phone,
                p.name as pg_name,
                r.room_number,
                COALESCE(
                    (SELECT SUM(amount) FROM bill_payments WHERE bill_id = b.id AND is_partial = 0), 
                    0
                ) as total_paid,
                COALESCE(
                    (SELECT SUM(amount) FROM bill_payments WHERE bill_id = b.id AND is_partial = 1), 
                    0
                ) as total_partial_paid,
                COALESCE(
                    (SELECT SUM(amount) FROM cash_payments WHERE bill_id = b.id AND status = 'verified'), 
                    0
                ) as total_cash_paid
            FROM bills b
            INNER JOIN tenants t ON b.tenant_id = t.id
            LEFT JOIN tenant_details td ON t.id = td.tenant_id
            LEFT JOIN pgs p ON td.pg_id = p.id
            LEFT JOIN rooms r ON td.room_id = r.id
            WHERE b.tenant_id = ?
            ORDER BY b.created_at DESC
            LIMIT 1
            `,
            [tenantId]
        );

        connection.release();

        if (bills.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No bill found"
            });
        }

        const bill = bills[0];

        // Calculate total due
        const totalDue = parseFloat(bill.total_amount) + parseFloat(bill.fine_amount || 0) - 
                         parseFloat(bill.paid_amount || 0) - parseFloat(bill.total_cash_paid || 0);

        const response = {
            bill: {
                id: bill.id,
                rent_amount: parseFloat(bill.rent_amount),
                electricity_amount: parseFloat(bill.electricity_amount || 0),
                electricity_meter_image: bill.electricity_meter_image,
                maintenance_amount: parseFloat(bill.maintenance_amount || 0),
                other_charges: parseFloat(bill.other_charges || 0),
                total_amount: parseFloat(bill.total_amount),
                fine_amount: parseFloat(bill.fine_amount || 0),
                paid_amount: parseFloat(bill.paid_amount || 0),
                status: bill.status,
                sent_at: bill.sent_at,
                valid_until: bill.valid_until,
                payment_qr: bill.payment_qr,
                partial_payment_qr: bill.partial_payment_qr,
                admin_qr: bill.admin_qr,
                total_due: totalDue,
                is_overdue: bill.status === 'unpaid' && new Date(bill.valid_until) < new Date()
            },
            tenant: {
                full_name: bill.tenant_name,
                email: bill.tenant_email,
                phone: bill.tenant_phone,
                pg_name: bill.pg_name,
                room_number: bill.room_number
            }
        };

        return res.json({
            success: true,
            data: response
        });

    } catch (error) {
        console.error("Get Bill Details Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const submitPaymentProof = async (req, res) => {
    try {
        const tenantId = req.tenant.id;
        const { bill_id, transaction_id, amount_paid } = req.body;
        const file = req.file;

        if (!bill_id) {
            return res.status(400).json({
                success: false,
                message: "Bill ID is required"
            });
        }

        if (!transaction_id) {
            return res.status(400).json({
                success: false,
                message: "Transaction ID is required"
            });
        }

        if (!amount_paid || amount_paid <= 0) {
            return res.status(400).json({
                success: false,
                message: "Valid payment amount is required"
            });
        }

        if (!file) {
            return res.status(400).json({
                success: false,
                message: "Payment screenshot is required"
            });
        }

        const connection = await db.getConnection();

        // Verify bill belongs to tenant and is not fully paid
        const [billCheck] = await connection.execute(
            `
            SELECT id, status, total_amount, paid_amount, fine_amount
            FROM bills 
            WHERE id = ? AND tenant_id = ?
            `,
            [bill_id, tenantId]
        );

        if (billCheck.length === 0) {
            connection.release();
            return res.status(404).json({
                success: false,
                message: "Bill not found"
            });
        }

        const bill = billCheck[0];

        if (bill.status === 'paid') {
            connection.release();
            return res.status(400).json({
                success: false,
                message: "Bill is already fully paid"
            });
        }

        // Upload payment proof
        const uploadResult = await uploadFile(
            file,
            `livinkey/payments/proofs/${tenantId}`
        );

        if (!uploadResult) {
            connection.release();
            return res.status(500).json({
                success: false,
                message: "Failed to upload payment proof"
            });
        }

        // ============================================================
        // FIXED: capture the tenant's name (for the admin notification
        // message) and the inserted proof's id (needed as the
        // notification's entity_id / link target).
        // ============================================================
        const [tenantRows] = await connection.execute(
            `SELECT full_name FROM tenants WHERE id = ?`,
            [tenantId]
        );
        const tenantName = tenantRows[0]?.full_name || 'Tenant';

        // Insert payment proof
        const [proofResult] = await connection.execute(
            `
            INSERT INTO payment_proofs (
                bill_id,
                tenant_id,
                transaction_id,
                amount_paid,
                proof_url,
                proof_public_id,
                proof_resource_type,
                status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                bill_id,
                tenantId,
                transaction_id,
                amount_paid,
                uploadResult.secure_url,
                uploadResult.public_id,
                uploadResult.resource_type || 'image',
                'pending'
            ]
        );

        connection.release();

        // ============================================================
        // FIXED: this previously never notified anyone. Admins now get
        // a "new payment proof submitted" notification.
        // ============================================================
        try {
            await NotificationEventManager.onPaymentProofSubmitted({
                id: proofResult.insertId,
                bill_id,
                tenant_id: tenantId,
                tenant_name: tenantName,
                amount_paid
            });
        } catch (notifError) {
            console.error("Failed to send payment proof submitted notification:", notifError);
        }

        return res.status(201).json({
            success: true,
            message: "Payment proof submitted successfully. Awaiting admin verification."
        });

    } catch (error) {
        console.error("Submit Payment Proof Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

const getPaymentHistory = async (req, res) => {
    try {
        const tenantId = req.tenant.id;

        const connection = await db.getConnection();

        // Get bill payments (join with bills to filter by tenant)
        const [payments] = await connection.execute(
            `
            SELECT 
                bp.*,
                b.total_amount as bill_total,
                b.status as bill_status,
                b.rent_amount,
                b.electricity_amount,
                b.maintenance_amount,
                b.other_charges,
                b.fine_amount,
                b.sent_at as bill_date,
                b.valid_until as bill_due_date
            FROM bill_payments bp
            INNER JOIN bills b ON bp.bill_id = b.id
            WHERE b.tenant_id = ?
            ORDER BY bp.created_at DESC
            `,
            [tenantId]
        );

        // Get cash payments (join with bills to filter by tenant)
        const [cashPayments] = await connection.execute(
            `
            SELECT 
                cp.*,
                b.total_amount as bill_total,
                b.status as bill_status,
                b.rent_amount,
                b.electricity_amount,
                b.maintenance_amount,
                b.other_charges,
                b.fine_amount,
                b.sent_at as bill_date,
                b.valid_until as bill_due_date
            FROM cash_payments cp
            INNER JOIN bills b ON cp.bill_id = b.id
            WHERE b.tenant_id = ?
            ORDER BY cp.created_at DESC
            `,
            [tenantId]
        );

        // Get payment proofs
        const [proofs] = await connection.execute(
            `
            SELECT 
                pp.*,
                b.total_amount as bill_total,
                b.status as bill_status,
                b.rent_amount,
                b.electricity_amount,
                b.maintenance_amount,
                b.other_charges,
                b.fine_amount,
                b.sent_at as bill_date,
                b.valid_until as bill_due_date
            FROM payment_proofs pp
            INNER JOIN bills b ON pp.bill_id = b.id
            WHERE pp.tenant_id = ?
            ORDER BY pp.created_at DESC
            `,
            [tenantId]
        );

        // Get tenant info
        const [tenantInfo] = await connection.execute(
            `
            SELECT 
                t.full_name,
                t.email,
                t.phone,
                t.nationality,
                p.name as pg_name,
                r.room_number
            FROM tenants t
            LEFT JOIN tenant_details td ON t.id = td.tenant_id
            LEFT JOIN pgs p ON td.pg_id = p.id
            LEFT JOIN rooms r ON td.room_id = r.id
            WHERE t.id = ?
            `,
            [tenantId]
        );

        connection.release();

        const tenant = tenantInfo[0] || {};

        return res.json({
            success: true,
            data: {
                tenant: tenant,
                online_payments: payments,
                cash_payments: cashPayments,
                payment_proofs: proofs
            }
        });

    } catch (error) {
        console.error("Get Payment History Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const getPaymentReceipt = async (req, res) => {
    try {
        const tenantId = req.tenant.id;
        const { paymentId, type } = req.params;

        if (!paymentId || !type) {
            return res.status(400).json({
                success: false,
                message: "Payment ID and type are required"
            });
        }

        // Validate type
        if (!['online', 'cash', 'proof'].includes(type)) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment type. Must be 'online', 'cash', or 'proof'"
            });
        }

        const connection = await db.getConnection();

        let paymentData = null;
        let tableName = '';

        // Get payment data based on type
        if (type === 'online') {
            tableName = 'bill_payments';
            const [rows] = await connection.execute(
                `
                SELECT 
                    bp.*,
                    b.total_amount as bill_total,
                    b.status as bill_status,
                    b.rent_amount,
                    b.electricity_amount,
                    b.maintenance_amount,
                    b.other_charges,
                    b.fine_amount,
                    b.sent_at as bill_date,
                    b.valid_until as bill_due_date,
                    b.payment_qr,
                    b.partial_payment_qr,
                    b.admin_qr,
                    b.electricity_meter_image,
                    t.full_name as tenant_name,
                    t.email as tenant_email,
                    t.phone as tenant_phone,
                    t.nationality,
                    p.name as pg_name,
                    r.room_number
                FROM bill_payments bp
                INNER JOIN bills b ON bp.bill_id = b.id
                INNER JOIN tenants t ON b.tenant_id = t.id
                LEFT JOIN tenant_details td ON t.id = td.tenant_id
                LEFT JOIN pgs p ON td.pg_id = p.id
                LEFT JOIN rooms r ON td.room_id = r.id
                WHERE bp.id = ? AND b.tenant_id = ?
                `,
                [paymentId, tenantId]
            );
            paymentData = rows[0];
        } else if (type === 'cash') {
            const [rows] = await connection.execute(
                `
                SELECT 
                    cp.*,
                    b.total_amount as bill_total,
                    b.status as bill_status,
                    b.rent_amount,
                    b.electricity_amount,
                    b.maintenance_amount,
                    b.other_charges,
                    b.fine_amount,
                    b.sent_at as bill_date,
                    b.valid_until as bill_due_date,
                    b.payment_qr,
                    b.partial_payment_qr,
                    b.admin_qr,
                    b.electricity_meter_image,
                    t.full_name as tenant_name,
                    t.email as tenant_email,
                    t.phone as tenant_phone,
                    t.nationality,
                    p.name as pg_name,
                    r.room_number,
                    a.name as verified_by_name
                FROM cash_payments cp
                INNER JOIN bills b ON cp.bill_id = b.id
                INNER JOIN tenants t ON b.tenant_id = t.id
                LEFT JOIN tenant_details td ON t.id = td.tenant_id
                LEFT JOIN pgs p ON td.pg_id = p.id
                LEFT JOIN rooms r ON td.room_id = r.id
                LEFT JOIN admins a ON cp.verified_by = a.id
                WHERE cp.id = ? AND b.tenant_id = ?
                `,
                [paymentId, tenantId]
            );
            paymentData = rows[0];
        } else if (type === 'proof') {
            const [rows] = await connection.execute(
                `
                SELECT 
                    pp.*,
                    b.total_amount as bill_total,
                    b.status as bill_status,
                    b.rent_amount,
                    b.electricity_amount,
                    b.maintenance_amount,
                    b.other_charges,
                    b.fine_amount,
                    b.sent_at as bill_date,
                    b.valid_until as bill_due_date,
                    b.payment_qr,
                    b.partial_payment_qr,
                    b.admin_qr,
                    b.electricity_meter_image,
                    t.full_name as tenant_name,
                    t.email as tenant_email,
                    t.phone as tenant_phone,
                    t.nationality,
                    p.name as pg_name,
                    r.room_number
                FROM payment_proofs pp
                INNER JOIN bills b ON pp.bill_id = b.id
                INNER JOIN tenants t ON b.tenant_id = t.id
                LEFT JOIN tenant_details td ON t.id = td.tenant_id
                LEFT JOIN pgs p ON td.pg_id = p.id
                LEFT JOIN rooms r ON td.room_id = r.id
                WHERE pp.id = ? AND pp.tenant_id = ?
                `,
                [paymentId, tenantId]
            );
            paymentData = rows[0];
        }

        connection.release();

        if (!paymentData) {
            return res.status(404).json({
                success: false,
                message: "Payment not found"
            });
        }

        // Generate receipt HTML
        const receiptHTML = generatePaymentReceipt(paymentData, type);

        // Send HTML response
        res.setHeader('Content-Type', 'text/html');
        return res.send(receiptHTML);

    } catch (error) {
        console.error("Get Payment Receipt Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const downloadPaymentReceipt = async (req, res) => {
    try {
        const tenantId = req.tenant.id;
        const { paymentId, type } = req.params;

        if (!paymentId || !type) {
            return res.status(400).json({
                success: false,
                message: "Payment ID and type are required"
            });
        }

        // Validate type
        if (!['online', 'cash', 'proof'].includes(type)) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment type. Must be 'online', 'cash', or 'proof'"
            });
        }

        const connection = await db.getConnection();

        let paymentData = null;

        // Get payment data based on type (same as above)
        if (type === 'online') {
            const [rows] = await connection.execute(
                `
                SELECT 
                    bp.*,
                    b.total_amount as bill_total,
                    b.status as bill_status,
                    b.rent_amount,
                    b.electricity_amount,
                    b.maintenance_amount,
                    b.other_charges,
                    b.fine_amount,
                    b.sent_at as bill_date,
                    b.valid_until as bill_due_date,
                    b.payment_qr,
                    b.partial_payment_qr,
                    b.admin_qr,
                    b.electricity_meter_image,
                    t.full_name as tenant_name,
                    t.email as tenant_email,
                    t.phone as tenant_phone,
                    t.nationality,
                    p.name as pg_name,
                    r.room_number
                FROM bill_payments bp
                INNER JOIN bills b ON bp.bill_id = b.id
                INNER JOIN tenants t ON b.tenant_id = t.id
                LEFT JOIN tenant_details td ON t.id = td.tenant_id
                LEFT JOIN pgs p ON td.pg_id = p.id
                LEFT JOIN rooms r ON td.room_id = r.id
                WHERE bp.id = ? AND b.tenant_id = ?
                `,
                [paymentId, tenantId]
            );
            paymentData = rows[0];
        } else if (type === 'cash') {
            const [rows] = await connection.execute(
                `
                SELECT 
                    cp.*,
                    b.total_amount as bill_total,
                    b.status as bill_status,
                    b.rent_amount,
                    b.electricity_amount,
                    b.maintenance_amount,
                    b.other_charges,
                    b.fine_amount,
                    b.sent_at as bill_date,
                    b.valid_until as bill_due_date,
                    b.payment_qr,
                    b.partial_payment_qr,
                    b.admin_qr,
                    b.electricity_meter_image,
                    t.full_name as tenant_name,
                    t.email as tenant_email,
                    t.phone as tenant_phone,
                    t.nationality,
                    p.name as pg_name,
                    r.room_number,
                    a.name as verified_by_name
                FROM cash_payments cp
                INNER JOIN bills b ON cp.bill_id = b.id
                INNER JOIN tenants t ON b.tenant_id = t.id
                LEFT JOIN tenant_details td ON t.id = td.tenant_id
                LEFT JOIN pgs p ON td.pg_id = p.id
                LEFT JOIN rooms r ON td.room_id = r.id
                LEFT JOIN admins a ON cp.verified_by = a.id
                WHERE cp.id = ? AND b.tenant_id = ?
                `,
                [paymentId, tenantId]
            );
            paymentData = rows[0];
        } else if (type === 'proof') {
            const [rows] = await connection.execute(
                `
                SELECT 
                    pp.*,
                    b.total_amount as bill_total,
                    b.status as bill_status,
                    b.rent_amount,
                    b.electricity_amount,
                    b.maintenance_amount,
                    b.other_charges,
                    b.fine_amount,
                    b.sent_at as bill_date,
                    b.valid_until as bill_due_date,
                    b.payment_qr,
                    b.partial_payment_qr,
                    b.admin_qr,
                    b.electricity_meter_image,
                    t.full_name as tenant_name,
                    t.email as tenant_email,
                    t.phone as tenant_phone,
                    t.nationality,
                    p.name as pg_name,
                    r.room_number
                FROM payment_proofs pp
                INNER JOIN bills b ON pp.bill_id = b.id
                INNER JOIN tenants t ON b.tenant_id = t.id
                LEFT JOIN tenant_details td ON t.id = td.tenant_id
                LEFT JOIN pgs p ON td.pg_id = p.id
                LEFT JOIN rooms r ON td.room_id = r.id
                WHERE pp.id = ? AND pp.tenant_id = ?
                `,
                [paymentId, tenantId]
            );
            paymentData = rows[0];
        }

        connection.release();

        if (!paymentData) {
            return res.status(404).json({
                success: false,
                message: "Payment not found"
            });
        }

        // Generate receipt HTML
        const receiptHTML = generatePaymentReceipt(paymentData, type);

        // Send as downloadable file
        const fileName = `receipt_${paymentId}_${Date.now()}.html`;
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        return res.send(receiptHTML);

    } catch (error) {
        console.error("Download Payment Receipt Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = {
    getBillDetails,
    submitPaymentProof,
    getPaymentHistory,
    getPaymentReceipt,
    downloadPaymentReceipt
};