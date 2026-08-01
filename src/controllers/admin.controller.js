const bcrypt = require("bcrypt");
const crypto = require("crypto");

const transporter = require("../config/mail");

const Admin = require("../models/admin.model");

const { uploadFile, deleteFile } = require("../services/upload.service");

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

        const adminId = await Admin.createAdmin({

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

        await Admin.createDefaultPermissions(adminId);

        await transporter.sendMail({

            from: `"Livinkey" <${process.env.EMAIL_USER}>`,

            to: email,

            subject: "Your Livinkey Admin Account",

            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">

                    <h2>Welcome to Livinkey</h2>

                    <p>Hello <strong>${name}</strong>,</p>

                    <p>Your administrator account has been created successfully.</p>

                    <p><strong>Email:</strong> ${email}</p>

                    <p><strong>Temporary Password:</strong> ${temporaryPassword}</p>

                    <p>
                        Please log in using the above credentials.
                    </p>

                    <p>
                        You will be required to change your password after your first login.
                    </p>

                    <br>

                    <p>Regards,</p>

                    <p><strong>Livinkey Team</strong></p>

                </div>
            `

        });

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

        const admins = await Admin.getAllAdmins();

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

        await Admin.updatePermissions(
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

        if (req.file) {

            const upload = await uploadFile(
                req.file,
                "livinkey/admins"
            );

            idDocument = upload.secure_url;
            publicId = upload.public_id;
            resourceType = upload.resource_type;

        }

        await Admin.updateAdmin({

            id: req.params.id,

            name,

            email,

            phone,

            id_document: idDocument,

            id_document_public_id: publicId,

            id_document_resource_type: resourceType

        });

        // Delete old file only after successful DB update
        if (req.file && oldPublicId) {

            await deleteFile(
                oldPublicId,
                oldResourceType
            );

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

        if (admin.id_document_public_id) {

            await deleteFile(
                admin.id_document_public_id,
                admin.id_document_resource_type
            );

        }

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