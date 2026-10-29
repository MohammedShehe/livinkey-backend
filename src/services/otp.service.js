const bcrypt = require("bcrypt");
const crypto = require("crypto");
const messagingService = require("./messaging.service");

const generateOTP = () => {
    return crypto.randomInt(100000, 1000000).toString();
};

const hashOTP = async (otp) => {
    return await bcrypt.hash(otp, 10);
};

const compareOTP = async (otp, hashedOTP) => {
    return await bcrypt.compare(otp, hashedOTP);
};

// For Admin OTP
const generateAndSendOTP = async (admin, context = "Login") => {
    if (admin.otp_sent_at) {
        const lastSent = new Date(admin.otp_sent_at);
        const diff = (Date.now() - lastSent.getTime()) / 1000;
        
        if (diff < 60) {
            throw {
                status: 429,
                message: `Please wait ${Math.ceil(60 - diff)} seconds before requesting another OTP.`
            };
        }
    }

    const otp = generateOTP();
    const hashedOTP = await hashOTP(otp);
    const expiry = new Date(Date.now() + 5 * 60 * 1000);

    // WhatsApp primary + Email fallback
    await messagingService.sendOTP(admin, otp, context);

    return { otp, hashedOTP, expiry };
};

// For Tenant OTP
const generateAndSendTenantOTP = async (tenant, context = "Forgot Password") => {
    if (tenant.otp_sent_at) {
        const lastSent = new Date(tenant.otp_sent_at);
        const diff = (Date.now() - lastSent.getTime()) / 1000;
        
        if (diff < 60) {
            throw {
                status: 429,
                message: `Please wait ${Math.ceil(60 - diff)} seconds before requesting another OTP.`
            };
        }
    }

    const otp = generateOTP();
    const hashedOTP = await hashOTP(otp);
    const expiry = new Date(Date.now() + 5 * 60 * 1000);

    // WhatsApp primary + Email fallback
    await messagingService.sendOTP(tenant, otp, context);

    return { otp, hashedOTP, expiry };
};

// For Guest OTP
const generateAndSendGuestOTP = async (guest, context = "Forgot Password") => {
    if (guest.otp_sent_at) {
        const lastSent = new Date(guest.otp_sent_at);
        const diff = (Date.now() - lastSent.getTime()) / 1000;
        
        if (diff < 60) {
            throw {
                status: 429,
                message: `Please wait ${Math.ceil(60 - diff)} seconds before requesting another OTP.`
            };
        }
    }

    const otp = generateOTP();
    const hashedOTP = await hashOTP(otp);
    const expiry = new Date(Date.now() + 5 * 60 * 1000);

    // WhatsApp primary + Email fallback
    await messagingService.sendOTP(guest, otp, context);

    return { otp, hashedOTP, expiry };
};

module.exports = {
    generateOTP,
    hashOTP,
    compareOTP,
    generateAndSendOTP,
    generateAndSendTenantOTP,
    generateAndSendGuestOTP
};
