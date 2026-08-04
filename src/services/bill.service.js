const db = require("../config/db");
const BillModel = require("../models/bill.model");
const { uploadFile, deleteFile, deleteMultipleFiles } = require("./upload.service");
const { sendBillEmail, sendFineNotificationEmail, sendCustomBillMessageEmail } = require("./mail.service");
const QRCode = require("qrcode");
const path = require("path");
const fs = require("fs");
const os = require("os");

const generateQRCode = async (data, folder) => {
    const tempDir = os.tmpdir();
    const fileName = `qr_${Date.now()}_${Math.random().toString(36).substring(7)}.png`;
    const filePath = path.join(tempDir, fileName);
    
    try {
        await QRCode.toFile(filePath, data, {
            width: 300,
            margin: 2,
            color: {
                dark: "#000000",
                light: "#ffffff"
            }
        });
        return filePath;
    } catch (error) {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        throw error;
    }
};

const cleanupUploadedFiles = async (uploadedFiles) => {
    const toDelete = [];
    for (const file of uploadedFiles) {
        if (file && file.public_id) {
            toDelete.push({ public_id: file.public_id, resource_type: file.resource_type });
        }
    }
    if (toDelete.length > 0) {
        await deleteMultipleFiles(toDelete);
    }
};

const getQRExpiryTime = (existingExpiry = null) => {
    if (existingExpiry && new Date(existingExpiry) > new Date()) {
        // If there's an existing valid expiry, use it
        return new Date(existingExpiry);
    }
    // Otherwise, set to 24 hours from now
    return new Date(Date.now() + 24 * 60 * 60 * 1000);
};

const createBill = async (billData, files = {}) => {
    const connection = await db.getConnection();
    const uploadedCloudFiles = [];
    let tempFiles = [];

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

        let paymentQrPath = null;
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
            
            paymentQrPath = await generateQRCode(JSON.stringify(paymentData), 'full');
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

        let partialQrPath = null;
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
            
            partialQrPath = await generateQRCode(JSON.stringify(partialPaymentData), 'partial');
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
                    console.log("Admin QR Uploaded:", adminQr);
                }
            } catch (adminQrError) {
                console.warn("Admin-uploaded paymentQr failed to upload:", adminQrError.message);
            }
        }

        const sentAt = new Date();
        const validUntil = new Date(sentAt.getTime() + 7 * 24 * 60 * 60 * 1000);

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
            sent_at: sentAt,
            valid_until: validUntil,
            created_by: billData.created_by,
            fine_applied_days: 0,
            last_fine_email_sent: null
        });

        await connection.commit();

        let emailSent = false;
        try {
            const tenant = await BillModel.getBillById(billId);
            await sendBillEmail(
                tenant.tenant_email,
                tenant.tenant_name,
                tenant,
                paymentQr,
                partialQr,
                meterImage,
                adminQr
            );
            emailSent = true;
        } catch (emailError) {
            console.error("Failed to send bill email:", emailError);
        }

        const createdBill = await BillModel.getBillById(billId);
        return { ...createdBill, email_sent: emailSent };

    } catch (error) {
        await connection.rollback();
        await cleanupUploadedFiles(uploadedCloudFiles);
        for (const tempFile of tempFiles) {
            if (fs.existsSync(tempFile)) {
                try {
                    fs.unlinkSync(tempFile);
                } catch (unlinkError) {
                    console.error("Failed to delete temp file:", unlinkError);
                }
            }
        }
        console.error("Bill Creation Error:", error);
        throw error;

    } finally {
        connection.release();
    }
};

const getUnpaidTenants = async () => {
    return await BillModel.getUnpaidTenants();
};

const getBills = async (filters = {}) => {
    return await BillModel.getBills(filters);
};

const getBillById = async (billId) => {
    return await BillModel.getBillById(billId);
};

const getBillsByTenant = async (tenantId) => {
    return await BillModel.getBillsByTenant(tenantId);
};

const getBillStats = async () => {
    return await BillModel.getBillStats();
};

const getOverdueBills = async () => {
    return await BillModel.getOverdueBills();
};

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

        // Check if there's an active QR code
        const activeMessage = await BillModel.getActiveCustomMessage(billId);
        let qrCodeUrl = null;
        let qrCodePublicId = null;
        let qrCodeResourceType = null;
        let qrExpiresAt = null;

        const totalDue = parseFloat(bill.total_amount) + parseFloat(bill.fine_amount || 0) - parseFloat(bill.paid_amount || 0);

        if (activeMessage && activeMessage.qr_expires_at && new Date(activeMessage.qr_expires_at) > new Date()) {
            // Use existing QR code and expiry
            qrCodeUrl = activeMessage.custom_message_qr;
            qrCodePublicId = activeMessage.custom_message_qr_public_id;
            qrCodeResourceType = activeMessage.custom_message_qr_resource_type;
            qrExpiresAt = activeMessage.qr_expires_at;
            console.log("Reusing existing QR code, expires at:", qrExpiresAt);
        } else if (totalDue > 0) {
            // Generate new QR code with 24 hours validity (end of day)
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

        // Upload admin's custom QR if provided
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

        // Update bill with message data
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

        // Send email
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

        const updatedBill = await BillModel.getBillById(billId);
        return updatedBill;

    } catch (error) {
        await connection.rollback();
        await cleanupUploadedFiles(uploadedCloudFiles);
        for (const tempFile of tempFiles) {
            if (fs.existsSync(tempFile)) {
                try {
                    fs.unlinkSync(tempFile);
                } catch (unlinkError) {
                    console.error("Failed to delete temp file:", unlinkError);
                }
            }
        }
        console.error("Send Custom Message Error:", error);
        throw error;

    } finally {
        connection.release();
    }
};

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
                DATEDIFF(NOW(), b.sent_at) as days_since_sent
            FROM bills b
            INNER JOIN tenants t ON b.tenant_id = t.id
            WHERE b.status IN ('unpaid', 'partially_paid', 'delayed')
            AND b.valid_until < NOW()
            AND b.sent_at IS NOT NULL
            ORDER BY b.valid_until ASC
            FOR UPDATE
            `
        );

        for (const bill of overdueBills[0]) {
            const daysSinceSent = Math.floor((Date.now() - new Date(bill.sent_at).getTime()) / (1000 * 60 * 60 * 24));
            
            let shouldApplyFine = false;
            let fineAmount = bill.fine_amount || 0;
            
            const hasPartialPayment = bill.total_partial_paid > 0;
            
            if (hasPartialPayment) {
                if (daysSinceSent > 14) {
                    shouldApplyFine = true;
                    const daysOverdue = daysSinceSent - 14;
                    fineAmount = daysOverdue * 100;
                }
            } else {
                if (daysSinceSent > 7) {
                    shouldApplyFine = true;
                    const daysOverdue = daysSinceSent - 7;
                    fineAmount = daysOverdue * 100;
                }
            }
            
            if (shouldApplyFine) {
                const newValidUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
                const fineAppliedDays = Math.floor((Date.now() - new Date(bill.sent_at).getTime()) / (1000 * 60 * 60 * 24)) - (hasPartialPayment ? 14 : 7);
                
                const lastEmailSent = bill.last_fine_email_sent;
                const today = new Date().toDateString();
                const shouldSendEmail = !lastEmailSent || new Date(lastEmailSent).toDateString() !== today;
                
                const totalAmount = parseFloat(bill.total_amount) || 0;
                const totalWithFine = totalAmount + fineAmount;
                
                console.log(`Generating new QR codes for bill ${bill.id} with total: ${totalWithFine}`);
                
                let fullQrUrl = bill.payment_qr;
                let partialQrUrl = bill.partial_payment_qr;
                let fullQrPath = null;
                let partialQrPath = null;

                try {
                    const fullPaymentData = {
                        billId: bill.id,
                        tenantId: bill.tenant_id,
                        amount: totalWithFine,
                        type: 'full_payment_with_fine'
                    };
                    
                    fullQrPath = await generateQRCode(JSON.stringify(fullPaymentData), 'full');
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
                    
                    partialQrPath = await generateQRCode(JSON.stringify(partialPaymentData), 'partial');
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
                        console.log(`Fine notification with new QR codes sent for bill ${bill.id}`);
                    } catch (emailError) {
                        console.error(`Failed to send fine email for bill ${bill.id}:`, emailError);
                    }
                }
                
                processedCount++;
            }
        }
        
        await connection.commit();

        for (const tempFile of tempFiles) {
            if (fs.existsSync(tempFile)) {
                try {
                    fs.unlinkSync(tempFile);
                } catch (unlinkError) {
                    console.error("Failed to delete temp file:", unlinkError);
                }
            }
        }

        return processedCount;
        
    } catch (error) {
        await connection.rollback();
        await cleanupUploadedFiles(uploadedCloudFiles);
        for (const tempFile of tempFiles) {
            if (fs.existsSync(tempFile)) {
                try {
                    fs.unlinkSync(tempFile);
                } catch (unlinkError) {
                    console.error("Failed to delete temp file:", unlinkError);
                }
            }
        }
        console.error("Process Delayed Payments Error:", error);
        throw error;
        
    } finally {
        connection.release();
    }
};

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

        const totalDue = parseFloat(bill.total_amount) + parseFloat(bill.fine_amount || 0) - parseFloat(bill.paid_amount || 0);
        
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

        await connection.commit();

        const updatedBill = await BillModel.getBillById(billId);
        return updatedBill;

    } catch (error) {
        await connection.rollback();
        console.error("Add Payment Error:", error);
        throw error;

    } finally {
        connection.release();
    }
};

module.exports = {
    createBill,
    getUnpaidTenants,
    getBills,
    getBillById,
    getBillsByTenant,
    getBillStats,
    getOverdueBills,
    sendCustomMessageToTenant,
    processDelayedPayments,
    addPayment
};