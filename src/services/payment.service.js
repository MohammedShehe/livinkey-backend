const db = require("../config/db");
const { uploadFile, deleteFile } = require("./upload.service");
const { generateUPIQRCode, generateTransactionId, getAppPaymentLinks } = require("./upi.service");
const QRCode = require("qrcode");
const path = require("path");
const fs = require("fs");
const os = require("os");
const axios = require("axios");
const crypto = require("crypto");

const PAYMENT_CONFIG = {
    razorpay_key_id: process.env.RAZORPAY_KEY_ID,
    razorpay_key_secret: process.env.RAZORPAY_KEY_SECRET,
    razorpay_webhook_secret: process.env.RAZORPAY_WEBHOOK_SECRET,
    cashfree_app_id: process.env.CASHFREE_APP_ID,
    cashfree_secret_key: process.env.CASHFREE_SECRET_KEY,
    cashfree_environment: process.env.CASHFREE_ENVIRONMENT || 'sandbox',
    payu_merchant_key: process.env.PAYU_MERCHANT_KEY,
    payu_merchant_salt: process.env.PAYU_MERCHANT_SALT,
    payu_environment: process.env.PAYU_ENVIRONMENT || 'test',
};

/**
 * Update tenant paid_till based on actual payment amount
 */
const updateTenantPaidTill = async (connection, tenantId, newPaidTill = null) => {
    const [tenantDetails] = await connection.execute(
        `SELECT rent, paid_till, paid_from FROM tenant_details WHERE tenant_id = ?`,
        [tenantId]
    );

    if (tenantDetails.length === 0) return null;
    
    const tenant = tenantDetails[0];
    const monthlyRent = parseFloat(tenant.rent) || 0;
    
    // Calculate how many months are paid based on bills table
    const [paidData] = await connection.execute(
        `
        SELECT COALESCE(SUM(paid_amount), 0) as total_paid
        FROM bills 
        WHERE tenant_id = ?
        `,
        [tenantId]
    );
    const totalPaid = parseFloat(paidData[0]?.total_paid) || 0;
    
    const monthsPaid = Math.floor(totalPaid / monthlyRent);
    const remainingBalance = totalPaid % monthlyRent;
    
    // Calculate new paid_till date
    let paidTillDate;
    if (newPaidTill) {
        paidTillDate = new Date(newPaidTill);
    } else if (tenant.paid_from) {
        paidTillDate = new Date(tenant.paid_from);
        paidTillDate.setMonth(paidTillDate.getMonth() + monthsPaid);
    } else {
        paidTillDate = new Date();
        paidTillDate.setMonth(paidTillDate.getMonth() + monthsPaid);
    }

    await connection.execute(
        `
        UPDATE tenant_details 
        SET paid_till = ?
        WHERE tenant_id = ?
        `,
        [paidTillDate.toISOString().split('T')[0], tenantId]
    );
    
    return {
        paid_till: paidTillDate.toISOString().split('T')[0],
        total_paid: totalPaid,
        is_fully_paid: remainingBalance === 0 && monthsPaid > 0,
        months_paid: monthsPaid,
        remaining_balance: remainingBalance
    };
};

const createRazorpayOrder = async (orderData) => {
    const { amount, currency = 'INR', receipt, notes = {} } = orderData;
    
    try {
        const response = await axios.post(
            'https://api.razorpay.com/v1/orders',
            {
                amount: Math.round(amount * 100),
                currency: currency,
                receipt: receipt || `rec_${Date.now()}`,
                notes: notes,
                payment_capture: 1,
            },
            {
                auth: {
                    username: PAYMENT_CONFIG.razorpay_key_id,
                    password: PAYMENT_CONFIG.razorpay_key_secret,
                },
            }
        );
        
        return {
            success: true,
            data: response.data,
            order_id: response.data.id,
            amount: response.data.amount / 100,
            currency: response.data.currency,
        };
    } catch (error) {
        console.error('Razorpay Order Creation Error:', error.response?.data || error.message);
        throw new Error(`Failed to create Razorpay order: ${error.message}`);
    }
};

const verifyRazorpaySignature = (paymentData) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentData;
    
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac('sha256', PAYMENT_CONFIG.razorpay_key_secret)
        .update(body)
        .digest('hex');
    
    return expectedSignature === razorpay_signature;
};

const createCashfreeOrder = async (orderData) => {
    const { 
        amount, 
        orderId, 
        customerEmail, 
        customerPhone, 
        customerName,
        returnUrl,
        notifyUrl 
    } = orderData;
    
    try {
        const environment = PAYMENT_CONFIG.cashfree_environment === 'production' 
            ? 'https://api.cashfree.com' 
            : 'https://sandbox.cashfree.com';
        
        const response = await axios.post(
            `${environment}/pg/orders`,
            {
                order_id: orderId,
                order_amount: amount,
                order_currency: 'INR',
                customer_details: {
                    customer_id: customerPhone,
                    customer_email: customerEmail,
                    customer_phone: customerPhone,
                    customer_name: customerName,
                },
                order_meta: {
                    return_url: returnUrl,
                    notify_url: notifyUrl,
                },
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-version': '2022-09-01',
                    'x-client-id': PAYMENT_CONFIG.cashfree_app_id,
                    'x-client-secret': PAYMENT_CONFIG.cashfree_secret_key,
                },
            }
        );
        
        return {
            success: true,
            data: response.data,
            order_id: response.data.order_id,
            payment_session_id: response.data.payment_session_id,
        };
    } catch (error) {
        console.error('Cashfree Order Creation Error:', error.response?.data || error.message);
        throw new Error(`Failed to create Cashfree order: ${error.message}`);
    }
};

const generatePaymentOptions = async (billData, options = {}) => {
    const {
        upiId = billData.payment_upi_id || process.env.MERCHANT_UPI_ID || "merchant@upi",
        transactionNote = "Payment for PG Rent",
        includeQR = true,
        amount = null,
    } = options;

    const configuredUpiId = billData.payment_upi_id || null;
    if (billData.payment_details_source && !configuredUpiId) {
        throw new Error("UPI ID is not configured for this bill. Please use the bank details or payment QR code shown on the bill.");
    }

    const totalDue = Math.max(
        parseFloat(billData.total_amount) + parseFloat(billData.fine_amount || 0) -
        parseFloat(billData.paid_amount || 0),
        0
    );

    if (totalDue <= 0) {
        throw new Error("No amount due for this bill");
    }

    const requestedAmount = amount === null || amount === undefined || amount === ''
        ? totalDue
        : Number(amount);
    if (!Number.isFinite(requestedAmount) || requestedAmount <= 0 || requestedAmount > totalDue + 0.005) {
        throw new Error(`Payment amount must be greater than 0 and no more than the current due amount of ₹${totalDue.toFixed(2)}`);
    }

    const transactionId = generateTransactionId('LIV');
    let qrPath = null;
    let upiLink = null;
    let qrUploadResult = null;

    if (includeQR) {
        const qrResult = await generateUPIQRCode({
            payeeName: billData.payment_account_holder_name || process.env.MERCHANT_NAME || "Livinkey",
            payeeUPI: upiId,
            amount: requestedAmount,
            transactionId: transactionId,
            transactionNote: transactionNote,
        });
        
        qrPath = qrResult.qrCodePath;
        upiLink = qrResult.upiLink;

        qrUploadResult = await uploadFile(
            { buffer: fs.readFileSync(qrPath), originalname: 'payment_qr.png' },
            "livinkey/payments/qr"
        );
        
        if (fs.existsSync(qrPath)) {
            fs.unlinkSync(qrPath);
        }
    }

    const appLinks = getAppPaymentLinks(upiLink);

    return {
        transaction_id: transactionId,
        total_due: totalDue,
        payment_amount: requestedAmount,
        upi_link: upiLink,
        app_links: appLinks,
        qr_code: qrUploadResult ? qrUploadResult.secure_url : null,
        qr_code_public_id: qrUploadResult ? qrUploadResult.public_id : null,
        qr_code_resource_type: qrUploadResult ? qrUploadResult.resource_type : null,
        payment_methods: {
            upi: {
                id: upiId,
                link: upiLink,
            },
            phonepe: {
                name: "PhonePe",
                link: appLinks.phonepe,
            },
            paytm: {
                name: "Paytm",
                link: appLinks.paytm,
            },
            googlepay: {
                name: "Google Pay",
                link: appLinks.googlepay,
            },
        },
        razorpay: {
            enabled: !!PAYMENT_CONFIG.razorpay_key_id,
        },
        cashfree: {
            enabled: !!PAYMENT_CONFIG.cashfree_app_id,
        },
    };
};

const createPaymentOrder = async (billData, tenantData) => {
    const totalDue = Math.max(
        parseFloat(billData.total_amount) + parseFloat(billData.fine_amount || 0) -
        parseFloat(billData.paid_amount || 0),
        0
    );

    if (totalDue <= 0) {
        throw new Error("No amount due for this bill");
    }

    if (PAYMENT_CONFIG.razorpay_key_id && PAYMENT_CONFIG.razorpay_key_secret) {
        try {
            const order = await createRazorpayOrder({
                amount: totalDue,
                receipt: `bill_${billData.id}`,
                notes: {
                    bill_id: billData.id,
                    tenant_id: tenantData.id,
                    tenant_name: tenantData.full_name,
                },
            });
            
            return {
                gateway: 'razorpay',
                order: order,
                key_id: PAYMENT_CONFIG.razorpay_key_id,
            };
        } catch (error) {
            console.error('Razorpay order failed, trying Cashfree:', error.message);
        }
    }

    if (PAYMENT_CONFIG.cashfree_app_id && PAYMENT_CONFIG.cashfree_secret_key) {
        try {
            const orderId = `bill_${billData.id}_${Date.now()}`;
            const order = await createCashfreeOrder({
                amount: totalDue,
                orderId: orderId,
                customerEmail: tenantData.email,
                customerPhone: tenantData.phone,
                customerName: tenantData.full_name,
                returnUrl: `${process.env.APP_URL}/payment/cashfree/return`,
                notifyUrl: `${process.env.APP_URL}/api/webhooks/cashfree`,
            });
            
            return {
                gateway: 'cashfree',
                order: order,
            };
        } catch (error) {
            console.error('Cashfree order failed:', error.message);
        }
    }

    const paymentOptions = await generatePaymentOptions(billData);
    return {
        gateway: 'upi_qr',
        order: paymentOptions,
    };
};

const createPaymentTransaction = async (connection, transactionData) => {
    const conn = connection || await db.getConnection();
    try {
        const [result] = await conn.execute(
            `
            INSERT INTO payment_transactions (
                bill_id,
                tenant_id,
                amount,
                payment_type,
                gateway,
                gateway_order_id,
                gateway_payment_id,
                status,
                payment_link,
                upi_id,
                transaction_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                transactionData.bill_id,
                transactionData.tenant_id,
                transactionData.amount,
                transactionData.payment_type || 'upi',
                transactionData.gateway,
                transactionData.gateway_order_id,
                transactionData.gateway_payment_id || null,
                transactionData.status || 'pending',
                transactionData.payment_link || null,
                transactionData.upi_id || null,
                transactionData.transaction_date || new Date(),
            ]
        );
        if (!connection) conn.release();
        return result.insertId;
    } catch (error) {
        if (!connection) conn.release();
        throw error;
    }
};

const updateTransactionStatus = async (connection, orderId, status, responseData = null) => {
    let query = `UPDATE payment_transactions SET status = ?`;
    const params = [status];
    
    if (responseData) {
        query += `, response_data = ?`;
        params.push(JSON.stringify(responseData));
    }
    
    query += `, updated_at = NOW() WHERE gateway_order_id = ?`;
    params.push(orderId);
    
    const [result] = await connection.execute(query, params);
    return result.affectedRows > 0;
};

const processWebhook = async (gateway, payload) => {
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();
        
        let orderId, status, paymentId, amount;
        
        switch (gateway) {
            case 'razorpay':
                if (!verifyRazorpaySignature(payload)) {
                    throw new Error('Invalid Razorpay signature');
                }
                orderId = payload.razorpay_order_id;
                paymentId = payload.razorpay_payment_id;
                status = 'success';
                break;
                
            case 'cashfree':
                orderId = payload.order_id;
                paymentId = payload.payment_id || payload.transaction_id;
                status = payload.order_status === 'PAID' ? 'success' : 'failed';
                amount = payload.order_amount;
                break;
                
            default:
                throw new Error(`Unsupported gateway: ${gateway}`);
        }
        
        const [txRows] = await connection.execute(
            `SELECT * FROM payment_transactions WHERE gateway_order_id = ? FOR UPDATE`,
            [orderId]
        );
        if (!txRows.length) throw new Error("Payment transaction not found for webhook");
        const transaction = txRows[0];

        // Idempotency: a replayed successful webhook must never add money twice.
        if (transaction.status === 'success') {
            await connection.commit();
            return { success: true, order_id: orderId, status: 'success', duplicate: true };
        }

        await updateTransactionStatus(connection, orderId, status, payload);

        if (status === 'success') {
            const billId = transaction.bill_id;
            const paidAmount = Number(transaction.amount);
            const [bills] = await connection.execute(
                `SELECT * FROM bills WHERE id = ? AND deleted_at IS NULL FOR UPDATE`,
                [billId]
            );
            if (!bills.length) throw new Error("Bill not found");

            const bill = bills[0];
            const due = Math.max(Number(bill.total_amount) + Number(bill.fine_amount || 0) - Number(bill.paid_amount || 0), 0);
            if (paidAmount > due + 0.005) throw new Error("Gateway payment exceeds current bill due");

            const isPartial = paidAmount < due - 0.005;
            if (isPartial && paidAmount + 0.005 < due * 0.5) {
                throw new Error("Online partial payment must be at least 50% of the current due");
            }
            if (isPartial) {
                const [partialRows] = await connection.execute(
                    `SELECT id FROM bill_payments WHERE bill_id=? AND is_partial=1 LIMIT 1`,
                    [billId]
                );
                if (partialRows.length) throw new Error("A partial payment has already been recorded for this bill");
            }

            const [dup] = await connection.execute(
                `SELECT id FROM bill_payments WHERE transaction_id = ? LIMIT 1`,
                [paymentId || orderId]
            );
            if (!dup.length) {
                await connection.execute(
                    `INSERT INTO bill_payments (bill_id, amount, payment_method, transaction_id, is_partial)
                     VALUES (?, ?, ?, ?, ?)`,
                    [billId, paidAmount, transaction.payment_type || 'upi', paymentId || orderId, isPartial ? 1 : 0]
                );
            }

            const newPaidAmount = Number(bill.paid_amount || 0) + paidAmount;
            const remainingAmount = Math.max(Number(bill.total_amount) + Number(bill.fine_amount || 0) - newPaidAmount, 0);
            const newStatus = remainingAmount <= 0.005 ? 'paid' : 'partially_paid';

            await connection.execute(
                `UPDATE bills SET paid_amount = ?,
                    status = ?,
                    partial_payment_made_at=CASE WHEN ?=1 AND partial_payment_made_at IS NULL THEN NOW() ELSE partial_payment_made_at END
                 WHERE id = ?`,
                [newPaidAmount, newStatus, isPartial ? 1 : 0, billId]
            );

                    // Delete QR codes if fully paid
                    if (newStatus === 'paid') {
                        const [billData] = await connection.execute(
                            `SELECT payment_qr_public_id, payment_qr_resource_type, 
                                    partial_payment_qr_public_id, partial_payment_qr_resource_type 
                             FROM bills WHERE id = ?`,
                            [billId]
                        );
                        if (billData.length > 0) {
                            if (billData[0].payment_qr_public_id) {
                                try {
                                    await deleteFile(billData[0].payment_qr_public_id, billData[0].payment_qr_resource_type);
                                } catch (e) {}
                            }
                            if (billData[0].partial_payment_qr_public_id) {
                                try {
                                    await deleteFile(billData[0].partial_payment_qr_public_id, billData[0].partial_payment_qr_resource_type);
                                } catch (e) {}
                            }
                            await connection.execute(
                                `UPDATE bills SET payment_qr = NULL, payment_qr_public_id = NULL, payment_qr_resource_type = NULL,
                                    partial_payment_qr = NULL, partial_payment_qr_public_id = NULL, partial_payment_qr_resource_type = NULL
                                 WHERE id = ?`,
                                [billId]
                            );
                        }
                    }
                }
        
        await connection.commit();
        return { success: true, order_id: orderId, status: status };
        
    } catch (error) {
        await connection.rollback();
        console.error('Webhook Processing Error:', error);
        throw error;
        
    } finally {
        connection.release();
    }
};

module.exports = {
    createRazorpayOrder,
    verifyRazorpaySignature,
    createCashfreeOrder,
    generatePaymentOptions,
    createPaymentOrder,
    createPaymentTransaction,
    updateTransactionStatus,
    processWebhook,
    updateTenantPaidTill
};
