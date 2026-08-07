const billService = require("../services/bill.service");
const paymentService = require("../services/payment.service");

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
 * Get payment history for a tenant
 */
const getPaymentHistory = async (req, res) => {
    try {
        const { tenantId } = req.params;
        
        const connection = await db.getConnection();
        const [transactions] = await connection.execute(
            `
            SELECT 
                pt.*,
                b.pg_name,
                b.room_number
            FROM payment_transactions pt
            LEFT JOIN bills b ON pt.bill_id = b.id
            WHERE pt.tenant_id = ?
            ORDER BY pt.created_at DESC
            `,
            [tenantId]
        );
        connection.release();
        
        return res.status(200).json({
            success: true,
            count: transactions.length,
            data: transactions
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
    generatePaymentLink,
    getPaymentStatus,
    handleWebhook,
    getPaymentHistory
};