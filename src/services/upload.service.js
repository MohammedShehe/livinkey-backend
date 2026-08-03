const cloudinary = require("../config/cloudinary");

const uploadFile = (file, folder) => {
    return new Promise((resolve, reject) => {
        if (!file) {
            return resolve(null);
        }

        // Ensure file has buffer
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

module.exports = {
    uploadFile,
    deleteFile
};