const bcrypt = require("bcrypt");
const { sendOTPEmail } = require("./mail.service");

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const hashOTP = async (otp) => {
    return await bcrypt.hash(otp, 10);
};

const compareOTP = async (otp, hashedOTP) => {
    return await bcrypt.compare(otp, hashedOTP);
};

// New shared function to handle OTP generation and sending
const generateAndSendOTP = async (admin, context = "Login") => {
    // Check rate limiting
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

    // Send OTP email
    await sendOTPEmail(admin.email, otp, context);

    return { otp, hashedOTP, expiry };
};

module.exports = {
    generateOTP,
    hashOTP,
    compareOTP,
    generateAndSendOTP
};