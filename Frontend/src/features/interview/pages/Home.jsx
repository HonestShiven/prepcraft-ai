/**
 * ===========================================================================================
 * HOME.JSX — Prepcraft AI: Landing Page Hero & Preparation Studio Workbench
 * Created by UI-UX Design & Prompt Specifications.
 *
 * WHAT THIS FILE DOES:
 *   1. Renders the Desktop Landing Page Hero (Section 1):
 *      - Living Animated Aurora Background (Crimson #ff2f3a -> Coral #ff6b4a -> Amber #ffb347)
 *      - Floating translucent Pill Nav with diamond logo glyph and quick links
 *      - Two-line H1 with warm gradient emphasis keyword
 *      - Tactile keycap-raised physical OS buttons
 *      - Dark-glass Command-Bar / Launcher Mockup with keyboard shortcut chips
 *      - Product Hunt #1 Product of the Day floating badge
 *      - Smooth scroll trigger ("Scroll to Studio ↓")
 *   2. Renders the Preparation Workbench (Section 2 - matching Image 2):
 *      - 2-Column interactive studio for target role specs and resume PDF ingestion
 *      - "Insert Sample JD" one-click test helper
 *      - Drag & drop in-memory resume PDF upload with active file badge card
 *      - Preparation kit generation pipeline checklist
 *      - User's past interview sessions grid with match score badges
 *
 * BACKEND INTEGRATION:
 *   - useInterview hook: calls generateReport (POST /api/interview/) and fetches past reports
 *   - useAuth hook: provides user profile state and handleLogout (GET /api/auth/logout)
 * ===========================================================================================
 */

import React, { useState, useRef } from 'react'
import "../style/home.scss" // UI-UX Pro Max styles: Aurora animation, command bar, tactile keycaps, workbench
import { useInterview } from '../hooks/useInterview.js'
import { useAuth } from '../../auth/hooks/useAuth.js'
import { useNavigate } from 'react-router'
import { motion, AnimatePresence } from 'motion/react' // Motion AI animation engine
import { 
    Briefcase, 
    FileText, 
    Upload, 
    LogOut, 
    Sparkles, 
    CheckCircle2, 
    ArrowRight, 
    ShieldCheck, 
    Layers, 
    Trash2,
    Calendar,
    Target,
    Search,
    Terminal,
    Cpu,
    ArrowDown,
    Command,
    Compass
} from 'lucide-react'

// Realistic Sample JD snippet for instant 1-click test simulation
const SAMPLE_JD = `Senior Full-Stack Engineer (React & Node.js)
Responsibilities:
- Architect and build scalable web applications using React, Vite, and TypeScript.
- Design resilient RESTful APIs with Node.js, Express, and MongoDB.
- Integrate LLM pipelines (Gemini / OpenAI) with structured JSON schemas and fallback reliability.
- Implement secure authentication mechanisms (HTTP-only JWT cookies, bcrypt).
- Optimize client-side render performance, bundle splitting, and physics-based animations.

Requirements:
- 3+ years experience with modern JavaScript / TypeScript stacks.
- Proven experience with in-memory stream processing and headless browser automation (Puppeteer).
- Deep knowledge of web security (XSS, CSRF, rate-limiting, token blacklisting).`

const Home = () => {

    // [Backend Hook]: Get interview state and actions from custom hook (see hooks/useInterview.js)
    const { loading, generateReport, reports } = useInterview()

    // [Backend Hook]: Get user authentication state and logout handler
    const { user, handleLogout } = useAuth()

    // Form inputs and UI states
    const [jobDescription, setJobDescription] = useState("")
    const [selfDescription, setSelfDescription] = useState("")
    const [fileName, setFileName] = useState("")
    const [fileSize, setFileSize] = useState("")
    const [isDragging, setIsDragging] = useState(false)

    // useRef to target hidden native file input
    const resumeInputRef = useRef(null)

    // useRef to smoothly scroll down to the workbench section
    const workbenchSectionRef = useRef(null)

    // React Router navigation
    const navigate = useNavigate()

    /**
     * handleGenerateReport:
     * Validates inputs, sends FormData to Express backend, and routes to report detail page.
     */
    const handleGenerateReport = async (e) => {
        e.preventDefault()
        const resumeFile = resumeInputRef.current?.files?.[0]
        if (!resumeFile && !jobDescription.trim()) {
            alert("Please provide at least a job description or upload your resume PDF.")
            return
        }

        const data = await generateReport({ jobDescription, selfDescription, resumeFile })
        if (data?._id) {
            navigate(`/interview/${data._id}`)
        }
    }

    /**
     * handleFileChange:
     * Reads the selected PDF file metadata and stores file name and size in state.
     */
    const handleFileChange = () => {
        const file = resumeInputRef.current?.files?.[0]
        if (file) {
            setFileName(file.name)
            setFileSize((file.size / 1024).toFixed(1) + " KB")
        }
    }

    /**
     * handleRemoveFile:
     * Clears the selected file from state and resets the native file input.
     */
    const handleRemoveFile = (e) => {
        e.stopPropagation()
        if (resumeInputRef.current) {
            resumeInputRef.current.value = ""
        }
        setFileName("")
        setFileSize("")
    }

    /**
     * Drag-and-drop event handlers:
     * Provide visual feedback and allow dragging PDF files directly onto the target zone.
     */
    const handleDragOver = (e) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = () => {
        setIsDragging(false)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setIsDragging(false)
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0]
            if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
                if (resumeInputRef.current) {
                    const dataTransfer = new DataTransfer()
                    dataTransfer.items.add(file)
                    resumeInputRef.current.files = dataTransfer.files
                    handleFileChange()
                }
            } else {
                alert("Please drop a valid PDF file.")
            }
        }
    }

    /**
     * handleInsertSampleJD:
     * Helper to automatically fill a realistic JD so the user can test in 1 click.
     */
    const handleInsertSampleJD = () => {
        setJobDescription(SAMPLE_JD)
        if (!selfDescription) {
            setSelfDescription("Experienced Full-Stack Developer with expertise in React, Node.js, Express, and AI integrations.")
        }
    }

    /**
     * scrollToWorkbench:
     * Smoothly scrolls from the Landing Hero to the Studio Workbench (Image 2).
     */
    const scrollToWorkbench = () => {
        workbenchSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    // Fullscreen loading screen during Gemini AI report generation
    if (loading) {
        return (
            <main className='loading-screen'>
                <div className='spinner' />
                <p>Generating your interview preparation plan with Gemini AI...</p>
                <span style={{ fontSize: "0.82rem", color: "var(--color-foreground-subtle)" }}>
                    Extracting competencies, assembling technical drills, and tailoring ATS resume.
                </span>
            </main>
        )
    }

    return (
        <div className='landing-workbench-wrapper'>
            {/* ================================================================
             * SECTION 1: CINEMATIC LIVING AURORA LANDING HERO
             * ================================================================ */}
            <section className='hero-viewport'>
                {/* ── Living Animated Aurora Light-Blades & Film-Grain Vignette ── */}
                <div className='aurora-container'>
                    <div className='aurora-blade-1' />
                    <div className='aurora-blade-2' />
                    <div className='aurora-blade-3' />
                    <div className='aurora-noise-overlay' />
                    <div className='aurora-vignette' />
                </div>

                {/* ── (1) Floating Translucent Pill Nav ── */}
                <nav className='floating-pill-nav'>
                    <div className='floating-pill-nav__brand'>
                        <span className='brand-glyph'>◆</span>
                        <span className='brand-text'>Prepcraft AI</span>
                    </div>

                    <ul className='floating-pill-nav__links'>
                        <li><a href="#workbench" onClick={scrollToWorkbench}>Platform</a></li>
                        <li><a href="#workbench" onClick={scrollToWorkbench}>Resume Score</a></li>
                        <li><a href="#workbench" onClick={scrollToWorkbench}>Skill Gaps</a></li>
                        <li><a href="#workbench" onClick={scrollToWorkbench}>Plan Maker</a></li>
                        <li><a href="#workbench" onClick={scrollToWorkbench}>Docs</a></li>
                    </ul>

                    <div className='floating-pill-nav__actions'>
                        {/* [UI-UX Pro Max Skill]: Display authenticated username badge and logout action */}
                        {user ? (
                            <>
                                <div className='nav-user-pill'>
                                    <span className='nav-user-pill__dot' />
                                    <span className='nav-user-pill__name'>{user.username}</span>
                                </div>
                                <button className='btn-nav-login' onClick={handleLogout} title="Sign Out">
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <button className='btn-nav-login' onClick={() => navigate('/login')}>
                                Log in
                            </button>
                        )}
                    </div>
                </nav>

                {/* ── Hero Center Content ── */}
                <div className='hero-content'>
                    {/* (3) H1 Heading (Inter 64px, 600 weight, warm gradient keyword) */}
                    <h1 className='hero-title'>
                        Everything you prepare,<br />
                        one <span className='word-gradient'>interview</span> away.
                    </h1>

                    {/* (4) Subtitle (18px/400 muted-white, max 640px) */}
                    <p className='hero-subtitle'>
                        Prepcraft AI is the intelligent interview preparation platform for builders. 
                        Calculate candidate resume scores, identify skill gaps, and craft customized preparation plans—all from a single command bar.
                    </p>

                    {/* [UI-UX Pro Max Skill]: Tactile Keycap-Raised Action Button ("Download Your Resume", no OS glyphs) */}
                    <div className='hero-cta-row'>
                        <button className='btn-keycap' onClick={scrollToWorkbench}>
                            <span>Download Your Resume</span>
                        </button>
                    </div>

                    {/* (7) Dark-Glass Command-Bar / Launcher Mockup */}
                    <div className='command-bar-mockup'>
                        <div className='command-bar-mockup__input-row'>
                            <div className='search-left'>
                                <Search size={15} />
                                <span className='query-text'>deploy interview plan senior-frontend</span>
                                <span className='blinking-caret' />
                            </div>
                            <span className='mode-pill'>Command</span>
                        </div>

                        <div className='command-bar-mockup__list'>
                            {/* Active Row tinted from the warm aurora (strictly warm) */}
                            <div className='command-bar-mockup__row command-bar-mockup__row--active'>
                                <div className='row-left'>
                                    <Sparkles size={14} className='row-icon' />
                                    <span>Deploy interview preparation plan</span>
                                </div>
                                <span className='shortcut-chip'>⌘ Enter</span>
                            </div>

                            <div className='command-bar-mockup__row'>
                                <div className='row-left'>
                                    <FileText size={14} className='row-icon' />
                                    <span>Calculate candidate resume match score</span>
                                </div>
                                <span className='shortcut-chip'>⌘ B</span>
                            </div>

                            <div className='command-bar-mockup__row'>
                                <div className='row-left'>
                                    <Target size={14} className='row-icon' />
                                    <span>Identify missing skill gaps & remediation plan</span>
                                </div>
                                <span className='shortcut-chip'>⌘ O</span>
                            </div>

                            <div className='command-bar-mockup__row'>
                                <div className='row-left'>
                                    <Cpu size={14} className='row-icon' />
                                    <span>Compile ATS-tailored resume PDF (Puppeteer)</span>
                                </div>
                                <span className='shortcut-chip'>⌘ K</span>
                            </div>
                        </div>

                        <div className='command-bar-mockup__footer'>
                            <div className='footer-hints'>
                                <span>↑↓ navigate</span>
                                <span>↵ open</span>
                                <span>esc dismiss</span>
                            </div>
                            <div className='footer-brand'>
                                <span className='footer-glyph'>◆</span>
                                <span>Prepcraft AI</span>
                            </div>
                        </div>
                    </div>

                    {/* (9) Centered Ghost Pill ('Learn more ->') */}
                    <button className='btn-learn-more' onClick={scrollToWorkbench}>
                        <span>Learn more</span>
                        <span className='btn-learn-more__arrow'>→</span>
                    </button>
                </div>

                {/* [UI-UX Pro Max Skill]: Clean bottom without external badge */}
            </section>

            {/* ================================================================
             * SECTION 2: WORKBENCH (IMAGE 2) STYLED WITH WARM AURORA THEME
             * ================================================================ */}
            <section ref={workbenchSectionRef} id="workbench" className='workbench-section'>
                <div className='workbench-container'>
                    {/* ── Top Utility Breadcrumb Bar (Matching Image 2) ──────── */}
                    <div className='workbench-top-bar'>
                        <div className='top-bar-left'>
                            <div className='brand-icon-box'>
                                <Sparkles size={15} />
                            </div>
                            <span className='brand-name'>Prepcraft AI</span>
                            <span className='breadcrumb-slash'>/</span>
                            <span className='breadcrumb-page'>Workspace</span>
                        </div>
                        <div className='top-bar-right'>
                            <div className='user-status-pill'>
                                <span className='status-dot' />
                                <span>{user?.username || "Candidate"}</span>
                            </div>
                            {user ? (
                                <button className='btn-topbar-signout' onClick={handleLogout} title="Sign Out">
                                    <LogOut size={13} />
                                    <span>Sign Out</span>
                                </button>
                            ) : (
                                <button className='btn-topbar-signout' onClick={() => navigate('/login')} title="Log In">
                                    <span>Log In</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* ── Workbench Header ───────────────────────────────────── */}
                    <div className='workbench-header'>
                        <div className='eyebrow'>
                            <span className='eyebrow-chip'>AI PREPARATION WORKBENCH</span>
                            <span className='eyebrow-meta'>3-Tier Model Fallback Active</span>
                        </div>
                        <h2>Prepare for your next interview</h2>
                        <p>
                            Upload your candidate resume and supply the target role specifications. 
                            The engine extracts core competencies, predicts technical and behavioral questions, and compiles an ATS-optimized resume.
                        </p>
                    </div>

                    {/* ── Two-Column Workbench Grid (Image 2) ────────────────── */}
                    <form onSubmit={handleGenerateReport} className='workbench-grid'>
                        {/* Left Column: Target Role Context */}
                        <div className='panel-card'>
                            <div className='panel-card__header'>
                                <div className='panel-card__title-group'>
                                    <div className='panel-icon'>
                                        <Briefcase size={16} />
                                    </div>
                                    <div>
                                        <h3>1. Target Role & Requirements</h3>
                                        <span className='panel-subtitle'>Paste the complete job posting or job requirements</span>
                                    </div>
                                </div>
                                <button 
                                    type="button" 
                                    className='btn-helper' 
                                    onClick={handleInsertSampleJD}
                                >
                                    Insert Sample JD
                                </button>
                            </div>

                            <div className='panel-card__body'>
                                <div className='field-group'>
                                    <div className='field-header'>
                                        <label htmlFor="jobDescription">Job Description</label>
                                        <span className='char-counter'>{jobDescription.length} / 5000</span>
                                    </div>
                                    <textarea
                                        id="jobDescription"
                                        rows={10}
                                        placeholder="Paste the full job description here (e.g. responsibilities, key tech stack, required qualifications)..."
                                        value={jobDescription}
                                        onChange={(e) => setJobDescription(e.target.value)}
                                        className='custom-textarea'
                                        required
                                    />
                                </div>

                                <div className='field-group' style={{ marginTop: '1.25rem' }}>
                                    <div className='field-header'>
                                        <label htmlFor="selfDescription">Self Description / Career Focus (Optional)</label>
                                        <span className='optional-tag'>Optional</span>
                                    </div>
                                    <textarea
                                        id="selfDescription"
                                        rows={4}
                                        placeholder="Briefly describe your years of experience, primary strengths, or specific topics you want emphasized..."
                                        value={selfDescription}
                                        onChange={(e) => setSelfDescription(e.target.value)}
                                        className='custom-textarea'
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Candidate Resume & Execution */}
                        <div className='panel-card right-panel'>
                            <div className='panel-card__header'>
                                <div className='panel-card__title-group'>
                                    <div className='panel-icon'>
                                        <FileText size={16} />
                                    </div>
                                    <div>
                                        <h3>2. Candidate Resume</h3>
                                        <span className='panel-subtitle'>Upload your existing PDF resume for parsing</span>
                                    </div>
                                </div>
                                <span className='badge-secure'>
                                    <ShieldCheck size={12} />
                                    <span>In-Memory RAM Buffer</span>
                                </span>
                            </div>

                            <div className='panel-card__body'>
                                {/* Hidden native file input */}
                                <input
                                    ref={resumeInputRef}
                                    type="file"
                                    accept=".pdf"
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                />

                                {/* Dropzone Area */}
                                {!fileName ? (
                                    <div 
                                        className={`dropzone-card ${isDragging ? 'dropzone-card--dragging' : ''}`}
                                        onClick={() => resumeInputRef.current?.click()}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                    >
                                        <div className='dropzone-icon-wrap'>
                                            <Upload size={22} />
                                        </div>
                                        <div className='dropzone-text'>
                                            <p className='dropzone-title'>Click to browse or drop your resume</p>
                                            <p className='dropzone-sub'>Standard PDF format up to 5MB. Parsed in-memory without disk storage.</p>
                                        </div>
                                    </div>
                                ) : (
                                    /* Active File Badge Card */
                                    <div className='file-selected-card'>
                                        <div className='file-info'>
                                            <div className='pdf-icon-badge'>PDF</div>
                                            <div className='file-meta'>
                                                <span className='file-name'>{fileName}</span>
                                                <span className='file-size'>{fileSize} • Ready for analysis</span>
                                            </div>
                                        </div>
                                        <button 
                                            type="button" 
                                            className='btn-remove-file'
                                            onClick={handleRemoveFile}
                                            title="Remove file"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                )}

                                {/* Generation Summary Checklist */}
                                <div className='generation-summary'>
                                    <h4>Kit Generation Pipeline</h4>
                                    <ul className='summary-checklist'>
                                        <li>
                                            <CheckCircle2 size={14} className='check-icon' />
                                            <span>Candidate Match Score (0–100%) against target role</span>
                                        </li>
                                        <li>
                                            <CheckCircle2 size={14} className='check-icon' />
                                            <span>Role-specific technical interview questions with ideal answers</span>
                                        </li>
                                        <li>
                                            <CheckCircle2 size={14} className='check-icon' />
                                            <span>STAR-format behavioral scenarios & competency mapping</span>
                                        </li>
                                        <li>
                                            <CheckCircle2 size={14} className='check-icon' />
                                            <span>Identified skill gaps & structured day-by-day prep plan</span>
                                        </li>
                                        <li>
                                            <CheckCircle2 size={14} className='check-icon' />
                                            <span>One-click ATS-tailored resume PDF compiled via Puppeteer</span>
                                        </li>
                                    </ul>

                                    <button 
                                        type="submit" 
                                        className='btn-generate-main'
                                        disabled={loading}
                                    >
                                        <span>Generate Preparation Kit</span>
                                        <ArrowRight size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>

                    {/* ── Past Reports Section ───────────────────────────────── */}
                    <section className='past-sessions-section'>
                        <div className='section-title-bar'>
                            <div className='section-title-left'>
                                <Layers size={18} />
                                <h3>Recent Interview Sessions</h3>
                                <span className='count-badge'>{reports?.length || 0}</span>
                            </div>
                        </div>

                        {reports && reports.length > 0 ? (
                            <div className='reports-grid'>
                                {reports.map((item, index) => (
                                    <motion.div
                                        key={item._id || index}
                                        className='session-card'
                                        onClick={() => navigate(`/interview/${item._id}`)}
                                        whileHover={{ y: -3, transition: { duration: 0.15 } }}
                                    >
                                        <div className='session-card__header'>
                                            <h4 className='session-title'>{item.title || "Interview Session"}</h4>
                                            <span className={`match-badge ${item.matchScore >= 80 ? 'match-high' : item.matchScore >= 60 ? 'match-med' : 'match-low'}`}>
                                                <Target size={12} />
                                                <span>{item.matchScore || 0}% Match</span>
                                            </span>
                                        </div>

                                        <div className='session-card__meta'>
                                            <span className='meta-item'>
                                                <Calendar size={13} />
                                                <span>{new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                            </span>
                                            <span className='meta-dot'>•</span>
                                            <span className='meta-item'>
                                                {item.technicalQuestions?.length || 0} Questions
                                            </span>
                                            <span className='meta-dot'>•</span>
                                            <span className='meta-item'>
                                                {item.skillGaps?.length || 0} Skill Gaps
                                            </span>
                                        </div>

                                        <div className='session-card__footer'>
                                            <span className='open-action'>
                                                <span>Open Preparation Kit</span>
                                                <ArrowRight size={14} />
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className='empty-history-card'>
                                <p>No preparation sessions generated yet. Provide your target job description and resume above to start your first session.</p>
                            </div>
                        )}
                    </section>
                </div>
            </section>
        </div>
    )
}

// Minimal inline SVG glyphs for Apple and Windows OS icons
const AppleGlyph = ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 170 170" fill="currentColor">
        <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.66-7.85-11.88-14.43-6.22-9.69-10.9-20.57-14.04-32.65-3.14-12.08-4.71-23.36-4.71-33.85 0-14.54 3.7-26.65 11.09-36.32 7.39-9.67 16.71-14.61 27.97-14.81 4.71 0 10.05 1.34 16.02 4.02 5.97 2.68 9.94 4.07 11.9 4.17 1.74 0 5.86-1.45 12.37-4.36 6.51-2.9 11.83-4.25 15.97-4.04 11.94.61 21.6 4.96 28.98 13.06-10.42 6.31-15.52 14.89-15.3 25.74.22 8.48 3.51 15.65 9.87 21.52 6.36 5.87 13.9 9.17 22.61 9.91-2.39 7.17-5.18 14.44-8.37 21.81zM119.22 31.81c0-7.17 2.58-13.84 7.74-20.02 5.16-6.18 11.51-9.94 19.04-11.29.22 1.3.33 2.49.33 3.58 0 7.07-2.67 13.9-8.01 20.48-5.34 6.58-11.96 10.37-19.86 11.37-.11-1.3-.24-2.67-.24-4.12z" />
    </svg>
)

const WindowsGlyph = ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
        <path d="M6.555 1.375L0 2.237V7.5h6.555V1.375zM0 8.5v5.263l6.555.862V8.5H0zm7.445-7.25V7.5H16V0L7.445 1.25zM16 8.5H7.445v6.25L16 16V8.5z" />
    </svg>
)

export default Home