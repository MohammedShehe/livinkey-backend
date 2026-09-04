/**
 * Build HTML email template with consistent styling
 * @param {Object} params - Email parameters
 * @param {string} params.title - Email title
 * @param {string} params.content - Main content (HTML)
 * @param {string} params.headerColor - Header background color (default: #92C24A)
 * @param {string} params.headerIcon - Header icon (default: 🔐)
 * @param {string} params.headerLabel - Header label (default: Livinkey)
 * @param {string} params.buttonUrl - Optional button URL
 * @param {string} params.buttonText - Optional button text
 * @param {string} params.alertMessage - Optional alert message (with color)
 * @param {string} params.alertColor - Alert color (default: #92C24A)
 * @param {string} params.footerText - Footer text
 * @returns {string} - HTML email template
 */
const buildEmailTemplate = ({
    title,
    content,
    headerColor = '#92C24A',
    headerIcon = '🔐',
    headerLabel = 'Livinkey',
    buttonUrl = null,
    buttonText = null,
    alertMessage = null,
    alertColor = '#92C24A',
    footerText = 'This is an automated message, please do not reply.'
}) => {
    const buttonHtml = buttonUrl && buttonText 
        ? `
        <tr>
            <td style="padding: 20px 40px 30px; text-align: center;">
                <a href="${buttonUrl}" target="_blank" style="display: inline-block; background-color: #92C24A; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                    ${buttonText}
                </a>
            </td>
        </tr>` 
        : '';

    const alertHtml = alertMessage 
        ? `
        <tr>
            <td style="padding: 0 40px 30px;">
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="background: #f8faf5; border-radius: 8px; border-left: 4px solid ${alertColor};">
                    <tr>
                        <td style="padding: 16px 20px;">
                            <div style="display: flex; align-items: flex-start;">
                                <span style="font-size: 18px; margin-right: 12px;">ℹ️</span>
                                <div>
                                    <p style="color: #000000; font-size: 14px; font-weight: 600; margin: 0 0 4px 0;">Note</p>
                                    <p style="color: #4a5568; font-size: 13px; line-height: 1.5; margin: 0;">${alertMessage}</p>
                                </div>
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>` 
        : '';

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f6f9; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; margin: 40px auto; border-radius: 16px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06); overflow: hidden;">
            <tr>
                <td style="background: ${headerColor}; padding: 40px 30px 30px; text-align: center;">
                    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                            <td align="center">
                                <div style="display: inline-block; background: rgba(255, 255, 255, 0.15); padding: 12px 24px; border-radius: 50px; backdrop-filter: blur(10px);">
                                    <span style="color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: 1px;">${headerIcon} ${headerLabel}</span>
                                </div>
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
                                ${title}
                            </td>
                        </tr>
                        ${content}
                    </table>
                </td>
            </tr>
            ${alertHtml}
            ${buttonHtml}
            <tr>
                <td style="background: #f8faf5; padding: 30px 40px; border-top: 1px solid #e8ecf1;">
                    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                            <td align="center" style="color: #4a5568; font-size: 13px; line-height: 1.6;">
                                <p style="margin: 0 0 4px 0;">
                                    <span style="font-weight: 600; color: #000000;">${headerLabel}</span> · System Notification
                                </p>
                                <p style="margin: 0 0 4px 0; color: #718096; font-size: 12px;">
                                    ${footerText}
                                </p>
                                <p style="margin: 0; color: #a0aec0; font-size: 11px;">
                                    &copy; 2022 ${headerLabel}. All rights reserved.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;
};

/**
 * Build OTP email content
 * @param {string} otp - OTP code
 * @param {string} purpose - Purpose of OTP (Login, Forgot Password, etc.)
 * @returns {string} - OTP HTML content
 */
const buildOTPContent = (otp, purpose = "Login") => {
    return `
    <tr>
        <td style="color: #4a5568; font-size: 16px; line-height: 1.6; text-align: center; padding-bottom: 10px;">
            Enter the verification code below to complete your ${purpose.toLowerCase()}.
        </td>
    </tr>
    <tr>
        <td style="padding: 20px 0;">
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
    `;
};

/**
 * Build welcome email content
 * @param {string} name - User name
 * @param {string} email - User email
 * @param {string} password - Temporary password
 * @param {Object} extraFields - Extra fields to display
 * @returns {string} - Welcome HTML content
 */
const buildWelcomeContent = (name, email, password, extraFields = {}) => {
    let extraHtml = '';
    for (const [key, value] of Object.entries(extraFields)) {
        if (value) {
            extraHtml += `
            <div style="background: #ffffff; border-radius: 8px; padding: 16px; border: 1px solid #e8ecf1; margin-bottom: 12px;">
                <p style="color: #4a5568; font-size: 14px; margin: 0 0 4px 0;">
                    <strong style="color: #000000;">${key}:</strong>
                </p>
                <p style="color: #000000; font-size: 16px; font-weight: 500; margin: 0;">${value}</p>
            </div>`;
        }
    }

    return `
    <tr>
        <td style="color: #000000; font-size: 24px; font-weight: 600; padding-bottom: 8px; text-align: center;">
            Welcome to Livinkey, ${name}!
        </td>
    </tr>
    <tr>
        <td style="color: #4a5568; font-size: 16px; line-height: 1.6; text-align: center; padding-bottom: 10px;">
            Your account has been created successfully. You now have access to the Livinkey platform.
        </td>
    </tr>
    <tr>
        <td style="padding: 20px 0;">
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
                        ${extraHtml}
                        <p style="color: #e74c3c; font-size: 14px; margin-top: 16px; margin-bottom: 0; text-align: center;">
                            ⚠️ Please change your password after your first login for security.
                        </p>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
    `;
};

/**
 * Build bill content for email
 * @param {Object} billData - Bill data
 * @param {number} totalDue - Total due amount
 * @param {number} partialAmount - Partial amount (50%)
 * @param {string} qrCodeUrl - Full payment QR code URL
 * @param {string} partialQrUrl - Partial payment QR code URL
 * @param {string} meterImageUrl - Meter image URL
 * @param {string} adminQrUrl - Admin QR code URL
 * @returns {string} - Bill HTML content
 */
const buildBillContent = (billData, totalDue, partialAmount, qrCodeUrl, partialQrUrl, meterImageUrl, adminQrUrl, meterImageUrl2 = null) => {
    const fineAmount = parseFloat(billData.fine_amount) || 0;
    
    let meterHtml = '';
    if (meterImageUrl || meterImageUrl2) {
        const images = [];
        if (meterImageUrl) {
            images.push(`<img src="${meterImageUrl}" alt="Electricity Meter 1" style="max-width: 100%; max-height: 300px; border-radius: 8px; border: 1px solid #e8ecf1; margin: 4px;">`);
        }
        if (meterImageUrl2) {
            images.push(`<img src="${meterImageUrl2}" alt="Electricity Meter 2" style="max-width: 100%; max-height: 300px; border-radius: 8px; border: 1px solid #e8ecf1; margin: 4px;">`);
        }
        meterHtml = `
        <tr>
            <td style="padding: 0 40px 30px;">
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="background: #f8faf5; border-radius: 12px; border: 1px solid #e8ecf1;">
                    <tr>
                        <td style="padding: 20px; text-align: center;">
                            <p style="color: #000000; font-size: 14px; font-weight: 600; margin: 0 0 12px 0;">⚡ Electricity Meter Image${images.length > 1 ? 's' : ''}</p>
                            ${images.join('')}
                        </td>
                    </tr>
                </table>
            </td>
        </tr>`;
    }

    let adminQrHtml = '';
    if (adminQrUrl) {
        adminQrHtml = `
        <tr>
            <td style="padding: 0 40px 30px;">
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="background: #f8faf5; border-radius: 12px; border: 1px solid #e8ecf1;">
                    <tr>
                        <td style="padding: 30px; text-align: center;">
                            <p style="color: #000000; font-size: 16px; font-weight: 600; margin: 0 0 16px 0;">📱 Admin Provided QR Code</p>
                            <div style="display: inline-block; background: #ffffff; border-radius: 8px; padding: 16px; border: 1px solid #e8ecf1;">
                                <img src="${adminQrUrl}" alt="Admin QR Code" style="width: 200px; height: 200px; display: block; margin: 0 auto;">
                            </div>
                            <p style="color: #4a5568; font-size: 14px; margin-top: 12px; margin-bottom: 0;">
                                Scan this QR code to pay the full amount of <strong>₹${totalDue.toFixed(2)}</strong>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>`;
    }

    let fullQrHtml = '';
    if (qrCodeUrl) {
        fullQrHtml = `
        <tr>
            <td style="padding: 0 40px 30px;">
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="background: #f8faf5; border-radius: 12px; border: 1px solid #e8ecf1;">
                    <tr>
                        <td style="padding: 30px; text-align: center;">
                            <p style="color: #000000; font-size: 16px; font-weight: 600; margin: 0 0 16px 0;">📱 Auto-Generated Payment QR</p>
                            <div style="display: inline-block; background: #ffffff; border-radius: 8px; padding: 16px; border: 1px solid #e8ecf1;">
                                <img src="${qrCodeUrl}" alt="Payment QR Code" style="width: 200px; height: 200px; display: block; margin: 0 auto;">
                            </div>
                            <p style="color: #4a5568; font-size: 14px; margin-top: 12px; margin-bottom: 0;">
                                Scan this QR code to pay the full amount of <strong>₹${totalDue.toFixed(2)}</strong>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>`;
    }

    let partialQrHtml = '';
    if (partialQrUrl) {
        partialQrHtml = `
        <tr>
            <td style="padding: 0 40px 30px;">
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="background: #f8faf5; border-radius: 12px; border: 1px solid #e8ecf1;">
                    <tr>
                        <td style="padding: 30px; text-align: center;">
                            <p style="color: #000000; font-size: 14px; font-weight: 600; margin: 0 0 12px 0;">💳 Auto-Generated Partial Payment QR (50%)</p>
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
        </tr>`;
    }

    return `
    <tr>
        <td style="color: #4a5568; font-size: 16px; line-height: 1.6; text-align: center; padding-bottom: 10px;">
            A new bill has been generated for your stay at <strong>${billData.pg_name}</strong>, Room <strong>${billData.room_number}</strong>.
        </td>
    </tr>
    <tr>
        <td style="padding: 20px 0;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="background: #f8faf5; border-radius: 12px; border: 1px solid #e8ecf1;">
                <tr>
                    <td style="padding: 30px;">
                        <p style="color: #000000; font-size: 16px; font-weight: 600; margin: 0 0 16px 0; text-align: center;">💰 Bill Details</p>
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
                                    <td style="padding: 10px 0 0 0; border-top: 2px solid #e8ecf1; text-align: right; font-weight: 700; color: #92C24A; font-size: 18px;">₹${totalDue.toFixed(2)}</td>
                                </tr>
                            </table>
                        </div>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
    <tr>
        <td style="padding: 10px 0;">
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
    ${meterHtml}
    ${adminQrHtml}
    ${fullQrHtml}
    ${partialQrHtml}
    `;
};

/**
 * Build custom message content
 * @param {string} adminName - Admin name
 * @param {string} message - Message content
 * @param {string} pgName - PG name
 * @param {string} roomNumber - Room number
 * @param {number} totalDue - Total due amount
 * @param {string} qrCodeUrl - QR code URL
 * @param {string} adminQrUrl - Admin QR URL
 * @param {Date} qrExpiresAt - QR expiry date
 * @returns {string} - Custom message HTML content
 */
const buildCustomMessageContent = (adminName, message, pgName, roomNumber, totalDue, qrCodeUrl, adminQrUrl, qrExpiresAt) => {
    const formattedMessage = message.replace(/\n/g, '<br>');
    const expiryFormatted = qrExpiresAt ? new Date(qrExpiresAt).toLocaleString() : 'Not set';

    let adminQrHtml = '';
    if (adminQrUrl) {
        adminQrHtml = `
        <tr>
            <td style="padding: 0 40px 20px;">
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="background: #f8faf5; border-radius: 12px; border: 1px solid #e8ecf1;">
                    <tr>
                        <td style="padding: 20px; text-align: center;">
                            <p style="color: #000000; font-size: 14px; font-weight: 600; margin: 0 0 12px 0;">📱 Admin Provided QR Code</p>
                            <img src="${adminQrUrl}" alt="Admin QR Code" style="max-width: 200px; height: auto; border-radius: 8px; border: 1px solid #e8ecf1;">
                        </td>
                    </tr>
                </table>
            </td>
        </tr>`;
    }

    let qrHtml = '';
    if (qrCodeUrl) {
        qrHtml = `
        <tr>
            <td style="padding: 0 40px 20px;">
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="background: #f8faf5; border-radius: 12px; border: 1px solid #e8ecf1;">
                    <tr>
                        <td style="padding: 20px; text-align: center;">
                            <p style="color: #000000; font-size: 14px; font-weight: 600; margin: 0 0 12px 0;">💳 Payment QR Code</p>
                            <img src="${qrCodeUrl}" alt="Payment QR Code" style="max-width: 200px; height: auto; border-radius: 8px; border: 1px solid #e8ecf1;">
                            <p style="color: #4a5568; font-size: 13px; margin-top: 8px; margin-bottom: 0;">
                                Amount Due: <strong>₹${totalDue.toFixed(2)}</strong>
                            </p>
                            <p style="color: #e74c3c; font-size: 12px; margin-top: 4px; margin-bottom: 0;">
                                ⚠️ This QR code is valid until <strong>${expiryFormatted}</strong>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>`;
    }

    return `
    <tr>
        <td style="color: #4a5568; font-size: 16px; line-height: 1.6; text-align: center; padding-bottom: 10px;">
            You have received a message from <strong>${adminName}</strong> regarding your stay at <strong>${pgName || 'Livinkey'}</strong> (Room ${roomNumber || 'N/A'}).
        </td>
    </tr>
    <tr>
        <td style="padding: 10px 0;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="background: #f8faf5; border-radius: 12px; border: 1px solid #e8ecf1;">
                <tr>
                    <td style="padding: 20px;">
                        <p style="color: #000000; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">📝 Message</p>
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
    ${adminQrHtml}
    ${qrHtml}
    `;
};

/**
 * Build e-FRRO expiry content
 * @param {Object} tenantData - Tenant data
 * @param {number} daysUntilExpiry - Days until expiry
 * @param {string} urgencyColor - Color for urgency level
 * @returns {string} - e-FRRO expiry HTML content
 */
const buildEFRROExpiryContent = (tenantData, daysUntilExpiry, urgencyColor) => {
    const expiryDate = new Date(tenantData.efrro_till).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    return `
    <tr>
        <td style="color: #4a5568; font-size: 16px; line-height: 1.6; text-align: center; padding-bottom: 10px;">
            <strong style="color: ${urgencyColor};">Your e-FRRO is expiring in ${daysUntilExpiry} day${daysUntilExpiry > 1 ? 's' : ''}.</strong>
        </td>
    </tr>
    <tr>
        <td style="padding: 20px 0;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="background: #f8faf5; border-radius: 12px; border: 1px solid #e8ecf1;">
                <tr>
                    <td style="padding: 30px;">
                        <p style="color: #000000; font-size: 16px; font-weight: 600; margin: 0 0 16px 0; text-align: center;">📋 e-FRRO Details</p>
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
    `;
};

module.exports = {
    buildEmailTemplate,
    buildOTPContent,
    buildWelcomeContent,
    buildBillContent,
    buildCustomMessageContent,
    buildEFRROExpiryContent
};