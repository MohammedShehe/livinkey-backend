const db = require("../config/db");

const findByEmail = async (email) => {

    const [rows] = await db.execute(
        "SELECT * FROM admins WHERE email = ? LIMIT 1",
        [email]
    );

    return rows[0];
};

const updateOTP = async (id, otp, otpExpiry) => {

    await db.execute(
        `
        UPDATE admins
        SET
            otp=?,
            otp_expiry=?,
            otp_sent_at=NOW()
        WHERE id=?
        `,
        [otp, otpExpiry, id]
    );

};

const clearOTP = async (id) => {

    await db.execute(
        `UPDATE admins
        SET otp=NULL,
        otp_expiry=NULL
        WHERE id=?`,
        [id]
    );

};

module.exports = {
    findByEmail,
    updateOTP,
    clearOTP
};