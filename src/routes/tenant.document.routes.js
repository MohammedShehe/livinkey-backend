const express = require("express");
const router = express.Router();

const tenantDocumentController = require("../controllers/tenant.document.controller");
const tenantAuthMiddleware = require("../middleware/tenant.auth.middleware");
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const upload = require("../middleware/upload.middleware");

// ============ ADMIN ROUTES (Protected) ============
// Mounted first, and tenantAuthMiddleware is NEVER applied to this
// router, so admin requests can no longer be rejected by tenant auth.
const adminRouter = express.Router();

adminRouter.use(authMiddleware);
adminRouter.use(roleMiddleware("super_admin", "admin"));

// Get all documents with filters
adminRouter.get("/all", tenantDocumentController.getDocumentsAdmin);

// Get documents for specific tenant
adminRouter.get("/tenant/:tenantId", tenantDocumentController.getTenantDocumentsAdmin);

// Delete document (admin only)
adminRouter.delete("/:documentId", tenantDocumentController.deleteDocumentAdmin);

// Delete all documents for a tenant (admin only)
adminRouter.delete("/tenant/:tenantId/all", tenantDocumentController.deleteAllDocumentsAdmin);

// Download multiple documents (admin only)
adminRouter.post("/download", tenantDocumentController.downloadDocuments);

// Download single document (admin only)
adminRouter.get("/:documentId/download", async (req, res) => {
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
});

// Mount admin routes under /admin. Note this happens BEFORE any
// tenant-only middleware is attached to `router`, so /admin/* never
// touches tenantAuthMiddleware.
router.use("/admin", adminRouter);

// ============ TENANT ROUTES (Protected) ============
// Tenants can only upload and view documents - NO DELETE
// tenantAuthMiddleware is applied per-route (not via router.use) so it
// can never leak onto other route trees mounted on this router later.
router.get("/types", tenantAuthMiddleware, tenantDocumentController.getDocumentTypes);
router.post("/upload", tenantAuthMiddleware, upload.single('document'), tenantDocumentController.uploadDocument);
router.get("/my-documents", tenantAuthMiddleware, tenantDocumentController.getMyDocuments);

// REMOVED: DELETE route for tenants - Tenants cannot delete documents

module.exports = router;