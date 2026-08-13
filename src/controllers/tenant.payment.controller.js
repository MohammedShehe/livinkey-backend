const db = require("../config/db");
const { uploadFile } = require("../services/upload.service");

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

        // Insert payment proof
        await connection.execute(
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
                b.status as bill_status
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
                b.status as bill_status
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
                b.status as bill_status
            FROM payment_proofs pp
            INNER JOIN bills b ON pp.bill_id = b.id
            WHERE pp.tenant_id = ?
            ORDER BY pp.created_at DESC
            `,
            [tenantId]
        );

        connection.release();

        return res.json({
            success: true,
            data: {
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

module.exports = {
    getBillDetails,
    submitPaymentProof,
    getPaymentHistory
};