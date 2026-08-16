// payment.controller.js
const billService = require("../services/bill.service");
const paymentService = require("../services/payment.service");
const db = require("../config/db");

/**
 * Generate payment link for a bill
 */
const generatePaymentLink = async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await billService.generateBillPaymentOptions(parseInt(id));
        
        return res.status(200).json({
            success: true,
            message: "Payment link generated successfully",
            data: result
        });
        
    } catch (error) {
        console.error("Generate Payment Link Error:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

/**
 * Get payment status
 */
const getPaymentStatus = async (req, res) => {
    try {
        const { transactionId } = req.params;
        
        const connection = await db.getConnection();
        const [transactions] = await connection.execute(
            `SELECT * FROM payment_transactions WHERE gateway_order_id = ? OR id = ?`,
            [transactionId, transactionId]
        );
        connection.release();
        
        if (transactions.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found"
            });
        }
        
        return res.status(200).json({
            success: true,
            data: transactions[0]
        });
        
    } catch (error) {
        console.error("Get Payment Status Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

/**
 * Webhook handler for payment gateways
 */
const handleWebhook = async (req, res) => {
    try {
        const { gateway } = req.params;
        const payload = req.body;
        
        const result = await paymentService.processWebhook(gateway, payload);
        
        return res.status(200).json({
            success: true,
            message: "Webhook processed successfully",
            data: result
        });
        
    } catch (error) {
        console.error("Webhook Handler Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

/**
 * Get payment history for a tenant - FIXED with proper joins
 */
const getPaymentHistory = async (req, res) => {
    try {
        const { tenantId } = req.params;
        
        if (!tenantId) {
            return res.status(400).json({
                success: false,
                message: "Tenant ID is required"
            });
        }

        const connection = await db.getConnection();
        
        // Get all transactions for this tenant with PG info
        const [transactions] = await connection.execute(
            `
            SELECT 
                pt.*,
                p.name as pg_name,
                r.room_number
            FROM payment_transactions pt
            LEFT JOIN bills b ON pt.bill_id = b.id
            LEFT JOIN tenant_details td ON b.tenant_id = td.tenant_id
            LEFT JOIN pgs p ON td.pg_id = p.id
            LEFT JOIN rooms r ON td.room_id = r.id
            WHERE pt.tenant_id = ?
            ORDER BY pt.created_at DESC
            `,
            [tenantId]
        );
        
        // Get bill payments (manual payments added by admin)
        const [billPayments] = await connection.execute(
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
                p.name as pg_name,
                r.room_number
            FROM bill_payments bp
            INNER JOIN bills b ON bp.bill_id = b.id
            LEFT JOIN tenant_details td ON b.tenant_id = td.tenant_id
            LEFT JOIN pgs p ON td.pg_id = p.id
            LEFT JOIN rooms r ON td.room_id = r.id
            WHERE b.tenant_id = ?
            ORDER BY bp.created_at DESC
            `,
            [tenantId]
        );
        
        // Get cash payments
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
                b.valid_until as bill_due_date,
                p.name as pg_name,
                r.room_number,
                a.name as verified_by_name
            FROM cash_payments cp
            INNER JOIN bills b ON cp.bill_id = b.id
            LEFT JOIN tenant_details td ON b.tenant_id = td.tenant_id
            LEFT JOIN pgs p ON td.pg_id = p.id
            LEFT JOIN rooms r ON td.room_id = r.id
            LEFT JOIN admins a ON cp.verified_by = a.id
            WHERE b.tenant_id = ?
            ORDER BY cp.created_at DESC
            `,
            [tenantId]
        );
        
        // Get payment proofs (shared by tenant)
        const [paymentProofs] = await connection.execute(
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
                p.name as pg_name,
                r.room_number
            FROM payment_proofs pp
            INNER JOIN bills b ON pp.bill_id = b.id
            LEFT JOIN tenant_details td ON b.tenant_id = td.tenant_id
            LEFT JOIN pgs p ON td.pg_id = p.id
            LEFT JOIN rooms r ON td.room_id = r.id
            WHERE pp.tenant_id = ?
            ORDER BY pp.created_at DESC
            `,
            [tenantId]
        );
        
        // Get tenant info
        const [tenantInfo] = await connection.execute(
            `
            SELECT 
                t.id,
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

        // Format the response with proper number parsing
        const response = {
            tenant: tenantInfo[0] || null,
            online_payments: billPayments.map(p => ({
                ...p,
                amount: parseFloat(p.amount) || 0,
                bill_total: parseFloat(p.bill_total) || 0,
                rent_amount: parseFloat(p.rent_amount) || 0,
                electricity_amount: parseFloat(p.electricity_amount) || 0,
                maintenance_amount: parseFloat(p.maintenance_amount) || 0,
                other_charges: parseFloat(p.other_charges) || 0,
                fine_amount: parseFloat(p.fine_amount) || 0
            })),
            cash_payments: cashPayments.map(p => ({
                ...p,
                amount: parseFloat(p.amount) || 0,
                bill_total: parseFloat(p.bill_total) || 0,
                rent_amount: parseFloat(p.rent_amount) || 0,
                electricity_amount: parseFloat(p.electricity_amount) || 0,
                maintenance_amount: parseFloat(p.maintenance_amount) || 0,
                other_charges: parseFloat(p.other_charges) || 0,
                fine_amount: parseFloat(p.fine_amount) || 0
            })),
            payment_proofs: paymentProofs.map(p => ({
                ...p,
                amount_paid: parseFloat(p.amount_paid) || 0,
                bill_total: parseFloat(p.bill_total) || 0,
                rent_amount: parseFloat(p.rent_amount) || 0,
                electricity_amount: parseFloat(p.electricity_amount) || 0,
                maintenance_amount: parseFloat(p.maintenance_amount) || 0,
                other_charges: parseFloat(p.other_charges) || 0,
                fine_amount: parseFloat(p.fine_amount) || 0
            })),
            transactions: transactions.map(t => ({
                ...t,
                amount: parseFloat(t.amount) || 0
            }))
        };
        
        return res.status(200).json({
            success: true,
            data: response
        });
        
    } catch (error) {
        console.error("Get Payment History Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

module.exports = {
    generatePaymentLink,
    getPaymentStatus,
    handleWebhook,
    getPaymentHistory
};