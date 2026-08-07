const db = require("../config/db");
const { uploadFile, deleteFile } = require("./upload.service");
const { generateUPIQRCode, generateTransactionId, getAppPaymentLinks } = require("./upi.service");
const QRCode = require("qrcode");
const path = require("path");
const fs = require("fs");
const os = require("os");
const axios = require("axios");
const crypto = require("crypto");

// Payment Gateway Configuration
const PAYMENT_CONFIG = {
    // Razorpay
    razorpay_key_id: process.env.RAZORPAY_KEY_ID,
    razorpay_key_secret: process.env.RAZORPAY_KEY_SECRET,
    razorpay_webhook_secret: process.env.RAZORPAY_WEBHOOK_SECRET,
    
    // Cashfree
    cashfree_app_id: process.env.CASHFREE_APP_ID,
    cashfree_secret_key: process.env.CASHFREE_SECRET_KEY,
    cashfree_environment: process.env.CASHFREE_ENVIRONMENT || 'sandbox',
    
    // PayU
    payu_merchant_key: process.env.PAYU_MERCHANT_KEY,
    payu_merchant_salt: process.env.PAYU_MERCHANT_SALT,
    payu_environment: process.env.PAYU_ENVIRONMENT || 'test',
};

/**
 * Create a payment order with Razorpay
 * @param {Object} orderData - Order details
 * @returns {Promise<Object>} Razorpay order response
 */
const createRazorpayOrder = async (orderData) => {
    const { amount, currency = 'INR', receipt, notes = {} } = orderData;
    
    try {
        const response = await axios.post(
            'https://api.razorpay.com/v1/orders',
            {
                amount: Math.round(amount * 100), // Convert to paise
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

/**
 * Verify Razorpay payment signature
 * @param {Object} paymentData - Payment data from Razorpay
 * @returns {boolean} Whether signature is valid
 */
const verifyRazorpaySignature = (paymentData) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentData;
    
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac('sha256', PAYMENT_CONFIG.razorpay_key_secret)
        .update(body)
        .digest('hex');
    
    return expectedSignature === razorpay_signature;
};

/**
 * Create a payment order with Cashfree
 * @param {Object} orderData - Order details
 * @returns {Promise<Object>} Cashfree order response
 */
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

/**
 * Generate payment link with UPI QR and options
 * @param {Object} billData - Bill data
 * @param {Object} options - Options for payment generation
 * @returns {Promise<Object>} Payment data with QR and links
 */
const generatePaymentOptions = async (billData, options = {}) => {
    const {
        upiId = PAYMENT_CONFIG.merchant_upi_id,
        transactionNote = "Payment for PG Rent",
        includeQR = true,
    } = options;

    const totalDue = parseFloat(billData.total_amount) + parseFloat(billData.fine_amount || 0) - 
                     parseFloat(billData.paid_amount || 0) - parseFloat(billData.total_cash_paid || 0);

    if (totalDue <= 0) {
        throw new Error("No amount due for this bill");
    }

    const transactionId = generateTransactionId('LIV');

    // Generate UPI QR Code
    let qrPath = null;
    let upiLink = null;
    let qrUploadResult = null;

    if (includeQR) {
        const qrResult = await generateUPIQRCode({
            payeeName: PAYMENT_CONFIG.merchant_name,
            payeeUPI: upiId,
            amount: totalDue,
            transactionId: transactionId,
            transactionNote: transactionNote,
        });
        
        qrPath = qrResult.qrCodePath;
        upiLink = qrResult.upiLink;

        // Upload QR to Cloudinary
        qrUploadResult = await uploadFile(
            { buffer: fs.readFileSync(qrPath), originalname: 'payment_qr.png' },
            "livinkey/payments/qr"
        );
        
        // Clean up temp file
        if (fs.existsSync(qrPath)) {
            fs.unlinkSync(qrPath);
        }
    }

    // Generate app-specific payment links
    const appLinks = getAppPaymentLinks(upiLink);

    return {
        transaction_id: transactionId,
        total_due: totalDue,
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

/**
 * Create a Razorpay order for payment
 * @param {Object} billData - Bill data
 * @param {Object} tenantData - Tenant data
 * @returns {Promise<Object>} Razorpay order details
 */
const createPaymentOrder = async (billData, tenantData) => {
    const totalDue = parseFloat(billData.total_amount) + parseFloat(billData.fine_amount || 0) - 
                     parseFloat(billData.paid_amount || 0) - parseFloat(billData.total_cash_paid || 0);

    if (totalDue <= 0) {
        throw new Error("No amount due for this bill");
    }

    // Try Razorpay first
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

    // Try Cashfree as fallback
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

    // Fallback to UPI QR only
    const paymentOptions = await generatePaymentOptions(billData);
    return {
        gateway: 'upi_qr',
        order: paymentOptions,
    };
};

/**
 * Create payment transaction record
 * @param {Object} connection - Database connection
 * @param {Object} transactionData - Transaction data
 * @returns {Promise<number>} Transaction ID
 */
const createPaymentTransaction = async (connection, transactionData) => {
    const [result] = await connection.execute(
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
    return result.insertId;
};

/**
 * Update payment transaction status
 * @param {Object} connection - Database connection
 * @param {string} orderId - Gateway order ID
 * @param {string} status - New status
 * @param {Object} responseData - Gateway response data
 * @returns {Promise<boolean>} Update success
 */
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

/**
 * Process webhook from payment gateway
 * @param {string} gateway - Payment gateway name
 * @param {Object} payload - Webhook payload
 * @returns {Promise<Object>} Processing result
 */
const processWebhook = async (gateway, payload) => {
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();
        
        let orderId, status, paymentId, amount;
        
        switch (gateway) {
            case 'razorpay':
                // Verify signature
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
        
        // Update transaction
        await updateTransactionStatus(connection, orderId, status, payload);
        
        // If payment is successful, update bill status
        if (status === 'success') {
            // Get bill ID from transaction
            const [transactions] = await connection.execute(
                `SELECT bill_id, amount FROM payment_transactions WHERE gateway_order_id = ?`,
                [orderId]
            );
            
            if (transactions.length > 0) {
                const transaction = transactions[0];
                const billId = transaction.bill_id;
                const paidAmount = transaction.amount;
                
                // Get bill details
                const [bills] = await connection.execute(
                    `SELECT * FROM bills WHERE id = ?`,
                    [billId]
                );
                
                if (bills.length > 0) {
                    const bill = bills[0];
                    const newPaidAmount = parseFloat(bill.paid_amount || 0) + parseFloat(paidAmount);
                    const remainingAmount = parseFloat(bill.total_amount) + parseFloat(bill.fine_amount || 0) - newPaidAmount;
                    
                    let newStatus = 'paid';
                    if (remainingAmount > 0) {
                        newStatus = 'partially_paid';
                    }
                    
                    await connection.execute(
                        `UPDATE bills SET paid_amount = ?, status = ? WHERE id = ?`,
                        [newPaidAmount, newStatus, billId]
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
};