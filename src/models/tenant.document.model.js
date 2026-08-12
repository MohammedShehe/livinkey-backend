const db = require("../config/db");

const createDocument = async (connection, documentData) => {
    const [result] = await connection.execute(
        `
        INSERT INTO tenant_documents (
            tenant_id,
            document_type,
            document_url,
            document_public_id,
            document_resource_type,
            original_name,
            file_size
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
            documentData.tenant_id,
            documentData.document_type,
            documentData.document_url,
            documentData.document_public_id,
            documentData.document_resource_type || 'image',
            documentData.original_name || null,
            documentData.file_size || null
        ]
    );
    return result.insertId;
};

const getDocumentsByTenant = async (tenantId) => {
    const [rows] = await db.execute(
        `
        SELECT 
            id,
            tenant_id,
            document_type,
            document_url,
            document_public_id,
            document_resource_type,
            original_name,
            file_size,
            created_at,
            updated_at
        FROM tenant_documents
        WHERE tenant_id = ?
        ORDER BY created_at DESC
        `,
        [tenantId]
    );
    return rows;
};

const getDocumentById = async (documentId) => {
    const [rows] = await db.execute(
        `
        SELECT 
            td.*,
            t.full_name as tenant_name,
            t.email as tenant_email,
            t.nationality,
            p.name as pg_name,
            r.room_number
        FROM tenant_documents td
        INNER JOIN tenants t ON td.tenant_id = t.id
        LEFT JOIN tenant_details tdet ON t.id = tdet.tenant_id
        LEFT JOIN pgs p ON tdet.pg_id = p.id
        LEFT JOIN rooms r ON tdet.room_id = r.id
        WHERE td.id = ?
        `,
        [documentId]
    );
    return rows[0] || null;
};

const getDocumentsByTenantAndType = async (tenantId, documentType) => {
    const [rows] = await db.execute(
        `
        SELECT * FROM tenant_documents
        WHERE tenant_id = ? AND document_type = ?
        `,
        [tenantId, documentType]
    );
    return rows[0] || null;
};

const deleteDocument = async (connection, documentId, tenantId = null) => {
    let query = `DELETE FROM tenant_documents WHERE id = ?`;
    const params = [documentId];
    
    if (tenantId) {
        query += ` AND tenant_id = ?`;
        params.push(tenantId);
    }
    
    const [result] = await connection.execute(query, params);
    return result.affectedRows;
};

const deleteAllDocumentsByTenant = async (connection, tenantId) => {
    const [result] = await connection.execute(
        `DELETE FROM tenant_documents WHERE tenant_id = ?`,
        [tenantId]
    );
    return result.affectedRows;
};

const getDocumentsByTenantIds = async (tenantIds) => {
    if (!tenantIds || tenantIds.length === 0) return [];
    
    const placeholders = tenantIds.map(() => '?').join(',');
    const [rows] = await db.execute(
        `
        SELECT 
            td.*,
            t.full_name as tenant_name,
            t.email as tenant_email,
            p.name as pg_name,
            r.room_number
        FROM tenant_documents td
        INNER JOIN tenants t ON td.tenant_id = t.id
        LEFT JOIN tenant_details tdet ON t.id = tdet.tenant_id
        LEFT JOIN pgs p ON tdet.pg_id = p.id
        LEFT JOIN rooms r ON tdet.room_id = r.id
        WHERE td.tenant_id IN (${placeholders})
        ORDER BY td.created_at DESC
        `,
        tenantIds
    );
    return rows;
};

const getDocumentsWithFilters = async (filters = {}) => {
    let query = `
        SELECT 
            td.*,
            t.full_name as tenant_name,
            t.email as tenant_email,
            t.nationality,
            t.gender,
            p.name as pg_name,
            r.room_number,
            DATE(td.created_at) as upload_date
        FROM tenant_documents td
        INNER JOIN tenants t ON td.tenant_id = t.id
        LEFT JOIN tenant_details tdet ON t.id = tdet.tenant_id
        LEFT JOIN pgs p ON tdet.pg_id = p.id
        LEFT JOIN rooms r ON tdet.room_id = r.id
        WHERE 1=1
    `;
    const params = [];

    if (filters.document_type) {
        query += ` AND td.document_type = ?`;
        params.push(filters.document_type);
    }

    if (filters.document_category) {
        // Get all document types in this category
        const { DOCUMENT_TYPES } = require('../config/document.types');
        const types = Object.keys(DOCUMENT_TYPES).filter(
            key => DOCUMENT_TYPES[key].category === filters.document_category
        );
        if (types.length > 0) {
            const placeholders = types.map(() => '?').join(',');
            query += ` AND td.document_type IN (${placeholders})`;
            params.push(...types);
        }
    }

    if (filters.pg_id) {
        query += ` AND tdet.pg_id = ?`;
        params.push(parseInt(filters.pg_id));
    }

    if (filters.pg_name) {
        query += ` AND p.name LIKE ?`;
        params.push(`%${filters.pg_name}%`);
    }

    if (filters.search) {
        query += ` AND (t.full_name LIKE ? OR r.room_number LIKE ? OR t.email LIKE ?)`;
        const searchPattern = `%${filters.search}%`;
        params.push(searchPattern, searchPattern, searchPattern);
    }

    if (filters.tenant_id) {
        query += ` AND td.tenant_id = ?`;
        params.push(parseInt(filters.tenant_id));
    }

    query += ` ORDER BY td.created_at DESC`;

    const [rows] = await db.execute(query, params);
    return rows;
};

const hasDocument = async (tenantId, documentType) => {
    const [rows] = await db.execute(
        `SELECT id FROM tenant_documents WHERE tenant_id = ? AND document_type = ? LIMIT 1`,
        [tenantId, documentType]
    );
    return rows.length > 0;
};

const getDocumentCount = async (tenantId) => {
    const [rows] = await db.execute(
        `SELECT COUNT(*) as count FROM tenant_documents WHERE tenant_id = ?`,
        [tenantId]
    );
    return rows[0].count;
};

module.exports = {
    createDocument,
    getDocumentsByTenant,
    getDocumentById,
    getDocumentsByTenantAndType,
    deleteDocument,
    deleteAllDocumentsByTenant,
    getDocumentsByTenantIds,
    getDocumentsWithFilters,
    hasDocument,
    getDocumentCount
};