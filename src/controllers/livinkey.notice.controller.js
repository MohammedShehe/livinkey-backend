const noticeModel = require("../models/livinkey.notice.model");
const uploadService = require("../services/upload.service");

const MAX_NOTICES = 5;

const getAdminNotices = async (req, res) => {
    try {
        const notices = await noticeModel.getAll();
        return res.json({ success: true, data: notices });
    } catch (error) {
        console.error("Get Livinkey notices error:", error);
        return res.status(500).json({ success: false, message: "Unable to load notices." });
    }
};

const uploadNotices = async (req, res) => {
    try {
        const files = req.files || [];
        if (!files.length) {
            return res.status(400).json({ success: false, message: "Select at least one notice image." });
        }

        const currentCount = await noticeModel.count();
        if (currentCount + files.length > MAX_NOTICES) {
            return res.status(400).json({
                success: false,
                message: `A maximum of ${MAX_NOTICES} notices can be active at one time.`
            });
        }

        const uploaded = [];
        for (const file of files) {
            if (!file.mimetype?.startsWith("image/")) {
                return res.status(400).json({ success: false, message: "Only image files are allowed for notices." });
            }
            const result = await uploadService.uploadFile(file, "livinkey/notices");
            const nextOrder = (await noticeModel.getAll()).length;
            uploaded.push(await noticeModel.create({
                image_url: result.secure_url,
                public_id: result.public_id,
                resource_type: result.resource_type || "image",
                display_order: nextOrder,
                created_by: req.admin.id
            }));
        }

        return res.status(201).json({ success: true, message: "Notice images uploaded successfully.", data: uploaded });
    } catch (error) {
        console.error("Upload Livinkey notices error:", error);
        return res.status(500).json({ success: false, message: error.message || "Unable to upload notices." });
    }
};

const replaceNotice = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const existing = await noticeModel.getById(id);
        if (!existing) return res.status(404).json({ success: false, message: "Notice not found." });
        if (!req.file) return res.status(400).json({ success: false, message: "Select a replacement image." });
        if (!req.file.mimetype?.startsWith("image/")) return res.status(400).json({ success: false, message: "Only image files are allowed." });

        const result = await uploadService.uploadFile(req.file, "livinkey/notices");
        const updated = await noticeModel.update(id, {
            image_url: result.secure_url,
            public_id: result.public_id,
            resource_type: result.resource_type || "image"
        });

        if (existing.public_id) {
            await uploadService.deleteFile(existing.public_id, existing.resource_type || "image").catch(() => {});
        }

        return res.json({ success: true, message: "Notice replaced successfully.", data: updated });
    } catch (error) {
        console.error("Replace Livinkey notice error:", error);
        return res.status(500).json({ success: false, message: error.message || "Unable to replace notice." });
    }
};

const deleteNotice = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const existing = await noticeModel.getById(id);
        if (!existing) return res.status(404).json({ success: false, message: "Notice not found." });

        await noticeModel.remove(id);
        if (existing.public_id) {
            await uploadService.deleteFile(existing.public_id, existing.resource_type || "image").catch(() => {});
        }

        return res.json({ success: true, message: "Notice deleted successfully." });
    } catch (error) {
        console.error("Delete Livinkey notice error:", error);
        return res.status(500).json({ success: false, message: "Unable to delete notice." });
    }
};

const getTenantNotices = async (req, res) => {
    try {
        const notices = await noticeModel.getAll();
        return res.json({
            success: true,
            data: notices.map(n => ({
                id: n.id,
                image_url: n.image_url,
                display_order: n.display_order,
                created_at: n.created_at,
                updated_at: n.updated_at
            }))
        });
    } catch (error) {
        console.error("Get tenant notices error:", error);
        return res.status(500).json({ success: false, message: "Unable to load Livinkey notices." });
    }
};

module.exports = {
    getAdminNotices,
    uploadNotices,
    replaceNotice,
    deleteNotice,
    getTenantNotices
};
