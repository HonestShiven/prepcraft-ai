// ===========================================================================================
// INTERVIEW.ROUTES.JS — Defines all interview-related API endpoints.
// All routes in this file are PROTECTED (require authentication).
// The interview route also uses Multer middleware for file uploads.
//
// Route table:
//   POST /api/interview/                          → Generate new interview report (with file upload)
//   GET  /api/interview/report/:interviewId       → Get a specific report by ID
//   GET  /api/interview/                          → Get all reports for the logged-in user
//   POST /api/interview/resume/pdf/:interviewReportId → Generate and download a tailored resume PDF
// ===========================================================================================

// Import Express for the Router function.
const express = require("express")

// Import auth middleware — ALL interview routes require authentication.
// This is because interview reports are personal and tied to a specific user.
const authMiddleware = require("../middlewares/auth.middleware")

// Import interview controller functions that handle the business logic.
const interviewController = require("../controllers/interview.controller")

// Import the configured Multer instance for handling file uploads.
// upload.single("resume") expects a single file with the form field name "resume".
const upload = require("../middlewares/file.middleware")

// Create a new Router instance for interview routes.
const interviewRouter = express.Router()



/**
 * @route POST /api/interview/
 * @description generate new interview report on the basis of user self description,resume pdf and job description.
 * @access private
 */
// This route has a THREE-MIDDLEWARE CHAIN (processed left to right):
//   1. authMiddleware.authUser — Verify JWT, set req.user (who is making the request)
//   2. upload.single("resume") — Parse the multipart form, extract the PDF file → req.file
//   3. interviewController.generateInterViewReportController — Process the data and call AI
// If any middleware fails, the chain stops and the subsequent ones don't run.
interviewRouter.post("/", authMiddleware.authUser, upload.single("resume"), interviewController.generateInterViewReportController)

/**
 * @route GET /api/interview/report/:interviewId
 * @description get interview report by interviewId.
 * @access private
 */
// :interviewId is a URL parameter — it captures the value from the URL.
// For example: GET /api/interview/report/abc123 → req.params.interviewId = "abc123"
interviewRouter.get("/report/:interviewId", authMiddleware.authUser, interviewController.getInterviewReportByIdController)


/**
 * @route GET /api/interview/
 * @description get all interview reports of logged in user.
 * @access private
 */
// Same path as POST "/" above, but different HTTP method (GET vs POST).
// Express distinguishes routes by BOTH method AND path.
interviewRouter.get("/", authMiddleware.authUser, interviewController.getAllInterviewReportsController)


/**
 * @route GET /api/interview/resume/pdf
 * @description generate resume pdf on the basis of user self description, resume content and job description.
 * @access private
 */
// :interviewReportId is the MongoDB _id of the report whose data we'll use to generate the resume.
// POST is used (not GET) because this endpoint generates a new resource (the PDF).
interviewRouter.post("/resume/pdf/:interviewReportId", authMiddleware.authUser, interviewController.generateResumePdfController)



// Export the router so app.js can mount it at "/api/interview".
module.exports = interviewRouter