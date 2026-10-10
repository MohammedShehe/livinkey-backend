const db = require("../config/db");
const { uploadFile } = require("../services/upload.service");
const { generatePaymentReceipt } = require("../services/receipt.service");
const paymentService = require("../services/payment.service");
const fs = require("fs");
const { generateQRCode } = require("../utils/helpers");
// FIXED: needed to notify admins when a tenant submits a payment proof
const NotificationEventManager = require("../utils/notification.events");


/**
 * Multi-bill payment helpers.
 *
 * Payment scope:
 *  - bill: one explicitly selected bill
 *  - outstanding: the tenant's complete outstanding balance
 *
 * For outstanding payments the server allocates oldest due bills first.
 * A previously-partially-paid bill must be settled in full before the
 * allocation can move to a newer bill. This preserves the existing
 * one-partial-payment-per-bill rule.
 */
const getTenantOutstandingRows = async (connection, tenantId, { lock = false } = {}) => {
    const lockClause = lock ? " FOR UPDATE" : "";
    const [rows] = await connection.execute(`
        SELECT
            b.id,
            b.tenant_id,
            b.room_id,
            b.bill_group_id,
            b.billing_month,
            b.period_from,
            b.period_till,
            b.total_amount,
            b.fine_amount,
            b.paid_amount,
            b.status,
            b.payment_upi_id,
            b.payment_account_holder_name,
            b.payment_bank_name,
            b.payment_account_number,
            b.payment_ifsc_code,
            b.payment_details_source,
            b.payment_details_qr,
            b.payment_qr,
            b.partial_payment_qr,
            b.admin_qr,
            b.valid_until,
            r.room_number,
            GREATEST(b.total_amount + b.fine_amount - b.paid_amount, 0) AS due_amount,
            EXISTS(
                SELECT 1 FROM bill_payments bp
                WHERE bp.bill_id=b.id AND bp.is_partial=1
            ) AS has_verified_partial,
            EXISTS(
                SELECT 1 FROM payment_proofs pp
                WHERE pp.bill_id=b.id AND pp.status='pending'
            ) AS has_pending_payment_proof
        FROM bills b
        LEFT JOIN rooms r ON r.id=b.room_id
        WHERE
            b.deleted_at IS NULL
            AND (b.total_amount + b.fine_amount - b.paid_amount) > 0
            AND (
                b.tenant_id=?
                OR EXISTS (
                    SELECT 1
                    FROM bill_group_members bgm
                    INNER JOIN bill_groups bg ON bg.id=bgm.bill_group_id
                    WHERE bg.bill_id=b.id AND bgm.tenant_id=?
                )
            )
        ORDER BY b.created_at ASC, b.id ASC
        ${lockClause}
    `, [tenantId, tenantId]);
    return rows;
};

const buildPaymentAllocationPreview = async (connection, tenantId, {
    scope = 'bill',
    billId = null,
    amount,
    lock = false
} = {}) => {
    const requested = Number(amount);
    if (!Number.isFinite(requested) || requested <= 0) {
        throw new Error("Payment amount must be greater than 0.");
    }

    let rows;
    if (scope === 'bill') {
        if (!billId) throw new Error("Bill ID is required for a bill payment.");

        const lockClause = lock ? " FOR UPDATE" : "";
        const [result] = await connection.execute(`
            SELECT
                b.id, b.tenant_id, b.room_id, b.bill_group_id, b.billing_month,
                b.period_from, b.period_till, b.total_amount, b.fine_amount,
                b.paid_amount, b.status, b.payment_upi_id,
                b.payment_account_holder_name, b.payment_bank_name,
                b.payment_account_number, b.payment_ifsc_code,
                b.payment_details_source, b.payment_details_qr,
                b.payment_qr, b.partial_payment_qr, b.admin_qr, b.valid_until,
                r.room_number,
                GREATEST(b.total_amount + b.fine_amount - b.paid_amount, 0) AS due_amount,
                EXISTS(SELECT 1 FROM bill_payments bp WHERE bp.bill_id=b.id AND bp.is_partial=1) AS has_verified_partial,
                EXISTS(SELECT 1 FROM payment_proofs pp WHERE pp.bill_id=b.id AND pp.status='pending') AS has_pending_payment_proof,
                EXISTS(
                    SELECT 1 FROM payment_proofs pp_all
                    WHERE pp_all.tenant_id=b.tenant_id AND pp_all.status='pending'
                ) AS has_pending_outstanding_payment_proof
            FROM bills b
            LEFT JOIN rooms r ON r.id=b.room_id
            WHERE b.id=? AND b.deleted_at IS NULL
              AND (
                b.tenant_id=?
                OR EXISTS(
                    SELECT 1 FROM bill_group_members bgm
                    INNER JOIN bill_groups bg ON bg.id=bgm.bill_group_id
                    WHERE bg.bill_id=b.id AND bgm.tenant_id=?
                )
              )
            ${lockClause}
        `, [billId, tenantId, tenantId]);
        rows = result;
    } else if (scope === 'outstanding') {
        rows = await getTenantOutstandingRows(connection, tenantId, { lock });
    } else {
        throw new Error("Invalid payment scope. Use 'bill' or 'outstanding'.");
    }

    if (!rows.length) throw new Error("No outstanding bill was found.");

    const totalOutstanding = rows.reduce(
        (sum, row) => sum + Math.max(Number(row.due_amount || 0), 0), 0
    );

    if (requested > totalOutstanding + 0.005) {
        throw new Error(
            `Payment amount ₹${requested.toFixed(2)} exceeds the ${scope === 'outstanding' ? 'total outstanding' : 'selected bill'} due of ₹${totalOutstanding.toFixed(2)}.`
        );
    }

    if (scope === 'outstanding' && requested < totalOutstanding - 0.005 &&
        requested + 0.005 < totalOutstanding * 0.5) {
        throw new Error(
            `A partial payment must be at least 50% of the total outstanding balance: ₹${(totalOutstanding * 0.5).toFixed(2)}.`
        );
    }

    if (scope === 'bill') {
        const row = rows[0];
        const due = Math.max(Number(row.due_amount || 0), 0);
        if (requested < due - 0.005 && requested + 0.005 < due * 0.5) {
            throw new Error(
                `A partial payment must be at least 50% of the current bill due: ₹${(due * 0.5).toFixed(2)}.`
            );
        }
        if (row.has_pending_payment_proof) {
            throw new Error("A payment proof for this bill is awaiting admin verification. Please wait before making another payment.");
        }
        if (row.has_verified_partial && requested < due - 0.005) {
            throw new Error(
                `A partial payment has already been verified for this bill. You must now pay the full remaining balance of ₹${due.toFixed(2)}.`
            );
        }
    } else {
        // One pending proof at a time for an outstanding-balance payment.
        const [pending] = await connection.execute(`
            SELECT id FROM payment_proofs
            WHERE tenant_id=? AND status='pending'
            LIMIT 1
        `, [tenantId]);
        if (pending.length) {
            throw new Error("A payment proof is already awaiting admin verification. Please wait before submitting another payment.");
        }
    }

    let remaining = requested;
    const allocations = [];

    for (const row of rows) {
        if (remaining <= 0.005) break;
        const due = Math.max(Number(row.due_amount || 0), 0);
        if (due <= 0) continue;

        const allocation = Math.min(remaining, due);
        const leavesBalance = allocation < due - 0.005;

        if (leavesBalance && row.has_verified_partial) {
            throw new Error(
                `Bill #${row.id} already has a verified partial payment. Your payment must fully settle its remaining due of ₹${due.toFixed(2)} before newer bills can be paid.`
            );
        }

        if (leavesBalance && allocation + 0.005 < due * 0.5 && scope === 'bill') {
            throw new Error(
                `A partial payment for Bill #${row.id} must be at least 50% of its current due.`
            );
        }

        allocations.push({
            bill_id: Number(row.id),
            amount: Number(allocation.toFixed(2)),
            due_before: Number(due.toFixed(2)),
            due_after: Number(Math.max(due - allocation, 0).toFixed(2)),
            is_partial: leavesBalance,
            row
        });
        remaining = Number((remaining - allocation).toFixed(2));
    }

    if (remaining > 0.005) {
        throw new Error("Unable to allocate the requested payment across the tenant's outstanding bills.");
    }

    return {
        scope,
        target_bill_id: scope === 'bill' ? Number(billId) : null,
        amount: Number(requested.toFixed(2)),
        total_outstanding: Number(totalOutstanding.toFixed(2)),
        allocations
    };
};

const getBillDetails = async (req, res) => {
    let connection = null;
    let connectionReleased = false;
    try {
        const tenantId = req.tenant.id;

        connection = await db.getConnection();

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

        // Return every outstanding bill as well as the primary bill. This makes
        // the tenant app show the previous unpaid bills, the newly created bill,
        // and one authoritative combined outstanding balance.
        const [outstandingBills] = await connection.execute(`
            SELECT b.id, b.billing_month, b.total_amount, b.fine_amount, b.paid_amount,
                   b.status, b.sent_at, b.valid_until, b.room_id, r.room_number,
                   GREATEST(b.total_amount + b.fine_amount - b.paid_amount, 0) AS due_amount
            FROM bills b
            LEFT JOIN rooms r ON r.id=b.room_id
            WHERE (b.tenant_id=? OR EXISTS (
                SELECT 1 FROM bill_group_members bgm
                INNER JOIN bill_groups bg ON bg.id=bgm.bill_group_id
                WHERE bg.bill_id=b.id AND bgm.tenant_id=?
            ))
              AND b.deleted_at IS NULL
              AND (b.total_amount + b.fine_amount - b.paid_amount) > 0
            ORDER BY b.created_at DESC
        `, [tenantId, tenantId]);

        const totalOutstanding = outstandingBills.reduce(
            (sum, item) => sum + Math.max(Number(item.due_amount || 0), 0), 0
        );

        connection.release();
        connectionReleased = true;

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
                has_pending_outstanding_payment_proof: Boolean(bill.has_pending_outstanding_payment_proof),
                total_paid_online: parseFloat(bill.ledger_online_paid || 0),
                total_paid_cash: parseFloat(bill.ledger_cash_paid || 0),
                total_due: totalDue,
                is_overdue: bill.status === 'unpaid' && new Date(bill.valid_until) < new Date(),
                room_id: bill.room_id || bill.bill_room_id || null,
                is_group_bill: Boolean(bill.bill_group_id),
                outstanding_bills: outstandingBills.map(item => ({
                    id: item.id,
                    billing_month: item.billing_month,
                    total_amount: Number(item.total_amount || 0),
                    fine_amount: Number(item.fine_amount || 0),
                    paid_amount: Number(item.paid_amount || 0),
                    due_amount: Number(item.due_amount || 0),
                    status: item.status,
                    sent_at: item.sent_at,
                    valid_until: item.valid_until,
                    room_id: item.room_id || null,
                    room_number: item.room_number || null
                })),
                total_outstanding: totalOutstanding
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
        try { if (typeof connection !== 'undefined' && !connectionReleased) connection.release(); } catch (_) {}
        console.error("Get Bill Details Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const generatePaymentQR = async (req, res) => {
    try {
        const tenantId = req.tenant.id;
        const {
            bill_id,
            amount,
            scope = 'bill'
        } = req.body;

        const requested = Number(amount);
        if (!Number.isFinite(requested) || requested <= 0) {
            return res.status(400).json({ success:false, message:"A valid payment amount is required." });
        }

        const connection = await db.getConnection();
        try {
            const preview = await buildPaymentAllocationPreview(connection, tenantId, {
                scope,
                billId: bill_id,
                amount: requested,
                lock: false
            });

            const anchor = preview.allocations[0]?.row;
            if (!anchor) {
                return res.status(400).json({ success:false, message:"No outstanding bill is available for payment." });
            }

            // Generate the QR using the SAME technique used by normal bill
            // auto-generated QR codes. The important difference is that the
            // payload is built from the fresh payment preview, so the QR always
            // contains the REAL amount being paid right now.
            //
            // Do not require a UPI ID here. A UPI QR and Livinkey's normal bill
            // QR are two different things. The latter is an application/payment
            // reference QR and works even when the bill has only bank details or
            // an uploaded static payment QR.
            const paymentAmount = Number(preview.amount.toFixed(2));
            const allocations = preview.allocations.map(a => ({
                billId: a.bill_id,
                amount: Number(Number(a.amount).toFixed(2)),
                dueBefore: Number(Number(a.due_before).toFixed(2)),
                dueAfter: Number(Number(a.due_after).toFixed(2)),
                isPartial: !!a.is_partial
            }));
            const qrPayload = {
                billId: scope === 'bill' ? anchor.id : null,
                tenantId,
                amount: paymentAmount,
                type: scope === 'outstanding' ? 'outstanding_payment' : 'full_payment',
                paymentScope: scope,
                targetBillId: preview.target_bill_id,
                allocations
            };

            let qrCode = null;
            let qrCodePublicId = null;
            let qrCodeResourceType = null;
            let qrPath = null;
            try {
                qrPath = await generateQRCode(JSON.stringify(qrPayload), scope === 'outstanding' ? 'outstanding' : 'full');
                const upload = await uploadFile(
                    { buffer: fs.readFileSync(qrPath), originalname: 'payment_qr.png' },
                    'livinkey/bills/qr'
                );
                if (!upload || !upload.secure_url) {
                    throw new Error('Failed to generate/upload payment QR code');
                }
                qrCode = upload.secure_url;
                qrCodePublicId = upload.public_id || null;
                qrCodeResourceType = upload.resource_type || null;
            } finally {
                if (qrPath && fs.existsSync(qrPath)) {
                    try { fs.unlinkSync(qrPath); } catch (_) {}
                }
            }

            return res.json({
                success: true,
                data: {
                    qr_code: qrCode,
                    qr_code_public_id: qrCodePublicId,
                    qr_code_resource_type: qrCodeResourceType,
                    qr_payload: qrPayload,
                    payment_scope: scope,
                    target_bill_id: preview.target_bill_id,
                    total_outstanding: preview.total_outstanding,
                    payment_amount: paymentAmount,
                    allocations: preview.allocations.map(a => ({
                        bill_id: a.bill_id,
                        amount: a.amount,
                        due_before: a.due_before,
                        due_after: a.due_after,
                        is_partial: a.is_partial
                    }))
                }
            });
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error("Generate Payment QR Error:", error);
        return res.status(400).json({ success:false, message:error.message || "Unable to generate payment QR" });
    }
};

// Backward-compatible endpoint used by older app builds.
const generatePartialPaymentQR = async (req, res) => {
    return generatePaymentQR(req, res);
};


const submitPaymentProof = async (req, res) => {
    let connection = null;
    try {
        const tenantId = req.tenant.id;
        const {
            bill_id,
            transaction_id,
            amount_paid,
            payment_scope = 'bill',
            payment_target_bill_id
        } = req.body;
        const file = req.file;

        if (!bill_id && payment_scope !== 'outstanding') {
            return res.status(400).json({ success:false, message:"Bill ID is required." });
        }
        if (!transaction_id) {
            return res.status(400).json({ success:false, message:"Transaction ID is required." });
        }
        const amount = Number(amount_paid);
        if (!Number.isFinite(amount) || amount <= 0) {
            return res.status(400).json({ success:false, message:"Valid payment amount is required." });
        }
        if (!file) {
            return res.status(400).json({ success:false, message:"Payment screenshot is required." });
        }
        if (!['bill', 'outstanding'].includes(payment_scope)) {
            return res.status(400).json({ success:false, message:"Invalid payment scope." });
        }

        connection = await db.getConnection();
        await connection.beginTransaction();

        const targetBillId = payment_scope === 'bill'
            ? Number(bill_id)
            : (payment_target_bill_id ? Number(payment_target_bill_id) : null);

        const preview = await buildPaymentAllocationPreview(connection, tenantId, {
            scope: payment_scope,
            billId: targetBillId,
            amount,
            lock: true
        });

        // The proof row keeps an anchor bill for legacy joins/listing. For an
        // outstanding payment this is the oldest bill that receives money.
        const anchorBillId = preview.allocations[0].bill_id;

        const [duplicateTx] = await connection.execute(
            `SELECT id FROM payment_proofs WHERE tenant_id=? AND transaction_id=? LIMIT 1`,
            [tenantId, transaction_id]
        );
        if (duplicateTx.length) {
            await connection.rollback();
            return res.status(409).json({ success:false, message:"This transaction ID has already been submitted." });
        }

        const uploadResult = await uploadFile(
            file,
            `livinkey/payments/proofs/${tenantId}`
        );
        if (!uploadResult) {
            await connection.rollback();
            return res.status(500).json({ success:false, message:"Failed to upload payment proof" });
        }

        const [tenantRows] = await connection.execute(
            `SELECT full_name FROM tenants WHERE id=?`,
            [tenantId]
        );
        const tenantName = tenantRows[0]?.full_name || 'Tenant';

        const dueBefore = preview.scope === 'outstanding'
            ? preview.total_outstanding
            : preview.allocations[0].due_before;
        const isPartial = amount < dueBefore - 0.005;
        const dueAfter = Math.max(dueBefore - amount, 0);

        const [proofResult] = await connection.execute(
            `
            INSERT INTO payment_proofs (
                bill_id,
                payment_scope,
                payment_target_bill_id,
                tenant_id,
                transaction_id,
                amount_paid,
                proof_url,
                proof_public_id,
                proof_resource_type,
                status,
                is_partial,
                due_before_payment,
                due_after_payment
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)
            `,
            [
                anchorBillId,
                payment_scope,
                targetBillId,
                tenantId,
                transaction_id,
                amount,
                uploadResult.secure_url,
                uploadResult.public_id,
                uploadResult.resource_type || 'image',
                isPartial ? 1 : 0,
                dueBefore,
                dueAfter
            ]
        );

        await connection.commit();

        try {
            await NotificationEventManager.onPaymentProofSubmitted({
                id: proofResult.insertId,
                bill_id: anchorBillId,
                tenant_id: tenantId,
                tenant_name: tenantName,
                amount_paid: amount,
                payment_scope
            });
        } catch (notifError) {
            console.error("Failed to send payment proof submitted notification:", notifError);
        }

        return res.status(201).json({
            success:true,
            message:"Payment proof submitted successfully. Awaiting admin verification.",
            data:{
                proof_id: proofResult.insertId,
                payment_scope,
                amount_paid: amount,
                total_outstanding: preview.total_outstanding,
                allocations: preview.allocations.map(a => ({
                    bill_id:a.bill_id,
                    amount:a.amount,
                    due_before:a.due_before,
                    due_after:a.due_after
                }))
            }
        });
    } catch (error) {
        try { if (connection) await connection.rollback(); } catch (_) {}
        console.error("Submit Payment Proof Error:", error);
        return res.status(400).json({
            success:false,
            message:error.message || "Unable to submit payment proof"
        });
    } finally {
        try { if (connection) connection.release(); } catch (_) {}
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
                  SELECT 1
                  FROM payment_allocations pa
                  INNER JOIN payment_proofs pp ON pp.id = pa.payment_proof_id
                  WHERE pa.bill_payment_id = bp.id
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
                INNER JOIN tenants t ON pp.tenant_id = t.id
                LEFT JOIN tenant_details td ON t.id = td.tenant_id
                LEFT JOIN pgs p ON td.pg_id = p.id
                LEFT JOIN rooms r ON td.room_id = r.id
                WHERE pp.id = ?
                  AND (
                    pp.tenant_id = ?
                    OR EXISTS (
                        SELECT 1
                        FROM bill_group_members bgm
                        INNER JOIN bill_groups bg ON bg.id = bgm.bill_group_id
                        WHERE bg.bill_id = pp.bill_id
                          AND bgm.tenant_id = ?
                    )
                  )
                `,
                [paymentId, tenantId, tenantId]
            );
            paymentData = rows[0];
        }

        if (!paymentData) {
            connection.release();
            return res.status(404).json({
                success: false,
                message: "Payment not found"
            });
        }
        if (type === 'proof' && paymentData.status !== 'verified') {
            return res.status(400).json({ success: false, message: "A receipt is available only after the payment proof is verified." });
        }
        await attachReceiptLedgerContext(connection, paymentData, type);
        if (type === 'proof') {
            const [allocationRows] = await connection.execute(
                `SELECT pa.*, b.billing_month, b.total_amount AS bill_total,
                        b.fine_amount, b.status AS bill_status, r.room_number
                 FROM payment_allocations pa
                 INNER JOIN bills b ON b.id=pa.bill_id
                 LEFT JOIN rooms r ON r.id=b.room_id
                 WHERE pa.payment_proof_id=?
                 ORDER BY pa.allocation_order ASC`,
                [paymentId]
            );
            paymentData.payment_allocations = allocationRows;
        }
        connection.release();

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
                INNER JOIN tenants t ON pp.tenant_id = t.id
                LEFT JOIN tenant_details td ON t.id = td.tenant_id
                LEFT JOIN pgs p ON td.pg_id = p.id
                LEFT JOIN rooms r ON td.room_id = r.id
                WHERE pp.id = ?
                  AND (
                    pp.tenant_id = ?
                    OR EXISTS (
                        SELECT 1
                        FROM bill_group_members bgm
                        INNER JOIN bill_groups bg ON bg.id = bgm.bill_group_id
                        WHERE bg.bill_id = pp.bill_id
                          AND bgm.tenant_id = ?
                    )
                  )
                `,
                [paymentId, tenantId, tenantId]
            );
            paymentData = rows[0];
        }

        if (!paymentData) {
            connection.release();
            return res.status(404).json({
                success: false,
                message: "Payment not found"
            });
        }
        if (type === 'proof' && paymentData.status !== 'verified') {
            return res.status(400).json({ success: false, message: "A receipt is available only after the payment proof is verified." });
        }
        await attachReceiptLedgerContext(connection, paymentData, type);
        if (type === 'proof') {
            const [allocationRows] = await connection.execute(
                `SELECT pa.*, b.billing_month, b.total_amount AS bill_total,
                        b.fine_amount, b.status AS bill_status, r.room_number
                 FROM payment_allocations pa
                 INNER JOIN bills b ON b.id=pa.bill_id
                 LEFT JOIN rooms r ON r.id=b.room_id
                 WHERE pa.payment_proof_id=?
                 ORDER BY pa.allocation_order ASC`,
                [paymentId]
            );
            paymentData.payment_allocations = allocationRows;
        }
        connection.release();

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
    generatePaymentQR,
    generatePartialPaymentQR,
    submitPaymentProof,
    getPaymentHistory,
    getPaymentReceipt,
    downloadPaymentReceipt
};