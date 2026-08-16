const bcrypt = require("bcrypt");
const crypto = require("crypto");
const db = require("../config/db");
const adminService = require("../services/admin.service");

const Admin = require("../models/admin.model");

const { uploadFile, deleteFile } = require("../services/upload.service");
const { sendWelcomeAdminEmail } = require("../services/mail.service");

exports.createAdmin = async (req, res) => {

    try {

        let {
            name,
            email,
            phone
        } = req.body;

        name = name?.trim();
        email = email?.trim().toLowerCase();
        phone = phone?.trim();

        if (!name || !email || !phone) {

            return res.status(400).json({

                success: false,

                message: "Name, email and phone are required."

            });

        }

        const existingEmail = await Admin.findByEmail(email);

        if (existingEmail) {

            return res.status(400).json({

                success: false,

                message: "Email already exists."

            });

        }

        const existingPhone = await Admin.findByPhone(phone);

        if (existingPhone) {

            return res.status(400).json({

                success: false,

                message: "Phone number already exists."

            });

        }

        let idDocument = null;
        let idDocumentPublicId = null;
        let idDocumentResourceType = null;

        if (req.file) {

            const uploadResult = await uploadFile(
            req.file,
            "livinkey/admins"
        );

        idDocument = uploadResult.secure_url;
        idDocumentPublicId = uploadResult.public_id;
        idDocumentResourceType = uploadResult.resource_type;

        }

        // Generate Temporary Password
        const temporaryPassword =
            crypto.randomBytes(6).toString("base64url") + "@A1";

        const hashedPassword =
            await bcrypt.hash(
                temporaryPassword,
                12
            );

        const adminId = await adminService.createAdmin({

            name,

            email,

            phone,

            password: hashedPassword,

            role: "admin",

            id_document: idDocument,

            id_document_public_id: idDocumentPublicId,

            id_document_resource_type: idDocumentResourceType,

            must_change_password: true

        });

        // Send welcome email
        await sendWelcomeAdminEmail(
            email,
            name,
            temporaryPassword
        );

        return res.status(201).json({

            success: true,

            message: "Admin created successfully.",

            adminId

        });

    } catch (error) {

        console.error("Create Admin Error:", error);

        return res.status(500).json({

            success: false,

            message: "Internal server error."

        });

    }

};

exports.getAllAdmins = async (req, res) => {

    try {

        const { search } = req.query;

        const admins = await Admin.getAllAdmins(search);

        return res.status(200).json({

            success: true,

            count: admins.length,

            data: admins

        });

    } catch (error) {

        console.error("Get All Admins Error:", error);

        return res.status(500).json({

            success: false,

            message: "Internal server error."

        });

    }

};

exports.updatePermissions = async (req, res) => {

    try {

        const adminId = req.params.id;

        const { permissions } = req.body;

        if (!permissions) {

            return res.status(400).json({

                success: false,

                message: "Permissions are required."

            });

        }

        const admin = await Admin.findById(adminId);

        if (!admin) {

            return res.status(404).json({

                success: false,

                message: "Admin not found."

            });

        }

        if (admin.role !== "admin") {

            return res.status(403).json({

                success: false,

                message: "Permissions can only be updated for normal admins."

            });

        }

        await adminService.updatePermissions(
            adminId,
            permissions
        );

        return res.status(200).json({

            success: true,

            message: "Permissions updated successfully."

        });

    } catch (error) {

        console.error("Update Permissions Error:", error);

        return res.status(400).json({

            success: false,

            message: error.message

        });

    }

};

exports.getAdmin = async (req, res) => {

    try {

        const admin = await Admin.getAdminById(
            req.params.id
        );

        if (!admin) {

            return res.status(404).json({

                success:false,

                message:"Admin not found."

            });

        }

        return res.json({

            success:true,

            data:admin

        });

    } catch(error){

        console.error(error);

        return res.status(500).json({

            success:false,

            message:"Internal server error."

        });

    }

};

exports.updateAdmin = async (req, res) => {

    try {

        const admin = await Admin.getAdminById(req.params.id);

        if (!admin) {

            return res.status(404).json({

                success: false,

                message: "Admin not found."

            });

        }

        let {
            name,
            email,
            phone
        } = req.body;

        name = name?.trim();
        email = email?.trim().toLowerCase();
        phone = phone?.trim();

        if (!name || !email || !phone) {

            return res.status(400).json({

                success: false,

                message: "Name, email and phone are required."

            });

        }

        // Check email uniqueness
        const existingEmail = await Admin.findByEmail(email);

        if (existingEmail && existingEmail.id != req.params.id) {

            return res.status(400).json({

                success: false,

                message: "Email already exists."

            });

        }

        // Check phone uniqueness
        const existingPhone = await Admin.findByPhone(phone);

        if (existingPhone && existingPhone.id != req.params.id) {

            return res.status(400).json({

                success: false,

                message: "Phone number already exists."

            });

        }

        let idDocument = admin.id_document;
        let publicId = admin.id_document_public_id;
        let resourceType = admin.id_document_resource_type;

        const oldPublicId = admin.id_document_public_id;
        const oldResourceType = admin.id_document_resource_type;

        // ============================================================
        // FIX: Previously, ANY edit that didn't include a re-uploaded
        // ID document was treated as "remove the document" (the old
        // `else` branch nulled out the fields whenever `oldPublicId`
        // existed, then the delete block below ran unconditionally via
        // `if (req.file || !req.file)` — a tautology that always
        // deleted the old Cloudinary file). That meant simply editing
        // an admin's name/email/phone silently destroyed their stored
        // ID document.
        //
        // Now: a new file uploaded -> replace it. An explicit
        // `remove_document` flag from the caller -> remove it.
        // Otherwise -> keep the existing document untouched.
        // ============================================================
        const wantsRemoval = req.body.remove_document === 'true' || req.body.remove_document === true;

        if (req.file) {

            const upload = await uploadFile(
                req.file,
                "livinkey/admins"
            );

            idDocument = upload.secure_url;
            publicId = upload.public_id;
            resourceType = upload.resource_type;

        } else if (wantsRemoval) {
            idDocument = null;
            publicId = null;
            resourceType = null;
        }
        // else: no new file and no explicit removal request -> keep
        // the existing document exactly as it was.

        await Admin.updateAdmin({

            id: req.params.id,

            name,

            email,

            phone,

            id_document: idDocument,

            id_document_public_id: publicId,

            id_document_resource_type: resourceType

        });

        // Only delete the OLD Cloudinary file when it was actually
        // replaced by a new upload, or explicitly removed - never when
        // it's simply being kept as-is.
        if (oldPublicId && (req.file || wantsRemoval)) {
            try {
                await deleteFile(
                    oldPublicId,
                    oldResourceType
                );
            } catch (cloudErr) {
                console.error("Failed to delete old admin ID document from Cloudinary:", cloudErr);
                // Don't fail the request - the DB update already succeeded.
            }
        }

        return res.status(200).json({

            success: true,

            message: "Admin updated successfully."

        });

    } catch (error) {

        console.error("Update Admin Error:", error);

        return res.status(500).json({

            success: false,

            message: "Internal server error."

        });

    }

};

exports.deleteAdmin = async (req, res) => {

    try {

        const admin = await Admin.getAdminById(req.params.id);

        if (!admin) {

            return res.status(404).json({

                success: false,

                message: "Admin not found."

            });

        }

        // Delete from Cloudinary first
        if (admin.id_document_public_id) {

            try {
                await deleteFile(
                    admin.id_document_public_id,
                    admin.id_document_resource_type
                );
            } catch (cloudinaryError) {
                console.error("Cloudinary deletion failed:", cloudinaryError);
                // Continue with database deletion even if Cloudinary fails
                // Log the error for manual cleanup later
            }

        }

        // Then delete from database
        await Admin.deleteAdmin(req.params.id);

        return res.status(200).json({

            success: true,

            message: "Admin deleted successfully."

        });

    } catch (error) {

        console.error("Delete Admin Error:", error);

        return res.status(500).json({

            success: false,

            message: "Internal server error."

        });

    }

};

// Get Admin Dashboard 
exports.getAdminDashboard = async (req, res) => {
    try {
        const adminId = req.admin.id;

        const connection = await db.getConnection();
        const [admins] = await connection.execute(
            `
            SELECT name, email, role, must_change_password FROM admins WHERE id = ? AND is_active = 1
            `,
            [adminId]
        );
        connection.release();

        if (admins.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Admin not found"
            });
        }

        const admin = admins[0];
        
        // Check if admin must change password
        if (admin.must_change_password === 1) {
            return res.json({
                success: true,
                data: {
                    greeting: "Welcome",
                    name: admin.name,
                    email: admin.email,
                    role: admin.role,
                    role_display: admin.role === 'super_admin' ? 'Super Admin' : 'Admin',
                    must_change_password: true,
                    message: "Please change your password to continue."
                }
            });
        }

        const hours = new Date().getHours();
        let greeting = '';
        if (hours >= 5 && hours < 12) greeting = 'Good Morning';
        else if (hours >= 12 && hours < 17) greeting = 'Good Afternoon';
        else if (hours >= 17 && hours < 21) greeting = 'Good Evening';
        else greeting = 'Good Night';

        let roleDisplay = admin.role === 'super_admin' ? 'Super Admin' : 'Admin';

        return res.json({
            success: true,
            data: {
                greeting: greeting,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                role_display: roleDisplay,
                must_change_password: false,
                message: `${greeting}, ${admin.name}! Welcome to Livinkey Admin Dashboard.`
            }
        });

    } catch (error) {
        console.error("Get Admin Dashboard Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};