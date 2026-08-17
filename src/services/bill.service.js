const db = require("../config/db");
const fs = require("fs");
const BillModel = require("../models/bill.model");
const TenantModel = require("../models/tenant.model");
const { uploadFile, deleteFile } = require("./upload.service");
const paymentService = require("./payment.service");
const { sendPaymentLinkEmail } = require("./mail.service");
const { 
    sendBillEmail, 
    sendFineNotificationEmail, 
    sendCustomBillMessageEmail, 
    sendCashPaymentOTPEmail 
} = require("./mail.service");
const NotificationEventManager = require("../utils/notification.events");
const {
    generateQRCode,
    cleanupUploadedFiles,
    generateOTP,
    cleanupTempFiles,
    getQRExpiryTime
} = require("../utils/helpers");

// ============ REGENERATE BILL QR CODES ============
const regenerateBillQRCodes = async (billId, billData, totalDue) => {
    const connection = await db.getConnection();
    const uploadedCloudFiles = [];
    let tempFiles = [];
    let result = {
        fullQr: null,
        fullPublicId: null,
        fullResourceType: null,
        partialQr: null,
        partialPublicId: null,
        partialResourceType: null
    };

    try {
        if (totalDue <= 0) {
            if (billData.payment_qr_public_id) {
                try {
                    await deleteFile(billData.payment_qr_public_id, billData.payment_qr_resource_type);
                } catch (e) {}
            }
            if (billData.partial_payment_qr_public_id) {
                try {
                    await deleteFile(billData.partial_payment_qr_public_id, billData.partial_payment_qr_resource_type);
                } catch (e) {}
            }
            return result;
        }

        try {
            const fullPaymentData = {
                billId: billId,
                tenantId: billData.tenant_id,
                amount: totalDue,
                type: 'full_payment'
            };
            
            const fullQrPath = await generateQRCode(JSON.stringify(fullPaymentData), 'full');
            tempFiles.push(fullQrPath);
            
            const fullQrUpload = await uploadFile(
                { buffer: fs.readFileSync(fullQrPath), originalname: 'qr_full.png' },
                "livinkey/bills/qr"
            );

            if (fullQrUpload && fullQrUpload.secure_url) {
                result.fullQr = fullQrUpload.secure_url;
                result.fullPublicId = fullQrUpload.public_id;
                result.fullResourceType = fullQrUpload.resource_type;
                uploadedCloudFiles.push({ public_id: fullQrUpload.public_id, resource_type: fullQrUpload.resource_type });
            }
        } catch (qrError) {
            console.error("Failed to generate full payment QR:", qrError);
        }

        try {
            const partialAmount = totalDue * 0.5;
            const partialPaymentData = {
                billId: billId,
                tenantId: billData.tenant_id,
                amount: partialAmount,
                type: 'partial_payment'
            };
            
            const partialQrPath = await generateQRCode(JSON.stringify(partialPaymentData), 'partial');
            tempFiles.push(partialQrPath);
            
            const partialQrUpload = await uploadFile(
                { buffer: fs.readFileSync(partialQrPath), originalname: 'qr_partial.png' },
                "livinkey/bills/qr"
            );

            if (partialQrUpload && partialQrUpload.secure_url) {
                result.partialQr = partialQrUpload.secure_url;
                result.partialPublicId = partialQrUpload.public_id;
                result.partialResourceType = partialQrUpload.resource_type;
                uploadedCloudFiles.push({ public_id: partialQrUpload.public_id, resource_type: partialQrUpload.resource_type });
            }
        } catch (qrError) {
            console.error("Failed to generate partial payment QR:", qrError);
        }

        await cleanupTempFiles(tempFiles);
        return result;

    } catch (error) {
        await cleanupUploadedFiles(uploadedCloudFiles);
        await cleanupTempFiles(tempFiles);
        console.error("Regenerate QR Codes Error:", error);
        throw error;
    } finally {
        connection.release();
    }
};

// ============ CREATE BILL ============
const createBill = async (billData, files = {}) => {
    const connection = await db.getConnection();
    const uploadedCloudFiles = [];
    let tempFiles = [];
    let createdBill = null;
    let tenant = null;

    try {
        await connection.beginTransaction();

        const unpaidTenants = await BillModel.getUnpaidTenants();
        const tenantExists = unpaidTenants.some(t => t.id === billData.tenant_id);
        if (!tenantExists) {
            throw new Error("Selected tenant is not eligible for a bill (either already paid or not a tenant)");
        }

        const totalAmount = parseFloat(billData.rent_amount) + 
                          parseFloat(billData.electricity_amount || 0) + 
                          parseFloat(billData.maintenance_amount || 0) + 
                          parseFloat(billData.other_charges || 0);

        let meterImage = null;
        let meterPublicId = null;
        let meterResourceType = null;

        if (files.meterImage && files.meterImage.length > 0) {
            const uploadResult = await uploadFile(
                files.meterImage[0],
                "livinkey/bills/meters"
            );
            if (uploadResult) {
                meterImage = uploadResult.secure_url;
                meterPublicId = uploadResult.public_id;
                meterResourceType = uploadResult.resource_type;
                uploadedCloudFiles.push({ public_id: meterPublicId, resource_type: meterResourceType });
            }
        }

        let paymentQr = null;
        let paymentQrPublicId = null;
        let paymentQrResourceType = null;

        try {
            const paymentData = {
                billId: null,
                tenantId: billData.tenant_id,
                amount: totalAmount,
                type: 'full_payment'
            };
            
            const paymentQrPath = await generateQRCode(JSON.stringify(paymentData), 'full');
            tempFiles.push(paymentQrPath);
            
            const paymentQrUpload = await uploadFile(
                { buffer: fs.readFileSync(paymentQrPath), originalname: 'qr_full.png' },
                "livinkey/bills/qr"
            );

            if (!paymentQrUpload || !paymentQrUpload.secure_url) {
                throw new Error("Failed to generate/upload full payment QR code");
            }
            
            paymentQr = paymentQrUpload.secure_url;
            paymentQrPublicId = paymentQrUpload.public_id;
            paymentQrResourceType = paymentQrUpload.resource_type;
            uploadedCloudFiles.push({ public_id: paymentQrPublicId, resource_type: paymentQrResourceType });
        } catch (qrError) {
            await cleanupUploadedFiles(uploadedCloudFiles);
            throw qrError;
        }

        let partialQr = null;
        let partialQrPublicId = null;
        let partialQrResourceType = null;

        try {
            const partialAmount = totalAmount * 0.5;
            const partialPaymentData = {
                billId: null,
                tenantId: billData.tenant_id,
                amount: partialAmount,
                type: 'partial_payment'
            };
            
            const partialQrPath = await generateQRCode(JSON.stringify(partialPaymentData), 'partial');
            tempFiles.push(partialQrPath);
            
            const partialQrUpload = await uploadFile(
                { buffer: fs.readFileSync(partialQrPath), originalname: 'qr_partial.png' },
                "livinkey/bills/qr"
            );

            if (!partialQrUpload || !partialQrUpload.secure_url) {
                throw new Error("Failed to generate/upload partial payment QR code");
            }
            
            partialQr = partialQrUpload.secure_url;
            partialQrPublicId = partialQrUpload.public_id;
            partialQrResourceType = partialQrUpload.resource_type;
            uploadedCloudFiles.push({ public_id: partialQrPublicId, resource_type: partialQrResourceType });
        } catch (qrError) {
            await cleanupUploadedFiles(uploadedCloudFiles);
            throw qrError;
        }

        // ============================================================
        // FIXED: Upload admin QR code when admin attaches one
        // ============================================================
        let adminQr = null;
        let adminQrPublicId = null;
        let adminQrResourceType = null;

        const adminQrFile = files.paymentQr && files.paymentQr.length > 0 ? files.paymentQr[0] : null;
        const adminQrIsValid = adminQrFile && adminQrFile.buffer && adminQrFile.buffer.length > 0;

        if (adminQrIsValid) {
            try {
                const uploadResult = await uploadFile(
                    adminQrFile,
                    "livinkey/bills/qr/admin"
                );
                if (uploadResult && uploadResult.secure_url) {
                    adminQr = uploadResult.secure_url;
                    adminQrPublicId = uploadResult.public_id;
                    adminQrResourceType = uploadResult.resource_type;
                    uploadedCloudFiles.push({ public_id: adminQrPublicId, resource_type: adminQrResourceType });
                    console.log("Admin QR uploaded successfully:", adminQr);
                }
            } catch (adminQrError) {
                console.warn("Admin-uploaded paymentQr failed to upload:", adminQrError.message);
            }
        }

        const sentAt = new Date();
        const validUntil = new Date(sentAt.getTime() + 7 * 24 * 60 * 60 * 1000);

        // ============================================================
        // FIXED: Pass admin_qr to BillModel.createBill
        // ============================================================
        const billId = await BillModel.createBill(connection, {
            tenant_id: billData.tenant_id,
            rent_amount: parseFloat(billData.rent_amount),
            electricity_amount: parseFloat(billData.electricity_amount || 0),
            electricity_meter_image: meterImage,
            electricity_meter_public_id: meterPublicId,
            electricity_meter_resource_type: meterResourceType,
            maintenance_amount: parseFloat(billData.maintenance_amount || 0),
            other_charges: parseFloat(billData.other_charges || 0),
            total_amount: totalAmount,
            payment_qr: paymentQr,
            payment_qr_public_id: paymentQrPublicId,
            payment_qr_resource_type: paymentQrResourceType,
            partial_payment_qr: partialQr,
            partial_payment_qr_public_id: partialQrPublicId,
            partial_payment_qr_resource_type: partialQrResourceType,
            // ============================================================
            // FIXED: Pass admin_qr fields to the model
            // ============================================================
            admin_qr: adminQr,
            admin_qr_public_id: adminQrPublicId,
            admin_qr_resource_type: adminQrResourceType,
            sent_at: sentAt,
            valid_until: validUntil,
            created_by: billData.created_by,
            fine_applied_days: 0,
            last_fine_email_sent: null,
            initial_email_sent: 0,
            qr_expires_at: null
        });

        await connection.commit();

        let emailSent = false;
        try {
            tenant = await BillModel.getBillById(billId);
            await sendBillEmail(
                tenant.tenant_email,
                tenant.tenant_name,
                tenant,
                paymentQr,
                partialQr,
                meterImage,
                adminQr  // Pass adminQr to email as well
            );
            emailSent = true;
        } catch (emailError) {
            console.error("Failed to send bill email:", emailError);
        }

        createdBill = await BillModel.getBillById(billId);

        try {
            if (tenant) {
                await NotificationEventManager.onBillCreated(createdBill, tenant);
                await NotificationEventManager.onTenantBillCreated(createdBill, tenant);
            }
        } catch (notifError) {
            console.error("Failed to send bill notification:", notifError);
        }

        await cleanupTempFiles(tempFiles);

        return { ...createdBill, email_sent: emailSent };

    } catch (error) {
        await connection.rollback();
        await cleanupUploadedFiles(uploadedCloudFiles);
        await cleanupTempFiles(tempFiles);
        console.error("Bill Creation Error:", error);
        throw error;
    } finally {
        connection.release();
    }
};

// ============ GET UNPAID TENANTS ============
const getUnpaidTenants = async () => {
    return await BillModel.getUnpaidTenants();
};

// ============ GET BILLS ============
const getBills = async (filters = {}) => {
    return await BillModel.getBills(filters);
};

// ============ GET BILL BY ID ============
const getBillById = async (billId) => {
    const bill = await BillModel.getBillById(billId);
    if (bill) {
        // Ensure all numeric values are properly parsed
        bill.total_amount = parseFloat(bill.total_amount) || 0;
        bill.paid_amount = parseFloat(bill.paid_amount) || 0;
        bill.fine_amount = parseFloat(bill.fine_amount) || 0;
        bill.rent_amount = parseFloat(bill.rent_amount) || 0;
        bill.electricity_amount = parseFloat(bill.electricity_amount) || 0;
        bill.maintenance_amount = parseFloat(bill.maintenance_amount) || 0;
        bill.other_charges = parseFloat(bill.other_charges) || 0;
        bill.total_paid = parseFloat(bill.total_paid) || 0;
        bill.total_partial_paid = parseFloat(bill.total_partial_paid) || 0;
        bill.total_cash_paid = parseFloat(bill.total_cash_paid) || 0;
        
        // ============================================================
        // FIX: DUE AMOUNT CALCULATION
        // paid_amount already includes online payments + cash payments
        // from bill_payments table. Do NOT subtract total_cash_paid
        // again - that would double-count cash payments.
        // ============================================================
        // CORRECT: Due = Total + Fine - Total Paid (all payments combined)
        const totalPaid = parseFloat(bill.paid_amount || 0);
        bill.due_amount = parseFloat(bill.total_amount) + parseFloat(bill.fine_amount || 0) - totalPaid;
        // Cap at 0 (can't be negative - overpayment shouldn't show negative due)
        if (bill.due_amount < 0) bill.due_amount = 0;
    }
    return bill;
};

// ============ GET BILLS BY TENANT ============
const getBillsByTenant = async (tenantId) => {
    return await BillModel.getBillsByTenant(tenantId);
};

// ============ GET BILL STATS ============
const getBillStats = async () => {
    return await BillModel.getBillStats();
};

// ============ GET OVERDUE BILLS ============
const getOverdueBills = async () => {
    return await BillModel.getOverdueBills();
};

// ============ GET CASH PAYMENTS ============
const getCashPayments = async (filters = {}) => {
    return await BillModel.getCashPayments(filters);
};

// ============ SEND CUSTOM MESSAGE ============
const sendCustomMessageToTenant = async (billId, messageData, files = {}) => {
    const connection = await db.getConnection();
    const uploadedCloudFiles = [];
    let tempFiles = [];

    try {
        await connection.beginTransaction();

        const bill = await BillModel.getBillById(billId);
        if (!bill) {
            throw new Error("Bill not found");
        }

        if (bill.status === 'paid') {
            throw new Error("Cannot send message to a paid bill");
        }

        const activeMessage = await BillModel.getActiveCustomMessage(billId);
        let qrCodeUrl = null;
        let qrCodePublicId = null;
        let qrCodeResourceType = null;
        let qrExpiresAt = null;

        // FIX: Use the fixed getBillById calculation
        const fixedBill = await getBillById(billId);
        const totalDue = fixedBill.due_amount || 0;

        if (activeMessage && activeMessage.qr_expires_at && new Date(activeMessage.qr_expires_at) > new Date()) {
            qrCodeUrl = activeMessage.custom_message_qr;
            qrCodePublicId = activeMessage.custom_message_qr_public_id;
            qrCodeResourceType = activeMessage.custom_message_qr_resource_type;
            qrExpiresAt = activeMessage.qr_expires_at;
        } else if (totalDue > 0) {
            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);
            qrExpiresAt = endOfDay;

            const qrData = {
                billId: bill.id,
                tenantId: bill.tenant_id,
                amount: totalDue,
                type: 'custom_message_payment',
                validUntil: qrExpiresAt.toISOString()
            };

            const qrPath = await generateQRCode(JSON.stringify(qrData), 'custom');
            tempFiles.push(qrPath);

            const qrUpload = await uploadFile(
                { buffer: fs.readFileSync(qrPath), originalname: 'qr_custom_message.png' },
                "livinkey/bills/custom_qr"
            );

            if (qrUpload && qrUpload.secure_url) {
                qrCodeUrl = qrUpload.secure_url;
                qrCodePublicId = qrUpload.public_id;
                qrCodeResourceType = qrUpload.resource_type;
                uploadedCloudFiles.push({ public_id: qrCodePublicId, resource_type: qrCodeResourceType });
            }
        }

        let adminQrUrl = null;
        let adminQrPublicId = null;
        let adminQrResourceType = null;

        if (files.adminQr && files.adminQr.length > 0) {
            const uploadResult = await uploadFile(
                files.adminQr[0],
                "livinkey/bills/admin_qr"
            );
            if (uploadResult && uploadResult.secure_url) {
                adminQrUrl = uploadResult.secure_url;
                adminQrPublicId = uploadResult.public_id;
                adminQrResourceType = uploadResult.resource_type;
                uploadedCloudFiles.push({ public_id: adminQrPublicId, resource_type: adminQrResourceType });
            }
        }

        await BillModel.updateCustomMessage(connection, billId, {
            qr_code_url: qrCodeUrl,
            qr_code_public_id: qrCodePublicId,
            qr_code_resource_type: qrCodeResourceType,
            admin_qr_url: adminQrUrl,
            admin_qr_public_id: adminQrPublicId,
            admin_qr_resource_type: adminQrResourceType,
            message: messageData.message,
            qr_expires_at: qrExpiresAt
        });

        await connection.commit();

        try {
            const updatedBill = await BillModel.getBillById(billId);
            const adminName = messageData.admin_name || 'Livinkey Admin';
            await sendCustomBillMessageEmail(
                bill.tenant_email,
                bill.tenant_name,
                adminName,
                messageData.subject,
                messageData.message,
                qrCodeUrl,
                adminQrUrl,
                totalDue,
                bill.pg_name,
                bill.room_number,
                qrExpiresAt
            );
        } catch (emailError) {
            console.error("Failed to send custom message email:", emailError);
        }

        await cleanupTempFiles(tempFiles);

        const updatedBill = await BillModel.getBillById(billId);
        return updatedBill;

    } catch (error) {
        await connection.rollback();
        await cleanupUploadedFiles(uploadedCloudFiles);
        await cleanupTempFiles(tempFiles);
        console.error("Send Custom Message Error:", error);
        throw error;
    } finally {
        connection.release();
    }
};

// ============ REQUEST CASH PAYMENT OTP ============
const requestCashPaymentOTP = async (billId, paymentData) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const bill = await BillModel.getBillById(billId);
        if (!bill) {
            throw new Error("Bill not found");
        }

        if (bill.status === 'paid') {
            throw new Error("Bill is already fully paid");
        }

        // FIX: Use the fixed getBillById calculation
        const fixedBill = await getBillById(billId);
        const totalDue = fixedBill.due_amount || 0;
        
        if (paymentData.amount > totalDue) {
            throw new Error(`Payment amount (${paymentData.amount}) exceeds total due (${totalDue})`);
        }

        const otp = generateOTP(4);
        const expiry = new Date(Date.now() + 5 * 60 * 1000);

        await BillModel.setCashPaymentOTP(connection, billId, otp, expiry);

        await connection.commit();

        try {
            await sendCashPaymentOTPEmail(
                bill.tenant_email,
                bill.tenant_name,
                otp,
                paymentData.amount,
                bill.pg_name,
                bill.room_number
            );
        } catch (emailError) {
            console.error("Failed to send OTP email:", emailError);
        }

        return { 
            success: true, 
            message: "OTP sent to tenant's email",
            bill_id: billId,
            amount: paymentData.amount
        };

    } catch (error) {
        await connection.rollback();
        console.error("Request Cash Payment OTP Error:", error);
        throw error;
    } finally {
        connection.release();
    }
};

// ============ VERIFY CASH PAYMENT ============
const verifyCashPayment = async (billId, otp, paymentData) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const bill = await BillModel.getBillById(billId);
        if (!bill) {
            throw new Error("Bill not found");
        }

        const verification = await BillModel.verifyCashPaymentOTP(connection, billId, otp);
        if (!verification.valid) {
            throw new Error(verification.message);
        }

        // FIX: Use the fixed getBillById calculation
        const fixedBill = await getBillById(billId);
        const totalDue = fixedBill.due_amount || 0;
        
        if (paymentData.amount > totalDue) {
            throw new Error(`Payment amount (${paymentData.amount}) exceeds total due (${totalDue})`);
        }

        await BillModel.createCashPayment(connection, {
            bill_id: billId,
            tenant_id: bill.tenant_id,
            amount: paymentData.amount,
            paid_from: paymentData.paid_from,
            paid_till: paymentData.paid_till,
            verified_by: paymentData.verified_by,
            otp: otp,
            notes: paymentData.notes || null
        });

        // Update paid_amount in bills table
        const newPaidAmount = parseFloat(bill.paid_amount || 0) + parseFloat(paymentData.amount);
        const remainingAmount = parseFloat(bill.total_amount) + parseFloat(bill.fine_amount || 0) - newPaidAmount;

        let newStatus = 'paid';
        if (remainingAmount > 0) {
            newStatus = 'partially_paid';
        }

        await BillModel.updateBillStatus(connection, billId, newStatus, paymentData.amount);
        await BillModel.clearCashPaymentOTP(connection, billId);

        const updatedBill = await BillModel.getBillById(billId);
        
        // FIX: Recalculate due amount using the fixed calculation
        const newTotalDue = parseFloat(updatedBill.total_amount) + parseFloat(updatedBill.fine_amount || 0) - 
                           parseFloat(updatedBill.paid_amount || 0);
        const finalDue = newTotalDue < 0 ? 0 : newTotalDue;

        if (updatedBill.payment_qr_public_id) {
            try {
                await deleteFile(updatedBill.payment_qr_public_id, updatedBill.payment_qr_resource_type);
            } catch (e) {}
        }
        if (updatedBill.partial_payment_qr_public_id) {
            try {
                await deleteFile(updatedBill.partial_payment_qr_public_id, updatedBill.partial_payment_qr_resource_type);
            } catch (e) {}
        }

        let fullQr = null;
        let fullPublicId = null;
        let fullResourceType = null;
        let partialQr = null;
        let partialPublicId = null;
        let partialResourceType = null;

        if (finalDue > 0) {
            const qrResult = await regenerateBillQRCodes(billId, updatedBill, finalDue);
            fullQr = qrResult.fullQr;
            fullPublicId = qrResult.fullPublicId;
            fullResourceType = qrResult.fullResourceType;
            partialQr = qrResult.partialQr;
            partialPublicId = qrResult.partialPublicId;
            partialResourceType = qrResult.partialResourceType;
        }

        await connection.execute(
            `
            UPDATE bills 
            SET 
                payment_qr = ?,
                payment_qr_public_id = ?,
                payment_qr_resource_type = ?,
                partial_payment_qr = ?,
                partial_payment_qr_public_id = ?,
                partial_payment_qr_resource_type = ?
            WHERE id = ?
            `,
            [fullQr, fullPublicId, fullResourceType, partialQr, partialPublicId, partialResourceType, billId]
        );

        await connection.commit();

        const finalBill = await BillModel.getBillById(billId);

        try {
            const tenant = { full_name: bill.tenant_name, id: bill.tenant_id };
            await NotificationEventManager.onCashPaymentVerified(finalBill, tenant);
            
            if (newStatus === 'paid') {
                await NotificationEventManager.onTenantBillPaid(finalBill, tenant);
            } else if (newStatus === 'partially_paid') {
                await NotificationEventManager.onTenantBillPartiallyPaid(finalBill, tenant);
            }
        } catch (notifError) {
            console.error("Failed to send payment notification:", notifError);
        }

        return finalBill;

    } catch (error) {
        await connection.rollback();
        console.error("Verify Cash Payment Error:", error);
        throw error;
    } finally {
        connection.release();
    }
};

// ============ PROCESS DELAYED PAYMENTS ============
const processDelayedPayments = async () => {
    const connection = await db.getConnection();
    let processedCount = 0;
    const uploadedCloudFiles = [];
    let tempFiles = [];

    try {
        await connection.beginTransaction();

        const overdueBills = await connection.execute(
            `
            SELECT 
                b.*,
                t.full_name as tenant_name,
                t.email as tenant_email,
                td.payment_date as tenant_payment_date,
                DATEDIFF(NOW(), b.sent_at) as days_since_sent
            FROM bills b
            INNER JOIN tenants t ON b.tenant_id = t.id
            LEFT JOIN tenant_details td ON t.id = td.tenant_id
            WHERE b.status IN ('unpaid', 'partially_paid', 'delayed')
            AND b.valid_until < NOW()
            AND b.sent_at IS NOT NULL
            ORDER BY b.valid_until ASC
            FOR UPDATE
            `
        );

        for (const bill of overdueBills[0]) {
            const daysSinceSent = Math.floor((Date.now() - new Date(bill.sent_at).getTime()) / (1000 * 60 * 60 * 24));
            
            let fineStartDate = new Date(bill.sent_at);
            fineStartDate.setDate(fineStartDate.getDate() + 7);
            
            const tenantPaymentDay = bill.tenant_payment_date || 1;
            let tenantPaymentDate = new Date(bill.sent_at);
            let paymentDay = parseInt(tenantPaymentDay);
            const lastDayOfMonth = new Date(tenantPaymentDate.getFullYear(), tenantPaymentDate.getMonth() + 1, 0).getDate();
            paymentDay = Math.min(paymentDay, lastDayOfMonth);
            tenantPaymentDate.setDate(paymentDay);
            
            if (tenantPaymentDate < new Date(bill.sent_at)) {
                tenantPaymentDate.setMonth(tenantPaymentDate.getMonth() + 1);
                const newLastDay = new Date(tenantPaymentDate.getFullYear(), tenantPaymentDate.getMonth() + 1, 0).getDate();
                paymentDay = Math.min(paymentDay, newLastDay);
                tenantPaymentDate.setDate(paymentDay);
            }
            
            const actualFineStartDate = new Date(Math.max(fineStartDate.getTime(), tenantPaymentDate.getTime()));
            const today = new Date();
            let daysOverdue = Math.floor((today.getTime() - actualFineStartDate.getTime()) / (1000 * 60 * 60 * 24));
            
            if (daysOverdue <= 0) continue;
            
            let shouldApplyFine = false;
            let fineAmount = bill.fine_amount || 0;
            
            const hasPartialPayment = bill.total_partial_paid > 0 || bill.total_cash_paid > 0;
            
            if (hasPartialPayment) {
                if (daysOverdue > 7) {
                    shouldApplyFine = true;
                    const extraDays = daysOverdue - 7;
                    fineAmount = extraDays * 100;
                }
            } else {
                if (daysOverdue > 0) {
                    shouldApplyFine = true;
                    fineAmount = daysOverdue * 100;
                }
            }
            
            if (shouldApplyFine) {
                const newValidUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
                const fineAppliedDays = daysOverdue;
                
                const lastEmailSent = bill.last_fine_email_sent;
                const todayDate = new Date().toDateString();
                const shouldSendEmail = !lastEmailSent || new Date(lastEmailSent).toDateString() !== todayDate;
                
                const totalAmount = parseFloat(bill.total_amount) || 0;
                const totalWithFine = totalAmount + fineAmount;
                
                let fullQrUrl = bill.payment_qr;
                let partialQrUrl = bill.partial_payment_qr;

                try {
                    const fullPaymentData = {
                        billId: bill.id,
                        tenantId: bill.tenant_id,
                        amount: totalWithFine,
                        type: 'full_payment_with_fine'
                    };
                    
                    const fullQrPath = await generateQRCode(JSON.stringify(fullPaymentData), 'full');
                    tempFiles.push(fullQrPath);
                    
                    const fullQrUpload = await uploadFile(
                        { buffer: fs.readFileSync(fullQrPath), originalname: 'qr_full_fine.png' },
                        "livinkey/bills/qr/fine"
                    );
                    
                    if (fullQrUpload && fullQrUpload.secure_url) {
                        fullQrUrl = fullQrUpload.secure_url;
                        uploadedCloudFiles.push({ public_id: fullQrUpload.public_id, resource_type: fullQrUpload.resource_type });
                    }
                    
                    const partialAmount = totalWithFine * 0.5;
                    const partialPaymentData = {
                        billId: bill.id,
                        tenantId: bill.tenant_id,
                        amount: partialAmount,
                        type: 'partial_payment_with_fine'
                    };
                    
                    const partialQrPath = await generateQRCode(JSON.stringify(partialPaymentData), 'partial');
                    tempFiles.push(partialQrPath);
                    
                    const partialQrUpload = await uploadFile(
                        { buffer: fs.readFileSync(partialQrPath), originalname: 'qr_partial_fine.png' },
                        "livinkey/bills/qr/fine"
                    );
                    
                    if (partialQrUpload && partialQrUpload.secure_url) {
                        partialQrUrl = partialQrUpload.secure_url;
                        uploadedCloudFiles.push({ public_id: partialQrUpload.public_id, resource_type: partialQrUpload.resource_type });
                    }
                } catch (qrError) {
                    await cleanupUploadedFiles(uploadedCloudFiles);
                    console.error("QR generation failed for bill", bill.id, qrError);
                }
                
                await connection.execute(
                    `
                    UPDATE bills 
                    SET 
                        payment_qr = ?,
                        partial_payment_qr = ?,
                        fine_amount = ?,
                        valid_until = ?,
                        status = 'delayed',
                        fine_applied_days = ?,
                        last_fine_email_sent = ?
                    WHERE id = ?
                    `,
                    [
                        fullQrUrl,
                        partialQrUrl,
                        fineAmount,
                        newValidUntil,
                        fineAppliedDays,
                        shouldSendEmail ? new Date() : lastEmailSent,
                        bill.id
                    ]
                );
                
                if (shouldSendEmail) {
                    try {
                        const updatedBill = await BillModel.getBillById(bill.id);
                        await sendFineNotificationEmail(
                            bill.tenant_email,
                            bill.tenant_name,
                            updatedBill,
                            fineAmount,
                            fineAppliedDays,
                            hasPartialPayment,
                            fullQrUrl,
                            partialQrUrl
                        );
                    } catch (emailError) {
                        console.error(`Failed to send fine email for bill ${bill.id}:`, emailError);
                    }
                }
                
                try {
                    const updatedBill = await BillModel.getBillById(bill.id);
                    await NotificationEventManager.onTenantBillFineApplied(updatedBill, fineAmount);
                } catch (notifError) {
                    console.error("Failed to send tenant fine notification:", notifError);
                }
                
                processedCount++;
            }
        }
        
        await connection.commit();
        await cleanupTempFiles(tempFiles);
        return processedCount;
        
    } catch (error) {
        await connection.rollback();
        await cleanupUploadedFiles(uploadedCloudFiles);
        await cleanupTempFiles(tempFiles);
        console.error("Process Delayed Payments Error:", error);
        throw error;
    } finally {
        connection.release();
    }
};

// ============ ADD PAYMENT (Admin records payment) ============
const addPayment = async (billId, paymentData) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const bill = await BillModel.getBillById(billId);
        if (!bill) {
            throw new Error("Bill not found");
        }

        if (bill.status === 'paid') {
            throw new Error("Bill is already fully paid");
        }

        // FIX: Use the fixed getBillById calculation
        const fixedBill = await getBillById(billId);
        const totalDue = fixedBill.due_amount || 0;
        
        if (paymentData.amount > totalDue) {
            throw new Error(`Payment amount (${paymentData.amount}) exceeds total due (${totalDue})`);
        }

        await BillModel.createBillPayment(connection, {
            bill_id: billId,
            amount: paymentData.amount,
            payment_method: paymentData.payment_method || 'qr_code',
            transaction_id: paymentData.transaction_id || null,
            is_partial: paymentData.is_partial || 0
        });

        const newPaidAmount = parseFloat(bill.paid_amount || 0) + parseFloat(paymentData.amount);
        const remainingAmount = parseFloat(bill.total_amount) + parseFloat(bill.fine_amount || 0) - newPaidAmount;

        let newStatus = 'paid';
        if (remainingAmount > 0) {
            if (paymentData.is_partial || (newPaidAmount < parseFloat(bill.total_amount))) {
                newStatus = 'partially_paid';
            } else {
                newStatus = 'delayed';
            }
        }

        await BillModel.updateBillStatus(connection, billId, newStatus, paymentData.amount);

        const updatedBill = await BillModel.getBillById(billId);
        
        // FIX: Recalculate due amount using the fixed calculation
        const newTotalDue = parseFloat(updatedBill.total_amount) + parseFloat(updatedBill.fine_amount || 0) - 
                           parseFloat(updatedBill.paid_amount || 0);
        const finalDue = newTotalDue < 0 ? 0 : newTotalDue;

        if (updatedBill.payment_qr_public_id) {
            try {
                await deleteFile(updatedBill.payment_qr_public_id, updatedBill.payment_qr_resource_type);
            } catch (e) {}
        }
        if (updatedBill.partial_payment_qr_public_id) {
            try {
                await deleteFile(updatedBill.partial_payment_qr_public_id, updatedBill.partial_payment_qr_resource_type);
            } catch (e) {}
        }

        let fullQr = null;
        let fullPublicId = null;
        let fullResourceType = null;
        let partialQr = null;
        let partialPublicId = null;
        let partialResourceType = null;

        if (finalDue > 0) {
            const qrResult = await regenerateBillQRCodes(billId, updatedBill, finalDue);
            fullQr = qrResult.fullQr;
            fullPublicId = qrResult.fullPublicId;
            fullResourceType = qrResult.fullResourceType;
            partialQr = qrResult.partialQr;
            partialPublicId = qrResult.partialPublicId;
            partialResourceType = qrResult.partialResourceType;
        }

        await connection.execute(
            `
            UPDATE bills 
            SET 
                payment_qr = ?,
                payment_qr_public_id = ?,
                payment_qr_resource_type = ?,
                partial_payment_qr = ?,
                partial_payment_qr_public_id = ?,
                partial_payment_qr_resource_type = ?
            WHERE id = ?
            `,
            [fullQr, fullPublicId, fullResourceType, partialQr, partialPublicId, partialResourceType, billId]
        );

        await connection.commit();

        const finalBill = await BillModel.getBillById(billId);

        try {
            const tenant = { full_name: bill.tenant_name, id: bill.tenant_id };
            
            if (newStatus === 'paid') {
                await NotificationEventManager.onBillPaid(finalBill, tenant);
                await NotificationEventManager.onTenantBillPaid(finalBill, tenant);
            } else if (newStatus === 'partially_paid') {
                await NotificationEventManager.onBillPartiallyPaid(finalBill, tenant);
                await NotificationEventManager.onTenantBillPartiallyPaid(finalBill, tenant);
            }
        } catch (notifError) {
            console.error("Failed to send payment notification:", notifError);
        }

        return finalBill;

    } catch (error) {
        await connection.rollback();
        console.error("Add Payment Error:", error);
        throw error;
    } finally {
        connection.release();
    }
};

// ============ GENERATE BILL PAYMENT OPTIONS (for Payment Link) ============
const generateBillPaymentOptions = async (billId) => {
    const bill = await BillModel.getBillById(billId);
    if (!bill) {
        throw new Error("Bill not found");
    }

    const tenant = await TenantModel.findById(bill.tenant_id);
    if (!tenant) {
        throw new Error("Tenant not found");
    }

    // FIX: Use the fixed getBillById calculation
    const fixedBill = await getBillById(billId);
    const totalDue = fixedBill.due_amount || 0;

    if (totalDue <= 0) {
        throw new Error("No amount due for this bill");
    }

    const paymentOptions = await paymentService.generatePaymentOptions(bill);

    let orderData = null;
    if (process.env.ENABLE_PAYMENT_GATEWAY === 'true') {
        try {
            orderData = await paymentService.createPaymentOrder(bill, tenant);
        } catch (error) {
            console.error('Payment order creation failed:', error.message);
        }
    }

    const transactionId = await paymentService.createPaymentTransaction(
        null,
        {
            bill_id: bill.id,
            tenant_id: tenant.id,
            amount: totalDue,
            payment_type: 'upi',
            gateway: orderData?.gateway || 'upi_qr',
            gateway_order_id: orderData?.order?.id || paymentOptions.transaction_id,
            status: 'pending',
            payment_link: paymentOptions.upi_link,
            upi_id: process.env.MERCHANT_UPI_ID,
        }
    );

    const connection = await db.getConnection();
    try {
        await connection.execute(
            `
            UPDATE bills 
            SET 
                upi_qr_code = ?,
                upi_qr_public_id = ?,
                upi_qr_resource_type = ?,
                payment_link = ?,
                gateway_order_id = ?
            WHERE id = ?
            `,
            [
                paymentOptions.qr_code,
                paymentOptions.qr_code_public_id,
                paymentOptions.qr_code_resource_type,
                paymentOptions.upi_link,
                orderData?.order?.id || paymentOptions.transaction_id,
                bill.id
            ]
        );
        await connection.commit();
    } finally {
        connection.release();
    }

    try {
        await sendPaymentLinkEmail(
            tenant.email,
            tenant.full_name,
            bill,
            paymentOptions,
            orderData
        );
    } catch (emailError) {
        console.error('Failed to send payment link email:', emailError);
    }

    return {
        bill,
        tenant,
        payment_options: paymentOptions,
        order: orderData,
        transaction_id: transactionId,
    };
};

module.exports = {
    createBill,
    getUnpaidTenants,
    getBills,
    getBillById,
    getBillsByTenant,
    getBillStats,
    getOverdueBills,
    getCashPayments,
    sendCustomMessageToTenant,
    requestCashPaymentOTP,
    verifyCashPayment,
    processDelayedPayments,
    addPayment,
    generateBillPaymentOptions,
    regenerateBillQRCodes
};