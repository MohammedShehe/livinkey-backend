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

const findByResetToken = async (token) => {

    const [rows] = await db.execute(
        `SELECT * FROM admins
        WHERE reset_token=?
        LIMIT 1`,
        [token]
    );

    return rows[0];

};

const saveResetToken = async (id, token, expiry) => {

    await db.execute(
        `UPDATE admins
        SET
            reset_token=?,
            reset_token_expiry=?
        WHERE id=?`,
        [token, expiry, id]
    );

};

const updatePassword = async (id, password) => {

    await db.execute(
        `UPDATE admins
        SET
            password=?,
            reset_token=NULL,
            reset_token_expiry=NULL
        WHERE id=?`,
        [password, id]
    );

};

module.exports = {
    findByEmail,
    updateOTP,
    clearOTP,
    findByResetToken,
    saveResetToken,
    updatePassword
};