const express = require("express");
const userActivity = require("../middleware/user.activity.middleware");
const activityAudit = require("../middleware/activity.audit.middleware");
const router = express.Router();

const tenantDocumentController = require("../controllers/tenant.document.controller");
const tenantAuthMiddleware = require("../middleware/tenant.auth.middleware");
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const permissionMiddleware = require("../middleware/permission.middleware");
const upload = require("../middleware/upload.middleware");

// ============ TENANT ROUTES (Protected) ============
// Tenants can upload, view, and download their own documents - NO DELETE
router.get("/types", tenantAuthMiddleware, userActivity, tenantDocumentController.getDocumentTypes);
router.post("/upload", tenantAuthMiddleware, userActivity, upload.single('document'), tenantDocumentController.uploadDocument);
router.get("/my-documents", tenantAuthMiddleware, userActivity, tenantDocumentController.getMyDocuments);
// Bulk download (zip) — must be registered before /:documentId/download
router.post("/my-documents/download", tenantAuthMiddleware, userActivity, tenantDocumentController.downloadMyDocumentsBulk);

// Vehicle (must be before /:documentId routes)
router.get("/vehicle", tenantAuthMiddleware, userActivity, tenantDocumentController.getMyVehicle);
router.put("/vehicle", tenantAuthMiddleware, userActivity, tenantDocumentController.updateMyVehicle);
router.patch("/vehicle", tenantAuthMiddleware, userActivity, tenantDocumentController.updateMyVehicle);

router.get("/:documentId/download", tenantAuthMiddleware, userActivity, tenantDocumentController.downloadMyDocument);

// ============ ADMIN ROUTES (Protected) ============
// Admins have full CRUD permissions
// Mounted on a separate router to avoid tenantAuthMiddleware leak
const adminRouter = express.Router();
adminRouter.use(authMiddleware);
adminRouter.use(roleMiddleware("super_admin", "admin"));

// GET ALL DOCUMENTS - Requires documents.view permission
adminRouter.get(
    "/all",
    permissionMiddleware("documents", "view"),
    tenantDocumentController.getDocumentsAdmin
);

// GET DOCUMENTS FOR SPECIFIC TENANT - Requires documents.view permission
adminRouter.get(
    "/tenant/:tenantId",
    permissionMiddleware("documents", "view"),
    tenantDocumentController.getTenantDocumentsAdmin
);

// Vehicle status for a tenant
adminRouter.get(
    "/tenant/:tenantId/vehicle",
    permissionMiddleware("documents", "view"),
    tenantDocumentController.getTenantVehicleAdmin
);

// DELETE DOCUMENT - Requires documents.delete permission
adminRouter.delete(
    "/:documentId",
    permissionMiddleware("documents", "delete"),
    tenantDocumentController.deleteDocumentAdmin
);

// DELETE ALL DOCUMENTS FOR TENANT - Requires documents.delete permission
adminRouter.delete(
    "/tenant/:tenantId/all",
    permissionMiddleware("documents", "delete"),
    tenantDocumentController.deleteAllDocumentsAdmin
);

// DOWNLOAD MULTIPLE DOCUMENTS - Requires documents.view permission
adminRouter.post(
    "/download",
    permissionMiddleware("documents", "view"),
    tenantDocumentController.downloadDocuments
);

// DOWNLOAD SINGLE DOCUMENT - Requires documents.view permission
adminRouter.get(
    "/:documentId/download",
    permissionMiddleware("documents", "view"),
    async (req, res) => {
        try {
            const { documentId } = req.params;
            const document = await require("../models/tenant.document.model").getDocumentById(documentId);

            if (!document) {
                return res.status(404).json({
                    success: false,
                    message: "Document not found"
                });
            }

            return res.redirect(document.document_url);
        } catch (error) {
            console.error("Download Document Error:", error);
            return res.status(500).json({
                success: false,
                message: error.message || "Internal server error"
            });
        }
    }
);

// Mount admin routes under /admin
router.use("/admin", adminRouter);

module.exports = router;