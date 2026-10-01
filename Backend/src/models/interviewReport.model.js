// ===========================================================================================
// INTERVIEWREPORT.MODEL.JS — Mongoose schema and model for the "InterviewReport" collection.
// This is the most complex model in the app. It stores the full AI-generated interview
// preparation report, including: match score, technical questions, behavioral questions,
// skill gaps, and a day-by-day preparation plan.
//
// ARCHITECTURE NOTE: This model uses "nested sub-schemas" — smaller schemas embedded inside
// the main schema. This is a MongoDB pattern for structured, repeatable data (like an array
// of questions where each question has the same shape: question, intention, answer).
// ===========================================================================================

// Import Mongoose for schema definition and model creation.
const mongoose = require('mongoose');


// ── SUB-SCHEMA 1: Technical Question ──────────────────────────────────────────
// Each technical question has three fields: the question text, why the interviewer
// asks it (intention), and how to answer it effectively (answer).
const technicalQuestionSchema = new mongoose.Schema({

    // The interview question itself, e.g., "Explain the difference between REST and GraphQL."
    question: {
        type: String,
        required: [ true, "Technical question is required" ]
    },

    // Why the interviewer asks this — what they're trying to evaluate.
    // e.g., "To assess candidate's understanding of API design trade-offs."
    intention: {
        type: String,
        required: [ true, "Intention is required" ]
    },

    // A model answer — how the candidate should structure their response.
    // e.g., "Start by defining both, then compare on flexibility, performance..."
    answer: {
        type: String,
        required: [ true, "Answer is required" ]
    }
}, {
    // _id: false — Don't generate a unique _id for each sub-document.
    // By default, Mongoose adds an _id to every sub-document. Since these are embedded
    // inside the parent document and don't need to be referenced individually, we disable it.
    _id: false
})

// ── SUB-SCHEMA 2: Behavioral Question ────────────────────────────────────────
// Same structure as technical questions but focused on soft skills, teamwork,
// leadership, conflict resolution, etc.
const behavioralQuestionSchema = new mongoose.Schema({

    // The behavioral question, e.g., "Tell me about a time you handled a conflict with a coworker."
    question: {
        type: String,
        required: [ true, "Technical question is required" ]
    },

    // The interviewer's intention, e.g., "Assess emotional intelligence and conflict resolution."
    intention: {
        type: String,
        required: [ true, "Intention is required" ]
    },

    // How to answer using the STAR method (Situation, Task, Action, Result).
    answer: {
        type: String,
        required: [ true, "Answer is required" ]
    }
}, {
    _id: false  // No individual _id needed for embedded sub-documents.
})

// ── SUB-SCHEMA 3: Skill Gap ──────────────────────────────────────────────────
// Identifies skills the candidate is missing for the target job, with a severity rating.
const skillGapSchema = new mongoose.Schema({

    // The skill name that the candidate lacks, e.g., "Kubernetes", "System Design".
    skill: {
        type: String,
        required: [ true, "Skill is required" ]
    },

    // How critical this gap is for the job role.
    // enum restricts the value to one of: "low", "medium", "high".
    // "high" means this skill is essential and its absence could disqualify the candidate.
    severity: {
        type: String,
        enum: [ "low", "medium", "high" ],
        required: [ true, "Severity is required" ]
    }
}, {
    _id: false  // No individual _id needed.
})

// ── SUB-SCHEMA 4: Preparation Plan Day ───────────────────────────────────────
// A single day in the preparation roadmap. The AI generates a multi-day plan
// with specific focus areas and actionable tasks for each day.
const preparationPlanSchema = new mongoose.Schema({

    // The day number (1, 2, 3, ...) in the preparation schedule.
    day: {
        type: Number,
        required: [ true, "Day is required" ]
    },

    // The main topic/focus for this day, e.g., "Data Structures & Algorithms".
    focus: {
        type: String,
        required: [ true, "Focus is required" ]
    },

    // An array of specific tasks to complete on this day.
    // e.g., ["Solve 5 LeetCode medium problems on trees", "Review hash map patterns"]
    tasks: [ {
        type: String,
        required: [ true, "Task is required" ]
    } ]
})

// ── MAIN SCHEMA: Interview Report ────────────────────────────────────────────
// The parent schema that combines all sub-schemas above into one complete report.
// Each document represents one interview preparation report for one user + job combo.
const interviewReportSchema = new mongoose.Schema({

    // The full job description text that the user pasted in.
    // Stored so we can re-generate the resume PDF later without asking the user again.
    jobDescription: {
        type: String,
        required: [ true, "Job description is required" ]
    },

    // The extracted text content from the user's uploaded PDF resume.
    // Stored for resume PDF regeneration.
    resume: {
        type: String,
    },

    // The user's self-description text (alternative to resume upload).
    selfDescription: {
        type: String,
    },

    // AI-generated match score (0-100) — how well the candidate fits the job.
    // min/max enforce the valid range at the schema level.
    matchScore: {
        type: Number,
        min: 0,
        max: 100,
    },

    // Array of technical questions — each follows the technicalQuestionSchema shape.
    // Mongoose validates each element in the array against the sub-schema.
    technicalQuestions: [ technicalQuestionSchema ],

    // Array of behavioral questions — each follows the behavioralQuestionSchema shape.
    behavioralQuestions: [ behavioralQuestionSchema ],

    // Array of skill gaps — each follows the skillGapSchema shape.
    skillGaps: [ skillGapSchema ],

    // Array of preparation plan days — each follows the preparationPlanSchema shape.
    preparationPlan: [ preparationPlanSchema ],

    // Reference to the user who generated this report.
    // mongoose.Schema.Types.ObjectId is MongoDB's unique identifier type.
    // ref: "users" — tells Mongoose which collection this ObjectId points to,
    //   enabling .populate() to auto-fetch the full user document if needed.
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },

    // The job title extracted by the AI (e.g., "Senior Frontend Engineer").
    // Used as the display title in the reports list on the Home page.
    title: {
        type: String,
        required: [ true, "Job title is required" ]
    }
}, {
    // Enable timestamps — Mongoose adds createdAt and updatedAt fields automatically.
    // createdAt is displayed on the Home page as "Generated on [date]".
    timestamps: true
})


// Create the Mongoose model. The collection in MongoDB will be "interviewreports"
// (Mongoose lowercases and pluralizes the model name "InterviewReport").
const interviewReportModel = mongoose.model("InterviewReport", interviewReportSchema);

// Export the model for use in interview.controller.js (CRUD operations on reports).
module.exports = interviewReportModel;  