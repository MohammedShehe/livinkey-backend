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
                pp.payment_scope,
                pp.payment_target_bill_id,
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

        if (rows.length === 0) {
            connection.release();
            return res.status(404).json({
                success: false,
                message: "Payment proof not found"
            });
        }

        const proof = rows[0];

        const [allocationRows] = await connection.execute(
            `SELECT pa.*, b.billing_month, b.total_amount AS bill_total,
                    b.fine_amount, b.paid_amount, b.status AS bill_status,
                    r.room_number
             FROM payment_allocations pa
             INNER JOIN bills b ON b.id=pa.bill_id
             LEFT JOIN rooms r ON r.id=b.room_id
             WHERE pa.payment_proof_id=?
             ORDER BY pa.allocation_order ASC`,
            [id]
        );

        let allocationPreview = [];
        if (proof.status === 'pending') {
            try {
                const preview = await buildVerificationAllocations(connection, proof, false);
                allocationPreview = preview.allocations;
            } catch (previewError) {
                allocationPreview = [];
                proof.allocation_preview_error = previewError.message;
            }
        }

        connection.release();
        return res.status(200).json({
            success: true,
            data: {
                ...proof,
                amount_paid: parseFloat(proof.amount_paid) || 0,
                bill_total: proof.bill_total ? parseFloat(proof.bill_total) || 0 : 0,
                payment_scope: proof.payment_scope || 'bill',
                payment_target_bill_id: proof.payment_target_bill_id || null,
                allocation_preview_error: proof.allocation_preview_error || null,
                allocation_preview: allocationPreview.map(a => ({
                    bill_id:a.bill_id,
                    amount:a.amount,
                    due_before:a.due_before,
                    due_after:a.due_after,
                    is_partial:a.is_partial
                })),
                allocations: allocationRows.map(a => ({
                    id:a.id,
                    bill_payment_id:a.bill_payment_id,
                    bill_id:a.bill_id,
                    amount:Number(a.amount || 0),
                    allocation_order:a.allocation_order,
                    billing_month:a.billing_month,
                    bill_total:Number(a.bill_total || 0),
                    bill_status:a.bill_status,
                    room_number:a.room_number
                }))
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

const getOutstandingRowsForTenant = async (connection, tenantId, lock = false) => {
    const lockClause = lock ? " FOR UPDATE" : "";
    const [rows] = await connection.execute(`
        SELECT
            b.id, b.tenant_id, b.total_amount, b.fine_amount, b.paid_amount,
            b.status, b.payment_upi_id, b.payment_account_holder_name,
            b.payment_bank_name, b.payment_account_number, b.payment_ifsc_code,
            GREATEST(b.total_amount + b.fine_amount - b.paid_amount, 0) AS due_amount,
            EXISTS(SELECT 1 FROM bill_payments bp WHERE bp.bill_id=b.id AND bp.is_partial=1) AS has_verified_partial,
            EXISTS(SELECT 1 FROM payment_proofs pp WHERE pp.bill_id=b.id AND pp.status='pending') AS has_pending_payment_proof
        FROM bills b
        WHERE b.deleted_at IS NULL
          AND (b.total_amount + b.fine_amount - b.paid_amount) > 0
          AND (
            b.tenant_id=?
            OR EXISTS(
                SELECT 1 FROM bill_group_members bgm
                INNER JOIN bill_groups bg ON bg.id=bgm.bill_group_id
                WHERE bg.bill_id=b.id AND bgm.tenant_id=?
            )
          )
        ORDER BY b.created_at ASC, b.id ASC
        ${lockClause}
    `, [tenantId, tenantId]);
    return rows;
};

const buildVerificationAllocations = async (connection, proof, lock = true) => {
    const amount = Number(proof.amount_paid);
    const scope = proof.payment_scope || 'bill';

    const rows = scope === 'outstanding'
        ? await getOutstandingRowsForTenant(connection, proof.tenant_id, lock)
        : await (async () => {
            const lockClause = lock ? " FOR UPDATE" : "";
            const [r] = await connection.execute(`
                SELECT b.id, b.tenant_id, b.total_amount, b.fine_amount, b.paid_amount,
                       b.status,
                       GREATEST(b.total_amount + b.fine_amount - b.paid_amount, 0) AS due_amount,
                       EXISTS(SELECT 1 FROM bill_payments bp WHERE bp.bill_id=b.id AND bp.is_partial=1) AS has_verified_partial
                FROM bills b
                WHERE b.id=? AND b.deleted_at IS NULL
                ${lockClause}
            `, [proof.payment_target_bill_id || proof.bill_id]);
            return r;
        })();

    if (!rows.length) throw new Error("No outstanding bill is available for this payment proof.");

    const totalOutstanding = rows.reduce(
        (sum, row) => sum + Math.max(Number(row.due_amount || 0), 0), 0
    );

    if (amount > totalOutstanding + 0.005) {
        throw new Error(`Proof amount ₹${amount.toFixed(2)} exceeds the current outstanding amount ₹${totalOutstanding.toFixed(2)}.`);
    }

    const dueBefore = scope === 'outstanding'
        ? Number(proof.due_before_payment || totalOutstanding)
        : Math.max(Number(rows[0].due_amount || 0), 0);

    if (amount < dueBefore - 0.005 && amount + 0.005 < dueBefore * 0.5) {
        throw new Error(
            `A partial payment must be at least 50% of the ${scope === 'outstanding' ? 'total outstanding balance' : 'current bill due'}: ₹${(dueBefore * 0.5).toFixed(2)}.`
        );
    }

    let remaining = amount;
    const allocations = [];
    for (const row of rows) {
        if (remaining <= 0.005) break;
        const due = Math.max(Number(row.due_amount || 0), 0);
        if (due <= 0) continue;

        const allocation = Math.min(remaining, due);
        const leavesBalance = allocation < due - 0.005;

        if (leavesBalance && row.has_verified_partial) {
            throw new Error(
                `Bill #${row.id} already has a verified partial payment. The payment must settle its remaining due of ₹${due.toFixed(2)}.`
            );
        }

        allocations.push({
            bill_id: Number(row.id),
            amount: Number(allocation.toFixed(2)),
            due_before: Number(due.toFixed(2)),
            due_after: Number(Math.max(due - allocation, 0).toFixed(2)),
            is_partial: leavesBalance
        });
        remaining = Number((remaining - allocation).toFixed(2));
    }

    if (remaining > 0.005) {
        throw new Error("The payment could not be allocated across the current outstanding bills.");
    }

    return { scope, total_outstanding: totalOutstanding, allocations };
};

exports.verifyPaymentProof = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const { id } = req.params;
        const adminId = req.admin.id;
        const adminName = req.admin.name || req.admin.full_name || 'Admin';
        const { paid_from, paid_till } = req.body;

        const [proofRows] = await connection.execute(
            `SELECT pp.*, b.total_amount, b.paid_amount, b.fine_amount,
                    b.status AS bill_status, b.deleted_at,
                    t.full_name AS tenant_name
             FROM payment_proofs pp
             LEFT JOIN bills b ON b.id=pp.bill_id
             INNER JOIN tenants t ON t.id=pp.tenant_id
             WHERE pp.id=?
             FOR UPDATE`,
            [id]
        );

        if (!proofRows.length) {
            await connection.rollback();
            return res.status(404).json({ success:false, message:"Payment proof not found" });
        }

        const proof = proofRows[0];
        if (proof.status !== 'pending') {
            await connection.rollback();
            return res.status(409).json({ success:false, message:`This proof has already been ${proof.status}` });
        }

        if (!proof.bill_id || proof.deleted_at) {
            await connection.rollback();
            return res.status(400).json({ success:false, message:"The anchor bill for this payment no longer exists." });
        }

        const amount = Number(proof.amount_paid);
        if (!Number.isFinite(amount) || amount <= 0) {
            throw new Error("Invalid payment proof amount.");
        }

        const allocation = await buildVerificationAllocations(connection, proof, true);

        const [duplicateProof] = await connection.execute(
            `SELECT id FROM payment_proofs
             WHERE tenant_id=? AND transaction_id=? AND id<>? LIMIT 1`,
            [proof.tenant_id, proof.transaction_id, proof.id]
        );
        const [duplicatePayment] = await connection.execute(
            `SELECT id FROM bill_payments WHERE transaction_id=? LIMIT 1`,
            [proof.transaction_id]
        );
        if (duplicateProof.length || duplicatePayment.length) {
            throw new Error("This transaction ID has already been recorded.");
        }

        await connection.execute(
            `UPDATE payment_proofs
             SET status='verified', verified_by=?, verified_at=NOW(),
                 paid_from=?, paid_till=?,
                 due_before_payment=?,
                 due_after_payment=?
             WHERE id=? AND status='pending'`,
            [
                adminId,
                paid_from || null,
                paid_till || null,
                allocation.scope === 'outstanding'
                    ? allocation.total_outstanding
                    : allocation.allocations[0].due_before,
                Math.max(
                    (allocation.scope === 'outstanding'
                        ? allocation.total_outstanding
                        : allocation.allocations[0].due_before) - amount,
                    0
                ),
                id
            ]
        );

        const allocationRows = [];
        for (let i = 0; i < allocation.allocations.length; i++) {
            const a = allocation.allocations[i];

            const [billPaymentResult] = await connection.execute(
                `INSERT INTO bill_payments
                 (bill_id, amount, payment_method, transaction_id, paid_from, paid_till, is_partial)
                 VALUES (?, ?, 'payment_proof', ?, ?, ?, ?)`,
                [
                    a.bill_id,
                    a.amount,
                    proof.transaction_id,
                    paid_from || proof.paid_from || null,
                    paid_till || proof.paid_till || null,
                    a.is_partial ? 1 : 0
                ]
            );

            const [billRows] = await connection.execute(
                `SELECT paid_amount, total_amount, fine_amount
                 FROM bills WHERE id=? FOR UPDATE`,
                [a.bill_id]
            );
            if (!billRows.length) throw new Error(`Bill #${a.bill_id} no longer exists.`);

            const newPaid = Number(billRows[0].paid_amount || 0) + a.amount;
            const newDue = Math.max(
                Number(billRows[0].total_amount) + Number(billRows[0].fine_amount || 0) - newPaid,
                0
            );
            const newStatus = newDue <= 0.005 ? 'paid' : 'partially_paid';

            await connection.execute(
                `UPDATE bills
                 SET paid_amount=?, status=?,
                     partial_payment_made_at=CASE
                         WHEN ?=1 AND partial_payment_made_at IS NULL THEN NOW()
                         ELSE partial_payment_made_at
                     END
                 WHERE id=?`,
                [newPaid, newStatus, a.is_partial ? 1 : 0, a.bill_id]
            );

            const [allocResult] = await connection.execute(
                `INSERT INTO payment_allocations
                 (payment_proof_id, bill_payment_id, tenant_id, bill_id, amount, allocation_order)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [id, billPaymentResult.insertId, proof.tenant_id, a.bill_id, a.amount, i + 1]
            );

            allocationRows.push({
                ...a,
                bill_payment_id: billPaymentResult.insertId,
                allocation_id: allocResult.insertId,
                new_status: newStatus,
                new_due: Number(newDue.toFixed(2))
            });

            // A QR generated for a bill is no longer valid after that bill is
            // fully settled. Total-outstanding QR codes are amount-specific and
            // are never stored on a bill.
            if (newStatus === 'paid') {
                const [assets] = await connection.execute(
                    `SELECT payment_qr_public_id, payment_qr_resource_type,
                            partial_payment_qr_public_id, partial_payment_qr_resource_type
                     FROM bills WHERE id=? FOR UPDATE`,
                    [a.bill_id]
                );
                if (assets.length) {
                    for (const f of [
                        [assets[0].payment_qr_public_id, assets[0].payment_qr_resource_type],
                        [assets[0].partial_payment_qr_public_id, assets[0].partial_payment_qr_resource_type]
                    ]) {
                        if (f[0]) {
                            try { await deleteFile(f[0], f[1] || 'image'); } catch (_) {}
                        }
                    }
                    await connection.execute(
                        `UPDATE bills SET payment_qr=NULL, payment_qr_public_id=NULL,
                         payment_qr_resource_type=NULL, partial_payment_qr=NULL,
                         partial_payment_qr_public_id=NULL, partial_payment_qr_resource_type=NULL
                         WHERE id=?`,
                        [a.bill_id]
                    );
                }
            }
        }

        // Sync paid_from / paid_till for every tenant who owns or shares any
        // allocated bill. Full/group bills must update all roommates, matching
        // the behaviour already used by cash and direct payment paths.
        if (paid_from && paid_till) {
            const tenantIdsToUpdate = new Set([Number(proof.tenant_id)]);
            for (const a of allocationRows) {
                const [groupTenants] = await connection.execute(
                    `SELECT bgm.tenant_id
                     FROM bill_group_members bgm
                     INNER JOIN bill_groups bg ON bg.id = bgm.bill_group_id
                     WHERE bg.bill_id = ?`,
                    [a.bill_id]
                );
                if (groupTenants.length) {
                    groupTenants.forEach((r) => tenantIdsToUpdate.add(Number(r.tenant_id)));
                } else {
                    const [billOwner] = await connection.execute(
                        `SELECT tenant_id FROM bills WHERE id = ? LIMIT 1`,
                        [a.bill_id]
                    );
                    if (billOwner.length) {
                        tenantIdsToUpdate.add(Number(billOwner[0].tenant_id));
                    }
                }
            }
            for (const tenantId of tenantIdsToUpdate) {
                await billService.updateTenantPaymentDates(
                    connection,
                    tenantId,
                    paid_from,
                    paid_till
                );
            }
        }

        await connection.commit();

        // Notifications: emit for every tenant affected by each allocated bill
        // (submitter + all group members of shared/Full bills).
        for (const a of allocationRows) {
            try {
                const [groupTenants] = await db.execute(
                    `SELECT bgm.tenant_id, t.full_name
                     FROM bill_group_members bgm
                     INNER JOIN bill_groups bg ON bg.id = bgm.bill_group_id
                     INNER JOIN tenants t ON t.id = bgm.tenant_id
                     WHERE bg.bill_id = ?`,
                    [a.bill_id]
                );

                const notifyTargets = groupTenants.length
                    ? groupTenants.map((r) => ({
                          id: Number(r.tenant_id),
                          full_name: r.full_name || "Tenant",
                      }))
                    : [
                          {
                              id: Number(proof.tenant_id),
                              full_name: proof.tenant_name || "Tenant",
                          },
                      ];

                if (!notifyTargets.some((t) => t.id === Number(proof.tenant_id))) {
                    notifyTargets.push({
                        id: Number(proof.tenant_id),
                        full_name: proof.tenant_name || "Tenant",
                    });
                }

                for (const tenant of notifyTargets) {
                    const notificationBill = {
                        id: a.bill_id,
                        tenant_id: tenant.id,
                        paid_amount: a.amount,
                        total_amount: a.due_before,
                        admin_name: adminName,
                    };
                    await NotificationEventManager.onTenantPaymentProofVerified(
                        notificationBill,
                        tenant,
                        adminName
                    );
                    if (a.new_status === "paid") {
                        await NotificationEventManager.onTenantBillPaid(
                            notificationBill,
                            tenant,
                            adminName
                        );
                    } else {
                        await NotificationEventManager.onTenantBillPartiallyPaid(
                            notificationBill,
                            tenant,
                            adminName
                        );
                    }
                }
            } catch (notifError) {
                console.error("Failed to send multi-bill payment notification:", notifError);
            }
        }

        return res.status(200).json({
            success:true,
            message:"Payment proof verified and allocated successfully.",
            data:{
                proof_id:Number(id),
                payment_scope:allocation.scope,
                amount_paid:amount,
                total_outstanding_before:Number(allocation.total_outstanding.toFixed(2)),
                allocations:allocationRows
            }
        });
    } catch (error) {
        try { await connection.rollback(); } catch (_) {}
        console.error("Verify Payment Proof Error:", error);
        return res.status(400).json({ success:false, message:error.message || "Internal server error" });
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