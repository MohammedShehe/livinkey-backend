const bcrypt = require("bcrypt");
const crypto = require("crypto");
const db = require("../config/db");
const billService = require("../services/bill.service");
const { deleteFile } = require("../services/upload.service");
// FIXED: needed to notify the tenant when their proof is verified/rejected
const NotificationEventManager = require("../utils/notification.events");

/**
 * Get all payment proofs with filters
 * GET /api/bills/payment-proofs
 */
exports.getPaymentProofs = async (req, res) => {
    try {
        const { 
            status, 
            tenant_id, 
            bill_id,
            search,
            from_date,
            to_date,
            pg_id
        } = req.query;

        let query = `
            SELECT 
                pp.id,
                pp.bill_id,
                pp.tenant_id,
                pp.transaction_id,
                pp.amount_paid,
                pp.paid_from,
                pp.paid_till,
                pp.proof_url,
                pp.proof_public_id,
                pp.proof_resource_type,
                pp.status,
                pp.admin_notes,
                pp.verified_by,
                pp.verified_at,
                pp.created_at,
                pp.updated_at,
                t.full_name as tenant_name,
                t.email as tenant_email,
                t.phone as tenant_phone,
                t.nationality,
                p.name as pg_name,
                r.room_number,
                b.total_amount as bill_total,
                    b.billing_month,
                    b.period_from,
                    b.period_till,
                b.rent_amount,
                b.electricity_amount,
                b.maintenance_amount,
                b.other_charges,
                b.fine_amount,
                b.status as bill_status,
                a.name as verified_by_name
            FROM payment_proofs pp
            INNER JOIN tenants t ON pp.tenant_id = t.id
            LEFT JOIN bills b ON pp.bill_id = b.id
            LEFT JOIN tenant_details td ON t.id = td.tenant_id
            LEFT JOIN pgs p ON td.pg_id = p.id
            LEFT JOIN rooms r ON td.room_id = r.id
            LEFT JOIN admins a ON pp.verified_by = a.id
            WHERE 1=1
        `;

        const params = [];

        if (status) {
            query += ` AND pp.status = ?`;
            params.push(status);
        }

        if (tenant_id) {
            query += ` AND pp.tenant_id = ?`;
            params.push(parseInt(tenant_id));
        }

        if (bill_id) {
            query += ` AND pp.bill_id = ?`;
            params.push(parseInt(bill_id));
        }

        if (search) {
            query += ` AND (t.full_name LIKE ? OR t.email LIKE ? OR pp.transaction_id LIKE ?)`;
            const searchPattern = `%${search}%`;
            params.push(searchPattern, searchPattern, searchPattern);
        }

        if (from_date) {
            query += ` AND DATE(pp.created_at) >= ?`;
            params.push(from_date);
        }

        if (to_date) {
            query += ` AND DATE(pp.created_at) <= ?`;
            params.push(to_date);
        }

        if (pg_id) {
            query += ` AND td.pg_id = ?`;
            params.push(parseInt(pg_id));
        }

        query += ` ORDER BY 
            CASE pp.status 
                WHEN 'pending' THEN 1 
                WHEN 'verified' THEN 2 
                WHEN 'rejected' THEN 3 
            END, 
            pp.created_at DESC`;

        const connection = await db.getConnection();
        const [rows] = await connection.execute(query, params);
        connection.release();

        return res.status(200).json({
            success: true,
            count: rows.length,
            data: rows.map(row => ({
                ...row,
                amount_paid: parseFloat(row.amount_paid) || 0,
                bill_total: row.bill_total ? parseFloat(row.bill_total) || 0 : 0,
                rent_amount: row.rent_amount ? parseFloat(row.rent_amount) || 0 : 0,
                electricity_amount: row.electricity_amount ? parseFloat(row.electricity_amount) || 0 : 0,
                maintenance_amount: row.maintenance_amount ? parseFloat(row.maintenance_amount) || 0 : 0,
                other_charges: row.other_charges ? parseFloat(row.other_charges) || 0 : 0,
                fine_amount: row.fine_amount ? parseFloat(row.fine_amount) || 0 : 0
            }))
        });

    } catch (error) {
        console.error("Get Payment Proofs Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

/**
 * Get single payment proof by ID
 * GET /api/bills/payment-proofs/:id
 */
exports.getPaymentProofById = async (req, res) => {
    try {
        const { id } = req.params;

        const connection = await db.getConnection();
        const [rows] = await connection.execute(
            `
            SELECT 
                pp.*,
                t.full_name as tenant_name,
                t.email as tenant_email,
                t.phone as tenant_phone,
                t.nationality,
                p.name as pg_name,
                r.room_number,
                b.total_amount as bill_total,
                    b.billing_month,
                    b.period_from,
                    b.period_till,
                b.rent_amount,
                b.electricity_amount,
                b.maintenance_amount,
                b.other_charges,
                b.fine_amount,
                b.status as bill_status,
                a.name as verified_by_name
            FROM payment_proofs pp
            INNER JOIN tenants t ON pp.tenant_id = t.id
            LEFT JOIN bills b ON pp.bill_id = b.id
            LEFT JOIN tenant_details td ON t.id = td.tenant_id
            LEFT JOIN pgs p ON td.pg_id = p.id
            LEFT JOIN rooms r ON td.room_id = r.id
            LEFT JOIN admins a ON pp.verified_by = a.id
            WHERE pp.id = ?
            `,
            [id]
        );
        connection.release();

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Payment proof not found"
            });
        }

        const proof = rows[0];
        return res.status(200).json({
            success: true,
            data: {
                ...proof,
                amount_paid: parseFloat(proof.amount_paid) || 0,
                bill_total: proof.bill_total ? parseFloat(proof.bill_total) || 0 : 0
            }
        });

    } catch (error) {
        console.error("Get Payment Proof By ID Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

/**
 * FIXED: Verify a payment proof (Admin action)
 * Now requires paid_from and paid_till from admin
 * PUT /api/bills/payment-proofs/:id/verify
 */
exports.verifyPaymentProof = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const { id } = req.params;
        const adminId = req.admin.id;
        const adminName = req.admin.name || req.admin.full_name || 'Admin';
        const { paid_from, paid_till } = req.body;

        // Lock both rows so two admins cannot verify the same proof or
        // calculate the same remaining balance concurrently.
        const [proofRows] = await connection.execute(
            `SELECT pp.*, b.total_amount, b.paid_amount, b.fine_amount, b.status AS bill_status
             FROM payment_proofs pp
             INNER JOIN bills b ON b.id = pp.bill_id
             WHERE pp.id = ? AND b.deleted_at IS NULL
             FOR UPDATE`,
            [id]
        );
        if (!proofRows.length) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: "Payment proof or associated bill not found" });
        }

        const proof = proofRows[0];
        if (proof.status !== 'pending') {
            await connection.rollback();
            return res.status(409).json({ success: false, message: `This proof has already been ${proof.status}` });
        }
        if (proof.bill_status === 'paid') {
            await connection.rollback();
            return res.status(400).json({ success: false, message: "The associated bill is already fully paid" });
        }

        const amount = Number(proof.amount_paid);
        const due = Math.max(
            Number(proof.total_amount) + Number(proof.fine_amount || 0) - Number(proof.paid_amount || 0),
            0
        );
        if (!Number.isFinite(amount) || amount <= 0) {
            throw new Error("Invalid payment proof amount");
        }
        if (amount > due + 0.005) {
            throw new Error(`Proof amount ₹${amount.toFixed(2)} exceeds the current bill due ₹${due.toFixed(2)}`);
        }

        // A bill may have only one verified partial payment.
        const [partialRows] = await connection.execute(
            `SELECT COUNT(*) AS count FROM bill_payments WHERE bill_id = ? AND is_partial = 1`,
            [proof.bill_id]
        );
        const isPartial = Number(proof.is_partial) === 1 || amount < due - 0.005;
        if (isPartial && Number(partialRows[0].count) > 0) {
            throw new Error("This bill has already received a partial payment. The proof must settle the remaining due.");
        }
        if (isPartial && amount + 0.005 < due * 0.5) {
            throw new Error("A partial payment must be at least 50% of the current amount due.");
        }

        // Transaction IDs are idempotent and cannot be reused.
        const [duplicateProof] = await connection.execute(
            `SELECT id FROM payment_proofs
             WHERE tenant_id = ? AND transaction_id = ? AND id <> ?
             LIMIT 1`,
            [proof.tenant_id, proof.transaction_id, proof.id]
        );
        const [duplicatePayment] = await connection.execute(
            `SELECT id FROM bill_payments WHERE transaction_id = ? LIMIT 1`,
            [proof.transaction_id]
        );
        if (duplicateProof.length || duplicatePayment.length) {
            throw new Error("This transaction ID has already been recorded.");
        }

        await connection.execute(
            `UPDATE payment_proofs
             SET status='verified', verified_by=?, verified_at=NOW(),
                 paid_from=?, paid_till=?
             WHERE id=? AND status='pending'`,
            [adminId, paid_from || null, paid_till || null, id]
        );

        await connection.execute(
            `INSERT INTO bill_payments
             (bill_id, amount, payment_method, transaction_id, paid_from, paid_till, is_partial)
             VALUES (?, ?, 'payment_proof', ?, ?, ?, ?)`,
            [proof.bill_id, amount, proof.transaction_id, paid_from || proof.paid_from || null,
             paid_till || proof.paid_till || null, isPartial ? 1 : 0]
        );

        const newPaid = Number(proof.paid_amount || 0) + amount;
        const newDue = Math.max(Number(proof.total_amount) + Number(proof.fine_amount || 0) - newPaid, 0);
        const newStatus = newDue <= 0.005 ? 'paid' : 'partially_paid';

        await connection.execute(
            `UPDATE bills
             SET paid_amount=?,
                 status=?,
                 partial_payment_made_at=CASE WHEN ?=1 AND partial_payment_made_at IS NULL THEN NOW() ELSE partial_payment_made_at END
             WHERE id=?`,
            [newPaid, newStatus, isPartial ? 1 : 0, proof.bill_id]
        );

        if (paid_from && paid_till) {
            await billService.updateTenantPaymentDates(connection, proof.tenant_id, paid_from, paid_till);
        }

        // Payment QR assets are no longer valid after a successful settlement.
        if (newStatus === 'paid') {
            const [billAssets] = await connection.execute(
                `SELECT payment_qr_public_id, payment_qr_resource_type,
                        partial_payment_qr_public_id, partial_payment_qr_resource_type
                 FROM bills WHERE id=? FOR UPDATE`,
                [proof.bill_id]
            );
            if (billAssets.length) {
                for (const f of [
                    [billAssets[0].payment_qr_public_id, billAssets[0].payment_qr_resource_type],
                    [billAssets[0].partial_payment_qr_public_id, billAssets[0].partial_payment_qr_resource_type]
                ]) {
                    if (f[0]) {
                        try { await deleteFile(f[0], f[1] || 'image'); } catch (e) {}
                    }
                }
                await connection.execute(
                    `UPDATE bills SET payment_qr=NULL, payment_qr_public_id=NULL,
                     payment_qr_resource_type=NULL, partial_payment_qr=NULL,
                     partial_payment_qr_public_id=NULL, partial_payment_qr_resource_type=NULL
                     WHERE id=?`,
                    [proof.bill_id]
                );
            }
        }

        await connection.commit();

        const [updatedProof] = await connection.execute(
            `SELECT pp.*, t.full_name AS tenant_name, t.email AS tenant_email,
                    b.total_amount AS bill_total, b.fine_amount, b.paid_amount, b.status AS bill_status
             FROM payment_proofs pp
             INNER JOIN tenants t ON pp.tenant_id=t.id
             INNER JOIN bills b ON pp.bill_id=b.id
             WHERE pp.id=?`,
            [id]
        );

        try {
            const tenant = { id: proof.tenant_id, full_name: proof.tenant_name || 'Tenant' };
            const notificationBill = {
                id: proof.bill_id,
                tenant_id: proof.tenant_id,
                paid_amount: amount,
                total_amount: proof.total_amount,
                admin_name: adminName
            };
            await NotificationEventManager.onTenantPaymentProofVerified(notificationBill, tenant, adminName);
            if (newStatus === 'paid') {
                await NotificationEventManager.onTenantBillPaid(notificationBill, tenant, adminName);
            } else {
                await NotificationEventManager.onTenantBillPartiallyPaid(notificationBill, tenant, adminName);
            }
        } catch (notifError) {
            console.error("Failed to send payment proof verified notification:", notifError);
        }

        return res.status(200).json({
            success: true,
            message: "Payment proof verified successfully",
            data: updatedProof[0]
        });
    } catch (error) {
        await connection.rollback();
        console.error("Verify Payment Proof Error:", error);
        return res.status(400).json({ success: false, message: error.message || "Internal server error" });
    } finally {
        connection.release();
    }
};

/**
 * Reject a payment proof (Admin action)
 * PUT /api/bills/payment-proofs/:id/reject
 */
exports.rejectPaymentProof = async (req, res) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const { id } = req.params;
        const { admin_notes } = req.body;

        const [proofRows] = await connection.execute(
            `
            SELECT * FROM payment_proofs WHERE id = ?
            `,
            [id]
        );

        if (proofRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: "Payment proof not found"
            });
        }

        const proof = proofRows[0];

        if (proof.status !== 'pending') {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: `This proof has already been ${proof.status}`
            });
        }

        const rejectionNote = admin_notes || 'Payment proof rejected by admin';

        await connection.execute(
            `
            UPDATE payment_proofs 
            SET 
                status = 'rejected',
                admin_notes = ?
            WHERE id = ?
            `,
            [rejectionNote, id]
        );

        await connection.commit();

        const [updatedProof] = await connection.execute(
            `
            SELECT 
                pp.*,
                t.full_name as tenant_name,
                t.email as tenant_email
            FROM payment_proofs pp
            INNER JOIN tenants t ON pp.tenant_id = t.id
            WHERE pp.id = ?
            `,
            [id]
        );

        // ============================================================
        // FIXED: previously never notified the tenant that their proof
        // was rejected. They now get told, including the admin's reason.
        // ============================================================
        try {
            await NotificationEventManager.onTenantPaymentProofRejected(
                proof.tenant_id,
                rejectionNote,
                req.admin.name || req.admin.full_name || 'Admin'
            );
        } catch (notifError) {
            console.error("Failed to send payment proof rejected notification:", notifError);
        }

        return res.status(200).json({
            success: true,
            message: "Payment proof rejected successfully",
            data: updatedProof[0]
        });

    } catch (error) {
        await connection.rollback();
        console.error("Reject Payment Proof Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    } finally {
        connection.release();
    }
};

/**
 * Delete a payment proof (Admin action)
 * DELETE /api/bills/payment-proofs/:id
 */
exports.deletePaymentProof = async (req, res) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const { id } = req.params;

        const [proofRows] = await connection.execute(
            `
            SELECT proof_public_id, proof_resource_type, status 
            FROM payment_proofs 
            WHERE id = ?
            `,
            [id]
        );

        if (proofRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: "Payment proof not found"
            });
        }

        const proof = proofRows[0];

        if (proof.proof_public_id) {
            try {
                await deleteFile(proof.proof_public_id, proof.proof_resource_type);
            } catch (error) {
                console.error("Failed to delete proof file:", error);
            }
        }

        await connection.execute(
            `
            DELETE FROM payment_proofs WHERE id = ?
            `,
            [id]
        );

        await connection.commit();

        return res.status(200).json({
            success: true,
            message: "Payment proof deleted successfully"
        });

    } catch (error) {
        await connection.rollback();
        console.error("Delete Payment Proof Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    } finally {
        connection.release();
    }
};

/**
 * Get payment proof stats
 * GET /api/bills/payment-proofs/stats
 */
exports.getPaymentProofStats = async (req, res) => {
    try {
        const { pg_id } = req.query;
        const connection = await db.getConnection();

        let query = `
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN pp.status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN pp.status = 'verified' THEN 1 ELSE 0 END) as verified,
                SUM(CASE WHEN pp.status = 'rejected' THEN 1 ELSE 0 END) as rejected,
                COALESCE(SUM(CASE WHEN pp.status = 'pending' THEN pp.amount_paid ELSE 0 END), 0) as pending_amount,
                COALESCE(SUM(CASE WHEN pp.status = 'verified' THEN pp.amount_paid ELSE 0 END), 0) as verified_amount,
                COALESCE(SUM(CASE WHEN pp.status = 'rejected' THEN pp.amount_paid ELSE 0 END), 0) as rejected_amount,
                COALESCE(SUM(pp.amount_paid), 0) as total_amount
            FROM payment_proofs pp
        `;
        const params = [];

        if (pg_id) {
            query += `
                INNER JOIN tenants t ON pp.tenant_id = t.id
                LEFT JOIN tenant_details td ON t.id = td.tenant_id
                WHERE td.pg_id = ?
            `;
            params.push(parseInt(pg_id));
        }

        const [rows] = await connection.execute(query, params);
        connection.release();

        const stats = rows[0] || {};
        
        return res.status(200).json({
            success: true,
            data: {
                total: parseInt(stats.total) || 0,
                pending: parseInt(stats.pending) || 0,
                verified: parseInt(stats.verified) || 0,
                rejected: parseInt(stats.rejected) || 0,
                pending_amount: parseFloat(stats.pending_amount) || 0,
                verified_amount: parseFloat(stats.verified_amount) || 0,
                rejected_amount: parseFloat(stats.rejected_amount) || 0,
                total_amount: parseFloat(stats.total_amount) || 0
            }
        });

    } catch (error) {
        console.error("Get Payment Proof Stats Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};