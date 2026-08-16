// controllers/admin.payment.proof.controller.js
const db = require("../config/db");
const { deleteFile } = require("../services/upload.service");

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
            to_date
        } = req.query;

        let query = `
            SELECT 
                pp.id,
                pp.bill_id,
                pp.tenant_id,
                pp.transaction_id,
                pp.amount_paid,
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
 * Verify a payment proof (Admin action)
 * PUT /api/bills/payment-proofs/:id/verify
 */
exports.verifyPaymentProof = async (req, res) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const { id } = req.params;
        const { admin_notes } = req.body;
        const adminId = req.admin.id;

        // Get the proof
        const [proofRows] = await connection.execute(
            `
            SELECT 
                pp.*,
                b.tenant_id,
                b.total_amount,
                b.paid_amount,
                b.fine_amount,
                b.status as bill_status
            FROM payment_proofs pp
            LEFT JOIN bills b ON pp.bill_id = b.id
            WHERE pp.id = ?
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

        // Check if bill still exists
        if (!proof.bill_id || !proof.bill_status) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: "Associated bill no longer exists. Cannot verify this payment proof."
            });
        }

        if (proof.status !== 'pending') {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: `This proof has already been ${proof.status}`
            });
        }

        // Update proof status
        await connection.execute(
            `
            UPDATE payment_proofs 
            SET 
                status = 'verified',
                verified_by = ?,
                verified_at = NOW(),
                admin_notes = ?
            WHERE id = ?
            `,
            [adminId, admin_notes || null, id]
        );

        // Update bill payment
        const newPaidAmount = parseFloat(proof.paid_amount || 0) + parseFloat(proof.amount_paid);
        const totalAmount = parseFloat(proof.total_amount) + parseFloat(proof.fine_amount || 0);
        const remainingAmount = totalAmount - newPaidAmount;

        let newBillStatus = 'paid';
        if (remainingAmount > 0) {
            newBillStatus = 'partially_paid';
        }

        await connection.execute(
            `
            UPDATE bills 
            SET 
                paid_amount = ?,
                status = ?
            WHERE id = ?
            `,
            [newPaidAmount, newBillStatus, proof.bill_id]
        );

        // Record in bill_payments table
        await connection.execute(
            `
            INSERT INTO bill_payments (
                bill_id,
                amount,
                payment_method,
                transaction_id,
                is_partial
            ) VALUES (?, ?, ?, ?, ?)
            `,
            [
                proof.bill_id,
                proof.amount_paid,
                'payment_proof',
                proof.transaction_id,
                remainingAmount > 0 ? 1 : 0
            ]
        );

        // Delete QR codes if fully paid
        if (newBillStatus === 'paid') {
            const [billData] = await connection.execute(
                `
                SELECT payment_qr_public_id, payment_qr_resource_type,
                       partial_payment_qr_public_id, partial_payment_qr_resource_type
                FROM bills 
                WHERE id = ?
                `,
                [proof.bill_id]
            );

            if (billData.length > 0) {
                if (billData[0].payment_qr_public_id) {
                    try {
                        await deleteFile(
                            billData[0].payment_qr_public_id,
                            billData[0].payment_qr_resource_type
                        );
                    } catch (e) { /* ignore */ }
                }
                if (billData[0].partial_payment_qr_public_id) {
                    try {
                        await deleteFile(
                            billData[0].partial_payment_qr_public_id,
                            billData[0].partial_payment_qr_resource_type
                        );
                    } catch (e) { /* ignore */ }
                }
                await connection.execute(
                    `
                    UPDATE bills 
                    SET 
                        payment_qr = NULL,
                        payment_qr_public_id = NULL,
                        payment_qr_resource_type = NULL,
                        partial_payment_qr = NULL,
                        partial_payment_qr_public_id = NULL,
                        partial_payment_qr_resource_type = NULL
                    WHERE id = ?
                    `,
                    [proof.bill_id]
                );
            }
        }

        await connection.commit();

        // Get updated proof
        const [updatedProof] = await connection.execute(
            `
            SELECT 
                pp.*,
                t.full_name as tenant_name,
                t.email as tenant_email,
                a.name as verified_by_name
            FROM payment_proofs pp
            INNER JOIN tenants t ON pp.tenant_id = t.id
            LEFT JOIN admins a ON pp.verified_by = a.id
            WHERE pp.id = ?
            `,
            [id]
        );

        return res.status(200).json({
            success: true,
            message: "Payment proof verified successfully",
            data: updatedProof[0]
        });

    } catch (error) {
        await connection.rollback();
        console.error("Verify Payment Proof Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
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

        // Get the proof
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

        // Update proof status
        await connection.execute(
            `
            UPDATE payment_proofs 
            SET 
                status = 'rejected',
                admin_notes = ?
            WHERE id = ?
            `,
            [admin_notes || 'Payment proof rejected by admin', id]
        );

        await connection.commit();

        // Get updated proof
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

        // Get the proof
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

        // Delete file from Cloudinary
        if (proof.proof_public_id) {
            try {
                await deleteFile(proof.proof_public_id, proof.proof_resource_type);
            } catch (error) {
                console.error("Failed to delete proof file:", error);
            }
        }

        // Delete from database
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
        const connection = await db.getConnection();
        const [rows] = await connection.execute(
            `
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'verified' THEN 1 ELSE 0 END) as verified,
                SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
                SUM(CASE WHEN status = 'pending' THEN amount_paid ELSE 0 END) as pending_amount
            FROM payment_proofs
            `
        );
        connection.release();

        const stats = rows[0] || { total: 0, pending: 0, verified: 0, rejected: 0, pending_amount: 0 };
        
        return res.status(200).json({
            success: true,
            data: {
                total: parseInt(stats.total) || 0,
                pending: parseInt(stats.pending) || 0,
                verified: parseInt(stats.verified) || 0,
                rejected: parseInt(stats.rejected) || 0,
                pending_amount: parseFloat(stats.pending_amount) || 0
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