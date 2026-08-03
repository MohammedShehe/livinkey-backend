const transporter = require("../config/mail");

const sendOTPEmail = async (email, otp, purpose = "Login") => {
    await transporter.sendMail({
        from: `"Livinkey" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `🔐 Livinkey ${purpose} Verification`,
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
                                        Enter the verification code below to complete your ${purpose.toLowerCase()}.
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
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
            </body>
            </html>
        `
    });
};

const sendWelcomeAdminEmail = async (email, name, temporaryPassword) => {
    await transporter.sendMail({
        from: `"Livinkey" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "🎉 Welcome to Livinkey - Your Admin Account",
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Welcome to Livinkey</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
                </style>
            </head>
            <body style="margin: 0; padding: 0; background-color: #f4f6f9; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; margin: 40px auto; border-radius: 16px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06); overflow: hidden;">
                    <tr>
                        <td style="background: #92C24A; padding: 40px 30px 30px; text-align: center;">
                            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center">
                                        <div style="display: inline-block; background: rgba(255, 255, 255, 0.15); padding: 12px 24px; border-radius: 50px; backdrop-filter: blur(10px);">
                                            <span style="color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: 1px;">🎉 Livinkey</span>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="padding-top: 12px;">
                                        <span style="color: rgba(255, 255, 255, 0.9); font-size: 14px; font-weight: 400; letter-spacing: 2px;">ADMIN ACCESS GRANTED</span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 40px 30px;">
                            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td style="color: #000000; font-size: 24px; font-weight: 600; padding-bottom: 8px; text-align: center;">
                                        Welcome to Livinkey, ${name}!
                                    </td>
                                </tr>
                                <tr>
                                    <td style="color: #4a5568; font-size: 16px; line-height: 1.6; text-align: center; padding-bottom: 10px;">
                                        Your administrator account has been created successfully. 
                                        You now have access to the Livinkey admin dashboard.
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 40px 30px;">
                            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="background: #f8faf5; border-radius: 12px; border: 1px solid #e8ecf1;">
                                <tr>
                                    <td style="padding: 30px;">
                                        <p style="color: #000000; font-size: 16px; font-weight: 600; margin: 0 0 16px 0; text-align: center;">
                                            Your Login Credentials
                                        </p>
                                        <div style="background: #ffffff; border-radius: 8px; padding: 16px; border: 1px solid #e8ecf1; margin-bottom: 12px;">
                                            <p style="color: #4a5568; font-size: 14px; margin: 0 0 4px 0;">
                                                <strong style="color: #000000;">Email:</strong>
                                            </p>
                                            <p style="color: #000000; font-size: 16px; font-weight: 500; margin: 0; font-family: 'Courier New', monospace;">
                                                ${email}
                                            </p>
                                        </div>
                                        <div style="background: #ffffff; border-radius: 8px; padding: 16px; border: 1px solid #e8ecf1;">
                                            <p style="color: #4a5568; font-size: 14px; margin: 0 0 4px 0;">
                                                <strong style="color: #000000;">Temporary Password:</strong>
                                            </p>
                                            <p style="color: #000000; font-size: 16px; font-weight: 500; margin: 0; font-family: 'Courier New', monospace;">
                                                ${temporaryPassword}
                                            </p>
                                        </div>
                                        <p style="color: #e74c3c; font-size: 14px; margin-top: 16px; margin-bottom: 0; text-align: center;">
                                            ⚠️ You will be required to change your password after your first login.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 40px 30px;">
                            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="background: #f8faf5; border-radius: 8px; border-left: 4px solid #92C24A;">
                                <tr>
                                    <td style="padding: 16px 20px;">
                                        <div style="display: flex; align-items: flex-start;">
                                            <span style="font-size: 18px; margin-right: 12px;">🚀</span>
                                            <div>
                                                <p style="color: #000000; font-size: 14px; font-weight: 600; margin: 0 0 4px 0;">
                                                    Getting Started
                                                </p>
                                                <p style="color: #4a5568; font-size: 13px; line-height: 1.5; margin: 0;">
                                                    Login to your dashboard to manage tenants, guests, bills, and more.
                                                    Explore the features and start managing your properties efficiently.
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
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
            </body>
            </html>
        `
    });
};

const sendWelcomeTenantEmail = async (email, name, role, password, pgName = null, roomNumber = null) => {
    const roleLabel = role === 'tenant' ? 'Tenant' : 'Guest';
    const propertyInfo = role === 'tenant' 
        ? `<p style="margin: 4px 0;"><strong>PG:</strong> ${pgName || 'N/A'}</p>
           <p style="margin: 4px 0;"><strong>Room:</strong> ${roomNumber || 'N/A'}</p>`
        : '';

    await transporter.sendMail({
        from: `"Livinkey" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `🎉 Welcome to Livinkey - Your ${roleLabel} Account`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Welcome to Livinkey</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
                </style>
            </head>
            <body style="margin: 0; padding: 0; background-color: #f4f6f9; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; margin: 40px auto; border-radius: 16px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06); overflow: hidden;">
                    <tr>
                        <td style="background: #92C24A; padding: 40px 30px 30px; text-align: center;">
                            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center">
                                        <div style="display: inline-block; background: rgba(255, 255, 255, 0.15); padding: 12px 24px; border-radius: 50px; backdrop-filter: blur(10px);">
                                            <span style="color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: 1px;">🏠 Livinkey</span>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="padding-top: 12px;">
                                        <span style="color: rgba(255, 255, 255, 0.9); font-size: 14px; font-weight: 400; letter-spacing: 2px;">${roleLabel.toUpperCase()} ACCESS GRANTED</span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 40px 30px;">
                            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td style="color: #000000; font-size: 24px; font-weight: 600; padding-bottom: 8px; text-align: center;">
                                        Welcome to Livinkey, ${name}!
                                    </td>
                                </tr>
                                <tr>
                                    <td style="color: #4a5568; font-size: 16px; line-height: 1.6; text-align: center; padding-bottom: 10px;">
                                        Your ${roleLabel.toLowerCase()} account has been created successfully. 
                                        You now have access to the Livinkey app.
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 40px 30px;">
                            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="background: #f8faf5; border-radius: 12px; border: 1px solid #e8ecf1;">
                                <tr>
                                    <td style="padding: 30px;">
                                        <p style="color: #000000; font-size: 16px; font-weight: 600; margin: 0 0 16px 0; text-align: center;">
                                            Your Account Details
                                        </p>
                                        <div style="background: #ffffff; border-radius: 8px; padding: 16px; border: 1px solid #e8ecf1; margin-bottom: 12px;">
                                            <p style="color: #4a5568; font-size: 14px; margin: 0 0 4px 0;">
                                                <strong style="color: #000000;">Email:</strong>
                                            </p>
                                            <p style="color: #000000; font-size: 16px; font-weight: 500; margin: 0; font-family: 'Courier New', monospace;">
                                                ${email}
                                            </p>
                                        </div>
                                        <div style="background: #ffffff; border-radius: 8px; padding: 16px; border: 1px solid #e8ecf1; margin-bottom: 12px;">
                                            <p style="color: #4a5568; font-size: 14px; margin: 0 0 4px 0;">
                                                <strong style="color: #000000;">Password:</strong>
                                            </p>
                                            <p style="color: #000000; font-size: 16px; font-weight: 500; margin: 0; font-family: 'Courier New', monospace;">
                                                ${password}
                                            </p>
                                        </div>
                                        ${propertyInfo}
                                        <p style="color: #e74c3c; font-size: 14px; margin-top: 16px; margin-bottom: 0; text-align: center;">
                                            ⚠️ Please change your password after your first login for security.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 40px 30px;">
                            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="background: #f8faf5; border-radius: 8px; border-left: 4px solid #92C24A;">
                                <tr>
                                    <td style="padding: 16px 20px;">
                                        <div style="display: flex; align-items: flex-start;">
                                            <span style="font-size: 18px; margin-right: 12px;">🚀</span>
                                            <div>
                                                <p style="color: #000000; font-size: 14px; font-weight: 600; margin: 0 0 4px 0;">
                                                    Getting Started
                                                </p>
                                                <p style="color: #4a5568; font-size: 13px; line-height: 1.5; margin: 0;">
                                                    Download the Livinkey app to access your account, view your property details, pay bills, and more.
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="background: #f8faf5; padding: 30px 40px; border-top: 1px solid #e8ecf1;">
                            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center" style="color: #4a5568; font-size: 13px; line-height: 1.6;">
                                        <p style="margin: 0 0 4px 0;">
                                            <span style="font-weight: 600; color: #000000;">Livinkey</span> · Tenant Dashboard
                                        </p>
                                        <p style="margin: 0 0 4px 0; color: #718096; font-size: 12px;">
                                            This is an automated message, please do not reply.
                                        </p>
                                        <p style="margin: 0; color: #a0aec0; font-size: 11px;">
                                            &copy; ${new Date().getFullYear()} Livinkey. All rights reserved.
                                        </p>
                                    </td>
                                </tr>
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
            </body>
            </html>
        `
    });
};

const sendPasswordResetEmail = async (email, name) => {
    await transporter.sendMail({
        from: `"Livinkey" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "🔑 Password Reset Request - Livinkey",
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Password Reset Request</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
                </style>
            </head>
            <body style="margin: 0; padding: 0; background-color: #f4f6f9; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; margin: 40px auto; border-radius: 16px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06); overflow: hidden;">
                    <tr>
                        <td style="background: #92C24A; padding: 40px 30px 30px; text-align: center;">
                            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center">
                                        <div style="display: inline-block; background: rgba(255, 255, 255, 0.15); padding: 12px 24px; border-radius: 50px; backdrop-filter: blur(10px);">
                                            <span style="color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: 1px;">🔑 Livinkey</span>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="padding-top: 12px;">
                                        <span style="color: rgba(255, 255, 255, 0.9); font-size: 14px; font-weight: 400; letter-spacing: 2px;">PASSWORD RESET</span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 40px 30px;">
                            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td style="color: #000000; font-size: 24px; font-weight: 600; padding-bottom: 8px; text-align: center;">
                                        Password Reset Request
                                    </td>
                                </tr>
                                <tr>
                                    <td style="color: #4a5568; font-size: 16px; line-height: 1.6; text-align: center; padding-bottom: 10px;">
                                        Hello <strong>${name}</strong>,
                                    </td>
                                </tr>
                                <tr>
                                    <td style="color: #4a5568; font-size: 16px; line-height: 1.6; text-align: center;">
                                        We received a request to reset your password for your Livinkey account.
                                        A verification code has been sent to your email to confirm your identity.
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 40px 30px;">
                            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="background: #f8faf5; border-radius: 12px; border: 1px solid #e8ecf1;">
                                <tr>
                                    <td style="padding: 30px; text-align: center;">
                                        <p style="color: #000000; font-size: 16px; font-weight: 600; margin: 0 0 16px 0;">
                                            Verification Code
                                        </p>
                                        <div style="background: #ffffff; border-radius: 8px; padding: 16px; border: 2px dashed #92C24A;">
                                            <span style="color: #000000; font-size: 16px; font-weight: 500; font-family: 'Courier New', monospace;">
                                                Check your email for the OTP code
                                            </span>
                                        </div>
                                        <p style="color: #4a5568; font-size: 14px; margin-top: 16px; margin-bottom: 0;">
                                            You will need to enter the OTP to proceed with password reset.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 40px 30px;">
                            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="background: #f8faf5; border-radius: 8px; border-left: 4px solid #e74c3c;">
                                <tr>
                                    <td style="padding: 16px 20px;">
                                        <div style="display: flex; align-items: flex-start;">
                                            <span style="font-size: 18px; margin-right: 12px;">🔒</span>
                                            <div>
                                                <p style="color: #000000; font-size: 14px; font-weight: 600; margin: 0 0 4px 0;">
                                                    Security Notice
                                                </p>
                                                <p style="color: #4a5568; font-size: 13px; line-height: 1.5; margin: 0;">
                                                    If you didn't request this password reset, please ignore this email.
                                                    Your account remains secure and no changes have been made.
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
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
            </body>
            </html>
        `
    });
};

module.exports = {
    sendOTPEmail,
    sendWelcomeAdminEmail,
    sendWelcomeTenantEmail,
    sendPasswordResetEmail
};