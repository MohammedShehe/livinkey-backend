/** Single place for password rules so admin, tenant and guest stay consistent. */
const validatePassword = (password) => {
    if (typeof password !== "string" || password.length < 8) {
        return "Password must be at least 8 characters long.";
    }
    if (password.length > 72) {
        return "Password must be 72 characters or fewer.";
    }
    if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
        return "Password must include at least one letter and one number.";
    }
    if (/^(password|12345678|qwerty123|livinkey1)/i.test(password)) {
        return "That password is too easy to guess. Please choose a stronger one.";
    }
    return null;
};
module.exports = { validatePassword };
