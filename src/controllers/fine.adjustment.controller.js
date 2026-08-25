const fineAdjustmentService = require("../services/fine.adjustment.service");

/**
 * Adjust fine on a bill
 * PUT /api/bills/:id/fine-adjust
 */
const adjustFine = async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.admin.id;
        const { new_fine_amount, reason } = req.body;

        if (new_fine_amount === undefined || new_fine_amount === null) {
            return res.status(400).json({
                success: false,
                message: "New fine amount is required"
            });
        }

        if (!reason || reason.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Reason for adjustment is required"
            });
        }

        const bill = await fineAdjustmentService.adjustFine(
            parseInt(id),
            parseInt(adminId),
            {
                new_fine_amount: parseFloat(new_fine_amount),
                reason: reason.trim()
            }
        );

        return res.status(200).json({
            success: true,
            message: "Fine adjusted successfully",
            data: bill
        });

    } catch (error) {
        console.error("Adjust Fine Error:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

/**
 * Get fine adjustment history for a bill
 * GET /api/bills/:id/fine-adjustments
 */
const getFineAdjustmentHistory = async (req, res) => {
    try {
        const { id } = req.params;

        const history = await fineAdjustmentService.getFineAdjustmentHistory(parseInt(id));

        return res.status(200).json({
            success: true,
            data: history
        });

    } catch (error) {
        console.error("Get Fine Adjustment History Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

/**
 * Get all fine adjustments (admin reporting)
 * GET /api/bills/fine-adjustments/all
 */
const getAllFineAdjustments = async (req, res) => {
    try {
        const { bill_id, admin_id, from_date, to_date } = req.query;

        const filters = {};
        if (bill_id) filters.bill_id = parseInt(bill_id);
        if (admin_id) filters.admin_id = parseInt(admin_id);
        if (from_date) filters.from_date = from_date;
        if (to_date) filters.to_date = to_date;

        const adjustments = await fineAdjustmentService.getAllFineAdjustments(filters);

        return res.status(200).json({
            success: true,
            count: adjustments.length,
            data: adjustments
        });

    } catch (error) {
        console.error("Get All Fine Adjustments Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = {
    adjustFine,
    getFineAdjustmentHistory,
    getAllFineAdjustments
};