const express = require("express");
const router = express.Router();

const tenantDocumentController = require("../controllers/tenant.document.controller");
const tenantAuthMiddleware = require("../middleware/tenant.auth.middleware");
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const upload = require("../middleware/upload.middleware");

// ============ TENANT ROUTES (Protected) ============
// Tenants can only upload and view documents - NO DELETE
router.use(tenantAuthMiddleware);

// Get document types for tenant
router.get("/types", tenantDocumentController.getDocumentTypes);

// Upload document
router.post("/upload", upload.single('document'), tenantDocumentController.uploadDocument);

// Get all documents for tenant (View only)
router.get("/my-documents", tenantDocumentController.getMyDocuments);

// REMOVED: DELETE route for tenants - Tenants cannot delete documents

// ============ ADMIN ROUTES (Protected) ============
// Admins have full CRUD permissions
const adminRouter = express.Router();
adminRouter.use(authMiddleware);
adminRouter.use(roleMiddleware("super_admin", "admin"));

// Get all documents with filters
adminRouter.get("/admin/all", tenantDocumentController.getDocumentsAdmin);

// Get documents for specific tenant
adminRouter.get("/admin/tenant/:tenantId", tenantDocumentController.getTenantDocumentsAdmin);

// Delete document (admin only)
adminRouter.delete("/admin/:documentId", tenantDocumentController.deleteDocumentAdmin);

// Delete all documents for a tenant (admin only)
adminRouter.delete("/admin/tenant/:tenantId/all", tenantDocumentController.deleteAllDocumentsAdmin);

// Download multiple documents (admin only)
adminRouter.post("/admin/download", tenantDocumentController.downloadDocuments);

// Mount admin routes
router.use(adminRouter);

module.exports = router;