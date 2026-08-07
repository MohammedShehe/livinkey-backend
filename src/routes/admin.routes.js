const express = require("express");

const router = express.Router();

const adminController = require("../controllers/admin.controller");

const authMiddleware = require("../middleware/auth.middleware");

const roleMiddleware = require("../middleware/role.middleware");

const upload = require("../middleware/upload.middleware");

router.post(
    "/",
    authMiddleware,
    roleMiddleware("super_admin"),
    upload.single("id_document"),
    adminController.createAdmin
);

router.get(
    "/",
    authMiddleware,
    roleMiddleware("super_admin"),
    adminController.getAllAdmins
);

router.put(
    "/:id/permissions",
    authMiddleware,
    roleMiddleware("super_admin"),
    adminController.updatePermissions
);

router.get(
    "/:id",
    authMiddleware,
    roleMiddleware("super_admin"),
    adminController.getAdmin
);

router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("super_admin"),
    upload.single("id_document"),
    adminController.updateAdmin
);

router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("super_admin"),
    adminController.deleteAdmin
);

module.exports = router;