const cloudinary = require("../config/cloudinary");
const fs = require("fs");

const uploadFile = (file, folder) => {
    return new Promise((resolve, reject) => {
        if (!file) {
            return resolve(null);
        }

        if (!file.buffer || file.buffer.length === 0) {
            return reject(new Error("File buffer is empty or missing"));
        }

        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: "auto"
            },
            (error, result) => {
                if (error) {
                    console.error("Cloudinary Upload Error:", error);
                    return reject(error);
                }
                resolve(result);
            }
        );

        stream.end(file.buffer);
    });
};

const deleteFile = async (publicId, resourceType) => {
    if (!publicId) {
        return;
    }

    try {
        await cloudinary.uploader.destroy(
            publicId,
            {
                resource_type: resourceType || "image"
            }
        );
    } catch (error) {
        console.error("Cloudinary Delete Error:", error);
        throw error;
    }
};

const deleteMultipleFiles = async (files) => {
    const results = [];
    for (const file of files) {
        if (file.public_id) {
            try {
                await deleteFile(file.public_id, file.resource_type);
                results.push({ success: true, public_id: file.public_id });
            } catch (error) {
                results.push({ success: false, public_id: file.public_id, error: error.message });
            }
        }
    }
    return results;
};

module.exports = {
    uploadFile,
    deleteFile,
    deleteMultipleFiles
};