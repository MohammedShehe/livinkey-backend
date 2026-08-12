const tenantDocumentService = require("../services/tenant.document.service");
const fs = require('fs');

// ============ TENANT DOCUMENT ENDPOINTS ============

const uploadDocument = async (req, res) => {
    try {
        const tenantId = req.tenant.id;
        const { document_type } = req.body;
        const file = req.file;

        if (!document_type) {
            return res.status(400).json({
                success: false,
                message: "Document type is required"
            });
        }

        if (!file) {
            return res.status(400).json({
                success: false,
                message: "File is required"
            });
        }

        const document = await tenantDocumentService.uploadDocument(
            tenantId,
            document_type,
            file
        );

        return res.status(201).json({
            success: true,
            message: "Document uploaded successfully",
            data: document
        });

    } catch (error) {
        console.error("Upload Document Error:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

const getMyDocuments = async (req, res) => {
    try {
        const tenantId = req.tenant.id;
        const result = await tenantDocumentService.getTenantDocuments(tenantId);

        return res.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error("Get My Documents Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

const deleteMyDocument = async (req, res) => {
    try {
        const tenantId = req.tenant.id;
        const { documentId } = req.params;

        const deleted = await tenantDocumentService.deleteDocumentByTenant(documentId, tenantId);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Document not found"
            });
        }

        return res.json({
            success: true,
            message: "Document deleted successfully"
        });

    } catch (error) {
        console.error("Delete Document Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

const getDocumentTypes = async (req, res) => {
    try {
        const tenantId = req.tenant.id;
        const tenant = await require("../models/tenant.model").findById(tenantId);
        
        if (!tenant) {
            return res.status(404).json({
                success: false,
                message: "Tenant not found"
            });
        }

        const types = tenantDocumentService.getDocumentTypesByResidency(tenant.residency);

        return res.json({
            success: true,
            data: types
        });

    } catch (error) {
        console.error("Get Document Types Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// ============ ADMIN DOCUMENT ENDPOINTS ============

const getDocumentsAdmin = async (req, res) => {
    try {
        const { 
            document_type, 
            document_category, 
            pg_id, 
            pg_name, 
            search, 
            tenant_id 
        } = req.query;

        const documents = await tenantDocumentService.getDocumentsAdmin({
            document_type,
            document_category,
            pg_id,
            pg_name,
            search,
            tenant_id
        });

        return res.json({
            success: true,
            count: documents.length,
            data: documents
        });

    } catch (error) {
        console.error("Get Documents Admin Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const deleteDocumentAdmin = async (req, res) => {
    try {
        const { documentId } = req.params;

        const deleted = await tenantDocumentService.deleteDocumentByAdmin(documentId);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Document not found"
            });
        }

        return res.json({
            success: true,
            message: "Document deleted successfully"
        });

    } catch (error) {
        console.error("Admin Delete Document Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

const deleteAllDocumentsAdmin = async (req, res) => {
    try {
        const { tenantId } = req.params;

        const deleted = await tenantDocumentService.deleteAllDocumentsByAdmin(tenantId);

        return res.json({
            success: true,
            message: `${deleted} document(s) deleted successfully`,
            deleted_count: deleted
        });

    } catch (error) {
        console.error("Admin Delete All Documents Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

const downloadDocuments = async (req, res) => {
    try {
        const { documentIds } = req.body;

        if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Document IDs are required"
            });
        }

        const zipFilePath = await tenantDocumentService.downloadDocumentsAsZip(documentIds);

        // Send file for download
        res.download(zipFilePath, 'documents.zip', (err) => {
            // Clean up temp file after download
            if (fs.existsSync(zipFilePath)) {
                fs.unlinkSync(zipFilePath);
            }
            if (err) {
                console.error("Download Error:", err);
            }
        });

    } catch (error) {
        console.error("Download Documents Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

const getTenantDocumentsAdmin = async (req, res) => {
    try {
        const { tenantId } = req.params;
        const result = await tenantDocumentService.getTenantDocuments(tenantId);

        return res.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error("Get Tenant Documents Admin Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

module.exports = {
    uploadDocument,
    getMyDocuments,
    deleteMyDocument,
    getDocumentTypes,
    getDocumentsAdmin,
    deleteDocumentAdmin,
    deleteAllDocumentsAdmin,
    downloadDocuments,
    getTenantDocumentsAdmin
};