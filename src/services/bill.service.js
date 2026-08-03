const db = require("../config/db");
const BillModel = require("../models/bill.model");
const { uploadFile, deleteFile } = require("./upload.service");
const { sendBillEmail } = require("./mail.service");
const QRCode = require("qrcode");
const path = require("path");
const fs = require("fs");
const os = require("os");

const generateQRCode = async (data, folder) => {
    const tempDir = os.tmpdir();
    const fileName = `qr_${Date.now()}_${Math.random().toString(36).substring(7)}.png`;
    const filePath = path.join(tempDir, fileName);
    
    await QRCode.toFile(filePath, data, {
        width: 300,
        margin: 2,
        color: {
            dark: "#000000",
            light: "#ffffff"
        }
    });
    
    return filePath;
};

const createBill = async (billData, files = {}) => {
    const connection = await db.getConnection();

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

        // 1. Upload meter image if provided
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
            }
        }

        // 2. Generate auto full payment QR code
        const paymentData = {
            billId: null,
            tenantId: billData.tenant_id,
            amount: totalAmount,
            type: 'full_payment'
        };
        
        const paymentQrPath = await generateQRCode(JSON.stringify(paymentData), 'full');
        const paymentQrUpload = await uploadFile(
            { buffer: fs.readFileSync(paymentQrPath), originalname: 'qr_full.png' },
            "livinkey/bills/qr"
        );
        fs.unlinkSync(paymentQrPath);

        if (!paymentQrUpload || !paymentQrUpload.secure_url) {
            throw new Error("Failed to generate/upload full payment QR code");
        }
        
        const paymentQr = paymentQrUpload.secure_url;
        const paymentQrPublicId = paymentQrUpload.public_id;
        const paymentQrResourceType = paymentQrUpload.resource_type;

        // 3. Generate auto partial payment QR code (50%)
        const partialAmount = totalAmount * 0.5;
        const partialPaymentData = {
            billId: null,
            tenantId: billData.tenant_id,
            amount: partialAmount,
            type: 'partial_payment'
        };
        
        const partialQrPath = await generateQRCode(JSON.stringify(partialPaymentData), 'partial');
        const partialQrUpload = await uploadFile(
            { buffer: fs.readFileSync(partialQrPath), originalname: 'qr_partial.png' },
            "livinkey/bills/qr"
        );
        fs.unlinkSync(partialQrPath);

        if (!partialQrUpload || !partialQrUpload.secure_url) {
            throw new Error("Failed to generate/upload partial payment QR code");
        }
        
        const partialQr = partialQrUpload.secure_url;
        const partialQrPublicId = partialQrUpload.public_id;
        const partialQrResourceType = partialQrUpload.resource_type;

        // 4. Upload admin's custom QR if provided (keep separate from auto-generated)
        let adminQr = null;
        let adminQrPublicId = null;
        let adminQrResourceType = null;

        const adminQrFile = files.paymentQr && files.paymentQr.length > 0 ? files.paymentQr[0] : null;
        const adminQrIsValid = adminQrFile && adminQrFile.buffer && adminQrFile.buffer.length > 0;

        if (adminQrIsValid) {
            const uploadResult = await uploadFile(
                adminQrFile,
                "livinkey/bills/qr/admin"
            );
            if (uploadResult && uploadResult.secure_url) {
                adminQr = uploadResult.secure_url;
                adminQrPublicId = uploadResult.public_id;
                adminQrResourceType = uploadResult.resource_type;
                console.log("Admin QR Uploaded:", adminQr);
            } else {
                console.warn("Admin-uploaded paymentQr failed to upload");
            }
        }

        const sentAt = new Date();
        const validUntil = new Date(sentAt.getTime() + 7 * 24 * 60 * 60 * 1000);

        // Use auto-generated QR for the main payment_qr column
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
            payment_qr: paymentQr,  // Auto-generated full QR
            payment_qr_public_id: paymentQrPublicId,
            payment_qr_resource_type: paymentQrResourceType,
            partial_payment_qr: partialQr,  // Auto-generated partial QR
            partial_payment_qr_public_id: partialQrPublicId,
            partial_payment_qr_resource_type: partialQrResourceType,
            sent_at: sentAt,
            valid_until: validUntil,
            created_by: billData.created_by
        });

        paymentData.billId = billId;
        partialPaymentData.billId = billId;

        await connection.commit();

        // Send email with ALL images
        try {
            const tenant = await BillModel.getBillById(billId);
            console.log("Full QR URL:", paymentQr);
            console.log("Partial QR URL:", partialQr);
            console.log("Meter Image URL:", meterImage);
            console.log("Admin QR URL:", adminQr);
            
            await sendBillEmail(
                tenant.tenant_email,
                tenant.tenant_name,
                tenant,
                paymentQr,      // Auto-generated full QR
                partialQr,      // Auto-generated partial QR
                meterImage,     // Meter image
                adminQr         // Admin custom QR (optional)
            );
        } catch (emailError) {
            console.error("Failed to send bill email:", emailError);
        }

        const createdBill = await BillModel.getBillById(billId);
        return createdBill;

    } catch (error) {
        await connection.rollback();
        console.error("Bill Creation Error:", error);
        throw error;

    } finally {
        connection.release();
    }
};

const getUnpaidTenants = async () => {
    return await BillModel.getUnpaidTenants();
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

const processDelayedPayments = async () => {
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();
        
        const overdueBills = await BillModel.getOverdueBills();
        
        for (const bill of overdueBills) {
            const newFineAmount = (bill.fine_amount || 0) + 100;
            const newValidUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
            
            await BillModel.updateBillFine(
                connection,
                bill.id,
                newFineAmount,
                newValidUntil
            );
            
            console.log(`Applied fine to bill ${bill.id}: +100, total fine: ${newFineAmount}`);
        }
        
        await connection.commit();
        return overdueBills.length;
        
    } catch (error) {
        await connection.rollback();
        console.error("Process Delayed Payments Error:", error);
        throw error;
        
    } finally {
        connection.release();
    }
};

module.exports = {
    createBill,
    getUnpaidTenants,
    getBillById,
    getBillsByTenant,
    getBillStats,
    getOverdueBills,
    processDelayedPayments
};