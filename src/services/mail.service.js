const transporter = require("../config/mail");
const { 
    buildEmailTemplate, 
    buildOTPContent, 
    buildWelcomeContent, 
    buildBillContent,
    buildCustomMessageContent,
    buildEFRROExpiryContent 
} = require("../utils/email.template");

// ============ OTP EMAIL ============
const sendOTPEmail = async (email, otp, purpose = "Login") => {
    const content = buildOTPContent(otp, purpose);
    const html = buildEmailTemplate({
        title: `🔐 Livinkey ${purpose} Verification`,
        content,
        headerIcon: '🔐',
        headerLabel: 'Livinkey',
        headerColor: '#92C24A',
        alertMessage: `If you didn't request this code, please ignore this email. Your account remains secure.`,
        alertColor: '#92C24A',
        footerText: 'This is an automated message, please do not reply.'
    });

    await transporter.sendMail({
        from: `"Livinkey" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `🔐 Livinkey ${purpose} Verification`,
        html
    });
};

// ============ WELCOME ADMIN EMAIL ============
const sendWelcomeAdminEmail = async (email, name, temporaryPassword) => {
    const content = buildWelcomeContent(name, email, temporaryPassword);
    const html = buildEmailTemplate({
        title: '🎉 Welcome to Livinkey - Your Admin Account',
        content,
        headerIcon: '🎉',
        headerLabel: 'Livinkey',
        headerColor: '#92C24A',
        alertMessage: 'Login to your dashboard to manage tenants, guests, bills, and more. Explore the features and start managing your properties efficiently.',
        alertColor: '#92C24A',
        footerText: 'This is an automated message, please do not reply.'
    });

    await transporter.sendMail({
        from: `"Livinkey" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "🎉 Welcome to Livinkey - Your Admin Account",
        html
    });
};

// ============ WELCOME TENANT EMAIL ============
const sendWelcomeTenantEmail = async (email, name, role, password, pgName = null, roomNumber = null) => {
    const roleLabel = role === 'tenant' ? 'Tenant' : 'Guest';
    const extraFields = {};
    if (role === 'tenant') {
        if (pgName) extraFields['PG'] = pgName;
        if (roomNumber) extraFields['Room'] = roomNumber;
    }

    const content = buildWelcomeContent(name, email, password, extraFields);
    const html = buildEmailTemplate({
        title: `🎉 Welcome to Livinkey - Your ${roleLabel} Account`,
        content,
        headerIcon: '🏠',
        headerLabel: 'Livinkey',
        headerColor: '#92C24A',
        alertMessage: `Download the Livinkey app to access your account, view your property details, and manage your stay.`,
        alertColor: '#92C24A',
        footerText: 'This is an automated message, please do not reply.'
    });

    await transporter.sendMail({
        from: `"Livinkey" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `🎉 Welcome to Livinkey - Your ${roleLabel} Account`,
        html
    });
};

// ============ WELCOME GUEST EMAIL ============
const sendWelcomeGuestEmail = async (email, guestName, nationality, country_code, phone) => {
    const extraFields = {
        'Phone': `${country_code} ${phone}`,
        'Nationality': nationality
    };
    
    const content = buildWelcomeContent(guestName, email, '********', extraFields);
    const html = buildEmailTemplate({
        title: '🎉 Welcome to Livinkey - Your Guest Account',
        content,
        headerIcon: '🎉',
        headerLabel: 'Livinkey',
        headerColor: '#92C24A',
        alertMessage: 'Login to your account to explore PGs, view ratings, and find the perfect place to stay.',
        alertColor: '#92C24A',
        footerText: 'This is an automated message, please do not reply.'
    });

    await transporter.sendMail({
        from: `"Livinkey" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "🎉 Welcome to Livinkey - Your Guest Account",
        html
    });
};

// ============ GUEST MESSAGE EMAIL ============
const sendGuestMessageEmail = async (email, guestName, adminName, message, subject = null) => {
    const formattedMessage = message.replace(/\n/g, '<br>');
    const emailSubject = subject || `📩 Message from Livinkey Admin`;

    const content = `
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
    <tr>
        <td style="padding: 20px 0;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="background: #f8faf5; border-radius: 12px; border: 1px solid #e8ecf1;">
                <tr>
                    <td style="padding: 30px;">
                        <p style="color: #000000; font-size: 16px; font-weight: 600; margin: 0 0 12px 0; text-align: center;">📝 Message</p>
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
    `;

    const html = buildEmailTemplate({
        title: emailSubject,
        content,
        headerIcon: '📩',
        headerLabel: 'Livinkey',
        headerColor: '#92C24A',
        alertMessage: 'If you have any questions, please reply to this email or contact the Livinkey support team.',
        alertColor: '#92C24A',
        footerText: 'This is an automated message from the Livinkey admin panel.'
    });

    await transporter.sendMail({
        from: `"Livinkey Admin" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: emailSubject,
        html
    });
};

// ============ PASSWORD RESET EMAIL ============
const sendPasswordResetEmail = async (email, name) => {
    const content = `
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
    <tr>
        <td style="padding: 20px 0;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="background: #f8faf5; border-radius: 12px; border: 1px solid #e8ecf1;">
                <tr>
                    <td style="padding: 30px; text-align: center;">
                        <p style="color: #000000; font-size: 16px; font-weight: 600; margin: 0 0 16px 0;">
                            Check your email for the OTP code
                        </p>
                        <div style="background: #ffffff; border-radius: 8px; padding: 16px; border: 2px dashed #92C24A;">
                            <span style="color: #000000; font-size: 16px; font-weight: 500; font-family: 'Courier New', monospace;">
                                You will need to enter the OTP to proceed
                            </span>
                        </div>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
    `;

    const html = buildEmailTemplate({
        title: '🔑 Password Reset Request - Livinkey',
        content,
        headerIcon: '🔑',
        headerLabel: 'Livinkey',
        headerColor: '#92C24A',
        alertMessage: 'If you didn\'t request this password reset, please ignore this email. Your account remains secure.',
        alertColor: '#e74c3c',
        footerText: 'This is an automated message, please do not reply.'
    });

    await transporter.sendMail({
        from: `"Livinkey" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "🔑 Password Reset Request - Livinkey",
        html
    });
};

// ============ BILL EMAIL ============
const sendBillEmail = async (email, tenantName, billData, qrCodeUrl, partialQrUrl, meterImageUrl = null, adminQrUrl = null) => {
    const totalAmount = parseFloat(billData.total_amount) || 0;
    const fineAmount = parseFloat(billData.fine_amount) || 0;
    const totalDue = totalAmount + fineAmount;
    const partialAmount = totalDue * 0.5;

    const content = buildBillContent(billData, totalDue, partialAmount, qrCodeUrl, partialQrUrl, meterImageUrl, adminQrUrl);
    
    const html = buildEmailTemplate({
        title: '📄 New Bill Generated - Livinkey',
        content: `
        <tr>
            <td style="color: #000000; font-size: 24px; font-weight: 600; padding-bottom: 8px; text-align: center;">
                Hello ${tenantName}!
            </td>
        </tr>
        ${content}
        `,
        headerIcon: '📄',
        headerLabel: 'Livinkey',
        headerColor: '#92C24A',
        footerText: 'This is an automated message, please do not reply.'
    });

    await transporter.sendMail({
        from: `"Livinkey" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `📄 New Bill Generated - Livinkey`,
        html
    });
};

// ============ FINE NOTIFICATION EMAIL ============
const sendFineNotificationEmail = async (email, tenantName, billData, fineAmount, daysDelayed, hasPartialPayment, fullQrUrl, partialQrUrl) => {
    const totalAmount = parseFloat(billData.total_amount) || 0;
    const previousFine = parseFloat(billData.fine_amount) || 0;
    const newTotal = totalAmount + fineAmount;
    const fineAdded = fineAmount - previousFine;
    const partialAmount = newTotal * 0.5;
    const daysOverdue = daysDelayed;

    const content = `
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
    <tr>
        <td style="padding: 20px 0;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="background: #f8faf5; border-radius: 12px; border: 1px solid #e8ecf1;">
                <tr>
                    <td style="padding: 30px;">
                        <p style="color: #000000; font-size: 16px; font-weight: 600; margin: 0 0 16px 0; text-align: center;">💰 Updated Bill Details</p>
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
        <td style="padding: 0 40px 20px;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="background: #f8faf5; border-radius: 12px; border: 1px solid #e8ecf1;">
                <tr>
                    <td style="padding: 30px; text-align: center;">
                        <p style="color: #000000; font-size: 16px; font-weight: 600; margin: 0 0 16px 0;">📱 Scan to Pay Full Amount</p>
                        <div style="display: inline-block; background: #ffffff; border-radius: 8px; padding: 16px; border: 1px solid #e8ecf1;">
                            <img src="${fullQrUrl}" alt="Payment QR Code" style="width: 200px; height: 200px; display: block; margin: 0 auto;">
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
        <td style="padding: 0 40px 20px;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="background: #f8faf5; border-radius: 12px; border: 1px solid #e8ecf1;">
                <tr>
                    <td style="padding: 30px; text-align: center;">
                        <p style="color: #000000; font-size: 14px; font-weight: 600; margin: 0 0 12px 0;">💳 Partial Payment (50%)</p>
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
    </tr>
    `;

    const html = buildEmailTemplate({
        title: '⚠️ Late Payment Fee Applied - Livinkey',
        content,
        headerIcon: '⚠️',
        headerLabel: 'Livinkey',
        headerColor: '#e74c3c',
        alertMessage: 'Please pay your outstanding bill as soon as possible to avoid additional late fees. New QR codes have been generated with the updated total amount.',
        alertColor: '#e74c3c',
        footerText: 'This is an automated message, please do not reply.'
    });

    await transporter.sendMail({
        from: `"Livinkey" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `⚠️ Late Payment Fee Applied - Livinkey`,
        html
    });
};

// ============ CUSTOM BILL MESSAGE EMAIL ============
const sendCustomBillMessageEmail = async (email, tenantName, adminName, subject, message, qrCodeUrl, adminQrUrl, totalDue, pgName, roomNumber, qrExpiresAt) => {
    const content = buildCustomMessageContent(adminName, message, pgName, roomNumber, totalDue, qrCodeUrl, adminQrUrl, qrExpiresAt);
    
    const html = buildEmailTemplate({
        title: `📩 ${subject}`,
        content,
        headerIcon: '📩',
        headerLabel: 'Livinkey',
        headerColor: '#92C24A',
        footerText: 'This is an automated message from the Livinkey admin panel.'
    });

    await transporter.sendMail({
        from: `"Livinkey Admin" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `📩 ${subject}`,
        html
    });
};

// ============ CASH PAYMENT OTP EMAIL ============
const sendCashPaymentOTPEmail = async (email, tenantName, otp, amount, pgName, roomNumber) => {
    const content = `
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
    <tr>
        <td style="padding: 20px 0;">
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
    `;

    const html = buildEmailTemplate({
        title: '🔐 Cash Payment Verification OTP - Livinkey',
        content,
        headerIcon: '🔐',
        headerLabel: 'Livinkey',
        headerColor: '#92C24A',
        alertMessage: 'Do not share this OTP with anyone except the Livinkey admin who is processing your cash payment.',
        alertColor: '#e74c3c',
        footerText: 'This is an automated message, please do not reply.'
    });

    await transporter.sendMail({
        from: `"Livinkey Admin" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `🔐 Cash Payment Verification OTP - Livinkey`,
        html
    });
};

// ============ PAYMENT LINK EMAIL ============
const sendPaymentLinkEmail = async (email, tenantName, billData, paymentOptions, orderData) => {
    const totalDue = parseFloat(billData.total_amount) + parseFloat(billData.fine_amount || 0) - 
                     parseFloat(billData.paid_amount || 0) - parseFloat(billData.total_cash_paid || 0);

    const content = `
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
    <tr>
        <td style="padding: 20px 0;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="background: #f8faf5; border-radius: 12px; border: 1px solid #e8ecf1;">
                <tr>
                    <td style="padding: 30px;">
                        <p style="color: #000000; font-size: 16px; font-weight: 600; margin: 0 0 16px 0; text-align: center;">💰 Payment Details</p>
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
        <td style="padding: 0 40px 20px;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="background: #f8faf5; border-radius: 12px; border: 1px solid #e8ecf1;">
                <tr>
                    <td style="padding: 30px; text-align: center;">
                        <p style="color: #000000; font-size: 16px; font-weight: 600; margin: 0 0 16px 0;">📱 Scan to Pay</p>
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
        <td style="padding: 0 40px 20px;">
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
    `;

    const html = buildEmailTemplate({
        title: '💳 Payment Link - Livinkey',
        content,
        headerIcon: '💳',
        headerLabel: 'Livinkey',
        headerColor: '#92C24A',
        alertMessage: 'Your payment is processed securely through encrypted channels. All transactions are protected.',
        alertColor: '#92C24A',
        footerText: 'This is an automated message, please do not reply.'
    });

    await transporter.sendMail({
        from: `"Livinkey Payments" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `💳 Payment Link - Livinkey`,
        html
    });
};

// ============ E-FRRO EXPIRY TENANT EMAIL ============
const sendEFRROExpiryTenantEmail = async (email, tenantName, tenantData) => {
    const daysUntilExpiry = tenantData.days_until_expiry;
    let urgencyColor = '#e67e22';
    let urgencyLevel = '⚠️';
    
    if (daysUntilExpiry <= 7) {
        urgencyColor = '#e74c3c';
        urgencyLevel = '🚨 URGENT';
    } else if (daysUntilExpiry <= 14) {
        urgencyColor = '#e67e22';
        urgencyLevel = '🔴 Soon';
    }

    const content = buildEFRROExpiryContent(tenantData, daysUntilExpiry, urgencyColor);
    
    const html = buildEmailTemplate({
        title: `⚠️ e-FRRO Expiry Alert - ${daysUntilExpiry} days remaining`,
        content: `
        <tr>
            <td style="color: #000000; font-size: 24px; font-weight: 600; padding-bottom: 8px; text-align: center;">
                Hello ${tenantName}!
            </td>
        </tr>
        ${content}
        `,
        headerIcon: urgencyLevel,
        headerLabel: 'Livinkey',
        headerColor: urgencyColor,
        alertMessage: 'Please renew your e-FRRO before the expiry date to avoid any legal complications. Contact the Livinkey admin for assistance with the renewal process.',
        alertColor: urgencyColor,
        footerText: 'This is an automated message, please do not reply.'
    });

    await transporter.sendMail({
        from: `"Livinkey" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `⚠️ e-FRRO Expiry Alert - ${daysUntilExpiry} days remaining`,
        html
    });
};

// ============ E-FRRO EXPIRY ADMIN EMAIL ============
const sendEFRROExpiryAdminEmail = async (adminEmail, adminName, expiringTenants) => {
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

    const content = `
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
    <tr>
        <td style="padding: 20px 0;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="background: #f8faf5; border-radius: 12px; border: 1px solid #e8ecf1;">
                <tr>
                    <td style="padding: 20px;">
                        <p style="color: #000000; font-size: 16px; font-weight: 600; margin: 0 0 16px 0; text-align: center;">📋 Expiring e-FRRO List</p>
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
    `;

    const html = buildEmailTemplate({
        title: `🚨 e-FRRO Expiry Alert - ${expiringTenants.length} tenant(s) expiring soon`,
        content,
        headerIcon: '🚨',
        headerLabel: 'Livinkey',
        headerColor: '#e74c3c',
        alertMessage: `
            <strong>Recommended Actions:</strong><br>
            • Contact tenants with <strong style="color: #e74c3c;">7 or fewer days</strong> remaining immediately<br>
            • Assist tenants with the e-FRRO renewal process<br>
            • Verify updated e-FRRO documents after renewal<br>
            • Update the system with new e-FRRO expiry dates
        `,
        alertColor: '#e74c3c',
        footerText: 'This is an automated system alert.'
    });

    await transporter.sendMail({
        from: `"Livinkey System" <${process.env.EMAIL_USER}>`,
        to: adminEmail,
        subject: `🚨 e-FRRO Expiry Alert - ${expiringTenants.length} tenant(s) expiring soon`,
        html
    });
};


// ============================================================
// NEW: Maintenance Completion Reminder Email
// ============================================================
const sendMaintenanceCompletionReminder = async (email, tenantName, requestData) => {
    const content = `
    <tr>
        <td style="color: #000000; font-size: 24px; font-weight: 600; padding-bottom: 8px; text-align: center;">
            Hello ${tenantName}!
        </td>
    </tr>
    <tr>
        <td style="color: #4a5568; font-size: 16px; line-height: 1.6; text-align: center; padding-bottom: 10px;">
            We noticed your maintenance request for <strong>${requestData.issue_type}</strong> 
            at <strong>${requestData.pg_name || 'Livinkey'}</strong> (Room ${requestData.room_number || 'N/A'}) 
            is still in progress.
        </td>
    </tr>
    <tr>
        <td style="padding: 20px 0;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="background: #f8faf5; border-radius: 12px; border: 1px solid #e8ecf1;">
                <tr>
                    <td style="padding: 30px; text-align: center;">
                        <div style="background: #ffffff; border-radius: 8px; padding: 20px; border: 2px dashed #92C24A;">
                            <span style="font-size: 24px; font-weight: 700; color: #000000; font-family: 'Courier New', monospace;">
                                🔧 Is your maintenance completed?
                            </span>
                        </div>
                        <p style="color: #4a5568; font-size: 14px; margin-top: 16px; margin-bottom: 0;">
                            Please open the Livinkey app and mark your maintenance request as <strong style="color: #92C24A;">completed</strong> 
                            if the work has been finished.
                        </p>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
    <tr>
        <td style="padding: 10px 0; text-align: center;">
            <a href="${process.env.APP_URL}/tenant-maintenance" target="_blank" style="display: inline-block; background-color: #92C24A; color: #000000; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px;">
                Open Maintenance
            </a>
        </td>
    </tr>
    `;

    const html = buildEmailTemplate({
        title: '🔧 Is Your Maintenance Completed?',
        content,
        headerIcon: '🔧',
        headerLabel: 'Livinkey',
        headerColor: '#92C24A',
        alertMessage: 'If the maintenance work is not yet complete, please contact your admin. If it is complete, mark it as done in the app.',
        alertColor: '#e67e22',
        footerText: 'This is an automated reminder, please do not reply.'
    });

    await transporter.sendMail({
        from: `"Livinkey" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `🔧 Is Your Maintenance Completed? - Livinkey`,
        html
    });
};

/**
 * Send fine adjusted email to tenant
 */
const sendFineAdjustedEmail = async (email, tenantName, billData, oldFine, newFine, reason) => {
    const totalAmount = parseFloat(billData.total_amount) || 0;
    const paidAmount = parseFloat(billData.paid_amount) || 0;
    const newTotalDue = totalAmount + newFine - paidAmount;
    const reductionAmount = oldFine - newFine;

    const content = `
    <tr>
        <td style="color: #000000; font-size: 24px; font-weight: 600; padding-bottom: 8px; text-align: center;">
            Hello ${tenantName}!
        </td>
    </tr>
    <tr>
        <td style="color: #4a5568; font-size: 16px; line-height: 1.6; text-align: center; padding-bottom: 10px;">
            Your late fee has been adjusted by the admin.
        </td>
    </tr>
    <tr>
        <td style="padding: 20px 0;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="background: #f8faf5; border-radius: 12px; border: 1px solid #e8ecf1;">
                <tr>
                    <td style="padding: 30px;">
                        <p style="color: #000000; font-size: 16px; font-weight: 600; margin: 0 0 16px 0; text-align: center;">💰 Fine Adjustment Details</p>
                        <div style="background: #ffffff; border-radius: 8px; padding: 16px; border: 1px solid #e8ecf1;">
                            <table width="100%" style="border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 6px 0; color: #4a5568;">Previous Late Fee</td>
                                    <td style="padding: 6px 0; text-align: right; font-weight: 500; color: #e74c3c;">₹${oldFine.toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 6px 0; color: #2ecc71; font-weight: 600;">Reduction</td>
                                    <td style="padding: 6px 0; text-align: right; font-weight: 600; color: #2ecc71;">- ₹${reductionAmount.toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 6px 0; color: #4a5568;">New Late Fee</td>
                                    <td style="padding: 6px 0; text-align: right; font-weight: 500; color: ${newFine === 0 ? '#2ecc71' : '#e67e22'};">₹${newFine.toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0 0 0; border-top: 2px solid #e8ecf1; font-weight: 600; color: #000000;">New Total Due</td>
                                    <td style="padding: 10px 0 0 0; border-top: 2px solid #e8ecf1; text-align: right; font-weight: 700; color: #92C24A; font-size: 18px;">₹${newTotalDue.toFixed(2)}</td>
                                </tr>
                            </table>
                        </div>
                        ${reason ? `
                        <div style="background: #f8faf5; border-radius: 8px; padding: 12px 16px; margin-top: 12px;">
                            <span style="font-size: 13px; color: #666; font-weight: 500;">Reason for adjustment:</span>
                            <p style="font-size: 13px; color: #555; margin-top: 4px;">${reason}</p>
                        </div>` : ''}
                    </td>
                </tr>
            </table>
        </td>
    </tr>
    `;

    const html = buildEmailTemplate({
        title: '💰 Late Fee Adjusted - Livinkey',
        content,
        headerIcon: '💰',
        headerLabel: 'Livinkey',
        headerColor: '#92C24A',
        alertMessage: 'Please check your updated bill in the Livinkey app. Your QR codes have been regenerated with the new total amount.',
        alertColor: '#92C24A',
        footerText: 'This is an automated message, please do not reply.'
    });

    await transporter.sendMail({
        from: `"Livinkey" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `💰 Late Fee Adjusted - Livinkey`,
        html
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
    sendEFRROExpiryAdminEmail,
    sendMaintenanceCompletionReminder
};