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

        subject: "Livinkey Login Verification",

        html: `
            <div style="font-family:Arial;padding:30px">
                <h2>Livinkey Admin Login</h2>

                <p>Your verification code is</p>

                <h1 style="letter-spacing:8px;">
                    ${otp}
                </h1>

                <p>This code expires in <strong>5 minutes</strong>.</p>

                <p>If you didn't request this, ignore this email.</p>

            </div>
        `
    });

};

module.exports = {
    generateOTP,
    hashOTP,
    compareOTP,
    sendOTPEmail
};