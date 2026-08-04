const billService = require("../services/bill.service");

const createBill = async (req, res) => {
    try {
        const {
            tenant_id,
            rent_amount,
            electricity_amount,
            maintenance_amount,
            other_charges
        } = req.body;

        if (!tenant_id || !rent_amount) {
            return res.status(400).json({
                success: false,
                message: "Tenant ID and rent amount are required"
            });
        }

        const billData = {
            tenant_id: parseInt(tenant_id),
            rent_amount: parseFloat(rent_amount),
            electricity_amount: parseFloat(electricity_amount || 0),
            maintenance_amount: parseFloat(maintenance_amount || 0),
            other_charges: parseFloat(other_charges || 0),
            created_by: req.admin.id
        };

        const files = {
            meterImage: req.files?.meterImage || [],
            paymentQr: req.files?.paymentQr || []
        };

        const bill = await billService.createBill(billData, files);

        return res.status(201).json({
            success: true,
            message: "Bill created and sent successfully",
            data: bill
        });

    } catch (error) {
        console.error("Create Bill Error:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

const getUnpaidTenants = async (req, res) => {
    try {
        const tenants = await billService.getUnpaidTenants();

        return res.status(200).json({
            success: true,
            count: tenants.length,
            data: tenants
        });

    } catch (error) {
        console.error("Get Unpaid Tenants Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const getBills = async (req, res) => {
    try {
        const { status, tenant_id, search } = req.query;

        const bills = await billService.getBills({
            status,
            tenant_id: tenant_id ? parseInt(tenant_id) : null,
            search
        });

        return res.status(200).json({
            success: true,
            count: bills.length,
            data: bills
        });

    } catch (error) {
        console.error("Get Bills Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const getBillById = async (req, res) => {
    try {
        const { id } = req.params;
        const bill = await billService.getBillById(id);

        if (!bill) {
            return res.status(404).json({
                success: false,
                message: "Bill not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: bill
        });

    } catch (error) {
        console.error("Get Bill By ID Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const getBillsByTenant = async (req, res) => {
    try {
        const { tenantId } = req.params;
        const bills = await billService.getBillsByTenant(tenantId);

        return res.status(200).json({
            success: true,
            count: bills.length,
            data: bills
        });

    } catch (error) {
        console.error("Get Bills By Tenant Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const getBillStats = async (req, res) => {
    try {
        const stats = await billService.getBillStats();

        return res.status(200).json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error("Get Bill Stats Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const processDelayedPayments = async (req, res) => {
    try {
        const processedCount = await billService.processDelayedPayments();

        return res.status(200).json({
            success: true,
            message: `Processed ${processedCount} delayed bill(s)`,
            processed_count: processedCount
        });

    } catch (error) {
        console.error("Process Delayed Payments Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const addPayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, payment_method, transaction_id, is_partial } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Valid payment amount is required"
            });
        }

        const payment = await billService.addPayment(
            parseInt(id),
            {
                amount: parseFloat(amount),
                payment_method: payment_method || 'qr_code',
                transaction_id: transaction_id || null,
                is_partial: is_partial === true || is_partial === 'true' ? 1 : 0,
                created_by: req.admin.id
            }
        );

        return res.status(201).json({
            success: true,
            message: "Payment recorded successfully",
            data: payment
        });

    } catch (error) {
        console.error("Add Payment Error:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

const sendCustomMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const { subject, message } = req.body;

        if (!subject || !message) {
            return res.status(400).json({
                success: false,
                message: "Subject and message are required"
            });
        }

        const messageData = {
            admin_name: req.admin.name || 'Livinkey Admin',
            subject,
            message
        };

        const files = {
            adminQr: req.files?.adminQr || []
        };

        const bill = await billService.sendCustomMessageToTenant(
            parseInt(id),
            messageData,
            files
        );

        return res.status(200).json({
            success: true,
            message: "Custom message sent successfully",
            data: bill
        });

    } catch (error) {
        console.error("Send Custom Message Error:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

// Cash Payment Controllers
const requestCashPaymentOTP = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, paid_from, paid_till, notes } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Valid payment amount is required"
            });
        }

        if (!paid_from || !paid_till) {
            return res.status(400).json({
                success: false,
                message: "Paid from and paid till dates are required"
            });
        }

        const result = await billService.requestCashPaymentOTP(
            parseInt(id),
            {
                amount: parseFloat(amount),
                paid_from,
                paid_till,
                notes: notes || null,
                verified_by: req.admin.id
            }
        );

        return res.status(200).json({
            success: true,
            message: "OTP sent to tenant's email. Please ask tenant for the 4-digit OTP.",
            data: result
        });

    } catch (error) {
        console.error("Request Cash Payment OTP Error:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

const verifyCashPayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { otp, amount, paid_from, paid_till, notes } = req.body;

        if (!otp) {
            return res.status(400).json({
                success: false,
                message: "OTP is required"
            });
        }

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Valid payment amount is required"
            });
        }

        if (!paid_from || !paid_till) {
            return res.status(400).json({
                success: false,
                message: "Paid from and paid till dates are required"
            });
        }

        const bill = await billService.verifyCashPayment(
            parseInt(id),
            otp,
            {
                amount: parseFloat(amount),
                paid_from,
                paid_till,
                notes: notes || null,
                verified_by: req.admin.id
            }
        );

        return res.status(200).json({
            success: true,
            message: "Cash payment verified and recorded successfully",
            data: bill
        });

    } catch (error) {
        console.error("Verify Cash Payment Error:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

const getCashPayments = async (req, res) => {
    try {
        const { tenant_id, status, search } = req.query;

        const payments = await billService.getCashPayments({
            tenant_id: tenant_id ? parseInt(tenant_id) : null,
            status: status || 'verified',
            search
        });

        return res.status(200).json({
            success: true,
            count: payments.length,
            data: payments
        });

    } catch (error) {
        console.error("Get Cash Payments Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = {
    createBill,
    getUnpaidTenants,
    getBills,
    getBillById,
    getBillsByTenant,
    getBillStats,
    processDelayedPayments,
    addPayment,
    sendCustomMessage,
    requestCashPaymentOTP,
    verifyCashPayment,
    getCashPayments
};