const jwt = require("jsonwebtoken");

const generateToken = (admin) => {
    // Build payload with all necessary fields
    const payload = {
        id: admin.id,
        role: admin.role,
        email: admin.email
    };
    
    // Include must_change_password if present
    if (admin.must_change_password !== undefined) {
        payload.must_change_password = admin.must_change_password;
    }

    return jwt.sign(
        payload,
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN
        }
    );
};

module.exports = {
    generateToken
};