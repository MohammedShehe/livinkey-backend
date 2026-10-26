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
            tenant_id,
            tenant_status,
            status,
            has_vehicle
        } = req.query;

        const documents = await tenantDocumentService.getDocumentsAdmin({
            document_type,
            document_category,
            pg_id,
            pg_name,
            search,
            tenant_id,
            tenant_status: tenant_status || status || 'active',
            has_vehicle
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

// ============================================================
// FIXED: Download multiple documents as zip - Using buffer approach
// ============================================================
const downloadDocuments = async (req, res) => {
    try {
        const { documentIds } = req.body;

        if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Document IDs are required"
            });
        }

        // Use the buffer-based download method
        const zipBuffer = await tenantDocumentService.downloadDocumentsAsZipBuffer(documentIds);

        // Set response headers for file download
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="documents_${Date.now()}.zip"`);
        res.setHeader('Content-Length', zipBuffer.length);
        
        // Send the zip buffer
        return res.send(zipBuffer);

    } catch (error) {
        console.error("Download Documents Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

// ============================================================
// OPTIONAL: Download as file path (if you need temp file approach)
// ============================================================
const downloadDocumentsAsFile = async (req, res) => {
    try {
        const { documentIds } = req.body;

        if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Document IDs are required"
            });
        }

        const zipFilePath = await tenantDocumentService.downloadDocumentsAsZip(documentIds);

        res.download(zipFilePath, `documents_${Date.now()}.zip`, (err) => {
            // Clean up the temp file after download
            if (fs.existsSync(zipFilePath)) {
                try {
                    fs.unlinkSync(zipFilePath);
                } catch (unlinkError) {
                    console.error("Failed to delete temp file:", unlinkError);
                }
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
            data: result || { documents: [], uploaded_documents: [] }
        });

    } catch (error) {
        console.error("Get Tenant Documents Admin Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

// Dedicated download for tenant's own document
const downloadMyDocument = async (req, res) => {
    try {
        const tenantId = req.tenant.id;
        const { documentId } = req.params;

        const document = await require("../models/tenant.document.model").getDocumentById(documentId);

        if (!document) {
            return res.status(404).json({
                success: false,
                message: "Document not found"
            });
        }

        // Ensure the document belongs to the authenticated tenant
        if (parseInt(document.tenant_id) !== parseInt(tenantId)) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized: You can only download your own documents"
            });
        }

        return res.redirect(document.document_url);
    } catch (error) {
        console.error("Download My Document Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

// Tenant bulk download: zip of the authenticated tenant's own documents only
const downloadMyDocumentsBulk = async (req, res) => {
    try {
        const tenantId = req.tenant.id;
        let { documentIds } = req.body || {};

        // If no IDs provided, download all of the tenant's documents
        if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
            const result = await tenantDocumentService.getTenantDocuments(tenantId);
            const docs = result?.uploaded_documents || result?.documents || [];
            documentIds = docs.map((d) => d.id).filter(Boolean);
        }

        if (!documentIds || documentIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No documents available to download"
            });
        }

        // Ownership check: only allow documents that belong to this tenant
        const ownedIds = [];
        for (const id of documentIds) {
            const document = await require("../models/tenant.document.model").getDocumentById(id);
            if (document && parseInt(document.tenant_id) === parseInt(tenantId)) {
                ownedIds.push(id);
            }
        }

        if (ownedIds.length === 0) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized: no matching documents found for this tenant"
            });
        }

        const zipBuffer = await tenantDocumentService.downloadDocumentsAsZipBuffer(ownedIds);

        res.setHeader("Content-Type", "application/zip");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="my_documents_${Date.now()}.zip"`
        );
        res.setHeader("Content-Length", zipBuffer.length);
        return res.send(zipBuffer);
    } catch (error) {
        console.error("Download My Documents Bulk Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

// ============ VEHICLE ENDPOINTS ============

const getMyVehicle = async (req, res) => {
    try {
        const tenantId = req.tenant.id;
        const result = await tenantDocumentService.getVehicleStatus(tenantId);
        return res.json({ success: true, data: result });
    } catch (error) {
        console.error("Get My Vehicle Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

const updateMyVehicle = async (req, res) => {
    try {
        const tenantId = req.tenant.id;
        const { has_vehicle, vehicle_number } = req.body;

        if (typeof has_vehicle === 'undefined' && typeof vehicle_number === 'undefined') {
            return res.status(400).json({
                success: false,
                message: "Provide has_vehicle and/or vehicle_number"
            });
        }

        // Basic plate validation when provided
        if (vehicle_number !== undefined && vehicle_number !== null && String(vehicle_number).trim()) {
            const plate = String(vehicle_number).trim().toUpperCase();
            if (plate.length < 4 || plate.length > 20) {
                return res.status(400).json({
                    success: false,
                    message: "Vehicle number must be between 4 and 20 characters"
                });
            }
        }

        const result = await tenantDocumentService.updateVehicleInfo(tenantId, {
            has_vehicle: typeof has_vehicle !== 'undefined' ? !!has_vehicle : undefined,
            vehicle_number: vehicle_number !== undefined
                ? (vehicle_number ? String(vehicle_number).trim().toUpperCase() : null)
                : undefined
        });

        return res.json({
            success: true,
            message: "Vehicle info updated",
            data: result
        });
    } catch (error) {
        console.error("Update My Vehicle Error:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

/** Admin: get vehicle status for a specific tenant */
const getTenantVehicleAdmin = async (req, res) => {
    try {
        const { tenantId } = req.params;
        const result = await tenantDocumentService.getVehicleStatus(tenantId);
        return res.json({ success: true, data: result });
    } catch (error) {
        console.error("Get Tenant Vehicle Admin Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

module.exports = {
    uploadDocument,
    getMyDocuments,
    getDocumentTypes,
    getDocumentsAdmin,
    deleteDocumentAdmin,
    deleteAllDocumentsAdmin,
    downloadDocuments,
    downloadDocumentsAsFile,
    getTenantDocumentsAdmin,
    downloadMyDocument,
    downloadMyDocumentsBulk,
    getMyVehicle,
    updateMyVehicle,
    getTenantVehicleAdmin
};