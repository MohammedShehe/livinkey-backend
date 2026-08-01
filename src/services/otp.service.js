const bcrypt = require("bcrypt");
const transporter = require("../config/mail");

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const hashOTP = async (otp) => {
    return await bcrypt.hash(otp, 10);
};

const compareOTP = async (otp, hashedOTP) => {
    return await bcrypt.compare(otp, hashedOTP);
};

const sendOTPEmail = async (email, otp) => {

    await transporter.sendMail({

        from: `"Livinkey" <${process.env.EMAIL_USER}>`,

        to: email,

        subject: "🔐 Livinkey Login Verification",

        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Livinkey Verification Code</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
                </style>
            </head>
            <body style="margin: 0; padding: 0; background-color: #f4f6f9; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; margin: 40px auto; border-radius: 16px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06); overflow: hidden;">
                    <!-- Header with Brand -->
                    <tr>
                        <td style="background: #92C24A; padding: 40px 30px 30px; text-align: center;">
                            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center">
                                        <div style="display: inline-block; background: rgba(255, 255, 255, 0.15); padding: 12px 24px; border-radius: 50px; backdrop-filter: blur(10px);">
                                            <span style="color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: 1px;">🔐 Livinkey</span>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="padding-top: 12px;">
                                        <span style="color: rgba(255, 255, 255, 0.9); font-size: 14px; font-weight: 400; letter-spacing: 2px;">SECURE ACCESS</span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 40px 40px 30px;">
                            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td style="color: #000000; font-size: 24px; font-weight: 600; padding-bottom: 8px; text-align: center;">
                                        Verify Your Identity
                                    </td>
                                </tr>
                                <tr>
                                    <td style="color: #4a5568; font-size: 16px; line-height: 1.6; text-align: center; padding-bottom: 10px;">
                                        Enter the verification code below to complete your login to your Livinkey admin account.
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- OTP Code Section -->
                    <tr>
                        <td style="padding: 0 40px 30px;">
                            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="background: #f8faf5; border-radius: 12px; border: 1px solid #e8ecf1;">
                                <tr>
                                    <td style="padding: 30px; text-align: center;">
                                        <div style="background: #ffffff; border-radius: 8px; padding: 20px; border: 2px dashed #92C24A;">
                                            <span style="font-size: 42px; font-weight: 700; letter-spacing: 12px; color: #000000; font-family: 'Courier New', monospace;">
                                                ${otp}
                                            </span>
                                        </div>
                                        <p style="color: #4a5568; font-size: 14px; margin-top: 16px; margin-bottom: 0;">
                                            This code expires in <strong style="color: #e74c3c;">5 minutes</strong>
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Security Notice -->
                    <tr>
                        <td style="padding: 0 40px 30px;">
                            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="background: #f8faf5; border-radius: 8px; border-left: 4px solid #92C24A;">
                                <tr>
                                    <td style="padding: 16px 20px;">
                                        <div style="display: flex; align-items: flex-start;">
                                            <span style="font-size: 18px; margin-right: 12px;">🔒</span>
                                            <div>
                                                <p style="color: #000000; font-size: 14px; font-weight: 600; margin: 0 0 4px 0;">
                                                    Security Notice
                                                </p>
                                                <p style="color: #4a5568; font-size: 13px; line-height: 1.5; margin: 0;">
                                                    If you didn't request this code, please ignore this email. 
                                                    Your account remains secure.
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background: #f8faf5; padding: 30px 40px; border-top: 1px solid #e8ecf1;">
                            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center" style="color: #4a5568; font-size: 13px; line-height: 1.6;">
                                        <p style="margin: 0 0 4px 0;">
                                            <span style="font-weight: 600; color: #000000;">Livinkey</span> · Admin Dashboard
                                        </p>
                                        <p style="margin: 0 0 4px 0; color: #718096; font-size: 12px;">
                                            This is an automated message, please do not reply.
                                        </p>
                                        <p style="margin: 0; color: #a0aec0; font-size: 11px;">
                                            &copy; ${new Date().getFullYear()} Livinkey. All rights reserved.
                                        </p>
                                    </td>
                                </tr>
                                <!-- Social/Contact Icons -->
                                <tr>
                                    <td align="center" style="padding-top: 16px;">
                                        <table align="center" border="0" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="padding: 0 8px;">
                                                    <a href="#" style="color: #4a5568; text-decoration: none; font-size: 12px; font-weight: 500;">Support</a>
                                                </td>
                                                <td style="color: #dce1e8; padding: 0 4px;">·</td>
                                                <td style="padding: 0 8px;">
                                                    <a href="#" style="color: #4a5568; text-decoration: none; font-size: 12px; font-weight: 500;">Privacy</a>
                                                </td>
                                                <td style="color: #dce1e8; padding: 0 4px;">·</td>
                                                <td style="padding: 0 8px;">
                                                    <a href="#" style="color: #4a5568; text-decoration: none; font-size: 12px; font-weight: 500;">Terms</a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
                <!-- Background pattern for larger screens -->
                <div style="display: none; background: #f4f6f9;">
                    <!-- Empty div for background styling -->
                </div>
            </body>
            </html>
        `
    });

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

    return { otp, hashedOTP, expiry };
};

module.exports = {
    generateOTP,
    hashOTP,
    compareOTP,
    sendOTPEmail,
    generateAndSendOTP
};