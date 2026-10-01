// ===========================================================================================
// AI.SERVICE.JS — The AI brain of the application.
// This service handles all interactions with Google's Gemini AI API.
// It contains three main functions:
//   1. generateInterviewReport() — Sends resume + job description to Gemini, gets structured JSON
//   2. generatePdfFromHtml()     — Converts HTML string to PDF using Puppeteer (headless browser)
//   3. generateResumePdf()       — Asks Gemini to generate resume HTML, then converts to PDF
//
// KEY FEATURE: Gemini Model Fallback Cascade (3.8 → 3.5 → 2.5 Flash)
// If the latest model is unavailable or rate-limited, we automatically try the next one.
// ===========================================================================================

// Import the Google GenAI SDK — the official client for interacting with Gemini AI models.
// GoogleGenAI provides methods to call Gemini's text generation API with structured output.
const { GoogleGenAI } = require("@google/genai")

// Import Zod — a TypeScript-first schema validation library.
// We use Zod to define the EXACT shape of the JSON we want Gemini to return.
// This ensures the AI response always matches our expected format (no missing fields).
const { z } = require("zod")

// Import zodToJsonSchema — converts a Zod schema to JSON Schema format.
// Gemini's API accepts JSON Schema (not Zod) for structured output configuration.
// This converter bridges the gap: we define schemas in Zod (cleaner syntax) and convert
// them to JSON Schema before sending to the API.
const { zodToJsonSchema } = require("zod-to-json-schema")

// Import Puppeteer — a headless Chrome browser automation library.
// We use it to convert HTML → PDF: Puppeteer opens the HTML in a hidden browser,
// then calls page.pdf() to "print" the page as a PDF file.
const puppeteer = require("puppeteer")

// ── Gemini Client Initialization ──────────────────────────────────────────────
// Create a new GoogleGenAI instance with the API key from environment variables.
// This same API key works for ALL Gemini models (3.8, 3.5, 2.5 Flash).
// The key is stored in .env as GOOGLE_GENAI_API_KEY (same one used in MorphixAI).
const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})

// ── Model Fallback Cascade ───────────────────────────────────────────────────
// Define the ordered list of Gemini models to try.
// If the first model fails (rate limit, outage, quota), we try the next one.
// This ensures the app stays functional even when the latest model is unavailable.
//   1. gemini-2.5-flash — Latest and most capable, best structured output
//   2. gemini-2.0-flash — Stable fallback with good performance
//   3. gemini-1.5-flash — Oldest but most reliable and widely available
const GEMINI_MODELS = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash"
]

// ── Helper: Call Gemini with automatic model fallback ─────────────────────────
// This function tries each model in order until one succeeds.
// If ALL models fail, it throws the last error.
async function callGeminiWithFallback({ prompt, responseSchema }) {

    // Variable to store the last error encountered (for debugging if all models fail).
    let lastError = null

    // Loop through each model in the cascade.
    for (const model of GEMINI_MODELS) {
        try {
            // Log which model we're attempting (helpful for debugging).
            console.log(`[AI Service] Trying model: ${model}`)

            // Call the Gemini API with the current model.
            // ai.models.generateContent() sends the prompt to the specified model.
            // config.responseMimeType = "application/json" — forces the AI to return valid JSON.
            // config.responseSchema — the JSON Schema that defines the expected response shape.
            //   Gemini will structure its output to match this schema exactly.
            const response = await ai.models.generateContent({
                model: model,
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: responseSchema,
                }
            })

            // If we reach here, the API call succeeded. Log success and return the result.
            console.log(`[AI Service] Success with model: ${model}`)

            // Parse the JSON string response into a JavaScript object.
            // response.text contains the raw JSON string that Gemini generated.
            return JSON.parse(response.text)

        } catch (error) {
            // If this model fails, log the error and try the next model.
            console.error(`[AI Service] Model ${model} failed:`, error.message)

            // Store the error in case all models fail.
            lastError = error
        }
    }

    // If we've exhausted all models, throw the last error.
    // This will propagate up to the controller, which should return a 500 error.
    throw new Error(`All Gemini models failed. Last error: ${lastError.message}`)
}


// ── Zod Schema: Interview Report ──────────────────────────────────────────────
// This schema defines the EXACT shape of the AI-generated interview report.
// Each field has a .describe() annotation that serves as an instruction to the AI
// about what to put in that field. Gemini reads these descriptions to understand
// what content to generate for each field.
const interviewReportSchema = z.object({

    // A numerical score (0-100) indicating how well the candidate fits the job.
    matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate's profile matches the job describe"),

    // Array of technical interview questions with intention and model answers.
    // z.array(z.object({...})) means: an array where each element is an object with these fields.
    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Technical questions that can be asked in the interview along with their intention and how to answer them"),

    // Array of behavioral interview questions (soft skills, culture fit).
    behavioralQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Behavioral questions that can be asked in the interview along with their intention and how to answer them"),

    // Array of skill gaps — what the candidate is missing for the job.
    // z.enum(["low", "medium", "high"]) restricts the AI to one of these three values.
    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z.enum([ "low", "medium", "high" ]).describe("The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances")
    })).describe("List of skill gaps in the candidate's profile along with their severity"),

    // Day-by-day preparation plan with focus areas and tasks.
    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number in the preparation plan, starting from 1"),
        focus: z.string().describe("The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc."),
        tasks: z.array(z.string()).describe("List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.")
    })).describe("A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively"),

    // The job title extracted from the job description (used as display title in the report list).
    title: z.string().describe("The title of the job for which the interview report is generated"),
})

// ── Main Function: Generate Interview Report ──────────────────────────────────
// This function orchestrates the AI call for generating a complete interview report.
// It builds the prompt, calls Gemini with fallback, and returns the parsed result.
async function generateInterviewReport({ resume, selfDescription, jobDescription }) {

    // Build the prompt that tells Gemini what to generate.
    // We include all three pieces of information the user provided.
    // The structured output schema (defined above) tells Gemini the exact JSON format to return.
    const prompt = `Generate an interview report for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}
`

    // Convert the Zod schema to JSON Schema format for the Gemini API.
    const jsonSchema = zodToJsonSchema(interviewReportSchema)

    // Call Gemini with the fallback cascade (tries 3.8 → 3.5 → 2.5 automatically).
    // Returns the parsed JSON object matching the interviewReportSchema shape.
    const result = await callGeminiWithFallback({
        prompt: prompt,
        responseSchema: jsonSchema
    })

    // Return the structured interview report to the controller.
    return result
}



// ── Helper Function: Convert HTML to PDF ──────────────────────────────────────
// Uses Puppeteer (headless Chrome) to render HTML and export it as a PDF.
// This is the same technique used by services like wkhtmltopdf and print-to-PDF.
async function generatePdfFromHtml(htmlContent) {

    // Launch a new headless Chromium browser instance.
    // "Headless" means no visible browser window — it runs in the background.
    const browser = await puppeteer.launch()

    // Create a new browser page (tab).
    const page = await browser.newPage();

    // Set the HTML content of the page.
    // waitUntil: "networkidle0" — wait until there are no network requests for 500ms.
    // This ensures all fonts, images, and CSS are fully loaded before generating the PDF.
    await page.setContent(htmlContent, { waitUntil: "networkidle0" })

    // Generate a PDF from the page content.
    // format: "A4" — standard paper size (210mm × 297mm).
    // margin — adds whitespace around the content so text doesn't touch the page edges.
    // Returns a Buffer (raw binary data) representing the PDF file.
    const pdfBuffer = await page.pdf({
        format: "A4", margin: {
            top: "20mm",
            bottom: "20mm",
            left: "15mm",
            right: "15mm"
        }
    })

    // Close the browser to free memory. Without this, each call would leak a Chromium process.
    await browser.close()

    // Return the PDF as a Buffer for the controller to send as a response.
    return pdfBuffer
}

// ── Main Function: Generate Resume PDF ────────────────────────────────────────
// Two-step process: (1) Gemini generates HTML resume, (2) Puppeteer converts HTML → PDF.
async function generateResumePdf({ resume, selfDescription, jobDescription }) {

    // Define a simple Zod schema for the resume response — just a single HTML string.
    const resumePdfSchema = z.object({
        html: z.string().describe("The HTML content of the resume which can be converted to PDF using any library like puppeteer")
    })

    // Build a detailed prompt that instructs Gemini to generate a professional resume.
    // The prompt includes specific requirements: ATS-friendly, not AI-sounding,
    // 1-2 pages, tailored for the job description, professional design.
    const prompt = `Generate resume for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}

                        the response should be a JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF using any library like puppeteer.
                        The resume should be tailored for the given job description and should highlight the candidate's strengths and relevant experience. The HTML content should be well-formatted and structured, making it easy to read and visually appealing.
                        The content of resume should be not sound like it's generated by AI and should be as close as possible to a real human-written resume.
                        you can highlight the content using some colors or different font styles but the overall design should be simple and professional.
                        The content should be ATS friendly, i.e. it should be easily parsable by ATS systems without losing important information.
                        The resume should not be so lengthy, it should ideally be 1-2 pages long when converted to PDF. Focus on quality rather than quantity and make sure to include all the relevant information that can increase the candidate's chances of getting an interview call for the given job description.
                    `

    // Convert the Zod schema to JSON Schema format.
    const jsonSchema = zodToJsonSchema(resumePdfSchema)

    // Call Gemini with fallback cascade to generate the resume HTML.
    const jsonContent = await callGeminiWithFallback({
        prompt: prompt,
        responseSchema: jsonSchema
    })

    // Convert the AI-generated HTML into a PDF using Puppeteer.
    // jsonContent.html contains the full HTML document string.
    const pdfBuffer = await generatePdfFromHtml(jsonContent.html)

    // Return the PDF Buffer to the controller for download.
    return pdfBuffer

}

// Export both main functions for use in interview.controller.js.
module.exports = { generateInterviewReport, generateResumePdf }