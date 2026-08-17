const db = require("../config/db");
const TenantDocumentModel = require("../models/tenant.document.model");
const TenantModel = require("../models/tenant.model");
const { uploadFile, deleteFile } = require("./upload.service");
const { INTERNATIONAL_DOCUMENTS, NATIONAL_DOCUMENTS } = require("../config/document.types");
const fs = require('fs');
const path = require('path');
const os = require('os');
const axios = require('axios');
const JSZip = require('jszip'); // Using JSZip instead of archiver

// Get required documents based on tenant residency
const getRequiredDocuments = (residency) => {
    if (residency === 'international') {
        return INTERNATIONAL_DOCUMENTS;
    } else {
        return NATIONAL_DOCUMENTS;
    }
};

// Upload document
const uploadDocument = async (tenantId, documentType, file) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // Check if tenant exists
        const tenant = await TenantModel.findById(tenantId);
        if (!tenant) {
            throw new Error("Tenant not found");
        }

        // Check if document already exists
        const existing = await TenantDocumentModel.getDocumentsByTenantAndType(tenantId, documentType);
        if (existing) {
            throw new Error(`Document "${documentType}" already uploaded. Delete existing to re-upload.`);
        }

        // Upload to Cloudinary
        const uploadResult = await uploadFile(
            file,
            `livinkey/tenants/${tenantId}/documents`
        );

        if (!uploadResult) {
            throw new Error("Failed to upload document");
        }

        // Create document record
        const documentId = await TenantDocumentModel.createDocument(connection, {
            tenant_id: tenantId,
            document_type: documentType,
            document_url: uploadResult.secure_url,
            document_public_id: uploadResult.public_id,
            document_resource_type: uploadResult.resource_type || 'image',
            original_name: file.originalname,
            file_size: file.size
        });

        await connection.commit();

        const document = await TenantDocumentModel.getDocumentById(documentId);
        return document;

    } catch (error) {
        await connection.rollback();
        console.error("Upload Document Error:", error);
        throw error;

    } finally {
        connection.release();
    }
};

// Get all documents for a tenant
const getTenantDocuments = async (tenantId) => {
    const documents = await TenantDocumentModel.getDocumentsByTenant(tenantId);
    const tenant = await TenantModel.findById(tenantId);
    
    if (!tenant) {
        throw new Error("Tenant not found");
    }

    // Get required documents based on residency
    const requiredDocs = getRequiredDocuments(tenant.residency);
    
    // Check which documents are uploaded
    const uploadedTypes = documents.map(doc => doc.document_type);
    
    const documentStatus = requiredDocs.map(doc => ({
        ...doc,
        uploaded: uploadedTypes.includes(doc.key),
        document: documents.find(d => d.document_type === doc.key) || null
    }));

    return {
        tenant: {
            id: tenant.id,
            full_name: tenant.full_name,
            residency: tenant.residency,
            pg_name: tenant.pg_name,
            room_number: tenant.room_number
        },
        documents: documentStatus,
        uploaded_documents: documents
    };
};

// Get document by ID
const getDocumentById = async (documentId) => {
    return await TenantDocumentModel.getDocumentById(documentId);
};

// Delete document (for tenant - only if they have uploaded it)
const deleteDocumentByTenant = async (documentId, tenantId) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const document = await TenantDocumentModel.getDocumentById(documentId);
        if (!document) {
            throw new Error("Document not found");
        }

        if (document.tenant_id !== parseInt(tenantId)) {
            throw new Error("Unauthorized: Document does not belong to this tenant");
        }

        // Delete from Cloudinary
        if (document.document_public_id) {
            try {
                await deleteFile(document.document_public_id, document.document_resource_type);
            } catch (error) {
                console.error("Failed to delete from Cloudinary:", error);
            }
        }

        // Delete from database
        const deleted = await TenantDocumentModel.deleteDocument(connection, documentId, tenantId);
        
        await connection.commit();
        return deleted > 0;

    } catch (error) {
        await connection.rollback();
        console.error("Delete Document Error:", error);
        throw error;

    } finally {
        connection.release();
    }
};

// Admin delete document
const deleteDocumentByAdmin = async (documentId) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const document = await TenantDocumentModel.getDocumentById(documentId);
        if (!document) {
            throw new Error("Document not found");
        }

        // Delete from Cloudinary
        if (document.document_public_id) {
            try {
                await deleteFile(document.document_public_id, document.document_resource_type);
            } catch (error) {
                console.error("Failed to delete from Cloudinary:", error);
            }
        }

        // Delete from database
        const deleted = await TenantDocumentModel.deleteDocument(connection, documentId);
        
        await connection.commit();
        return deleted > 0;

    } catch (error) {
        await connection.rollback();
        console.error("Admin Delete Document Error:", error);
        throw error;

    } finally {
        connection.release();
    }
};

// Admin delete all documents for a tenant
const deleteAllDocumentsByAdmin = async (tenantId) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // Get all documents for tenant
        const documents = await TenantDocumentModel.getDocumentsByTenant(tenantId);
        
        // Delete from Cloudinary
        for (const doc of documents) {
            if (doc.document_public_id) {
                try {
                    await deleteFile(doc.document_public_id, doc.document_resource_type);
                } catch (error) {
                    console.error("Failed to delete from Cloudinary:", error);
                }
            }
        }

        // Delete from database
        const deleted = await TenantDocumentModel.deleteAllDocumentsByTenant(connection, tenantId);
        
        await connection.commit();
        return deleted;

    } catch (error) {
        await connection.rollback();
        console.error("Admin Delete All Documents Error:", error);
        throw error;

    } finally {
        connection.release();
    }
};

// Admin get documents with filters
const getDocumentsAdmin = async (filters = {}) => {
    return await TenantDocumentModel.getDocumentsWithFilters(filters);
};

// Get document types by residency
const getDocumentTypesByResidency = (residency) => {
    return getRequiredDocuments(residency);
};

// ============================================================
// FIXED: Download multiple documents as zip - Using JSZip
// ============================================================
const downloadDocumentsAsZip = async (documentIds) => {
    try {
        const documents = [];
        for (const id of documentIds) {
            const doc = await TenantDocumentModel.getDocumentById(id);
            if (doc) {
                documents.push(doc);
            }
        }

        if (documents.length === 0) {
            throw new Error("No documents found to download");
        }

        // Create a new JSZip instance
        const zip = new JSZip();

        let addedCount = 0;

        // Download each document and add to zip
        for (const doc of documents) {
            try {
                // Get file extension from URL
                let extension = 'jpg';
                if (doc.document_url) {
                    const urlParts = doc.document_url.split('.');
                    const ext = urlParts[urlParts.length - 1].split('?')[0];
                    if (ext && ext.length <= 5) {
                        extension = ext;
                    }
                }
                
                const fileName = `${doc.tenant_name || 'tenant'}_${doc.document_type || 'document'}_${Date.now()}.${extension}`;
                
                // Download the file from Cloudinary
                const response = await axios({
                    method: 'get',
                    url: doc.document_url,
                    responseType: 'arraybuffer',
                    timeout: 30000
                });

                // Add the file to the zip
                zip.file(fileName, response.data);
                addedCount++;
                
            } catch (error) {
                console.error(`Failed to download document ${doc.id}:`, error.message);
                // Continue with other documents
            }
        }

        if (addedCount === 0) {
            throw new Error("Failed to download any documents");
        }

        // Generate the zip file
        const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

        // Save to temp file
        const tempDir = os.tmpdir();
        const zipFileName = `documents_${Date.now()}.zip`;
        const zipFilePath = path.join(tempDir, zipFileName);
        
        fs.writeFileSync(zipFilePath, zipBuffer);

        return zipFilePath;

    } catch (error) {
        console.error("Download Documents Error:", error);
        throw error;
    }
};

// Alternative: Return zip as buffer directly (for streaming response)
const downloadDocumentsAsZipBuffer = async (documentIds) => {
    try {
        const documents = [];
        for (const id of documentIds) {
            const doc = await TenantDocumentModel.getDocumentById(id);
            if (doc) {
                documents.push(doc);
            }
        }

        if (documents.length === 0) {
            throw new Error("No documents found to download");
        }

        const zip = new JSZip();
        let addedCount = 0;

        for (const doc of documents) {
            try {
                let extension = 'jpg';
                if (doc.document_url) {
                    const urlParts = doc.document_url.split('.');
                    const ext = urlParts[urlParts.length - 1].split('?')[0];
                    if (ext && ext.length <= 5) {
                        extension = ext;
                    }
                }
                
                const fileName = `${doc.tenant_name || 'tenant'}_${doc.document_type || 'document'}_${Date.now()}.${extension}`;
                
                const response = await axios({
                    method: 'get',
                    url: doc.document_url,
                    responseType: 'arraybuffer',
                    timeout: 30000
                });

                zip.file(fileName, response.data);
                addedCount++;
                
            } catch (error) {
                console.error(`Failed to download document ${doc.id}:`, error.message);
            }
        }

        if (addedCount === 0) {
            throw new Error("Failed to download any documents");
        }

        return await zip.generateAsync({ type: 'nodebuffer' });

    } catch (error) {
        console.error("Download Documents Error:", error);
        throw error;
    }
};

module.exports = {
    uploadDocument,
    getTenantDocuments,
    getDocumentById,
    deleteDocumentByTenant,
    deleteDocumentByAdmin,
    deleteAllDocumentsByAdmin,
    getDocumentsAdmin,
    getDocumentTypesByResidency,
    getRequiredDocuments,
    downloadDocumentsAsZip,
    downloadDocumentsAsZipBuffer
};