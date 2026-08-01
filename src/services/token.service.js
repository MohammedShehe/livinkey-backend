const jwt = require("jsonwebtoken");

const generateToken = (admin) => {

    return jwt.sign(
        {
            id: admin.id,
            role: admin.role,
            email: admin.email
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN
        }
    );

};

module.exports = {
    generateToken
};