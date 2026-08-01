const cloudinary = require("../config/cloudinary");

const uploadFile = (file, folder) => {

    return new Promise((resolve, reject) => {

        if (!file) {
            return resolve(null);
        }

        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: "auto"
            },
            (error, result) => {

                if (error) {
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

    await cloudinary.uploader.destroy(
        publicId,
        {
            resource_type: resourceType || "image"
        }
    );

};

module.exports = {

    uploadFile,

    deleteFile

};