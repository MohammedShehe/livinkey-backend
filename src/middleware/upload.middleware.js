/**
 * File upload handling.
 *
 *  - Only images (JPEG/PNG/WebP/GIF/HEIC) and PDFs are accepted.
 *  - The declared mimetype is NOT trusted: the file's magic bytes are checked
 *    after upload and the real type replaces the declared one.
 *  - `upload.single/array/fields/any` return an array of middleware
 *    [multer, magicByteCheck]; Express flattens arrays so existing routes
 *    keep working unchanged.
 */
const multer = require("multer");

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED = {
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/webp": [".webp"],
    "image/gif": [".gif"],
    "image/heic": [".heic"],
    "image/heif": [".heif"],
    "application/pdf": [".pdf"]
};

const detectType = (buf) => {
    if (!buf || buf.length < 12) return null;
    if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
    if (buf.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
    if (buf.slice(0, 4).toString("ascii") === "GIF8") return "image/gif";
    if (buf.slice(0, 4).toString("ascii") === "RIFF" && buf.slice(8, 12).toString("ascii") === "WEBP") return "image/webp";
    if (buf.slice(0, 5).toString("ascii") === "%PDF-") return "application/pdf";
    if (buf.slice(4, 8).toString("ascii") === "ftyp") {
        const brand = buf.slice(8, 12).toString("ascii");
        if (["heic", "heix", "hevc", "mif1", "msf1"].includes(brand)) return "image/heic";
    }
    return null;
};

const fileFilter = (req, file, cb) => {
    const ext = (file.originalname.match(/\.[^.]+$/) || [""])[0].toLowerCase();
    const declaredOk = Object.prototype.hasOwnProperty.call(ALLOWED, file.mimetype) || file.mimetype === "application/octet-stream";
    const extOk = Object.values(ALLOWED).some((list) => list.includes(ext));
    if (!declaredOk || !extOk) {
        const err = new Error("Only images (JPG, PNG, WebP, HEIC) and PDF files are allowed.");
        err.status = 400;
        return cb(err);
    }
    cb(null, true);
};

const collectFiles = (req) => {
    if (req.file) return [req.file];
    if (Array.isArray(req.files)) return req.files;
    if (req.files && typeof req.files === "object") return Object.values(req.files).flat();
    return [];
};

const verifyMagicBytes = (req, res, next) => {
    for (const file of collectFiles(req)) {
        const real = detectType(file.buffer);
        if (!real) {
            return res.status(400).json({
                success: false,
                message: `"${file.originalname}" doesn't look like a valid image or PDF. Please choose a different file.`
            });
        }
        file.mimetype = real;
    }
    next();
};

const base = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_FILE_SIZE, files: 10 },
    fileFilter
});

const wrap = (factory) => (...args) => [factory.apply(base, args), verifyMagicBytes];

module.exports = {
    single: wrap(base.single),
    array: wrap(base.array),
    fields: wrap(base.fields),
    any: wrap(base.any),
    none: base.none.bind(base),
    detectType,
    MAX_FILE_SIZE
};
