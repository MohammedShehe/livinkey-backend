const express = require("express");
const router = express.Router();

const fineAdjustmentController = require("../controllers/fine.adjustment.controller");
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const permissionMiddleware = require("../middleware/permission.middleware");

// All routes require authentication
router.use(authMiddleware);

// GET all fine adjustments (admin reporting) - Must come before /:id routes
router.get(
    "/all",
    roleMiddleware("super_admin", "admin"),
    permissionMiddleware("bills", "view"),
    fineAdjustmentController.getAllFineAdjustments
);

// GET fine adjustment history for a specific bill
router.get(
    "/:id/fine-adjustments",
    roleMiddleware("super_admin", "admin"),
    permissionMiddleware("bills", "view"),
    fineAdjustmentController.getFineAdjustmentHistory
);

// PUT adjust fine on a bill
router.put(
    "/:id/fine-adjust",
    roleMiddleware("super_admin", "admin"),
    permissionMiddleware("bills", "edit"),
    fineAdjustmentController.adjustFine
);

module.exports = router;