const db = require("../config/db");
const { uploadFile } = require("../services/upload.service");
const { generatePaymentReceipt } = require("../services/receipt.service");
const paymentService = require("../services/payment.service");
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
                ) as total_cash_paid,
                COALESCE(
                    (SELECT SUM(amount)
                     FROM cash_payments
                     WHERE bill_id=b.id AND status='verified'), 0
                ) AS ledger_cash_paid,
                COALESCE(
                    (SELECT SUM(amount)
                     FROM bill_payments bp2
                     WHERE bp2.bill_id=b.id
                       AND LOWER(COALESCE(bp2.payment_method,''))<>'cash'
                       AND NOT EXISTS (
                           SELECT 1
                           FROM cash_payments cp2
                           WHERE cp2.bill_id=b.id
                             AND cp2.status='verified'
                             AND bp2.transaction_id=CONCAT('CASH-', cp2.id)
                       )
                    ), 0
                ) AS ledger_online_paid,
                b.payment_bank_name,
                b.payment_account_holder_name,
                b.payment_account_number,
                b.payment_ifsc_code,
                b.payment_upi_id,
                b.payment_details_source,
                EXISTS(SELECT 1 FROM bill_payments bp WHERE bp.bill_id=b.id AND bp.is_partial=1) AS has_verified_partial,
                EXISTS(SELECT 1 FROM payment_proofs pp WHERE pp.bill_id=b.id AND pp.status='pending') AS has_pending_payment_proof
            FROM bills b
            INNER JOIN tenants t ON b.tenant_id = t.id
            LEFT JOIN tenant_details td ON t.id = td.tenant_id
            LEFT JOIN pgs p ON td.pg_id = p.id
            LEFT JOIN rooms r ON td.room_id = r.id
            WHERE (b.tenant_id = ? OR EXISTS (SELECT 1 FROM bill_group_members bgm INNER JOIN bill_groups bg ON bg.id=bgm.bill_group_id WHERE bg.bill_id=b.id AND bgm.tenant_id=?))
              AND b.deleted_at IS NULL
            ORDER BY b.created_at DESC
            LIMIT 1
            `,
            [tenantId, tenantId]
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
        const totalDue = Math.max(
            parseFloat(bill.total_amount) + parseFloat(bill.fine_amount || 0) -
            parseFloat(bill.paid_amount || 0),
            0
        );

        const response = {
            bill: {
                id: bill.id,
                rent_amount: parseFloat(bill.rent_amount),
                electricity_amount: parseFloat(bill.electricity_amount || 0),
                electricity_meter_image: bill.electricity_meter_image,
                electricity_meter_image_2: bill.electricity_meter_image_2 || null,
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
                payment_bank_name: bill.payment_bank_name,
                payment_account_holder_name: bill.payment_account_holder_name,
                payment_account_number: bill.payment_account_number,
                payment_ifsc_code: bill.payment_ifsc_code,
                payment_upi_id: bill.payment_upi_id,
                payment_details_source: bill.payment_details_source,
                payment_details_qr: bill.payment_details_qr,
                has_verified_partial: Boolean(bill.has_verified_partial),
                has_pending_payment_proof: Boolean(bill.has_pending_payment_proof),
                total_paid_online: parseFloat(bill.ledger_online_paid || 0),
                total_paid_cash: parseFloat(bill.ledger_cash_paid || 0),
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

const generatePartialPaymentQR = async (req, res) => {
    try {
        const tenantId = req.tenant.id;
        const { bill_id, amount } = req.body;
        const requested = Number(amount);
        if (!bill_id || !Number.isFinite(requested) || requested <= 0) {
            return res.status(400).json({ success: false, message: "Bill and a valid payment amount are required" });
        }

        const connection = await db.getConnection();
        try {
            const [rows] = await connection.execute(
                `SELECT id, tenant_id, status, total_amount, paid_amount, fine_amount,
                        payment_upi_id, payment_account_holder_name
                 FROM bills WHERE id=? AND deleted_at IS NULL AND (tenant_id=? OR EXISTS (SELECT 1 FROM bill_group_members bgm INNER JOIN bill_groups bg ON bg.id=bgm.bill_group_id WHERE bg.bill_id=bills.id AND bgm.tenant_id=?)) FOR UPDATE`,
                [bill_id, tenantId, tenantId]
            );
            if (!rows.length) return res.status(404).json({ success:false, message:"Bill not found" });
            const bill = rows[0];
            const due = Math.max(Number(bill.total_amount)+Number(bill.fine_amount||0)-Number(bill.paid_amount||0),0);
            if (bill.status === 'paid' || due <= 0) return res.status(400).json({success:false,message:"Bill is already fully paid"});
            if (requested > due + 0.005) return res.status(400).json({success:false,message:`Amount exceeds current due of ₹${due.toFixed(2)}`});

            const [pendingProofs] = await connection.execute(
                `SELECT id, amount_paid FROM payment_proofs WHERE bill_id=? AND status='pending' LIMIT 1`,
                [bill_id]
            );
            if (pendingProofs.length) {
                return res.status(409).json({success:false,message:"A payment proof for this bill is awaiting admin verification. Please wait for verification before making another payment."});
            }
            const [partials] = await connection.execute(
                `SELECT id FROM bill_payments WHERE bill_id=? AND is_partial=1 LIMIT 1`,
                [bill_id]
            );
            if (partials.length && requested < due - 0.005) {
                return res.status(400).json({success:false,message:`A partial payment has already been verified for this bill. You must now pay the full remaining balance of ₹${due.toFixed(2)}.`});
            }
            if (requested < due - 0.005 && requested + 0.005 < due * 0.5) {
                return res.status(400).json({success:false,message:`Your partial payment is ₹${requested.toFixed(2)}, but the minimum allowed partial payment is 50% of the current due: ₹${(due * 0.5).toFixed(2)}.`});
            }
            const options = await paymentService.generatePaymentOptions(bill, { amount: requested });
            return res.json({ success:true, data: options });
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error("Generate Partial Payment QR Error:", error);
        return res.status(400).json({ success:false, message:error.message || "Unable to generate payment QR" });
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
            WHERE id = ? AND deleted_at IS NULL AND (tenant_id = ? OR EXISTS (SELECT 1 FROM bill_group_members bgm INNER JOIN bill_groups bg ON bg.id=bgm.bill_group_id WHERE bg.bill_id=bills.id AND bgm.tenant_id = ?))
            FOR UPDATE
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

        const due = Math.max(
            Number(bill.total_amount) + Number(bill.fine_amount || 0) - Number(bill.paid_amount || 0),
            0
        );
        const amount = Number(amount_paid);
        if (amount > due + 0.005) {
            connection.release();
            return res.status(400).json({
                success: false,
                message: `Amount exceeds the current due amount of ₹${due.toFixed(2)}`
            });
        }

        const [pendingProofs] = await connection.execute(
            `SELECT id FROM payment_proofs WHERE bill_id=? AND status='pending' LIMIT 1`,
            [bill_id]
        );
        if (pendingProofs.length) {
            connection.release();
            return res.status(409).json({
                success: false,
                message: "A payment proof for this bill is already awaiting admin verification. Please wait for verification before submitting another payment."
            });
        }
        const isPartial = amount < due - 0.005;
        if (isPartial && amount + 0.005 < due * 0.5) {
            connection.release();
            return res.status(400).json({
                success: false,
                message: `Your partial payment is ₹${amount.toFixed(2)}, but the minimum allowed partial payment is 50% of the current due: ₹${(due * 0.5).toFixed(2)}.`
            });
        }
        const [partialRows] = await connection.execute(
            `SELECT id FROM bill_payments WHERE bill_id = ? AND is_partial = 1 LIMIT 1`,
            [bill_id]
        );
        if (isPartial && partialRows.length) {
            connection.release();
            return res.status(400).json({
                success: false,
                message: `A partial payment has already been verified for this bill. You must now pay the full remaining balance of ₹${due.toFixed(2)}.`
            });
        }

        const [duplicateTx] = await connection.execute(
            `SELECT id FROM payment_proofs WHERE tenant_id = ? AND transaction_id = ? LIMIT 1`,
            [tenantId, transaction_id]
        );
        if (duplicateTx.length) {
            connection.release();
            return res.status(409).json({
                success: false,
                message: "This transaction ID has already been submitted."
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
                status,
                is_partial,
                due_before_payment
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                bill_id,
                tenantId,
                transaction_id,
                amount_paid,
                uploadResult.secure_url,
                uploadResult.public_id,
                uploadResult.resource_type || 'image',
                'pending',
                isPartial ? 1 : 0,
                due
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
                'online' AS _type,
                b.total_amount as bill_total,
                    b.billing_month,
                    b.period_from,
                    b.period_till,
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
            WHERE (b.tenant_id = ? OR EXISTS (SELECT 1 FROM bill_group_members bgm INNER JOIN bill_groups bg ON bg.id=bgm.bill_group_id WHERE bg.bill_id=b.id AND bgm.tenant_id=?))
              AND LOWER(COALESCE(bp.payment_method,'')) <> 'cash'
              AND NOT EXISTS (
                  SELECT 1 FROM payment_proofs pp
                  WHERE pp.bill_id = bp.bill_id
                    AND pp.transaction_id = bp.transaction_id
              )
            ORDER BY bp.created_at DESC
            `,
            [tenantId, tenantId]
        );

        // Get cash payments (join with bills to filter by tenant)
        const [cashPayments] = await connection.execute(
            `
            SELECT 
                cp.*,
                'cash' AS _type,
                'cash' AS payment_method,
                b.total_amount as bill_total,
                    b.billing_month,
                    b.period_from,
                    b.period_till,
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
            WHERE (b.tenant_id = ? OR EXISTS (SELECT 1 FROM bill_group_members bgm INNER JOIN bill_groups bg ON bg.id=bgm.bill_group_id WHERE bg.bill_id=b.id AND bgm.tenant_id=?))
              AND cp.status = 'verified'
            ORDER BY cp.created_at DESC
            `,
            [tenantId, tenantId]
        );

        // Get payment proofs
        const [proofs] = await connection.execute(
            `
            SELECT 
                pp.*,
                b.total_amount as bill_total,
                    b.billing_month,
                    b.period_from,
                    b.period_till,
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

const attachReceiptLedgerContext = async (connection, paymentData, type) => {
    if (!paymentData || (type === 'proof' && paymentData.status !== 'verified')) {
        return paymentData;
    }

    let ledgerId = null;

    if (type === 'online') {
        ledgerId = paymentData.id;
    }

    if (type === 'cash') {
        // Newer cash payments may have a corresponding bill_payments
        // ledger row. Legacy production cash payments may not. Both must
        // produce the same receipt/payment totals.
        const [rows] = await connection.execute(
            `SELECT id
             FROM bill_payments
             WHERE transaction_id = ? AND bill_id = ?
             LIMIT 1`,
            [`CASH-${paymentData.id}`, paymentData.bill_id]
        );
        ledgerId = rows[0]?.id || null;
    }

    if (type === 'proof') {
        const [rows] = await connection.execute(
            `SELECT id
             FROM bill_payments
             WHERE transaction_id = ? AND bill_id = ?
             LIMIT 1`,
            [paymentData.transaction_id, paymentData.bill_id]
        );
        ledgerId = rows[0]?.id || null;
    }

    let paymentDate = paymentData.payment_date || paymentData.created_at || new Date();

    if (ledgerId) {
        const [ledgerRows] = await connection.execute(
            `SELECT id, payment_date, amount
             FROM bill_payments
             WHERE id = ?
             LIMIT 1`,
            [ledgerId]
        );

        if (ledgerRows.length) {
            paymentDate = ledgerRows[0].payment_date;
            paymentData.payment_date = paymentDate;
        }
    }

    /*
     * IMPORTANT:
     * Do not use bills.paid_amount as "paid before this payment".
     * It is a running total and therefore gives incorrect receipt values.
     *
     * The live database contains legacy cash_payments rows that predate the
     * bill_payments ledger. Count verified cash directly, while excluding
     * CASH-<id> ledger rows from bill_payments to prevent double counting.
     */
    const [priorRows] = await connection.execute(
        `SELECT
            COALESCE((
                SELECT SUM(bp.amount)
                FROM bill_payments bp
                WHERE bp.bill_id = ?
                  AND LOWER(COALESCE(bp.payment_method,'')) <> 'cash'
                  AND (
                      bp.payment_date < ?
                      OR (bp.payment_date = ? AND bp.id < ?)
                  )
                  AND NOT EXISTS (
                      SELECT 1
                      FROM cash_payments cp
                      WHERE cp.bill_id = bp.bill_id
                        AND cp.status = 'verified'
                        AND bp.transaction_id = CONCAT('CASH-', cp.id)
                  )
            ), 0)
            +
            COALESCE((
                SELECT SUM(cp.amount)
                FROM cash_payments cp
                WHERE cp.bill_id = ?
                  AND cp.status = 'verified'
                  AND (
                      cp.payment_date < ?
                      OR (cp.payment_date = ? AND cp.id < ?)
                  )
            ), 0) AS paid_before_payment`,
        [
            paymentData.bill_id,
            paymentDate,
            paymentDate,
            Number(ledgerId || Number.MAX_SAFE_INTEGER),
            paymentData.bill_id,
            paymentDate,
            paymentDate,
            type === 'cash' ? Number(paymentData.id) : Number.MAX_SAFE_INTEGER
        ]
    );

    paymentData.paid_before_payment = Number(priorRows[0]?.paid_before_payment || 0);
    paymentData.payment_date = paymentDate;
    paymentData.paid_amount =
        paymentData.paid_before_payment +
        Number(paymentData.amount_paid ?? paymentData.amount ?? 0);

    return paymentData;
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
                    b.billing_month,
                    b.period_from,
                    b.period_till,
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
                    b.electricity_meter_image_2,
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
                WHERE bp.id = ? AND (b.tenant_id = ? OR EXISTS (SELECT 1 FROM bill_group_members bgm INNER JOIN bill_groups bg ON bg.id=bgm.bill_group_id WHERE bg.bill_id=b.id AND bgm.tenant_id=?))
                `,
                [paymentId, tenantId, tenantId]
            );
            paymentData = rows[0];
        } else if (type === 'cash') {
            const [rows] = await connection.execute(
                `
                SELECT 
                    cp.*,
                    b.total_amount as bill_total,
                    b.billing_month,
                    b.period_from,
                    b.period_till,
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
                    b.electricity_meter_image_2,
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
                WHERE cp.id = ? AND (b.tenant_id = ? OR EXISTS (SELECT 1 FROM bill_group_members bgm INNER JOIN bill_groups bg ON bg.id=bgm.bill_group_id WHERE bg.bill_id=b.id AND bgm.tenant_id=?))
                `,
                [paymentId, tenantId, tenantId]
            );
            paymentData = rows[0];
        } else if (type === 'proof') {
            const [rows] = await connection.execute(
                `
                SELECT 
                    pp.*,
                    b.total_amount as bill_total,
                    b.billing_month,
                    b.period_from,
                    b.period_till,
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
                    b.electricity_meter_image_2,
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
                [paymentId, tenantId, tenantId]
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
        if (type === 'proof' && paymentData.status !== 'verified') {
            return res.status(400).json({ success: false, message: "A receipt is available only after the payment proof is verified." });
        }
        await attachReceiptLedgerContext(connection, paymentData, type);

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
                    b.billing_month,
                    b.period_from,
                    b.period_till,
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
                    b.electricity_meter_image_2,
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
                WHERE bp.id = ? AND (b.tenant_id = ? OR EXISTS (SELECT 1 FROM bill_group_members bgm INNER JOIN bill_groups bg ON bg.id=bgm.bill_group_id WHERE bg.bill_id=b.id AND bgm.tenant_id=?))
                `,
                [paymentId, tenantId, tenantId]
            );
            paymentData = rows[0];
        } else if (type === 'cash') {
            const [rows] = await connection.execute(
                `
                SELECT 
                    cp.*,
                    b.total_amount as bill_total,
                    b.billing_month,
                    b.period_from,
                    b.period_till,
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
                    b.electricity_meter_image_2,
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
                WHERE cp.id = ? AND (b.tenant_id = ? OR EXISTS (SELECT 1 FROM bill_group_members bgm INNER JOIN bill_groups bg ON bg.id=bgm.bill_group_id WHERE bg.bill_id=b.id AND bgm.tenant_id=?))
                `,
                [paymentId, tenantId, tenantId]
            );
            paymentData = rows[0];
        } else if (type === 'proof') {
            const [rows] = await connection.execute(
                `
                SELECT 
                    pp.*,
                    b.total_amount as bill_total,
                    b.billing_month,
                    b.period_from,
                    b.period_till,
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
                    b.electricity_meter_image_2,
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
                [paymentId, tenantId, tenantId]
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
        if (type === 'proof' && paymentData.status !== 'verified') {
            return res.status(400).json({ success: false, message: "A receipt is available only after the payment proof is verified." });
        }
        await attachReceiptLedgerContext(connection, paymentData, type);

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
    generatePartialPaymentQR,
    submitPaymentProof,
    getPaymentHistory,
    getPaymentReceipt,
    downloadPaymentReceipt
};