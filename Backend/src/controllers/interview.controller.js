// ===========================================================================================
// INTERVIEW.CONTROLLER.JS — Handles all interview report business logic.
// This file contains 4 controllers:
//   1. generateInterViewReportController — Parse resume PDF + call AI to generate report
//   2. getInterviewReportByIdController  — Fetch a single report by its MongoDB _id
//   3. getAllInterviewReportsController   — Fetch all reports for the logged-in user
//   4. generateResumePdfController       — Generate a tailored resume PDF via AI
//
// FLOW: User uploads resume PDF → pdf-parse extracts text → Gemini AI generates
// structured interview report → saved to MongoDB → returned to frontend.
// ===========================================================================================

// Import pdf-parse — a library for extracting text content from PDF files.
// It reads the raw PDF binary buffer and returns the plain text content.
// This lets us send the resume text to Gemini AI for analysis.
const pdfParse = require("pdf-parse")

// Import the two AI service functions:
//   generateInterviewReport — Sends resume + job description to Gemini, returns structured JSON.
//   generateResumePdf — Sends data to Gemini, gets HTML, converts to PDF via Puppeteer.
const { generateInterviewReport, generateResumePdf } = require("../services/ai.service")

// Import the InterviewReport model for database CRUD operations.
const interviewReportModel = require("../models/interviewReport.model")




/**
 * @description Controller to generate interview report based on user self description, resume and job description.
 */
async function generateInterViewReportController(req, res) {

    // STEP 1: Extract text from the uploaded PDF resume.
    // req.file is populated by Multer middleware (file.middleware.js).
    // req.file.buffer is the raw PDF binary data stored in memory.
    // Uint8Array.from() converts the Node.js Buffer to a Uint8Array (required by pdf-parse v2).
    // PDFParse().getText() extracts all text content from the PDF pages.
    const resumeContent = await (new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))).getText()

    // STEP 2: Extract the text fields from the request body.
    // These were sent as part of the multipart form data along with the PDF file.
    const { selfDescription, jobDescription } = req.body

    // STEP 3: Call the AI service to generate the interview report.
    // This sends the resume text, self description, and job description to Gemini AI.
    // The AI returns a structured JSON object matching the interviewReportSchema
    // (matchScore, technicalQuestions, behavioralQuestions, skillGaps, preparationPlan, title).
    const interViewReportByAi = await generateInterviewReport({
        resume: resumeContent.text,  // The extracted plain text from the PDF.
        selfDescription,
        jobDescription
    })

    // STEP 4: Save the report to MongoDB.
    // We spread (...) the AI response to merge its fields into the new document.
    // We also store the original inputs (resume text, selfDescription, jobDescription)
    // so we can regenerate a tailored resume PDF later without asking the user to re-upload.
    // req.user.id comes from auth.middleware.js — it identifies which user owns this report.
    const interviewReport = await interviewReportModel.create({
        user: req.user.id,              // Link this report to the logged-in user.
        resume: resumeContent.text,     // Store the extracted resume text.
        selfDescription,                // Store the user's self-description.
        jobDescription,                 // Store the target job description.
        ...interViewReportByAi          // Spread: matchScore, questions, skillGaps, plan, title.
    })

    // STEP 5: Return the saved report to the frontend.
    // Status 201 = "Created" — a new resource was successfully created.
    // The frontend uses interviewReport._id to navigate to the report detail page.
    res.status(201).json({
        message: "Interview report generated successfully.",
        interviewReport
    })

}

/**
 * @description Controller to get interview report by interviewId.
 */
async function getInterviewReportByIdController(req, res) {

    // Extract the interviewId from the URL parameter.
    // For route /api/interview/report/:interviewId, req.params.interviewId contains the value.
    const { interviewId } = req.params

    // Find the report by BOTH its _id AND the user's id.
    // This ensures users can only access their OWN reports — not other users' reports.
    // If we only checked _id, any authenticated user could view any report by guessing IDs.
    const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user.id })

    // If no report was found (wrong ID or belongs to another user), return 404.
    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    // Return the full report with all fields (questions, skill gaps, prep plan, etc.).
    res.status(200).json({
        message: "Interview report fetched successfully.",
        interviewReport
    })
}


/** 
 * @description Controller to get all interview reports of logged in user.
 */
async function getAllInterviewReportsController(req, res) {

    // Find ALL reports belonging to the logged-in user.
    // .sort({ createdAt: -1 }) — Sort by newest first (descending order).
    // .select("-field") — EXCLUDE these fields from the response to reduce payload size.
    //   We exclude the heavy fields (resume, selfDescription, jobDescription, questions, etc.)
    //   because the Home page only needs the title, matchScore, and createdAt for the list.
    //   The full data is loaded when the user clicks into a specific report.
    const interviewReports = await interviewReportModel.find({ user: req.user.id }).sort({ createdAt: -1 }).select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

    // Return the lightweight list of reports.
    res.status(200).json({
        message: "Interview reports fetched successfully.",
        interviewReports
    })
}


/**
 * @description Controller to generate resume PDF based on user self description, resume and job description.
 */
async function generateResumePdfController(req, res) {

    // Extract the interviewReportId from the URL parameter.
    const { interviewReportId } = req.params

    // Find the original interview report to get the stored resume text,
    // job description, and self description.
    const interviewReport = await interviewReportModel.findById(interviewReportId)

    // If the report doesn't exist, return 404.
    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    // Destructure the original inputs from the saved report.
    // We stored these during report generation so the user doesn't have to re-upload.
    const { resume, jobDescription, selfDescription } = interviewReport

    // Call the AI service to generate a tailored resume.
    // This sends the data to Gemini AI which returns HTML, then Puppeteer converts it to PDF.
    // The result is a PDF Buffer (raw binary data of the PDF file).
    const pdfBuffer = await generateResumePdf({ resume, jobDescription, selfDescription })

    // Set HTTP response headers for a PDF file download.
    // Content-Type: application/pdf — tells the browser this is a PDF file.
    // Content-Disposition: attachment — tells the browser to download it (not display inline).
    //   filename=resume_[id].pdf — suggests a filename for the downloaded file.
    res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
    })

    // Send the raw PDF buffer as the response body.
    // The frontend receives this as a Blob, creates a temporary URL, and triggers a download.
    res.send(pdfBuffer)
}

// Export all four controller functions for use in interview.routes.js.
module.exports = { generateInterViewReportController, getInterviewReportByIdController, getAllInterviewReportsController, generateResumePdfController }