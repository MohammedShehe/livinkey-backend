const bcrypt = require("bcrypt");
const crypto = require("crypto");
const messagingService = require("./messaging.service");
const { maskPhone, normalizePhone } = require("../utils/phone");

/** Safe description of where the code went (shown to the user so they know where to look). */
const describeDelivery = (user, sent) => {
    const channel = sent?.channel || null;
    let sent_to = null;
    if (channel === "email" && user.email) {
        const [local, domain] = String(user.email).split("@");
        sent_to = `${local.slice(0, 2)}${"•".repeat(Math.max(local.length - 2, 2))}@${domain}`;
    } else if (channel) {
        sent_to = maskPhone(normalizePhone(user.phone, user.country_code));
    }
    return { channel, sent_to };
};

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

    // WhatsApp -> SMS -> Email
    const sent = await messagingService.sendOTP(admin, otp, context);

    return { otp, hashedOTP, expiry, delivery: describeDelivery(admin, sent) };
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

    // WhatsApp -> SMS -> Email
    const sent = await messagingService.sendOTP(tenant, otp, context);

    return { otp, hashedOTP, expiry, delivery: describeDelivery(tenant, sent) };
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

    // WhatsApp -> SMS -> Email
    const sent = await messagingService.sendOTP(guest, otp, context);

    return { otp, hashedOTP, expiry, delivery: describeDelivery(guest, sent) };
};

module.exports = {
    generateOTP,
    hashOTP,
    compareOTP,
    generateAndSendOTP,
    generateAndSendTenantOTP,
    generateAndSendGuestOTP
};
