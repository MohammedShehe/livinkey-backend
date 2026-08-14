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

const sendGuestMessageEmail = async (email, guestName, adminName, message, subject = null) => {
    const emailSubject = subject || `📩 Message from Livinkey Admin`;
    
    // Convert \n to <br> for proper line breaks
    const formattedMessage = message.replace(/\n/g, '<br>');

    await transporter.sendMail({
        from: `"Livinkey Admin" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: emailSubject,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Message from Livinkey Admin</title>
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
                                            <span style="color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: 1px;">📩 Livinkey</span>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="padding-top: 12px;">
                                        <span style="color: rgba(255, 255, 255, 0.9); font-size: 14px; font-weight: 400; letter-spacing: 2px;">MESSAGE FROM ADMIN</span>
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
                                        Hello ${guestName}!
                                    </td>
                                </tr>
                                <tr>
                                    <td style="color: #4a5568; font-size: 16px; line-height: 1.6; text-align: center; padding-bottom: 10px;">
                                        You have received a message from <strong>${adminName}</strong> regarding your stay at Livinkey.
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
                                        <p style="color: #000000; font-size: 16px; font-weight: 600; margin: 0 0 12px 0; text-align: center;">
                                            📝 Message
                                        </p>
                                        <div style="background: #ffffff; border-radius: 8px; padding: 20px; border: 1px solid #e8ecf1; min-height: 80px;">
                                            <p style="color: #4a5568; font-size: 15px; line-height: 1.8; margin: 0; white-space: pre-wrap;">
                                                ${formattedMessage}
                                            </p>
                                        </div>
                                        <p style="color: #718096; font-size: 13px; margin-top: 12px; margin-bottom: 0; text-align: center;">
                                            Sent on: ${new Date().toLocaleString()}
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
                                            <span style="font-size: 18px; margin-right: 12px;">💡</span>
                                            <div>
                                                <p style="color: #000000; font-size: 14px; font-weight: 600; margin: 0 0 4px 0;">
                                                    Need Help?
                                                </p>
                                                <p style="color: #4a5568; font-size: 13px; line-height: 1.5; margin: 0;">
                                                    If you have any questions, please reply to this email or contact the Livinkey support team.
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
                                            <span style="font-weight: 600; color: #000000;">Livinkey</span> · Guest Communication
                                        </p>
                                        <p style="margin: 0 0 4px 0; color: #718096; font-size: 12px;">
                                            This is an automated message from the Livinkey admin panel.
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

const sendBillEmail = async (email, tenantName, billData, qrCodeUrl, partialQrUrl, meterImageUrl = null, adminQrUrl = null) => {
    const totalAmount = parseFloat(billData.total_amount) || 0;
    const fineAmount = parseFloat(billData.fine_amount) || 0;
    const grandTotal = totalAmount + fineAmount;
    const partialAmount = grandTotal * 0.5;

    console.log("sendBillEmail - Full QR URL:", qrCodeUrl);
    console.log("sendBillEmail - Partial QR URL:", partialQrUrl);
    console.log("sendBillEmail - Meter Image URL:", meterImageUrl);
    console.log("sendBillEmail - Admin QR URL:", adminQrUrl);

    await transporter.sendMail({
        from: `"Livinkey" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `📄 New Bill Generated - Livinkey`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>New Bill - Livinkey</title>
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
                                            <span style="color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: 1px;">📄 Livinkey</span>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="padding-top: 12px;">
                                        <span style="color: rgba(255, 255, 255, 0.9); font-size: 14px; font-weight: 400; letter-spacing: 2px;">NEW BILL GENERATED</span>
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
                                        Hello ${tenantName}!
                                    </td>
                                </tr>
                                <tr>
                                    <td style="color: #4a5568; font-size: 16px; line-height: 1.6; text-align: center; padding-bottom: 10px;">
                                        A new bill has been generated for your stay at <strong>${billData.pg_name}</strong>, Room <strong>${billData.room_number}</strong>.
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
                                            💰 Bill Details
                                        </p>
                                        <div style="background: #ffffff; border-radius: 8px; padding: 16px; border: 1px solid #e8ecf1;">
                                            <table width="100%" style="border-collapse: collapse;">
                                                <tr>
                                                    <td style="padding: 6px 0; color: #4a5568;">Rent</td>
                                                    <td style="padding: 6px 0; text-align: right; font-weight: 500; color: #000000;">₹${parseFloat(billData.rent_amount).toFixed(2)}</td>
                                                </tr>
                                                ${parseFloat(billData.electricity_amount || 0) > 0 ? `
                                                <tr>
                                                    <td style="padding: 6px 0; color: #4a5568;">Electricity</td>
                                                    <td style="padding: 6px 0; text-align: right; font-weight: 500; color: #000000;">₹${parseFloat(billData.electricity_amount).toFixed(2)}</td>
                                                </tr>` : ''}
                                                ${parseFloat(billData.maintenance_amount || 0) > 0 ? `
                                                <tr>
                                                    <td style="padding: 6px 0; color: #4a5568;">Maintenance</td>
                                                    <td style="padding: 6px 0; text-align: right; font-weight: 500; color: #000000;">₹${parseFloat(billData.maintenance_amount).toFixed(2)}</td>
                                                </tr>` : ''}
                                                ${parseFloat(billData.other_charges || 0) > 0 ? `
                                                <tr>
                                                    <td style="padding: 6px 0; color: #4a5568;">Other Charges</td>
                                                    <td style="padding: 6px 0; text-align: right; font-weight: 500; color: #000000;">₹${parseFloat(billData.other_charges).toFixed(2)}</td>
                                                </tr>` : ''}
                                                ${fineAmount > 0 ? `
                                                <tr>
                                                    <td style="padding: 6px 0; color: #e74c3c;">Late Fee</td>
                                                    <td style="padding: 6px 0; text-align: right; font-weight: 500; color: #e74c3c;">₹${fineAmount.toFixed(2)}</td>
                                                </tr>` : ''}
                                                <tr>
                                                    <td style="padding: 10px 0 0 0; border-top: 2px solid #e8ecf1; font-weight: 600; color: #000000;">Total Amount</td>
                                                    <td style="padding: 10px 0 0 0; border-top: 2px solid #e8ecf1; text-align: right; font-weight: 700; color: #92C24A; font-size: 18px;">₹${grandTotal.toFixed(2)}</td>
                                                </tr>
                                            </table>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    ${meterImageUrl ? `
                    <tr>
                        <td style="padding: 0 40px 30px;">
                            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="background: #f8faf5; border-radius: 12px; border: 1px solid #e8ecf1;">
                                <tr>
                                    <td style="padding: 20px; text-align: center;">
                                        <p style="color: #000000; font-size: 14px; font-weight: 600; margin: 0 0 12px 0;">⚡ Electricity Meter Image</p>
                                        <img src="${meterImageUrl}" alt="Electricity Meter" style="max-width: 100%; max-height: 300px; border-radius: 8px; border: 1px solid #e8ecf1;">
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>` : ''}
                    <tr>
                        <td style="padding: 0 40px 30px;">
                            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td style="padding: 16px 20px; text-align: center;">
                                        <p style="color: #4a5568; font-size: 14px; margin: 0 0 8px 0;">
                                            <strong>📅 Valid Until:</strong> ${new Date(billData.valid_until).toLocaleString()}
                                        </p>
                                        <p style="color: #e74c3c; font-size: 13px; margin: 0;">
                                            ⚠️ If not paid within 7 days, a late fee of ₹100 will be applied daily.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    ${adminQrUrl ? `
                    <tr>
                        <td style="padding: 0 40px 30px;">
                            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="background: #f8faf5; border-radius: 12px; border: 1px solid #e8ecf1;">
                                <tr>
                                    <td style="padding: 30px; text-align: center;">
                                        <p style="color: #000000; font-size: 16px; font-weight: 600; margin: 0 0 16px 0;">
                                            📱 Admin Provided QR Code
                                        </p>
                                        <div style="display: inline-block; background: #ffffff; border-radius: 8px; padding: 16px; border: 1px solid #e8ecf1;">
                                            <img src="${adminQrUrl}" alt="Admin QR Code" style="width: 200px; height: 200px; display: block; margin: 0 auto;">
                                        </div>
                                        <p style="color: #4a5568; font-size: 14px; margin-top: 12px; margin-bottom: 0;">
                                            Scan this QR code to pay the full amount of <strong>₹${grandTotal.toFixed(2)}</strong>
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>` : ''}
                    ${qrCodeUrl ? `
                    <tr>
                        <td style="padding: 0 40px 30px;">
                            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="background: #f8faf5; border-radius: 12px; border: 1px solid #e8ecf1;">
                                <tr>
                                    <td style="padding: 30px; text-align: center;">
                                        <p style="color: #000000; font-size: 16px; font-weight: 600; margin: 0 0 16px 0;">
                                            📱 Auto-Generated Payment QR
                                        </p>
                                        <div style="display: inline-block; background: #ffffff; border-radius: 8px; padding: 16px; border: 1px solid #e8ecf1;">
                                            <img src="${qrCodeUrl}" alt="Payment QR Code" style="width: 200px; height: 200px; display: block; margin: 0 auto;">
                                        </div>
                                        <p style="color: #4a5568; font-size: 14px; margin-top: 12px; margin-bottom: 0;">
                                            Scan this QR code to pay the full amount of <strong>₹${grandTotal.toFixed(2)}</strong>
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>` : ''}
                    ${partialQrUrl ? `
                    <tr>
                        <td style="padding: 0 40px 30px;">
                            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="background: #f8faf5; border-radius: 12px; border: 1px solid #e8ecf1;">
                                <tr>
                                    <td style="padding: 30px; text-align: center;">
                                        <p style="color: #000000; font-size: 14px; font-weight: 600; margin: 0 0 12px 0;">
                                            💳 Auto-Generated Partial Payment QR (50%)
                                        </p>
                                        <div style="display: inline-block; background: #ffffff; border-radius: 8px; padding: 16px; border: 1px solid #e8ecf1;">
                                            <img src="${partialQrUrl}" alt="Partial Payment QR Code" style="width: 150px; height: 150px; display: block; margin: 0 auto;">
                                        </div>
                                        <p style="color: #4a5568; font-size: 13px; margin-top: 10px; margin-bottom: 0;">
                                            Scan to pay 50% (<strong>₹${partialAmount.toFixed(2)}</strong>)
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>` : ''}
                    <tr>
                        <td style="background: #f8faf5; padding: 30px 40px; border-top: 1px solid #e8ecf1;">
                            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center" style="color: #4a5568; font-size: 13px; line-height: 1.6;">
                                        <p style="margin: 0 0 4px 0;">
                                            <span style="font-weight: 600; color: #000000;">Livinkey</span> · Bill Management
                                        </p>
                                        <p style="margin: 0 0 4px 0; color: #718096; font-size: 12px;">
                                            This is an automated message, please do not reply.
                                        </p>
                                        <p style="margin: 0; color: #a0aec0; font-size: 11px;">
                                            &copy; ${new Date().getFullYear()} Livinkey. All rights reserved.
                                        </p>
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

const sendFineNotificationEmail = async (email, tenantName, billData, fineAmount, daysDelayed, hasPartialPayment, fullQrUrl, partialQrUrl) => {
    const totalAmount = parseFloat(billData.total_amount) || 0;
    const previousFine = parseFloat(billData.fine_amount) || 0;
    const newTotal = totalAmount + fineAmount;
    const fineAdded = fineAmount - previousFine;
    const partialAmount = newTotal * 0.5;
    
    const daysOverdue = daysDelayed;

    const qrFull = fullQrUrl || billData.payment_qr;
    const qrPartial = partialQrUrl || billData.partial_payment_qr;

    await transporter.sendMail({
        from: `"Livinkey" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `⚠️ Late Payment Fee Applied - Livinkey`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Late Payment Fee - Livinkey</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
                </style>
            </head>
            <body style="margin: 0; padding: 0; background-color: #f4f6f9; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; margin: 40px auto; border-radius: 16px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06); overflow: hidden;">
                    <tr>
                        <td style="background: #e74c3c; padding: 40px 30px 30px; text-align: center;">
                            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center">
                                        <div style="display: inline-block; background: rgba(255, 255, 255, 0.15); padding: 12px 24px; border-radius: 50px; backdrop-filter: blur(10px);">
                                            <span style="color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: 1px;">⚠️ Livinkey</span>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="padding-top: 12px;">
                                        <span style="color: rgba(255, 255, 255, 0.9); font-size: 14px; font-weight: 400; letter-spacing: 2px;">LATE PAYMENT FEE</span>
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
                                        Hello ${tenantName}!
                                    </td>
                                </tr>
                                <tr>
                                    <td style="color: #4a5568; font-size: 16px; line-height: 1.6; text-align: center; padding-bottom: 10px;">
                                        Your bill payment is <strong style="color: #e74c3c;">${daysOverdue} days overdue</strong>. A late payment fee has been applied.
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
                                            💰 Updated Bill Details
                                        </p>
                                        <div style="background: #ffffff; border-radius: 8px; padding: 16px; border: 1px solid #e8ecf1;">
                                            <table width="100%" style="border-collapse: collapse;">
                                                <tr>
                                                    <td style="padding: 6px 0; color: #4a5568;">Original Bill Amount</td>
                                                    <td style="padding: 6px 0; text-align: right; font-weight: 500; color: #000000;">₹${totalAmount.toFixed(2)}</td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 6px 0; color: #4a5568;">Previous Late Fees</td>
                                                    <td style="padding: 6px 0; text-align: right; font-weight: 500; color: #000000;">₹${previousFine.toFixed(2)}</td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 6px 0; color: #e74c3c; font-weight: 600;">New Late Fee Added</td>
                                                    <td style="padding: 6px 0; text-align: right; font-weight: 600; color: #e74c3c;">+ ₹${fineAdded.toFixed(2)}</td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 10px 0 0 0; border-top: 2px solid #e8ecf1; font-weight: 600; color: #000000;">Total Amount Due</td>
                                                    <td style="padding: 10px 0 0 0; border-top: 2px solid #e8ecf1; text-align: right; font-weight: 700; color: #e74c3c; font-size: 18px;">₹${newTotal.toFixed(2)}</td>
                                                </tr>
                                            </table>
                                        </div>
                                        <p style="color: #4a5568; font-size: 13px; margin-top: 12px; margin-bottom: 0; text-align: center;">
                                            ${hasPartialPayment ? '⚠️ You have made a partial payment. Additional fees apply after 14 days.' : '⚠️ ₹100 late fee added for each day beyond the 7-day grace period.'}
                                        </p>
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
                                            📱 Scan to Pay Full Amount
                                        </p>
                                        <div style="display: inline-block; background: #ffffff; border-radius: 8px; padding: 16px; border: 1px solid #e8ecf1;">
                                            <img src="${qrFull}" alt="Payment QR Code" style="width: 200px; height: 200px; display: block; margin: 0 auto;">
                                        </div>
                                        <p style="color: #4a5568; font-size: 14px; margin-top: 12px; margin-bottom: 0;">
                                            Scan this QR code to pay the full amount of <strong>₹${newTotal.toFixed(2)}</strong>
                                        </p>
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
                                        <p style="color: #000000; font-size: 14px; font-weight: 600; margin: 0 0 12px 0;">
                                            💳 Partial Payment (50%)
                                        </p>
                                        <div style="display: inline-block; background: #ffffff; border-radius: 8px; padding: 16px; border: 1px solid #e8ecf1;">
                                            <img src="${qrPartial}" alt="Partial Payment QR Code" style="width: 150px; height: 150px; display: block; margin: 0 auto;">
                                        </div>
                                        <p style="color: #4a5568; font-size: 13px; margin-top: 10px; margin-bottom: 0;">
                                            Scan to pay 50% (<strong>₹${partialAmount.toFixed(2)}</strong>)
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
                                            <span style="font-size: 18px; margin-right: 12px;">⏰</span>
                                            <div>
                                                <p style="color: #000000; font-size: 14px; font-weight: 600; margin: 0 0 4px 0;">
                                                    Action Required
                                                </p>
                                                <p style="color: #4a5568; font-size: 13px; line-height: 1.5; margin: 0;">
                                                    Please pay your outstanding bill as soon as possible to avoid additional late fees. 
                                                    New QR codes have been generated with the updated total amount.
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
                                            <span style="font-weight: 600; color: #000000;">Livinkey</span> · Bill Management
                                        </p>
                                        <p style="margin: 0 0 4px 0; color: #718096; font-size: 12px;">
                                            This is an automated message, please do not reply.
                                        </p>
                                        <p style="margin: 0; color: #a0aec0; font-size: 11px;">
                                            &copy; ${new Date().getFullYear()} Livinkey. All rights reserved.
                                        </p>
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

const sendCustomBillMessageEmail = async (email, tenantName, adminName, subject, message, qrCodeUrl, adminQrUrl, totalDue, pgName, roomNumber, qrExpiresAt) => {
    const expiryDate = qrExpiresAt ? new Date(qrExpiresAt) : new Date(Date.now() + 24 * 60 * 60 * 1000);
    const expiryFormatted = expiryDate.toLocaleString();

    // Convert \n to <br> for proper line breaks in HTML
    const formattedMessage = message.replace(/\n/g, '<br>');

    await transporter.sendMail({
        from: `"Livinkey Admin" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `📩 ${subject}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${subject}</title>
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
                                            <span style="color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: 1px;">📩 Livinkey</span>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="padding-top: 12px;">
                                        <span style="color: rgba(255, 255, 255, 0.9); font-size: 14px; font-weight: 400; letter-spacing: 2px;">CUSTOM MESSAGE</span>
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
                                        Hello ${tenantName}!
                                    </td>
                                </tr>
                                <tr>
                                    <td style="color: #4a5568; font-size: 16px; line-height: 1.6; text-align: center; padding-bottom: 10px;">
                                        You have received a message from <strong>${adminName}</strong> regarding your stay at <strong>${pgName || 'Livinkey'}</strong> (Room ${roomNumber || 'N/A'}).
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 40px 30px;">
                            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="background: #f8faf5; border-radius: 12px; border: 1px solid #e8ecf1;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <p style="color: #000000; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">
                                            📝 Message
                                        </p>
                                        <div style="background: #ffffff; border-radius: 8px; padding: 16px; border: 1px solid #e8ecf1;">
                                            <p style="color: #4a5568; font-size: 15px; line-height: 1.8; margin: 0; white-space: pre-wrap;">
                                                ${formattedMessage}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    ${adminQrUrl ? `
                    <tr>
                        <td style="padding: 0 40px 30px;">
                            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="background: #f8faf5; border-radius: 12px; border: 1px solid #e8ecf1;">
                                <tr>
                                    <td style="padding: 20px; text-align: center;">
                                        <p style="color: #000000; font-size: 14px; font-weight: 600; margin: 0 0 12px 0;">
                                            📱 Admin Provided QR Code
                                        </p>
                                        <img src="${adminQrUrl}" alt="Admin QR Code" style="max-width: 200px; height: auto; border-radius: 8px; border: 1px solid #e8ecf1;">
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>` : ''}
                    ${qrCodeUrl ? `
                    <tr>
                        <td style="padding: 0 40px 30px;">
                            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="background: #f8faf5; border-radius: 12px; border: 1px solid #e8ecf1;">
                                <tr>
                                    <td style="padding: 20px; text-align: center;">
                                        <p style="color: #000000; font-size: 14px; font-weight: 600; margin: 0 0 12px 0;">
                                            💳 Auto-Generated Payment QR Code
                                        </p>
                                        <img src="${qrCodeUrl}" alt="Payment QR Code" style="max-width: 200px; height: auto; border-radius: 8px; border: 1px solid #e8ecf1;">
                                        <p style="color: #4a5568; font-size: 13px; margin-top: 8px; margin-bottom: 0;">
                                            Amount Due: <strong>₹${totalDue.toFixed(2)}</strong>
                                        </p>
                                        <p style="color: #e74c3c; font-size: 12px; margin-top: 4px; margin-bottom: 0;">
                                            ⚠️ This QR code is valid until <strong>${expiryFormatted}</strong>
                                        </p>
                                        <p style="color: #e74c3c; font-size: 12px; margin-top: 2px; margin-bottom: 0;">
                                            ⚠️ If the QR code has already expired, please request a new one.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>` : ''}
                    <tr>
                        <td style="background: #f8faf5; padding: 30px 40px; border-top: 1px solid #e8ecf1;">
                            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center" style="color: #4a5568; font-size: 13px; line-height: 1.6;">
                                        <p style="margin: 0 0 4px 0;">
                                            <span style="font-weight: 600; color: #000000;">Livinkey</span> · Bill Management
                                        </p>
                                        <p style="margin: 0 0 4px 0; color: #718096; font-size: 12px;">
                                            This is an automated message from the Livinkey admin panel.
                                        </p>
                                        <p style="margin: 0; color: #a0aec0; font-size: 11px;">
                                            &copy; ${new Date().getFullYear()} Livinkey. All rights reserved.
                                        </p>
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

const sendCashPaymentOTPEmail = async (email, tenantName, otp, amount, pgName, roomNumber) => {
    await transporter.sendMail({
        from: `"Livinkey Admin" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `🔐 Cash Payment Verification OTP - Livinkey`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Cash Payment OTP</title>
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
                                        <span style="color: rgba(255, 255, 255, 0.9); font-size: 14px; font-weight: 400; letter-spacing: 2px;">CASH PAYMENT OTP</span>
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
                                        Cash Payment Verification
                                    </td>
                                </tr>
                                <tr>
                                    <td style="color: #4a5568; font-size: 16px; line-height: 1.6; text-align: center; padding-bottom: 10px;">
                                        Hello <strong>${tenantName}</strong>,
                                    </td>
                                </tr>
                                <tr>
                                    <td style="color: #4a5568; font-size: 16px; line-height: 1.6; text-align: center;">
                                        A cash payment of <strong>₹${amount.toFixed(2)}</strong> for your stay at <strong>${pgName || 'Livinkey'}</strong> (Room ${roomNumber || 'N/A'}) is being processed.
                                        Please share the OTP below with the admin to complete the payment.
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
                                            <span style="font-size: 48px; font-weight: 700; letter-spacing: 16px; color: #000000; font-family: 'Courier New', monospace;">
                                                ${otp}
                                            </span>
                                        </div>
                                        <p style="color: #4a5568; font-size: 14px; margin-top: 16px; margin-bottom: 0;">
                                            This OTP expires in <strong style="color: #e74c3c;">5 minutes</strong>
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
                                                    Do not share this OTP with anyone except the Livinkey admin who is processing your cash payment.
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
                                            <span style="font-weight: 600; color: #000000;">Livinkey</span> · Cash Payment
                                        </p>
                                        <p style="margin: 0 0 4px 0; color: #718096; font-size: 12px;">
                                            This is an automated message, please do not reply.
                                        </p>
                                        <p style="margin: 0; color: #a0aec0; font-size: 11px;">
                                            &copy; ${new Date().getFullYear()} Livinkey. All rights reserved.
                                        </p>
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

const sendPaymentLinkEmail = async (email, tenantName, billData, paymentOptions, orderData) => {
    const totalDue = parseFloat(billData.total_amount) + parseFloat(billData.fine_amount || 0) - 
                     parseFloat(billData.paid_amount || 0) - parseFloat(billData.total_cash_paid || 0);

    await transporter.sendMail({
        from: `"Livinkey Payments" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `💳 Payment Link - Livinkey`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Payment Link - Livinkey</title>
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
                                            <span style="color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: 1px;">💳 Livinkey</span>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="padding-top: 12px;">
                                        <span style="color: rgba(255, 255, 255, 0.9); font-size: 14px; font-weight: 400; letter-spacing: 2px;">PAYMENT LINK</span>
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
                                        Hello ${tenantName}!
                                    </td>
                                </tr>
                                <tr>
                                    <td style="color: #4a5568; font-size: 16px; line-height: 1.6; text-align: center; padding-bottom: 10px;">
                                        Your payment link is ready for <strong>${billData.pg_name}</strong>, Room <strong>${billData.room_number}</strong>.
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
                                            💰 Payment Details
                                        </p>
                                        <div style="background: #ffffff; border-radius: 8px; padding: 16px; border: 1px solid #e8ecf1;">
                                            <table width="100%" style="border-collapse: collapse;">
                                                <tr>
                                                    <td style="padding: 6px 0; color: #4a5568;">Amount Due</td>
                                                    <td style="padding: 6px 0; text-align: right; font-weight: 700; color: #000000; font-size: 18px;">₹${totalDue.toFixed(2)}</td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 6px 0; color: #4a5568;">PG</td>
                                                    <td style="padding: 6px 0; text-align: right; font-weight: 500; color: #000000;">${billData.pg_name}</td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 6px 0; color: #4a5568;">Room</td>
                                                    <td style="padding: 6px 0; text-align: right; font-weight: 500; color: #000000;">${billData.room_number}</td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 6px 0; color: #4a5568;">Transaction ID</td>
                                                    <td style="padding: 6px 0; text-align: right; font-weight: 500; color: #000000; font-family: monospace;">${paymentOptions.transaction_id}</td>
                                                </tr>
                                            </table>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    ${paymentOptions.qr_code ? `
                    <tr>
                        <td style="padding: 0 40px 30px;">
                            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="background: #f8faf5; border-radius: 12px; border: 1px solid #e8ecf1;">
                                <tr>
                                    <td style="padding: 30px; text-align: center;">
                                        <p style="color: #000000; font-size: 16px; font-weight: 600; margin: 0 0 16px 0;">
                                            📱 Scan to Pay
                                        </p>
                                        <div style="display: inline-block; background: #ffffff; border-radius: 8px; padding: 16px; border: 1px solid #e8ecf1;">
                                            <img src="${paymentOptions.qr_code}" alt="Payment QR Code" style="width: 200px; height: 200px; display: block; margin: 0 auto;">
                                        </div>
                                        <p style="color: #4a5568; font-size: 13px; margin-top: 10px; margin-bottom: 0;">
                                            Scan with any UPI app (PhonePe, Paytm, Google Pay)
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>` : ''}
                    <tr>
                        <td style="padding: 0 40px 30px;">
                            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td style="padding: 10px; text-align: center;">
                                        <p style="color: #4a5568; font-size: 14px; margin: 0 0 10px 0;">
                                            <strong>📱 Quick Pay Options</strong>
                                        </p>
                                        <div style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">
                                            <a href="${paymentOptions.app_links.phonepe}" target="_blank" style="display: inline-block; background: #5F259F; color: #ffffff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; margin: 4px;">
                                                PhonePe
                                            </a>
                                            <a href="${paymentOptions.app_links.paytm}" target="_blank" style="display: inline-block; background: #00BAF2; color: #ffffff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; margin: 4px;">
                                                Paytm
                                            </a>
                                            <a href="${paymentOptions.app_links.googlepay}" target="_blank" style="display: inline-block; background: #4285F4; color: #ffffff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; margin: 4px;">
                                                Google Pay
                                            </a>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    ${orderData && orderData.gateway === 'razorpay' ? `
                    <tr>
                        <td style="padding: 0 40px 30px;">
                            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td style="text-align: center; padding: 10px 0;">
                                        <a href="${process.env.APP_URL}/payment/razorpay/${orderData.order.id}" target="_blank" style="display: inline-block; background-color: #2D3748; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                                            Pay with Card / Net Banking
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>` : ''}
                    <tr>
                        <td style="padding: 0 40px 30px;">
                            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="background: #f8faf5; border-radius: 8px; border-left: 4px solid #92C24A;">
                                <tr>
                                    <td style="padding: 16px 20px;">
                                        <div style="display: flex; align-items: flex-start;">
                                            <span style="font-size: 18px; margin-right: 12px;">🔒</span>
                                            <div>
                                                <p style="color: #000000; font-size: 14px; font-weight: 600; margin: 0 0 4px 0;">
                                                    Secure Payment
                                                </p>
                                                <p style="color: #4a5568; font-size: 13px; line-height: 1.5; margin: 0;">
                                                    Your payment is processed securely through encrypted channels.
                                                    All transactions are protected.
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
                                            <span style="font-weight: 600; color: #000000;">Livinkey</span> · Payment
                                        </p>
                                        <p style="margin: 0 0 4px 0; color: #718096; font-size: 12px;">
                                            This is an automated message, please do not reply.
                                        </p>
                                        <p style="margin: 0; color: #a0aec0; font-size: 11px;">
                                            &copy; ${new Date().getFullYear()} Livinkey. All rights reserved.
                                        </p>
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

// NEW: Send e-FRRO expiry notification to tenant
const sendEFRROExpiryTenantEmail = async (email, tenantName, tenantData) => {
    const daysUntilExpiry = tenantData.days_until_expiry;
    const expiryDate = new Date(tenantData.efrro_till).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    
    let urgencyLevel = '⚠️';
    let urgencyColor = '#e67e22';
    let urgencyMessage = `Your e-FRRO is expiring in ${daysUntilExpiry} day${daysUntilExpiry > 1 ? 's' : ''}.`;
    
    if (daysUntilExpiry <= 7) {
        urgencyLevel = '🚨';
        urgencyColor = '#e74c3c';
        urgencyMessage = `URGENT: Your e-FRRO is expiring in just ${daysUntilExpiry} day${daysUntilExpiry > 1 ? 's' : ''}!`;
    } else if (daysUntilExpiry <= 14) {
        urgencyLevel = '🔴';
        urgencyColor = '#e67e22';
        urgencyMessage = `Your e-FRRO is expiring in ${daysUntilExpiry} days. Please renew soon.`;
    }

    await transporter.sendMail({
        from: `"Livinkey" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `⚠️ e-FRRO Expiry Alert - ${daysUntilExpiry} days remaining`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>e-FRRO Expiry Alert</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
                </style>
            </head>
            <body style="margin: 0; padding: 0; background-color: #f4f6f9; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; margin: 40px auto; border-radius: 16px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06); overflow: hidden;">
                    <tr>
                        <td style="background: ${urgencyColor}; padding: 40px 30px 30px; text-align: center;">
                            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center">
                                        <div style="display: inline-block; background: rgba(255, 255, 255, 0.15); padding: 12px 24px; border-radius: 50px; backdrop-filter: blur(10px);">
                                            <span style="color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: 1px;">${urgencyLevel} Livinkey</span>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="padding-top: 12px;">
                                        <span style="color: rgba(255, 255, 255, 0.9); font-size: 14px; font-weight: 400; letter-spacing: 2px;">e-FRRO EXPIRY ALERT</span>
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
                                        Hello ${tenantName}!
                                    </td>
                                </tr>
                                <tr>
                                    <td style="color: #4a5568; font-size: 16px; line-height: 1.6; text-align: center; padding-bottom: 10px;">
                                        <strong style="color: ${urgencyColor};">${urgencyMessage}</strong>
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
                                            📋 e-FRRO Details
                                        </p>
                                        <div style="background: #ffffff; border-radius: 8px; padding: 16px; border: 1px solid #e8ecf1;">
                                            <table width="100%" style="border-collapse: collapse;">
                                                <tr>
                                                    <td style="padding: 6px 0; color: #4a5568;">PG</td>
                                                    <td style="padding: 6px 0; text-align: right; font-weight: 500; color: #000000;">${tenantData.pg_name || 'N/A'}</td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 6px 0; color: #4a5568;">Room</td>
                                                    <td style="padding: 6px 0; text-align: right; font-weight: 500; color: #000000;">${tenantData.room_number || 'N/A'}</td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 6px 0; color: #4a5568;">Valid From</td>
                                                    <td style="padding: 6px 0; text-align: right; font-weight: 500; color: #000000;">${tenantData.efrro_from ? new Date(tenantData.efrro_from).toLocaleDateString('en-IN') : 'N/A'}</td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 6px 0; color: #4a5568;">Valid Till</td>
                                                    <td style="padding: 6px 0; text-align: right; font-weight: 600; color: ${urgencyColor};">${expiryDate}</td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 6px 0; color: #4a5568;">Days Remaining</td>
                                                    <td style="padding: 6px 0; text-align: right; font-weight: 700; color: ${urgencyColor}; font-size: 18px;">${daysUntilExpiry} days</td>
                                                </tr>
                                            </table>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 40px 30px;">
                            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="background: #f8faf5; border-radius: 8px; border-left: 4px solid ${urgencyColor};">
                                <tr>
                                    <td style="padding: 16px 20px;">
                                        <div style="display: flex; align-items: flex-start;">
                                            <span style="font-size: 18px; margin-right: 12px;">📌</span>
                                            <div>
                                                <p style="color: #000000; font-size: 14px; font-weight: 600; margin: 0 0 4px 0;">
                                                    Action Required
                                                </p>
                                                <p style="color: #4a5568; font-size: 13px; line-height: 1.5; margin: 0;">
                                                    Please renew your e-FRRO before the expiry date to avoid any legal complications. 
                                                    Contact the Livinkey admin for assistance with the renewal process.
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
                                            <span style="font-weight: 600; color: #000000;">Livinkey</span> · e-FRRO Management
                                        </p>
                                        <p style="margin: 0 0 4px 0; color: #718096; font-size: 12px;">
                                            This is an automated message, please do not reply.
                                        </p>
                                        <p style="margin: 0; color: #a0aec0; font-size: 11px;">
                                            &copy; ${new Date().getFullYear()} Livinkey. All rights reserved.
                                        </p>
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

// NEW: Send e-FRRO expiry notification to Super Admin
const sendEFRROExpiryAdminEmail = async (adminEmail, adminName, expiringTenants) => {
    // Build tenant list table
    let tenantRows = '';
    expiringTenants.forEach((tenant, index) => {
        const days = tenant.days_until_expiry;
        let urgencyColor = '#e67e22';
        let urgencyBadge = '⚠️';
        if (days <= 7) {
            urgencyColor = '#e74c3c';
            urgencyBadge = '🚨 URGENT';
        } else if (days <= 14) {
            urgencyColor = '#e67e22';
            urgencyBadge = '🔴 Soon';
        } else {
            urgencyColor = '#92C24A';
            urgencyBadge = '🟡 Upcoming';
        }
        
        tenantRows += `
            <tr style="${index % 2 === 0 ? 'background: #f8faf5;' : ''}">
                <td style="padding: 10px 8px; color: #000000; font-weight: 500;">${tenant.full_name}</td>
                <td style="padding: 10px 8px; color: #4a5568;">${tenant.pg_name || 'N/A'}</td>
                <td style="padding: 10px 8px; color: #4a5568;">${tenant.room_number || 'N/A'}</td>
                <td style="padding: 10px 8px; color: #4a5568;">${tenant.email}</td>
                <td style="padding: 10px 8px; color: #4a5568;">${tenant.phone || 'N/A'}</td>
                <td style="padding: 10px 8px; text-align: center; color: ${urgencyColor}; font-weight: 600;">${days} days</td>
                <td style="padding: 10px 8px; text-align: center;"><span style="background: ${urgencyColor}; color: #ffffff; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 600;">${urgencyBadge}</span></td>
            </tr>
        `;
    });

    await transporter.sendMail({
        from: `"Livinkey System" <${process.env.EMAIL_USER}>`,
        to: adminEmail,
        subject: `🚨 e-FRRO Expiry Alert - ${expiringTenants.length} tenant(s) expiring soon`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>e-FRRO Expiry Alert - Admin</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
                </style>
            </head>
            <body style="margin: 0; padding: 0; background-color: #f4f6f9; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 700px; background-color: #ffffff; margin: 40px auto; border-radius: 16px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06); overflow: hidden;">
                    <tr>
                        <td style="background: #e74c3c; padding: 40px 30px 30px; text-align: center;">
                            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center">
                                        <div style="display: inline-block; background: rgba(255, 255, 255, 0.15); padding: 12px 24px; border-radius: 50px; backdrop-filter: blur(10px);">
                                            <span style="color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: 1px;">🚨 Livinkey</span>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="padding-top: 12px;">
                                        <span style="color: rgba(255, 255, 255, 0.9); font-size: 14px; font-weight: 400; letter-spacing: 2px;">e-FRRO EXPIRY REPORT</span>
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
                                        Hello ${adminName}!
                                    </td>
                                </tr>
                                <tr>
                                    <td style="color: #4a5568; font-size: 16px; line-height: 1.6; text-align: center; padding-bottom: 10px;">
                                        <strong style="color: #e74c3c;">${expiringTenants.length} tenant(s)</strong> have e-FRRO documents expiring within the next 30 days.
                                        Please review the list below and take appropriate action.
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 40px 30px;">
                            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="background: #f8faf5; border-radius: 12px; border: 1px solid #e8ecf1;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <p style="color: #000000; font-size: 16px; font-weight: 600; margin: 0 0 16px 0; text-align: center;">
                                            📋 Expiring e-FRRO List
                                        </p>
                                        <div style="background: #ffffff; border-radius: 8px; padding: 10px; border: 1px solid #e8ecf1; overflow-x: auto;">
                                            <table width="100%" style="border-collapse: collapse; font-size: 13px;">
                                                <thead>
                                                    <tr style="background: #92C24A; color: #ffffff;">
                                                        <th style="padding: 10px 8px; text-align: left;">Name</th>
                                                        <th style="padding: 10px 8px; text-align: left;">PG</th>
                                                        <th style="padding: 10px 8px; text-align: left;">Room</th>
                                                        <th style="padding: 10px 8px; text-align: left;">Email</th>
                                                        <th style="padding: 10px 8px; text-align: left;">Phone</th>
                                                        <th style="padding: 10px 8px; text-align: center;">Days Left</th>
                                                        <th style="padding: 10px 8px; text-align: center;">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    ${tenantRows}
                                                </tbody>
                                            </table>
                                        </div>
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
                                            <span style="font-size: 18px; margin-right: 12px;">📌</span>
                                            <div>
                                                <p style="color: #000000; font-size: 14px; font-weight: 600; margin: 0 0 4px 0;">
                                                    Recommended Actions
                                                </p>
                                                <ul style="color: #4a5568; font-size: 13px; line-height: 1.8; margin: 0; padding-left: 20px;">
                                                    <li>Contact tenants with <strong style="color: #e74c3c;">7 or fewer days</strong> remaining immediately</li>
                                                    <li>Assist tenants with the e-FRRO renewal process</li>
                                                    <li>Verify updated e-FRRO documents after renewal</li>
                                                    <li>Update the system with new e-FRRO expiry dates</li>
                                                </ul>
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
                                            <span style="font-weight: 600; color: #000000;">Livinkey</span> · e-FRRO Management
                                        </p>
                                        <p style="margin: 0 0 4px 0; color: #718096; font-size: 12px;">
                                            This is an automated system alert.
                                        </p>
                                        <p style="margin: 0; color: #a0aec0; font-size: 11px;">
                                            &copy; ${new Date().getFullYear()} Livinkey. All rights reserved.
                                        </p>
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

// NEW: Send welcome email to guest user
const sendWelcomeGuestEmail = async (email, guestName, nationality, country_code, phone) => {
    await transporter.sendMail({
        from: `"Livinkey" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "🎉 Welcome to Livinkey - Your Guest Account",
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
                                        <span style="color: rgba(255, 255, 255, 0.9); font-size: 14px; font-weight: 400; letter-spacing: 2px;">GUEST ACCESS GRANTED</span>
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
                                        Welcome to Livinkey, ${guestName}!
                                    </td>
                                </tr>
                                <tr>
                                    <td style="color: #4a5568; font-size: 16px; line-height: 1.6; text-align: center; padding-bottom: 10px;">
                                        Your guest account has been created successfully. 
                                        You now have access to explore PGs and find your perfect stay.
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
                                                <strong style="color: #000000;">Phone:</strong>
                                            </p>
                                            <p style="color: #000000; font-size: 16px; font-weight: 500; margin: 0;">
                                                ${country_code} ${phone}
                                            </p>
                                        </div>
                                        <div style="background: #ffffff; border-radius: 8px; padding: 16px; border: 1px solid #e8ecf1;">
                                            <p style="color: #4a5568; font-size: 14px; margin: 0 0 4px 0;">
                                                <strong style="color: #000000;">Nationality:</strong>
                                            </p>
                                            <p style="color: #000000; font-size: 16px; font-weight: 500; margin: 0;">
                                                ${nationality}
                                            </p>
                                        </div>
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
                                                    Login to your account to explore PGs, view ratings, and find the perfect place to stay.
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
                                            <span style="font-weight: 600; color: #000000;">Livinkey</span> · Guest Dashboard
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
    sendWelcomeGuestEmail,
    sendGuestMessageEmail,
    sendPasswordResetEmail,
    sendBillEmail,
    sendFineNotificationEmail,
    sendCustomBillMessageEmail,
    sendCashPaymentOTPEmail,
    sendPaymentLinkEmail,
    sendEFRROExpiryTenantEmail,
    sendEFRROExpiryAdminEmail
};