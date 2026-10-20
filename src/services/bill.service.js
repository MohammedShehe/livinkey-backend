const db = require("../config/db");
const fs = require("fs");
const BillModel = require("../models/bill.model");
const TenantModel = require("../models/tenant.model");
const { uploadFile, deleteFile } = require("./upload.service");
const paymentService = require("./payment.service");
const messagingService = require("./messaging.service");

// Helper: try WhatsApp notification (non-blocking)
const tryWhatsApp = async (userObj, type, data = {}) => {
    try {
        // skipEmail: true because this file already sends email separately
        const base = {
            userId: userObj.id,
            userType: userObj.role || "tenant",
            phone: userObj.phone,
            email: userObj.email,
            name: userObj.full_name || userObj.name || "User",
            skipEmail: true,
        };
        if (type === "bill") {
            await messagingService.sendMessage({ ...base, type: "bill", templateData: data });
        } else if (type === "fine") {
            await messagingService.sendMessage({ ...base, type: "fine", templateData: data });
        } else if (type === "otp") {
            await messagingService.sendMessage({ ...base, type: "otp", templateData: { otp: data.otp, purpose: data.purpose || "Cash Payment" } });
        } else if (type === "custom") {
            await messagingService.sendMessage({ ...base, type: "custom", title: data.title || "Message", body: data.message || "" });
        } else {
            await messagingService.sendMessage({ ...base, type, ...data, skipEmail: true });
        }
    } catch (e) {
        console.error("WhatsApp notification failed:", e.message);
    }
};

const { 
    sendBillEmail, 
    sendFineNotificationEmail, 
    sendCustomBillMessageEmail, 
    sendCashPaymentOTPEmail,
    sendPaymentLinkEmail
} = require("./mail.service");
const NotificationEventManager = require("../utils/notification.events");
const {
    generateQRCode,
    cleanupUploadedFiles,
    generateOTP,
    cleanupTempFiles,
    getQRExpiryTime
} = require("../utils/helpers");

/**
 * FIXED: Update tenant paid_till using admin-provided date
 * NO MORE CALCULATION - just use what admin entered
 */
const updateTenantPaidTill = async (connection, tenantId, paidTillDate) => {
    if (!paidTillDate) {
        throw new Error("paid_till date is required to update tenant");
    }

    await connection.execute(
        `UPDATE tenant_details 
         SET paid_till = ? 
         WHERE tenant_id = ?`,
        [paidTillDate, tenantId]
    );
    
    return { paid_till: paidTillDate };
};

/**
 * FIXED: Update tenant paid_from and paid_till together
 */
const updateTenantPaymentDates = async (connection, tenantId, paidFrom, paidTill) => {
    if (!paidFrom || !paidTill) {
        throw new Error("Both paid_from and paid_till are required");
    }

    await connection.execute(
        `UPDATE tenant_details
         SET
           paid_from = CASE
             WHEN paid_from IS NULL OR ? < paid_from THEN ?
             ELSE paid_from
           END,
           paid_till = CASE
             WHEN paid_till IS NULL OR ? > paid_till THEN ?
             ELSE paid_till
           END
         WHERE tenant_id = ?`,
        [paidFrom, paidFrom, paidTill, paidTill, tenantId]
    );
    
    return { paid_from: paidFrom, paid_till: paidTill };
};

/**
 * FIXED: Get tenant payment status from bills table (single source of truth)
 */
const getTenantPaymentStatus = async (tenantId) => {
    const [billData] = await db.execute(
        `
        SELECT 
            status,
            total_amount,
            paid_amount,
            fine_amount,
            created_at,
            valid_until
        FROM bills 
        WHERE tenant_id = ? 
        ORDER BY created_at DESC 
        LIMIT 1
        `,
        [tenantId]
    );
    
    if (billData.length === 0) {
        return { 
            status: 'unpaid', 
            message: 'No bills found for this tenant',
            has_bill: false 
        };
    }
    
    const bill = billData[0];
    const totalDue = parseFloat(bill.total_amount) + parseFloat(bill.fine_amount || 0) - parseFloat(bill.paid_amount || 0);
    
    return {
        status: bill.status,
        has_bill: true,
        total_amount: parseFloat(bill.total_amount),
        paid_amount: parseFloat(bill.paid_amount),
        fine_amount: parseFloat(bill.fine_amount || 0),
        total_due: totalDue,
        bill_date: bill.created_at,
        valid_until: bill.valid_until,
        is_overdue: bill.status !== 'paid' && new Date(bill.valid_until) < new Date()
    };
};

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

        // Partial QR codes are generated on-demand for the exact amount chosen
        // by the tenant. A fixed 50% QR is intentionally not persisted.
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

    try {
        await connection.beginTransaction();

        const [tenantExists] = await connection.execute(
            `SELECT id, full_name, email FROM tenants WHERE id = ? AND role = 'tenant' AND is_active = 1`,
            [billData.tenant_id]
        );

        if (tenantExists.length === 0) {
            throw new Error(`Tenant with ID ${billData.tenant_id} does not exist or is not an active tenant`);
        }

        const [assignmentRows] = await connection.execute(
            `SELECT td.room_id, td.pg_id, td.rent, r.room_number, r.rent AS room_rent,
                    r.is_active AS room_active, r.deleted_at AS room_deleted
             FROM tenant_details td
             INNER JOIN rooms r ON r.id=td.room_id
             WHERE td.tenant_id=? FOR UPDATE`,
            [billData.tenant_id]
        );
        if (!assignmentRows.length || !assignmentRows[0].room_active || assignmentRows[0].room_deleted) {
            throw new Error("Tenant does not have a valid active room assignment.");
        }
        if (billData.room_id && Number(billData.room_id) !== Number(assignmentRows[0].room_id)) {
            throw new Error("Selected room does not match the tenant's current room assignment.");
        }
        billData.room_id = assignmentRows[0].room_id;

        const rentInput = Number(billData.rent_amount);
        if (!Number.isFinite(rentInput) || rentInput <= 0) {
            throw new Error("Rent amount must be greater than 0.");
        }

        // Multiple bills are intentionally allowed. A tenant may have any number
        // of outstanding bills; the tenant/admin balance is the sum of all open bills.
        // Resolve billing period (YYYY-MM). Default: current month.
        let billingMonth = (billData.billing_month || "").trim();
        if (!billingMonth) {
            const now = new Date();
            billingMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
        }
        if (!/^\d{4}-\d{2}$/.test(billingMonth)) {
            throw new Error("billing_month must be in YYYY-MM format");
        }
        const [y, m] = billingMonth.split("-").map(Number);
        const periodFrom = `${billingMonth}-01`;
        const periodTillDate = new Date(y, m, 0);
        const periodTill = `${billingMonth}-${String(periodTillDate.getDate()).padStart(2, "0")}`;
        billData.billing_month = billingMonth;
        billData.period_from = periodFrom;
        billData.period_till = periodTill;

        const totalAmount = parseFloat(billData.rent_amount) + 
                          parseFloat(billData.electricity_amount || 0) + 
                          parseFloat(billData.maintenance_amount || 0) + 
                          parseFloat(billData.other_charges || 0);

        // Payment details are snapshotted onto each bill so later PG edits
        // never change an already-issued bill.
        const [paymentDetailRows] = await connection.execute(
            `SELECT name, payment_bank_name, payment_account_holder_name,
                    payment_account_number, payment_ifsc_code, payment_upi_id,
                    payment_qr, payment_qr_public_id, payment_qr_resource_type
             FROM pgs
             WHERE id = ? LIMIT 1`,
            [assignmentRows[0].pg_id]
        );
        const pgPayment = paymentDetailRows[0] || {};
        const paymentSource = (String(billData.payment_details_source || 'pg').toLowerCase() === 'manual') ? 'manual' : 'pg';
        const paymentBankName = paymentSource === 'manual' ? (billData.payment_bank_name || null) : (pgPayment.payment_bank_name || null);
        const paymentHolderName = paymentSource === 'manual' ? (billData.payment_account_holder_name || null) : (pgPayment.payment_account_holder_name || null);
        const paymentAccountNumber = paymentSource === 'manual' ? (billData.payment_account_number || null) : (pgPayment.payment_account_number || null);
        const paymentIfscCode = paymentSource === 'manual' ? (billData.payment_ifsc_code || null) : (pgPayment.payment_ifsc_code || null);
        const paymentUpiId = paymentSource === 'manual' ? (billData.payment_upi_id || null) : (pgPayment.payment_upi_id || null);
        if (!paymentBankName || !paymentHolderName || !paymentAccountNumber || !paymentIfscCode) {
            throw new Error(paymentSource === 'manual'
                ? 'Complete bank payment details are required: bank name, account holder name, account number and IFSC code.'
                : "The selected tenant's PG does not have complete payment bank details. Add them in PG Management or choose Manual Payment Details.");
        }

        let meterImage = null;
        let meterPublicId = null;
        let meterResourceType = null;
        let meterImage2 = null;
        let meterPublicId2 = null;
        let meterResourceType2 = null;

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
            if (files.meterImage.length > 1) {
                const uploadResult2 = await uploadFile(
                    files.meterImage[1],
                    "livinkey/bills/meters"
                );
                if (uploadResult2) {
                    meterImage2 = uploadResult2.secure_url;
                    meterPublicId2 = uploadResult2.public_id;
                    meterResourceType2 = uploadResult2.resource_type;
                    uploadedCloudFiles.push({ public_id: meterPublicId2, resource_type: meterResourceType2 });
                }
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

        // Partial payments use an amount-specific QR generated on demand.
        let partialQr = null;
        let partialQrPublicId = null;
        let partialQrResourceType = null;

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
                }
            } catch (adminQrError) {
                console.warn("Admin-uploaded paymentQr failed to upload:", adminQrError.message);
            }
        }

        let paymentDetailsQr = null;
        let paymentDetailsQrPublicId = null;
        let paymentDetailsQrResourceType = null;
        if (paymentSource === 'pg' && pgPayment.payment_qr) {
            paymentDetailsQr = pgPayment.payment_qr;
            paymentDetailsQrPublicId = pgPayment.payment_qr_public_id || null;
            paymentDetailsQrResourceType = pgPayment.payment_qr_resource_type || 'image';
        } else if (adminQr) {
            paymentDetailsQr = adminQr;
            paymentDetailsQrPublicId = adminQrPublicId;
            paymentDetailsQrResourceType = adminQrResourceType;
        }

        const sentAt = new Date();
        const validUntil = new Date(sentAt.getTime() + 7 * 24 * 60 * 60 * 1000);
        const fineStartDate = new Date(validUntil);

        const billId = await BillModel.createBill(connection, {
            tenant_id: billData.tenant_id,
            room_id: billData.room_id,
            billing_month: billData.billing_month,
            period_from: billData.period_from,
            period_till: billData.period_till,
            rent_amount: parseFloat(billData.rent_amount),
            electricity_amount: parseFloat(billData.electricity_amount || 0),
            electricity_meter_image: meterImage,
            electricity_meter_public_id: meterPublicId,
            electricity_meter_resource_type: meterResourceType,
            electricity_meter_image_2: meterImage2,
            electricity_meter_public_id_2: meterPublicId2,
            electricity_meter_resource_type_2: meterResourceType2,
            maintenance_amount: parseFloat(billData.maintenance_amount || 0),
            other_charges: parseFloat(billData.other_charges || 0),
            other_charges_note: billData.other_charges_note || null,
            total_amount: totalAmount,
            payment_qr: paymentQr,
            payment_qr_public_id: paymentQrPublicId,
            payment_qr_resource_type: paymentQrResourceType,
            partial_payment_qr: partialQr,
            partial_payment_qr_public_id: partialQrPublicId,
            partial_payment_qr_resource_type: partialQrResourceType,
            admin_qr: adminQr,
            admin_qr_public_id: adminQrPublicId,
            admin_qr_resource_type: adminQrResourceType,
            payment_bank_name: paymentBankName,
            payment_account_holder_name: paymentHolderName,
            payment_account_number: paymentAccountNumber,
            payment_ifsc_code: paymentIfscCode,
            payment_upi_id: paymentUpiId,
            payment_details_source: paymentSource,
            payment_details_qr: paymentDetailsQr,
            payment_details_qr_public_id: paymentDetailsQrPublicId,
            payment_details_qr_resource_type: paymentDetailsQrResourceType,
            sent_at: sentAt,
            valid_until: validUntil,
            created_by: billData.created_by,
            fine_applied_days: 0,
            last_fine_email_sent: null,
            initial_email_sent: 0,
            qr_expires_at: null,
            fine_start_date: fineStartDate.toISOString().slice(0, 10),
            daily_fine_rate: Number(billData.daily_fine_rate || 100),
            max_fine: Number(billData.max_fine || 0)
        });

        await BillModel.insertBillAudit(connection, {
            bill_id: billId,
            admin_id: billData.created_by,
            action: 'create',
            before_data: null,
            after_data: {
                tenant_id: billData.tenant_id,
                billing_month: billData.billing_month,
                rent_amount: billData.rent_amount,
                total_amount: totalAmount
            },
            note: `Bill created for ${billData.billing_month}`
        });

        await connection.commit();

        // ============================================================
        // FIXED: `tenant` is no longer reused to hold the bill row.
        // Previously this variable was assigned the bill row (which has
        // `tenant_email`/`tenant_name`, not `id`/`full_name`) and was
        // then passed straight into the tenant notification helpers,
        // which read `tenant.id` expecting the TENANT's id but actually
        // got the BILL's id. That silently wrote every "bill created"
        // notification against the wrong tenant_id, so the real tenant
        // never saw it. `billForEmail` is now used only for sending the
        // email, and a separate, correctly-shaped `tenantForNotif`
        // object is built from `createdBill` for the notification calls.
        // ============================================================
        let emailSent = false;
        let billForEmail = null;
        try {
            billForEmail = await BillModel.getBillById(billId);
            if (billData.skipEmail) throw new Error("SKIP_GROUP_ANCHOR_EMAIL");
            await sendBillEmail(
                billForEmail.tenant_email,
                billForEmail.tenant_name,
                billForEmail,
                paymentQr,
                partialQr,
                meterImage,
                adminQr,
                meterImage2
            );
            emailSent = true;
            // Also send via WhatsApp
            tryWhatsApp(
                { id: billForEmail.tenant_id, phone: billForEmail.tenant_phone, email: billForEmail.tenant_email, full_name: billForEmail.tenant_name, role: "tenant" },
                "bill",
                { amount: billForEmail.total_amount || billForEmail.amount, dueDate: billForEmail.due_date, billId: billForEmail.id }
            );;
        } catch (emailError) {
            console.error("Failed to send bill email:", emailError);
        }

        createdBill = await BillModel.getBillById(billId);

        try {
            const tenantForNotif = {
                id: createdBill.tenant_id,
                full_name: createdBill.tenant_name
            };
            await NotificationEventManager.onBillCreated(createdBill, tenantForNotif);
            await NotificationEventManager.onTenantBillCreated(createdBill, tenantForNotif, billData.admin_name || 'Admin');
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
        
        const totalPaid = parseFloat(bill.paid_amount || 0);
        bill.due_amount = parseFloat(bill.total_amount) + parseFloat(bill.fine_amount || 0) - totalPaid;
        if (bill.bill_group_id) {
            bill.group_members = await BillModel.getBillGroupMembers(billId);
            bill.is_group_bill = true;
        } else {
            bill.group_members = [];
            bill.is_group_bill = false;
        }
        if (bill.due_amount < 0) bill.due_amount = 0;
        bill.previous_outstanding_amount = Number(bill.previous_outstanding_amount) || 0;
        bill.total_outstanding_amount = Number(bill.total_outstanding_amount) || 0;
        bill.outstanding_bills = Array.isArray(bill.outstanding_bills) ? bill.outstanding_bills : [];
        bill.previous_outstanding_bills = Array.isArray(bill.previous_outstanding_bills) ? bill.previous_outstanding_bills : [];
    }
    return bill;
};

// ============ GET BILLS BY TENANT ============
const getBillsByTenant = async (tenantId) => {
    return await BillModel.getBillsByTenant(tenantId);
};

// ============ GET BILL STATS ============
const getBillStats = async (filters = {}) => {
    return await BillModel.getBillStats(filters);
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
            // Dual channel
            tryWhatsApp(
                { id: bill.tenant_id, phone: bill.tenant_phone, email: bill.tenant_email, full_name: bill.tenant_name, role: "tenant" },
                "custom",
                { title: messageData.subject || "Message", message: messageData.message }
            );
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
            tryWhatsApp(
                { id: bill.tenant_id, phone: bill.tenant_phone, email: bill.tenant_email, full_name: bill.tenant_name, role: "tenant" },
                "otp",
                { otp: otp, purpose: "Cash Payment" }
            );
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

        const [lockedBillRows] = await connection.execute(
            `SELECT * FROM bills WHERE id=? AND deleted_at IS NULL FOR UPDATE`,
            [billId]
        );
        const bill = lockedBillRows[0];
        if (!bill) throw new Error("Bill not found");
        if (bill.status === 'paid') throw new Error("Bill is already fully paid");

        const verification = await BillModel.verifyCashPaymentOTP(connection, billId, otp);
        if (!verification.valid) {
            throw new Error(verification.message);
        }

        const fixedBill = await getBillById(billId);
        const totalDue = fixedBill.due_amount || 0;
        
        const amount = Number(paymentData.amount);
        if (!Number.isFinite(amount) || amount <= 0 || amount > totalDue + 0.005) {
            throw new Error(`Payment amount must be greater than 0 and no more than the current due of ₹${Number(totalDue).toFixed(2)}`);
        }
        const cashIsPartial = amount < totalDue - 0.005;
        const [partialRows] = await connection.execute(
            `SELECT id FROM bill_payments WHERE bill_id=? AND is_partial=1 LIMIT 1`,
            [billId]
        );
        if (cashIsPartial && partialRows.length) {
            throw new Error("This bill has already received a partial payment. The cash payment must settle the remaining due.");
        }
        if (cashIsPartial && amount + 0.005 < totalDue * 0.5) {
            throw new Error("A partial payment must be at least 50% of the current amount due.");
        }

        // Store paid_from and paid_till from admin input
        const cashPaymentId = await BillModel.createCashPayment(connection, {
            bill_id: billId,
            tenant_id: bill.tenant_id,
            amount,
            paid_from: paymentData.paid_from,
            paid_till: paymentData.paid_till,
            verified_by: paymentData.verified_by,
            otp: otp,
            notes: paymentData.notes || null
        });

        // Cash is part of the same immutable payment ledger. The cash table is
        // the audit record; bill_payments is the financial source of truth.
        await BillModel.createBillPayment(connection, {
            bill_id: billId,
            amount,
            payment_method: 'cash',
            transaction_id: `CASH-${cashPaymentId}`,
            is_partial: cashIsPartial ? 1 : 0,
            paid_from: paymentData.paid_from,
            paid_till: paymentData.paid_till
        });

        const newPaidAmount = parseFloat(bill.paid_amount || 0) + amount;
        const totalAmount = parseFloat(bill.total_amount) + parseFloat(bill.fine_amount || 0);
        const remainingAmount = totalAmount - newPaidAmount;

        let newStatus = 'paid';
        if (remainingAmount > 0) {
            newStatus = 'partially_paid';
        }

        await BillModel.updateBillStatus(connection, billId, newStatus, amount);
        await BillModel.clearCashPaymentOTP(connection, billId);

        // ✅ FIXED: Update tenant_details with admin-provided paid_till
        await updateTenantPaymentDates(
            connection, 
            bill.tenant_id, 
            paymentData.paid_from, 
            paymentData.paid_till
        );

        const updatedBill = await BillModel.getBillById(billId);
        
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

// Calendar-date only (local Y/M/D) so midnight/TZ jitter does not skip or double a fine day.
const toCalendarDate = (value) => {
    if (value == null || value === "") return null;
    if (value instanceof Date) {
        if (Number.isNaN(value.getTime())) return null;
        return new Date(value.getFullYear(), value.getMonth(), value.getDate());
    }
    const str = String(value);
    const iso = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (iso) {
        return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
    }
    const d = new Date(str);
    if (Number.isNaN(d.getTime())) return null;
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

const calendarDaysBetween = (fromDate, toDate) => {
    const from = toCalendarDate(fromDate);
    const to = toCalendarDate(toDate);
    if (!from || !to) return 0;
    return Math.max(0, Math.round((to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000)));
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
            WHERE b.deleted_at IS NULL
            AND b.status IN ('unpaid', 'partially_paid', 'delayed')
            AND b.valid_until < NOW()
            AND b.sent_at IS NOT NULL
            ORDER BY b.valid_until ASC
            FOR UPDATE
            `
        );

        for (const bill of overdueBills[0]) {
            if (bill.status === 'paid' || Number(bill.paid_amount || 0) >= Number(bill.total_amount || 0) + Number(bill.fine_amount || 0)) {
                continue;
            }

            const fineStartDate = bill.fine_start_date
                ? toCalendarDate(bill.fine_start_date)
                : toCalendarDate(new Date(new Date(bill.sent_at).getTime() + 7 * 24 * 60 * 60 * 1000));
            const today = toCalendarDate(new Date());
            const daysOverdue = calendarDaysBetween(fineStartDate, today);
            if (daysOverdue <= 0) continue;

            if (bill.status !== 'delayed' && bill.status !== 'overdue') {
                try {
                    const tenantForNotif = { full_name: bill.tenant_name, id: bill.tenant_id };
                    await NotificationEventManager.onTenantBillOverdue(bill, tenantForNotif, daysOverdue);
                } catch (notifError) {
                    console.error("Failed to send bill overdue notification:", notifError);
                }
            }

            // Admin waive/reduce freezes auto-accrual so calculated fine cannot climb back.
            if (Number(bill.fine_accrual_frozen) === 1) {
                await connection.execute(
                    `
                    UPDATE bills
                    SET
                        valid_until = DATE_ADD(NOW(), INTERVAL 1 DAY),
                        status = CASE
                            WHEN paid_amount >= total_amount + IFNULL(fine_amount, 0) THEN 'paid'
                            WHEN paid_amount > 0 THEN 'partially_paid'
                            WHEN status IN ('delayed', 'overdue') THEN status
                            ELSE 'delayed'
                        END
                    WHERE id = ?
                    `,
                    [bill.id]
                );
                continue;
            }

            const rate = Number(bill.daily_fine_rate || 100);
            const cap = Number(bill.max_fine || 0);
            const calculatedFine = cap > 0 ? Math.min(daysOverdue * rate, cap) : daysOverdue * rate;
            const fineAmount = Math.max(Number(bill.fine_amount || 0), calculatedFine);
            const shouldApplyFine = fineAmount > Number(bill.fine_amount || 0);

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
                        status = CASE
                            WHEN paid_amount >= total_amount + ? THEN 'paid'
                            WHEN paid_amount > 0 THEN 'partially_paid'
                            ELSE 'delayed'
                        END,
                        fine_applied_days = ?,
                        last_fine_email_sent = ?
                    WHERE id = ?
                    `,
                    [
                        fullQrUrl,
                        partialQrUrl,
                        fineAmount,
                        newValidUntil,
                        fineAmount,
                        fineAppliedDays,
                        shouldSendEmail ? new Date() : lastEmailSent,
                        bill.id
                    ]
                );
                
                if (shouldSendEmail) {
                    try {
                        const updatedBill = await BillModel.getBillById(bill.id);
                        tryWhatsApp(
                            { id: bill.tenant_id, phone: bill.tenant_phone, email: bill.tenant_email, full_name: bill.tenant_name, role: "tenant" },
                            "fine",
                            { amount: fineAmount, reason: "Fine applied" }
                        );
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
            } else {
                // Fine already at calculated/cap level: still advance valid_until
                // so the same bill is not re-selected on every cron tick.
                await connection.execute(
                    `
                    UPDATE bills
                    SET
                        valid_until = DATE_ADD(NOW(), INTERVAL 1 DAY),
                        status = CASE
                            WHEN paid_amount >= total_amount + IFNULL(fine_amount, 0) THEN 'paid'
                            WHEN paid_amount > 0 THEN 'partially_paid'
                            ELSE 'delayed'
                        END,
                        fine_applied_days = GREATEST(IFNULL(fine_applied_days, 0), ?)
                    WHERE id = ?
                    `,
                    [daysOverdue, bill.id]
                );
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

        const [lockedRows] = await connection.execute(
            `SELECT * FROM bills WHERE id = ? AND deleted_at IS NULL FOR UPDATE`,
            [billId]
        );
        const bill = lockedRows[0];
        if (!bill) throw new Error("Bill not found");
        if (bill.status === 'paid') throw new Error("Bill is already fully paid");

        const totalDue = Math.max(
            Number(bill.total_amount) + Number(bill.fine_amount || 0) - Number(bill.paid_amount || 0),
            0
        );
        const amount = Number(paymentData.amount);
        if (!Number.isFinite(amount) || amount <= 0) throw new Error("Invalid payment amount");
        if (amount > totalDue + 0.005) {
            throw new Error(`Payment amount (₹${amount.toFixed(2)}) exceeds total due (₹${totalDue.toFixed(2)})`);
        }

        const [partialRows] = await connection.execute(
            `SELECT COUNT(*) AS count FROM bill_payments WHERE bill_id = ? AND is_partial = 1`,
            [billId]
        );
        const wouldBePartial = amount < totalDue - 0.005;
        if (wouldBePartial && Number(partialRows[0].count) > 0) {
            throw new Error("This bill has already received a partial payment. The next payment must settle the remaining due.");
        }
        if (wouldBePartial && amount + 0.005 < totalDue * 0.5) {
            throw new Error("A partial payment must be at least 50% of the current amount due.");
        }

        if (paymentData.transaction_id) {
            const [duplicateTx] = await connection.execute(
                `SELECT id FROM bill_payments WHERE transaction_id = ? LIMIT 1`,
                [paymentData.transaction_id]
            );
            if (duplicateTx.length) throw new Error("This transaction has already been recorded.");
        }

        // Store paid_from and paid_till

        await BillModel.createBillPayment(connection, {
            bill_id: billId,
            amount,
            payment_method: paymentData.payment_method || 'qr_code',
            transaction_id: paymentData.transaction_id || null,
            is_partial: wouldBePartial ? 1 : 0,
            paid_from: paymentData.paid_from || null,
            paid_till: paymentData.paid_till || null
        });

        const newPaidAmount = parseFloat(bill.paid_amount || 0) + amount;
        const remainingAmount = parseFloat(bill.total_amount) + parseFloat(bill.fine_amount || 0) - newPaidAmount;

        let newStatus = 'paid';
        if (remainingAmount > 0) {
            if (paymentData.is_partial || (newPaidAmount < parseFloat(bill.total_amount))) {
                newStatus = 'partially_paid';
            } else {
                newStatus = 'delayed';
            }
        }

        await BillModel.updateBillStatus(connection, billId, newStatus, amount);

        // ✅ FIXED: Update tenant_details with admin-provided dates
        if (paymentData.paid_from && paymentData.paid_till) {
            // A full/group bill is shared by every occupant. Keep each tenant's
            // payment dates synchronized when the shared bill is settled.
            const [groupTenants] = await connection.execute(`
                SELECT bgm.tenant_id
                FROM bill_group_members bgm
                INNER JOIN bill_groups bg ON bg.id=bgm.bill_group_id
                WHERE bg.bill_id=?
            `, [billId]);
            const tenantIdsToUpdate = groupTenants.length
                ? groupTenants.map(r => Number(r.tenant_id))
                : [Number(bill.tenant_id)];

            for (const tenantId of tenantIdsToUpdate) {
                await updateTenantPaymentDates(
                    connection,
                    tenantId,
                    paymentData.paid_from,
                    paymentData.paid_till
                );
            }
        }

        const updatedBill = await BillModel.getBillById(billId);
        
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
            const [groupTenants] = await connection.execute(`
                SELECT t.id, t.full_name
                FROM bill_group_members bgm
                INNER JOIN bill_groups bg ON bg.id=bgm.bill_group_id
                INNER JOIN tenants t ON t.id=bgm.tenant_id
                WHERE bg.bill_id=?
            `, [billId]);
            const tenantsToNotify = groupTenants.length
                ? groupTenants
                : [{ id: bill.tenant_id, full_name: bill.tenant_name }];

            for (const tenant of tenantsToNotify) {
                if (newStatus === 'paid') {
                    await NotificationEventManager.onBillPaid(finalBill, tenant);
                    await NotificationEventManager.onTenantBillPaid(finalBill, tenant);
                } else if (newStatus === 'partially_paid') {
                    await NotificationEventManager.onBillPartiallyPaid(finalBill, tenant);
                    await NotificationEventManager.onTenantBillPartiallyPaid(finalBill, tenant);
                }
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

// ============ GENERATE BILL PAYMENT OPTIONS ============
const generateBillPaymentOptions = async (billId) => {
    const bill = await BillModel.getBillById(billId);
    if (!bill) {
        throw new Error("Bill not found");
    }

    const tenant = await TenantModel.findById(bill.tenant_id);
    if (!tenant) {
        throw new Error("Tenant not found");
    }

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
        tryWhatsApp(
            { id: tenant.id, phone: tenant.phone, email: tenant.email, full_name: tenant.full_name, role: "tenant" },
            "custom",
            { title: "Payment Link", message: "Your payment options are ready. Please check the app or email." }
        );
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

// ============ CHECK AND SEND PAYMENT REMINDERS ============
const checkAndSendPaymentReminders = async () => {
    try {

        // Get tenants with payment due in 1, 3, or 7 days using bills table
        const [tenants] = await db.query(
            `
            SELECT 
                t.id,
                t.full_name,
                t.email,
                td.rent,
                td.paid_from,
                td.payment_date,
                b.status as bill_status,
                b.total_amount,
                b.paid_amount,
                b.valid_until,
                -- Calculate days until next payment date
                CASE 
                    WHEN td.payment_date >= DAY(CURDATE()) THEN td.payment_date - DAY(CURDATE())
                    ELSE td.payment_date + DAY(LAST_DAY(CURDATE())) - DAY(CURDATE())
                END as days_until_due
            FROM tenants t
            INNER JOIN tenant_details td ON t.id = td.tenant_id
            LEFT JOIN bills b ON t.id = b.tenant_id AND b.status != 'paid'
            WHERE 
                t.role = 'tenant'
                AND t.is_active = 1
                AND td.paid_from IS NOT NULL
                AND td.rent > 0
                AND b.id IS NOT NULL
                AND CASE 
                    WHEN td.payment_date >= DAY(CURDATE()) THEN td.payment_date - DAY(CURDATE())
                    ELSE td.payment_date + DAY(LAST_DAY(CURDATE())) - DAY(CURDATE())
                END IN (1, 3, 7)
            `
        );

        let sent = 0;
        for (const tenant of tenants) {
            try {
                await NotificationEventManager.onTenantPaymentReminder(tenant, tenant.days_until_due);
                sent++;
            } catch (notifError) {
                console.error(`Failed to send payment reminder to ${tenant.full_name}:`, notifError.message);
            }
        }

        return { sent, totalChecked: tenants.length };

    } catch (error) {
        console.error("Error in checkAndSendPaymentReminders:", error);
        throw error;
    }
};


// ============ UPDATE BILL ============
const updateBill = async (billId, billData, files = {}) => {
    const connection = await db.getConnection();
    const uploadedCloudFiles = [];
    let oldPublicIdsToDelete = [];

    try {
        await connection.beginTransaction();

        const existing = await BillModel.getBillById(billId);
        if (!existing) {
            throw new Error("Bill not found");
        }

        if (existing.status === 'paid') {
            throw new Error("Cannot edit a fully paid bill. Paid bills are locked for financial integrity.");
        }
        if (parseFloat(existing.paid_amount || 0) > 0 && billData.rent_amount !== undefined) {
            // Allow electricity/maintenance tweaks but guard total vs paid later
        }

        const rent = parseFloat(billData.rent_amount !== undefined ? billData.rent_amount : existing.rent_amount);
        const electricity = parseFloat(billData.electricity_amount !== undefined ? billData.electricity_amount : existing.electricity_amount || 0);
        const maintenance = parseFloat(billData.maintenance_amount !== undefined ? billData.maintenance_amount : existing.maintenance_amount || 0);
        const other = parseFloat(billData.other_charges !== undefined ? billData.other_charges : existing.other_charges || 0);

        if (isNaN(rent) || rent < 0) throw new Error("Invalid rent amount");
        if (isNaN(electricity) || electricity < 0) throw new Error("Invalid electricity amount");
        if (isNaN(maintenance) || maintenance < 0) throw new Error("Invalid maintenance amount");
        if (isNaN(other) || other < 0) throw new Error("Invalid other charges");

        const totalAmount = rent + electricity + maintenance + other;
        const paidAmount = parseFloat(existing.paid_amount || 0);
        const fineAmount = parseFloat(existing.fine_amount || 0);

        if (totalAmount + fineAmount < paidAmount) {
            throw new Error(`New total (₹${totalAmount.toFixed(2)}) plus fine cannot be less than already paid amount (₹${paidAmount.toFixed(2)})`);
        }

        await BillModel.updateBillAmounts(connection, billId, {
            rent_amount: rent,
            electricity_amount: electricity,
            maintenance_amount: maintenance,
            other_charges: other,
            other_charges_note: billData.other_charges_note !== undefined ? billData.other_charges_note : (existing.other_charges_note || null),
            total_amount: totalAmount
        });

        // Optional meter image replacements
        const meterUpdate = {};
        if (files.meterImage && files.meterImage.length > 0) {
            if (existing.electricity_meter_public_id) {
                oldPublicIdsToDelete.push({ public_id: existing.electricity_meter_public_id, resource_type: existing.electricity_meter_resource_type || 'image' });
            }
            const uploadResult = await uploadFile(files.meterImage[0], "livinkey/bills/meters");
            if (uploadResult) {
                meterUpdate.electricity_meter_image = uploadResult.secure_url;
                meterUpdate.electricity_meter_public_id = uploadResult.public_id;
                meterUpdate.electricity_meter_resource_type = uploadResult.resource_type;
                uploadedCloudFiles.push({ public_id: uploadResult.public_id, resource_type: uploadResult.resource_type });
            }
            if (files.meterImage.length > 1) {
                if (existing.electricity_meter_public_id_2) {
                    oldPublicIdsToDelete.push({ public_id: existing.electricity_meter_public_id_2, resource_type: existing.electricity_meter_resource_type_2 || 'image' });
                }
                const uploadResult2 = await uploadFile(files.meterImage[1], "livinkey/bills/meters");
                if (uploadResult2) {
                    meterUpdate.electricity_meter_image_2 = uploadResult2.secure_url;
                    meterUpdate.electricity_meter_public_id_2 = uploadResult2.public_id;
                    meterUpdate.electricity_meter_resource_type_2 = uploadResult2.resource_type;
                    uploadedCloudFiles.push({ public_id: uploadResult2.public_id, resource_type: uploadResult2.resource_type });
                }
            }
        }

        // Optional admin QR replacement
        if (files.paymentQr && files.paymentQr.length > 0) {
            const adminFile = files.paymentQr[0];
            if (adminFile && adminFile.buffer && adminFile.buffer.length > 0) {
                if (existing.admin_qr_public_id) {
                    oldPublicIdsToDelete.push({ public_id: existing.admin_qr_public_id, resource_type: existing.admin_qr_resource_type || 'image' });
                }
                const uploadResult = await uploadFile(adminFile, "livinkey/bills/qr/admin");
                if (uploadResult && uploadResult.secure_url) {
                    meterUpdate.admin_qr = uploadResult.secure_url;
                    meterUpdate.admin_qr_public_id = uploadResult.public_id;
                    meterUpdate.admin_qr_resource_type = uploadResult.resource_type;
                    uploadedCloudFiles.push({ public_id: uploadResult.public_id, resource_type: uploadResult.resource_type });
                }
            }
        }

        // Clear meter slots if requested (without requiring a replacement upload)
        if (billData.clear_meter_1 === true || billData.clear_meter_1 === 'true' || billData.clear_meter_1 === '1') {
            if (existing.electricity_meter_public_id) {
                oldPublicIdsToDelete.push({ public_id: existing.electricity_meter_public_id, resource_type: existing.electricity_meter_resource_type || 'image' });
            }
            meterUpdate.electricity_meter_image = null;
            meterUpdate.electricity_meter_public_id = null;
            meterUpdate.electricity_meter_resource_type = null;
        }
        if (billData.clear_meter_2 === true || billData.clear_meter_2 === 'true' || billData.clear_meter_2 === '1') {
            if (existing.electricity_meter_public_id_2) {
                oldPublicIdsToDelete.push({ public_id: existing.electricity_meter_public_id_2, resource_type: existing.electricity_meter_resource_type_2 || 'image' });
            }
            meterUpdate.electricity_meter_image_2 = null;
            meterUpdate.electricity_meter_public_id_2 = null;
            meterUpdate.electricity_meter_resource_type_2 = null;
        }

        if (Object.keys(meterUpdate).length > 0) {
            await BillModel.updateBillMeterImages(connection, billId, meterUpdate);
        }

        await BillModel.insertBillAudit(connection, {
            bill_id: billId,
            admin_id: billData.updated_by || null,
            action: 'update',
            before_data: {
                rent_amount: existing.rent_amount,
                electricity_amount: existing.electricity_amount,
                maintenance_amount: existing.maintenance_amount,
                other_charges: existing.other_charges,
                total_amount: existing.total_amount
            },
            after_data: {
                rent_amount: rent,
                electricity_amount: electricity,
                maintenance_amount: maintenance,
                other_charges: other,
                total_amount: totalAmount
            },
            note: 'Bill amounts updated'
        });

        // Recalculate status based on paid vs new total
        const newDue = totalAmount + fineAmount - paidAmount;
        let newStatus = existing.status;
        if (paidAmount <= 0) {
            newStatus = newDue > 0 ? (existing.status === 'overdue' || existing.status === 'delayed' ? existing.status : 'unpaid') : 'paid';
        } else if (newDue <= 0) {
            newStatus = 'paid';
        } else {
            newStatus = 'partially_paid';
        }
        if (newStatus !== existing.status) {
            await BillModel.updateBillStatus(connection, billId, newStatus, null);
        }

        await connection.commit();

        // Cleanup old cloud files after successful commit
        for (const f of oldPublicIdsToDelete) {
            try { await deleteFile(f.public_id, f.resource_type); } catch (e) {}
        }

        // Regenerate payment QRs for remaining due
        const updated = await BillModel.getBillById(billId);
        const dueNow = parseFloat(updated.total_amount) + parseFloat(updated.fine_amount || 0) - parseFloat(updated.paid_amount || 0);

        // Delete old payment QRs
        if (updated.payment_qr_public_id) {
            try { await deleteFile(updated.payment_qr_public_id, updated.payment_qr_resource_type); } catch (e) {}
        }
        if (updated.partial_payment_qr_public_id) {
            try { await deleteFile(updated.partial_payment_qr_public_id, updated.partial_payment_qr_resource_type); } catch (e) {}
        }

        if (dueNow > 0) {
            try {
                const qrResult = await regenerateBillQRCodes(billId, updated, dueNow);
                if (qrResult.fullQr || qrResult.partialQr) {
                    const conn2 = await db.getConnection();
                    try {
                        await BillModel.updateBillQRCodes(conn2, billId, {
                            payment_qr: qrResult.fullQr,
                            payment_qr_public_id: qrResult.fullPublicId,
                            payment_qr_resource_type: qrResult.fullResourceType,
                            partial_payment_qr: qrResult.partialQr,
                            partial_payment_qr_public_id: qrResult.partialPublicId,
                            partial_payment_qr_resource_type: qrResult.partialResourceType
                        });
                    } finally {
                        conn2.release();
                    }
                }
            } catch (qrErr) {
                console.error("Failed to regenerate QR after bill update:", qrErr);
            }
        }

        return await BillModel.getBillById(billId);
    } catch (error) {
        await connection.rollback();
        await cleanupUploadedFiles(uploadedCloudFiles);
        throw error;
    } finally {
        connection.release();
    }
};

// ============ DELETE BILL ============
const deleteBill = async (billId, adminId = null) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Include soft-deleted check via raw query if getBillById filters them
        const [rows] = await connection.execute(
            `SELECT * FROM bills WHERE id = ? AND deleted_at IS NULL`,
            [billId]
        );
        const existing = rows[0];
        if (!existing) {
            throw new Error("Bill not found");
        }

        // Production rule: never destroy paid / partially paid financial history via delete
        if (existing.status === 'paid') {
            throw new Error("Fully paid bills cannot be deleted. They are locked for financial integrity.");
        }
        if (parseFloat(existing.paid_amount || 0) > 0) {
            throw new Error("This bill has recorded payments and cannot be deleted. Adjust or keep it for records.");
        }

        // Soft-delete preserves related payment rows for audit; hide bill from all listings
        const affected = await BillModel.softDeleteBill(connection, billId, adminId);
        if (!affected) {
            throw new Error("Failed to delete bill");
        }

        await BillModel.insertBillAudit(connection, {
            bill_id: billId,
            admin_id: adminId,
            action: 'soft_delete',
            before_data: {
                status: existing.status,
                total_amount: existing.total_amount,
                billing_month: existing.billing_month
            },
            after_data: { deleted: true },
            note: 'Bill soft-deleted by admin'
        });

        // Soft-clean notification references
        try {
            await connection.execute(
                `DELETE FROM admin_notifications WHERE entity_type = 'bill' AND entity_id = ?`,
                [billId]
            );
        } catch (e) {}
        try {
            await connection.execute(
                `DELETE FROM tenant_notifications WHERE entity_type = 'bill' AND entity_id = ?`,
                [billId]
            );
        } catch (e) {}

        await connection.commit();

        // Optionally remove bill-level QR/meter assets from cloud (proofs kept with soft-deleted bill history)
        const cloudFiles = [];
        const pushIf = (pid, rt) => { if (pid) cloudFiles.push({ public_id: pid, resource_type: rt || 'image' }); };
        pushIf(existing.payment_qr_public_id, existing.payment_qr_resource_type);
        pushIf(existing.partial_payment_qr_public_id, existing.partial_payment_qr_resource_type);
        for (const f of cloudFiles) {
            try { await deleteFile(f.public_id, f.resource_type); } catch (e) {}
        }

        return { id: billId, deleted: true, soft: true };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

// ============ ROOM-BASED BILL CREATION ============
// One admin action always starts from a room. The backend derives the tenants
// and their recorded rents from the database so the client cannot overbill or
// accidentally omit a room occupant.
//
// "individual"/"split" => one bill per active tenant, with the room-level bill
// split equally across all occupants.
// "group"/"full" => one shared room bill; payment of that bill settles it for
// every tenant in the room because all tenants reference the same bill group.
const createBillsForTenants = async (tenantIds, billData, files = {}) => {
    const requestedIds = [...new Set((tenantIds || []).map(Number).filter(Number.isInteger))];
    if (!requestedIds.length) throw new Error("At least one tenant must be selected");

    // Billing type is meaningful only for a shared room. A single-tenant room
    // always gets one normal individual bill; clients cannot force a group bill.
    const requestedMode = ['group', 'full', 'full_bill'].includes(String(billData.bill_mode || '').toLowerCase())
        ? 'group'
        : 'individual';

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Resolve the room from the selected tenant set. If room_id was supplied,
        // it must match every selected tenant. All active occupants are then billed
        // so a malicious/buggy client cannot create a partial room bill.
        const placeholders = requestedIds.map(() => '?').join(',');
        const [members] = await connection.execute(`
            SELECT td.tenant_id, td.pg_id, td.room_id, td.rent, r.room_number,
                   r.rent AS room_rent, t.full_name, t.email, t.phone
            FROM tenant_details td
            INNER JOIN tenants t ON t.id=td.tenant_id
            INNER JOIN rooms r ON r.id=td.room_id
            WHERE td.tenant_id IN (${placeholders})
              AND t.role='tenant' AND t.is_active=1
              AND r.is_active=1 AND r.deleted_at IS NULL
            FOR UPDATE
        `, requestedIds);

        if (members.length !== requestedIds.length) {
            throw new Error("All selected tenants must be active tenants with valid room assignments.");
        }

        const roomIds = [...new Set(members.map(x => Number(x.room_id)))];
        const pgIds = [...new Set(members.map(x => Number(x.pg_id)))];
        if (roomIds.length !== 1 || pgIds.length !== 1) {
            throw new Error("Billing must be created for tenants in the same room and PG.");
        }

        const roomId = roomIds[0];
        if (billData.room_id && Number(billData.room_id) !== roomId) {
            throw new Error("The selected room does not match the selected tenants.");
        }
        if (billData.pg_id && Number(billData.pg_id) !== pgIds[0]) {
            throw new Error("The selected PG does not match the selected room.");
        }

        const [allOccupants] = await connection.execute(`
            SELECT td.tenant_id, td.rent, t.full_name, t.email, t.phone
            FROM tenant_details td
            INNER JOIN tenants t ON t.id=td.tenant_id
            WHERE td.room_id=? AND td.pg_id=? AND t.role='tenant' AND t.is_active=1
            ORDER BY t.full_name
            FOR UPDATE
        `, [roomId, pgIds[0]]);

        if (!allOccupants.length) throw new Error("The selected room has no active tenants.");
        const selectedSet = new Set(requestedIds);
        if (allOccupants.some(x => !selectedSet.has(Number(x.tenant_id)))) {
            throw new Error("All active tenants in the selected room must be included in the bill.");
        }

        const occupantCount = allOccupants.length;
        // A group bill is allowed only when the selected room actually has
        // multiple active tenants. This is enforced server-side as well as in
        // the admin UI so the billing rule cannot be bypassed by a client.
        const mode = requestedMode === 'group' && occupantCount > 1 ? 'group' : 'individual';
        const roomRent = Number(members[0].room_rent || 0);
        const recordedRentTotal = allOccupants.reduce((sum, x) => sum + Number(x.rent || 0), 0);
        const roomTotalRent = roomRent > 0 ? roomRent : recordedRentTotal;
        if (!Number.isFinite(roomTotalRent) || roomTotalRent <= 0) {
            throw new Error("The selected room has no valid recorded rent.");
        }

        const electricity = Number(billData.electricity_amount || 0);
        const maintenance = Number(billData.maintenance_amount || 0);
        const other = Number(billData.other_charges || 0);
        if (![electricity, maintenance, other].every(Number.isFinite) || electricity < 0 || maintenance < 0 || other < 0) {
            throw new Error("Bill charges must be valid non-negative amounts.");
        }

        // ALL room-level bill components are split in Split Bill mode: rent,
        // electricity, maintenance and other charges. Allocate cents
        // deterministically so the tenant bills always add back to the exact
        // original room bill (the final tenant receives any 0.01 remainder).
        const allocateEvenly = (value) => {
            const base = Math.floor((value / occupantCount) * 100) / 100;
            const allocations = Array.from({ length: occupantCount }, () => base);
            const remainder = Math.round((value - base * occupantCount) * 100) / 100;
            allocations[allocations.length - 1] = Math.round((base + remainder) * 100) / 100;
            return allocations;
        };
        const rentAllocations = allocateEvenly(roomTotalRent);
        const electricityAllocations = allocateEvenly(electricity);
        const maintenanceAllocations = allocateEvenly(maintenance);
        const otherAllocations = allocateEvenly(other);

        const createData = {
            ...billData,
            room_id: roomId,
            pg_id: pgIds[0]
        };

        // Release this validation transaction before calling createBill, which
        // owns its own transaction and sends notifications/emails.
        await connection.commit();

        if (mode === 'group') {
            const bill = await createBill({
                ...createData,
                tenant_id: Number(allOccupants[0].tenant_id),
                rent_amount: roomTotalRent,
                electricity_amount: electricity,
                maintenance_amount: maintenance,
                other_charges: other,
                bill_mode: 'group',
                skipEmail: true
            }, files);

            const groupConnection = await db.getConnection();
            try {
                await groupConnection.beginTransaction();
                const [groupResult] = await groupConnection.execute(
                    `INSERT INTO bill_groups (bill_id, billing_month, created_by) VALUES (?, ?, ?)`,
                    [bill.id, bill.billing_month, billData.created_by]
                );
                const groupId = groupResult.insertId;
                await groupConnection.execute(`UPDATE bills SET bill_group_id=? WHERE id=?`, [groupId, bill.id]);
                for (const tenant of allOccupants) {
                    await groupConnection.execute(
                        `INSERT INTO bill_group_members (bill_group_id, tenant_id) VALUES (?, ?)`,
                        [groupId, tenant.tenant_id]
                    );
                }
                await groupConnection.commit();

                const fullBill = await BillModel.getBillById(bill.id);
                let emailCount = 0;
                for (const tenant of allOccupants) {
                    try {
                        if (tenant.email) {
                            await sendBillEmail(
                                tenant.email, tenant.full_name,
                                { ...fullBill, tenant_name: tenant.full_name, tenant_email: tenant.email },
                                fullBill.payment_qr, fullBill.partial_payment_qr,
                                fullBill.electricity_meter_image, fullBill.admin_qr, fullBill.electricity_meter_image_2
                            );
                            emailCount++;
                        }
                        tryWhatsApp(
                            { id: tenant.tenant_id, phone: tenant.phone, email: tenant.email, full_name: tenant.full_name, role: "tenant" },
                            "bill",
                            { amount: fullBill.total_amount, dueDate: fullBill.due_date, billId: fullBill.id }
                        );
                    } catch (e) {
                        console.error(`Failed to notify group tenant ${tenant.tenant_id}:`, e.message);
                    }
                }

                return {
                    mode: 'group',
                    group_id: groupId,
                    bill_id: bill.id,
                    room_id: roomId,
                    created_count: 1,
                    failed_count: 0,
                    billed_tenant_count: occupantCount,
                    email_sent_count: emailCount,
                    results: allOccupants.map(t => ({ tenant_id: t.tenant_id, success: true, bill: fullBill }))
                };
            } catch (error) {
                await groupConnection.rollback();
                try { await db.execute(`UPDATE bills SET deleted_at=NOW() WHERE id=?`, [bill.id]); } catch (_) {}
                throw error;
            } finally {
                groupConnection.release();
            }
        }

        const results = [];
        for (let occupantIndex = 0; occupantIndex < allOccupants.length; occupantIndex++) {
            const tenant = allOccupants[occupantIndex];
            try {
                const bill = await createBill({
                    ...createData,
                    tenant_id: Number(tenant.tenant_id),
                    rent_amount: rentAllocations[occupantIndex],
                    electricity_amount: electricityAllocations[occupantIndex],
                    maintenance_amount: maintenanceAllocations[occupantIndex],
                    other_charges: otherAllocations[occupantIndex],
                    bill_mode: 'individual'
                }, files);
                results.push({ tenant_id: tenant.tenant_id, success: true, bill });
            } catch (error) {
                results.push({ tenant_id: tenant.tenant_id, success: false, message: error.message });
            }
        }

        const created = results.filter(r => r.success);
        if (!created.length) throw new Error(results[0]?.message || "No bills could be created");
        return {
            mode: 'individual',
            room_id: roomId,
            created_count: created.length,
            failed_count: results.length - created.length,
            billed_tenant_count: occupantCount,
            results
        };
    } catch (error) {
        try { await connection.rollback(); } catch (_) {}
        throw error;
    } finally {
        connection.release();
    }
};

module.exports = {
    createBill,
    createBillsForTenants,
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
    regenerateBillQRCodes,
    checkAndSendPaymentReminders,
    updateTenantPaidTill,
    updateTenantPaymentDates,
    getTenantPaymentStatus,
    updateBill,
    deleteBill
};