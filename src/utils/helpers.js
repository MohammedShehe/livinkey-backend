const QRCode = require("qrcode");
const path = require("path");
const fs = require("fs");
const os = require("os");
const crypto = require("crypto");
const { deleteFile } = require("../services/upload.service");

/**
 * Generate QR Code
 * @param {string} data - Data to encode in QR
 * @param {string} folder - Folder name for logging
 * @returns {Promise<string>} - Path to generated QR file
 */
const generateQRCode = async (data, folder) => {
    const tempDir = os.tmpdir();
    const fileName = `qr_${Date.now()}_${Math.random().toString(36).substring(7)}.png`;
    const filePath = path.join(tempDir, fileName);
    
    try {
        await QRCode.toFile(filePath, data, {
            width: 300,
            margin: 2,
            color: {
                dark: "#000000",
                light: "#ffffff"
            }
        });
        return filePath;
    } catch (error) {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        throw error;
    }
};

/**
 * Cleanup uploaded files from Cloudinary
 * @param {Array} uploadedFiles - Array of file objects with public_id and resource_type
 */
const cleanupUploadedFiles = async (uploadedFiles) => {
    const toDelete = [];
    for (const file of uploadedFiles) {
        if (file && file.public_id) {
            toDelete.push({ public_id: file.public_id, resource_type: file.resource_type });
        }
    }
    if (toDelete.length > 0) {
        for (const file of toDelete) {
            try {
                await deleteFile(file.public_id, file.resource_type);
            } catch (error) {
                console.error("Failed to delete file:", error);
            }
        }
    }
};

/**
 * Generate random OTP
 * @param {number} length - Length of OTP (default: 4)
 * @returns {string} - Generated OTP
 */
const generateOTP = (length = 4) => {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    return Math.floor(min + Math.random() * (max - min + 1)).toString();
};

/**
 * Clean up temporary files
 * @param {Array} tempFiles - Array of file paths to delete
 */
const cleanupTempFiles = async (tempFiles) => {
    for (const tempFile of tempFiles) {
        if (fs.existsSync(tempFile)) {
            try {
                fs.unlinkSync(tempFile);
            } catch (unlinkError) {
                console.error("Failed to delete temp file:", unlinkError);
            }
        }
    }
};

/**
 * Get QR expiry time
 * @param {Date|null} existingExpiry - Existing expiry date
 * @returns {Date} - New expiry date (24 hours from now or existing if valid)
 */
const getQRExpiryTime = (existingExpiry = null) => {
    if (existingExpiry && new Date(existingExpiry) > new Date()) {
        return new Date(existingExpiry);
    }
    return new Date(Date.now() + 24 * 60 * 60 * 1000);
};

/**
 * Generate random password
 * @param {number} length - Password length (default: 12)
 * @returns {string} - Generated password
 */
const generatePassword = (length = 12) => {
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const specials = "!@#$%^&*";
    const all = uppercase + lowercase + numbers + specials;
    
    let password = "";
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += specials[Math.floor(Math.random() * specials.length)];
    
    for (let i = 4; i < length; i++) {
        password += all[Math.floor(Math.random() * all.length)];
    }
    
    return password.split('').sort(() => Math.random() - 0.5).join('');
};

/**
 * Normalize number of tenants (ensure minimum 1)
 * @param {any} value - Input value
 * @returns {number} - Normalized number (minimum 1)
 */
const normalizeNumberOfTenants = (value) => {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed) || parsed <= 0) return 1;
    return parsed;
};

/**
 * Generate unique transaction ID
 * @param {string} prefix - Prefix for transaction ID
 * @returns {string} - Unique transaction ID
 */
const generateTransactionId = (prefix = "LIV") => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `${prefix}${timestamp}${random}`;
};

/**
 * Validate UPI ID format
 * @param {string} upiId - UPI ID to validate
 * @returns {boolean} - Whether the UPI ID is valid
 */
const validateUPIId = (upiId) => {
    const upiRegex = /^[a-zA-Z0-9.\-_]{2,}@[a-zA-Z]{2,}$/;
    return upiRegex.test(upiId);
};

/**
 * Get greeting based on time of day
 * @returns {string} - Greeting message
 */
const getTimeBasedGreeting = () => {
    const hours = new Date().getHours();
    if (hours >= 5 && hours < 12) return 'Good Morning';
    if (hours >= 12 && hours < 17) return 'Good Afternoon';
    if (hours >= 17 && hours < 21) return 'Good Evening';
    return 'Good Night';
};

module.exports = {
    generateQRCode,
    cleanupUploadedFiles,
    generateOTP,
    cleanupTempFiles,
    getQRExpiryTime,
    generatePassword,
    normalizeNumberOfTenants,
    generateTransactionId,
    validateUPIId,
    getTimeBasedGreeting
};