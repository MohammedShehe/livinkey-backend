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
            file_size,
            review_status,
            uploaded_by_type
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            documentData.tenant_id,
            documentData.document_type,
            documentData.document_url,
            documentData.document_public_id,
            documentData.document_resource_type || 'image',
            documentData.original_name || null,
            documentData.file_size || null,
            documentData.review_status || 'pending',
            documentData.uploaded_by_type || 'tenant'
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
            updated_at,
            review_status,
            review_note,
            reviewed_at
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
            t.is_active,
            COALESCE(t.status, 'active') AS tenant_status,
            p.name as pg_name,
            r.room_number,
            DATE(td.created_at) as upload_date,
            COALESCE(tdet.has_vehicle, 0) AS has_vehicle,
            tdet.vehicle_number,
            ra.name AS reviewed_by_name
        FROM tenant_documents td
        LEFT JOIN admins ra ON ra.id = td.reviewed_by
        INNER JOIN tenants t ON td.tenant_id = t.id
        LEFT JOIN tenant_details tdet ON t.id = tdet.tenant_id
        LEFT JOIN pgs p ON tdet.pg_id = p.id
        LEFT JOIN rooms r ON tdet.room_id = r.id
        WHERE t.role = 'tenant'
    `;
    const params = [];

    // Tenant lifecycle filter:
    //   active (default) | inactive | archived | checked_out | all
    const statusFilter = (filters.tenant_status || filters.status || 'active').toLowerCase();
    if (statusFilter === 'active') {
        query += ` AND (t.status IS NULL OR t.status = 'active') AND (t.is_active IS NULL OR t.is_active = 1)`;
    } else if (statusFilter === 'inactive') {
        query += ` AND (t.status IN ('archived', 'checked_out') OR t.is_active = 0)`;
    } else if (statusFilter === 'archived') {
        query += ` AND t.status = 'archived'`;
    } else if (statusFilter === 'checked_out') {
        query += ` AND t.status = 'checked_out'`;
    }
    // 'all' → no status filter

    if (filters.has_vehicle === '1' || filters.has_vehicle === 'true' || filters.has_vehicle === true) {
        query += ` AND tdet.has_vehicle = 1`;
    } else if (filters.has_vehicle === '0' || filters.has_vehicle === 'false' || filters.has_vehicle === false) {
        query += ` AND (tdet.has_vehicle IS NULL OR tdet.has_vehicle = 0)`;
    }

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

    if (filters.review_status && ['pending','approved','rejected'].includes(filters.review_status)) {
        query += ` AND td.review_status = ?`;
        params.push(filters.review_status);
    }
    if (filters.only_new === '1' || filters.only_new === true) {
        query += ` AND td.admin_seen_at IS NULL AND td.review_status = 'pending'`;
    }
    if (filters.uploaded_from) { query += ` AND DATE(td.created_at) >= ?`; params.push(filters.uploaded_from); }
    if (filters.uploaded_to) { query += ` AND DATE(td.created_at) <= ?`; params.push(filters.uploaded_to); }

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

// ---------------- Review workflow ----------------
const setReview = async (documentId, status, note, adminId) => {
    await db.execute(
        `UPDATE tenant_documents SET review_status = ?, review_note = ?, reviewed_by = ?, reviewed_at = NOW(), admin_seen_at = COALESCE(admin_seen_at, NOW())
         WHERE id = ?`,
        [status, note || null, adminId, documentId]
    );
};
const markSeen = async (ids) => {
    if (!ids || !ids.length) return 0;
    const [r] = await db.query(`UPDATE tenant_documents SET admin_seen_at = NOW() WHERE id IN (?) AND admin_seen_at IS NULL`, [ids]);
    return r.affectedRows;
};
const reviewCounts = async (pgId) => {
    const [rows] = await db.query(
        `SELECT d.review_status AS s, COUNT(*) AS c, SUM(d.admin_seen_at IS NULL AND d.review_status='pending') AS fresh
         FROM tenant_documents d JOIN tenants t ON t.id = d.tenant_id LEFT JOIN tenant_details td ON td.tenant_id = d.tenant_id
         WHERE t.role='tenant' AND (t.status IS NULL OR t.status='active') ${pgId ? 'AND td.pg_id = ?' : ''}
         GROUP BY d.review_status`, pgId ? [pgId] : []);
    const out = { pending: 0, approved: 0, rejected: 0, fresh: 0 };
    rows.forEach(r => { out[r.s] = Number(r.c); out.fresh += Number(r.fresh || 0); });
    return out;
};
module.exports.setReview = setReview;
module.exports.markSeen = markSeen;
module.exports.reviewCounts = reviewCounts;
