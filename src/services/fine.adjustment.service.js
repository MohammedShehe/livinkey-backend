const db = require("../config/db");
const BillModel = require("../models/bill.model");
const FineAdjustmentModel = require("../models/bill.fine.adjustment.model");
const { deleteFile } = require("./upload.service");
const { regenerateBillQRCodes } = require("./bill.service");
const { sendFineAdjustedEmail } = require("./mail.service");
const firebase = require("../config/firebase");
const NotificationEventManager = require("../utils/notification.events");

/**
 * Adjust (reduce) fine on a bill
 */
const adjustFine = async (billId, adminId, adjustmentData) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // Get current bill
        const bill = await BillModel.getBillById(billId);
        if (!bill) {
            throw new Error("Bill not found");
        }

        if (bill.status === 'paid') {
            throw new Error("Cannot adjust fine on a paid bill");
        }

        const currentFine = parseFloat(bill.fine_amount) || 0;

        // Validate new fine amount
        const newFine = parseFloat(adjustmentData.new_fine_amount);
        if (isNaN(newFine) || newFine < 0) {
            throw new Error("New fine amount must be a non-negative number");
        }

        if (newFine > currentFine) {
            throw new Error("New fine amount cannot exceed current fine amount");
        }

        if (newFine === currentFine) {
            throw new Error("New fine amount is same as current fine. No adjustment needed.");
        }

        if (!adjustmentData.reason || adjustmentData.reason.trim().length === 0) {
            throw new Error("Reason for adjustment is required");
        }

        if (adjustmentData.reason.trim().length > 200) {
            throw new Error("Reason must not exceed 200 characters");
        }

        // Create adjustment log
        await FineAdjustmentModel.createFineAdjustment(connection, {
            bill_id: billId,
            admin_id: adminId,
            old_fine_amount: currentFine,
            new_fine_amount: newFine,
            reason: adjustmentData.reason.trim()
        });

        // Update bill fine amount
        const totalAmount = parseFloat(bill.total_amount) || 0;
        const newTotal = totalAmount + newFine;

        // Determine new status
        let newStatus = bill.status;
        const paidAmount = parseFloat(bill.paid_amount) || 0;

        // If fine was reduced to 0 and bill was in 'delayed' status,
        // revert to previous status
        if (newFine === 0 && bill.status === 'delayed') {
            // Check if bill has any payments
            if (paidAmount > 0) {
                const remainingAmount = totalAmount - paidAmount;
                newStatus = remainingAmount > 0 ? 'partially_paid' : 'paid';
            } else {
                newStatus = 'unpaid';
            }
        }

        await connection.execute(
            `
            UPDATE bills 
            SET 
                fine_amount = ?,
                total_amount = ?,
                status = ?,
                valid_until = DATE_ADD(NOW(), INTERVAL 7 DAY)
            WHERE id = ?
            `,
            [newFine, totalAmount, newStatus, billId]
        );

        // Regenerate QR codes with new total
        const fixedBill = await BillModel.getBillById(billId);
        const totalDue = parseFloat(fixedBill.total_amount) + parseFloat(fixedBill.fine_amount || 0) - 
                         parseFloat(fixedBill.paid_amount || 0);

        // Delete old QR codes
        if (fixedBill.payment_qr_public_id) {
            try {
                await deleteFile(fixedBill.payment_qr_public_id, fixedBill.payment_qr_resource_type);
            } catch (e) { /* ignore */ }
        }
        if (fixedBill.partial_payment_qr_public_id) {
            try {
                await deleteFile(fixedBill.partial_payment_qr_public_id, fixedBill.partial_payment_qr_resource_type);
            } catch (e) { /* ignore */ }
        }

        // Regenerate QR codes if there's still a due amount
        let fullQr = null;
        let fullPublicId = null;
        let fullResourceType = null;
        let partialQr = null;
        let partialPublicId = null;
        let partialResourceType = null;

        if (totalDue > 0) {
            const qrResult = await regenerateBillQRCodes(billId, fixedBill, totalDue);
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

        // Get updated bill
        const updatedBill = await BillModel.getBillById(billId);

        // Send notifications
        try {
            const tenant = { 
                full_name: bill.tenant_name, 
                id: bill.tenant_id,
                email: bill.tenant_email
            };

            // Send email to tenant
            await sendFineAdjustedEmail(
                bill.tenant_email,
                bill.tenant_name,
                updatedBill,
                currentFine,
                newFine,
                adjustmentData.reason.trim()
            );

            // Send push notification
            const fcmTokens = await firebase.getTenantFCMTokens(bill.tenant_id);
            if (fcmTokens.length > 0) {
                await firebase.sendPushNotificationToMultiple(
                    fcmTokens,
                    {
                        title: "💰 Late Fee Adjusted",
                        body: `Your late fee has been adjusted. New total due: ₹${(parseFloat(updatedBill.total_amount) + parseFloat(updatedBill.fine_amount || 0) - parseFloat(updatedBill.paid_amount || 0)).toFixed(2)}`
                    },
                    {
                        type: 'fine_adjusted',
                        entity_id: billId,
                        action: 'open_bill'
                    }
                );
            }

            // Send in-app notification
            await NotificationEventManager.onTenantFineAdjusted(updatedBill, currentFine, newFine);
        } catch (notifError) {
            console.error("Failed to send fine adjustment notifications:", notifError);
        }

        return updatedBill;

    } catch (error) {
        await connection.rollback();
        console.error("Adjust Fine Error:", error);
        throw error;
    } finally {
        connection.release();
    }
};

/**
 * Get fine adjustment history for a bill
 */
const getFineAdjustmentHistory = async (billId) => {
    return await FineAdjustmentModel.getFineAdjustmentsByBillId(billId);
};

/**
 * Get all fine adjustments with filters (admin reporting)
 */
const getAllFineAdjustments = async (filters = {}) => {
    return await FineAdjustmentModel.getFineAdjustments(filters);
};

module.exports = {
    adjustFine,
    getFineAdjustmentHistory,
    getAllFineAdjustments
};