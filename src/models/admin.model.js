const db = require("../config/db");

const findByEmail = async (email) => {
    if (!email) return null;
    const [rows] = await db.execute(
        "SELECT * FROM admins WHERE email = ? LIMIT 1",
        [email]
    );
    return rows[0];
};

const updateOTP = async (id, otp, otpExpiry) => {
    if (!id) return;
    await db.execute(
        `
        UPDATE admins
        SET
            otp=?,
            otp_expiry=?,
            otp_sent_at=NOW()
        WHERE id=?
        `,
        [otp, otpExpiry, id]
    );
};

const clearOTP = async (id) => {
    if (!id) return;
    await db.execute(
        `UPDATE admins
        SET otp=NULL,
        otp_expiry=NULL
        WHERE id=?`,
        [id]
    );
};

const findByResetToken = async (token) => {
    if (!token || token === 'undefined' || token === 'null') {
        return null;
    }
    const [rows] = await db.execute(
        `SELECT * FROM admins
        WHERE reset_token=?
        LIMIT 1`,
        [token]
    );
    return rows[0];
};

const saveResetToken = async (id, token, expiry) => {
    if (!id || !token) return;
    await db.execute(
        `UPDATE admins
        SET
            reset_token=?,
            reset_token_expiry=?
        WHERE id=?`,
        [token, expiry, id]
    );
};

const updatePassword = async (id, password) => {
    if (!id || !password) return;
    await db.execute(
        `UPDATE admins
        SET
            password=?,
            reset_token=NULL,
            reset_token_expiry=NULL
        WHERE id=?`,
        [password, id]
    );
};

const updatePasswordAndClearFlag = async (id, password) => {
    if (!id || !password) return;
    await db.execute(
        `UPDATE admins
        SET
            password=?,
            reset_token=NULL,
            reset_token_expiry=NULL,
            must_change_password=0
        WHERE id=?`,
        [password, id]
    );
};

const createAdmin = async (connection, admin) => {
    const [result] = await connection.execute(
        `
        INSERT INTO admins
        (
            name,
            email,
            phone,
            password,
            role,
            id_document,
            id_document_public_id,
            id_document_resource_type,
            must_change_password
        )
        VALUES
        (?,?,?,?,?,?,?,?,?)
        `,
        [
            admin.name,
            admin.email,
            admin.phone,
            admin.password,
            admin.role,
            admin.id_document || null,
            admin.id_document_public_id || null,
            admin.id_document_resource_type || null,
            admin.must_change_password || false
        ]
    );
    return result.insertId;
};

const findByPhone = async (phone) => {
    if (!phone) return null;
    const [rows] = await db.execute(
        `
        SELECT *
        FROM admins
        WHERE phone=?
        LIMIT 1
        `,
        [phone]
    );
    return rows[0];
};

const createDefaultPermissions = async (connection, adminId) => {
    if (!adminId) return;
    const modules = [
        "tenants",
        "guests",
        "bills",
        "pgs",
        "maintenance",
        "documents",
        "feedbacks"
    ];

    const values = modules.map(module => [
        adminId,
        module,
        false,
        false,
        false,
        false
    ]);

    await connection.query(
        `
        INSERT INTO admin_permissions
        (
            admin_id,
            module_name,
            can_view,
            can_add,
            can_edit,
            can_delete
        )
        VALUES ?
        `,
        [values]
    );
};

const getAllAdmins = async (search = null) => {
    let query = `
        SELECT
            a.id,
            a.name,
            a.email,
            a.phone,
            a.role,
            a.id_document,
            a.is_active,
            a.must_change_password,
            a.created_at,
            ap.module_name,
            ap.can_view,
            ap.can_add,
            ap.can_edit,
            ap.can_delete
        FROM admins a
        LEFT JOIN admin_permissions ap
        ON a.id = ap.admin_id
        WHERE a.role='admin'
    `;
    const params = [];

    if (search) {
        query += `
            AND (
                a.name LIKE ?
                OR a.email LIKE ?
                OR a.phone LIKE ?
            )
        `;
        const searchPattern = `%${search}%`;
        params.push(searchPattern, searchPattern, searchPattern);
    }

    query += ` ORDER BY a.created_at DESC`;

    const [rows] = await db.execute(query, params);

    const adminsMap = {};

    rows.forEach(row => {
        if (!adminsMap[row.id]) {
            adminsMap[row.id] = {
                id: row.id,
                name: row.name,
                email: row.email,
                phone: row.phone,
                role: row.role,
                id_document: row.id_document,
                is_active: Boolean(row.is_active),
                must_change_password: Boolean(row.must_change_password),
                created_at: row.created_at,
                permissions: {}
            };
        }

        if (row.module_name) {
            adminsMap[row.id].permissions[row.module_name] = {
                view: Boolean(row.can_view),
                add: Boolean(row.can_add),
                edit: Boolean(row.can_edit),
                delete: Boolean(row.can_delete)
            };
        }
    });

    return Object.values(adminsMap);
};

const findById = async (id) => {
    if (!id) return null;
    const [rows] = await db.execute(
        `
        SELECT
            id,
            role,
            email
        FROM admins
        WHERE id=?
        LIMIT 1
        `,
        [id]
    );
    return rows[0];
};

const updatePermission = async (
    connection,
    adminId,
    moduleName,
    permission
) => {
    if (!adminId || !moduleName) return { affectedRows: 0 };
    
    const canView = Boolean(permission.view);
    const canAdd = moduleName === "feedbacks" ? false : Boolean(permission.add);
    const canEdit = moduleName === "feedbacks" ? false : Boolean(permission.edit);
    const canDelete = moduleName === "feedbacks" ? false : Boolean(permission.delete);

    const [result] = await connection.execute(
        `
        UPDATE admin_permissions
        SET
            can_view=?,
            can_add=?,
            can_edit=?,
            can_delete=?
        WHERE
            admin_id=?
        AND
            module_name=?
        `,
        [
            canView,
            canAdd,
            canEdit,
            canDelete,
            adminId,
            moduleName
        ]
    );
    return result;
};

// ============================================================
// FIX: getAdminById no longer filters by role='admin'
// This allows the auth flow (login/verifyOTP) to fetch full
// profile for super_admin as well as normal admins.
// ============================================================
const getAdminById = async (adminId) => {
    if (!adminId) return null;
    const [rows] = await db.execute(
        `
        SELECT
            a.id,
            a.name,
            a.email,
            a.phone,
            a.role,
            a.id_document,
            a.id_document_public_id,
            a.id_document_resource_type,
            a.is_active,
            a.must_change_password,
            a.created_at,
            ap.module_name,
            ap.can_view,
            ap.can_add,
            ap.can_edit,
            ap.can_delete
        FROM admins a
        LEFT JOIN admin_permissions ap
        ON a.id = ap.admin_id
        WHERE a.id=?
        `,
        [adminId]
    );

    if (!rows.length) {
        return null;
    }

    const admin = {
        id: rows[0].id,
        name: rows[0].name,
        email: rows[0].email,
        phone: rows[0].phone,
        role: rows[0].role,
        id_document: rows[0].id_document,
        id_document_public_id: rows[0].id_document_public_id,
        id_document_resource_type: rows[0].id_document_resource_type,
        is_active: Boolean(rows[0].is_active),
        must_change_password: Boolean(rows[0].must_change_password),
        created_at: rows[0].created_at,
        permissions: {}
    };

    rows.forEach(row => {
        if (row.module_name) {
            admin.permissions[row.module_name] = {
                view: Boolean(row.can_view),
                add: Boolean(row.can_add),
                edit: Boolean(row.can_edit),
                delete: Boolean(row.can_delete)
            };
        }
    });

    return admin;
};

const updateAdmin = async (admin) => {
    if (!admin || !admin.id) return;
    await db.execute(
        `
        UPDATE admins
        SET
            name=?,
            email=?,
            phone=?,
            id_document=?,
            id_document_public_id=?,
            id_document_resource_type=?
        WHERE id=?
        `,
        [
            admin.name,
            admin.email,
            admin.phone,
            admin.id_document || null,
            admin.id_document_public_id || null,
            admin.id_document_resource_type || null,
            admin.id
        ]
    );
};

const deleteAdmin = async (id) => {
    if (!id) return;
    await db.execute(
        `
        DELETE FROM admins
        WHERE id=?
        AND role='admin'
        `,
        [id]
    );
};

// ============================================================
// EXPORTS - Make sure all functions are exported properly
// ============================================================
module.exports = {
    findByEmail,
    updateOTP,
    clearOTP,
    findByResetToken,
    saveResetToken,
    updatePassword,
    updatePasswordAndClearFlag,
    createAdmin,
    findByPhone,
    createDefaultPermissions,
    getAllAdmins,
    findById,
    updatePermission,
    getAdminById,
    updateAdmin,
    deleteAdmin
};