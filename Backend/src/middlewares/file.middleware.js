// ===========================================================================================
// FILE.MIDDLEWARE.JS — File upload middleware using Multer.
// Multer is a middleware for handling multipart/form-data (file uploads) in Express.
// This configuration stores uploaded files in memory (RAM) instead of on disk,
// which is ideal for our use case: we read the PDF content immediately and don't need
// to persist the file — we just extract the text and discard the buffer.
// ===========================================================================================

// Import the Multer library for handling file uploads.
// Multer intercepts multipart/form-data requests, parses the uploaded file, and makes
// it available as req.file (single file) or req.files (multiple files).
const multer = require("multer")


// Create a Multer instance with configuration.
const upload = multer({

    // storage: multer.memoryStorage() — Store uploaded files in memory (as a Buffer).
    // Alternative: multer.diskStorage() would save files to the filesystem.
    // We use memoryStorage because:
    //   1. We only need the PDF content temporarily (to extract text with pdf-parse).
    //   2. No need to manage file cleanup — the buffer is garbage collected automatically.
    //   3. Faster than disk I/O for small files.
    // The file is accessible as req.file.buffer (a Node.js Buffer object).
    storage: multer.memoryStorage(),

    // limits — Restrict the maximum file size to prevent abuse.
    limits: {
        fileSize: 3 * 1024 * 1024 // 3MB = 3 * 1024 KB * 1024 bytes
        // 3MB is more than enough for a resume PDF (typically 100-500KB).
        // If a file exceeds this limit, Multer automatically rejects the request
        // with a MulterError before it reaches the controller.
    }
})


// Export the configured Multer instance.
// Usage in routes: upload.single("resume") — expects a single file with field name "resume".
// This will parse the file from the multipart form data and put it in req.file.
module.exports = upload