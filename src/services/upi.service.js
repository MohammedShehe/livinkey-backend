const QRCode = require("qrcode");
const path = require("path");
const fs = require("fs");
const os = require("os");
const crypto = require("crypto");

// UPI Payment Configuration
const UPI_CONFIG = {
    // Merchant UPI ID - Get this from your payment provider
    merchant_upi_id: process.env.MERCHANT_UPI_ID || "merchant@upi",
    // Merchant Name
    merchant_name: process.env.MERCHANT_NAME || "Livinkey",
    // Merchant Code
    merchant_code: process.env.MERCHANT_CODE || "LIVINKEY",
    // Transaction Note
    transaction_note: "Payment for PG Rent",
    // UPI Deep Link URL
    upi_deep_link: "upi://pay",
};

/**
 * Generate UPI Deep Link URL
 * @param {Object} params - Payment parameters
 * @returns {string} UPI Deep Link URL
 */
const generateUPILink = (params) => {
    const {
        payeeName = UPI_CONFIG.merchant_name,
        payeeUPI = UPI_CONFIG.merchant_upi_id,
        amount,
        transactionId,
        transactionNote = UPI_CONFIG.transaction_note,
        merchantCode = UPI_CONFIG.merchant_code,
    } = params;

    // Build UPI URL parameters
    const upiParams = new URLSearchParams({
        pa: payeeUPI,           // Payee UPI ID
        pn: payeeName,          // Payee Name
        am: amount.toString(),  // Amount
        tn: transactionNote,    // Transaction Note
        cu: "INR",              // Currency
        mc: merchantCode,       // Merchant Code
    });

    // Add transaction ID if provided
    if (transactionId) {
        upiParams.append("tid", transactionId);
    }

    return `${UPI_CONFIG.upi_deep_link}?${upiParams.toString()}`;
};

/**
 * Generate UPI QR Code
 * @param {Object} params - Payment parameters
 * @returns {Promise<Object>} { qrCodePath, upiLink }
 */
const generateUPIQRCode = async (params) => {
    const upiLink = generateUPILink(params);
    const tempDir = os.tmpdir();
    const fileName = `upi_qr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.png`;
    const filePath = path.join(tempDir, fileName);

    await QRCode.toFile(filePath, upiLink, {
        width: 400,
        margin: 4,
        color: {
            dark: "#000000",
            light: "#ffffff",
        },
    });

    return {
        qrCodePath: filePath,
        upiLink: upiLink,
    };
};

/**
 * Format UPI Payment Link for different apps
 * @param {string} upiLink - The UPI deep link
 * @returns {Object} Payment links for different apps
 */
const getAppPaymentLinks = (upiLink) => {
    return {
        // Deep link (works with any UPI app)
        deep_link: upiLink,
        
        // PhonePe
        phonepe: upiLink,
        
        // Paytm
        paytm: upiLink,
        
        // Google Pay (Tez)
        googlepay: upiLink,
        
        // Generic UPI
        upi: upiLink,
        
        // Web fallback (some apps require different format)
        web: upiLink.replace("upi://pay", "https://pay.upi.in/upi"),
    };
};

/**
 * Generate UPI Intent URL for specific apps
 * @param {Object} params - Payment parameters
 * @param {string} app - Target app (phonepe, paytm, googlepay, all)
 * @returns {string} App-specific UPI URL
 */
const generateAppUPILink = (params, app = "all") => {
    const upiLink = generateUPILink(params);
    const links = getAppPaymentLinks(upiLink);
    
    if (app === "all") {
        return links;
    }
    
    return links[app] || upiLink;
};

/**
 * Validate UPI ID format
 * @param {string} upiId - UPI ID to validate
 * @returns {boolean} Whether the UPI ID is valid
 */
const validateUPIId = (upiId) => {
    // Basic UPI ID validation
    const upiRegex = /^[a-zA-Z0-9.\-_]{2,}@[a-zA-Z]{2,}$/;
    return upiRegex.test(upiId);
};

/**
 * Generate unique transaction ID
 * @param {string} prefix - Prefix for transaction ID
 * @returns {string} Unique transaction ID
 */
const generateTransactionId = (prefix = "LIV") => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `${prefix}${timestamp}${random}`;
};

module.exports = {
    UPI_CONFIG,
    generateUPILink,
    generateUPIQRCode,
    getAppPaymentLinks,
    generateAppUPILink,
    validateUPIId,
    generateTransactionId,
};