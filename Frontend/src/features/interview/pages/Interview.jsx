/**
 * ===========================================================================================
 * INTERVIEW.JSX — Interview Report Detail Dashboard
 * ===========================================================================================
 * 
 * 🎨 SKILLS USED IN THIS FILE:
 * 
 * 1. [UI-UX Pro Max Skill]:
 *    - Executive 3-column split dashboard layout (Left Nav, Center Content, Right Sidebar)
 *    - Semantic question badges: .q-card__tag--intention (indigo) vs .q-card__tag--answer (emerald)
 *    - Circular Match Score Ring (.match-score-widget__ring) with dynamic status color:
 *      * score--high (emerald border glow) for >= 80%
 *      * score--mid (amber border glow) for 60-79%
 *      * score--low (crimson border glow) for < 60%
 *    - Categorized skill gap pills (.skill-tag--critical, .skill-tag--medium, .skill-tag--minor)
 *    - RoadMap day cards with day badges, focus headers, and task lists
 *    - Download Resume CTA button with sapphire gradient and bevel highlight
 * 
 * 2. [Motion AI Skill] (from 'motion/react'):
 *    - <AnimatePresence> accordion expanding/collapsing question answers smoothly
 *    - Chevron rotation animation (<motion.span animate={{ rotate: open ? 180 : 0 }}>)
 *    - Staggered physics springs for question cards (stiffness: 300, damping: 30, delay: 0.05 * index)
 *    - RoadMapDay staggered entry: initial={{ opacity: 0, x: -20 }}
 *    - Tab section slide/fade transitions: <AnimatePresence mode="wait">
 *    - Match score spring scale: initial={{ scale: 0.8 }} animate={{ scale: 1 }} with delayed score counter
 *    - Skill gap tags staggered entrance: initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
 * 
 * NOTE: For backend logic (useInterview hook, getReportById, getResumePdf blob download), see hooks/useInterview.js.
 * ===========================================================================================
 */
import React, { useState, useEffect } from 'react'
import '../style/interview.scss' // [UI-UX Pro Max Skill]: Styles for the report dashboard
import { useInterview } from '../hooks/useInterview.js'
import { useNavigate, useParams } from 'react-router'
import { motion, AnimatePresence } from 'motion/react' // [Motion AI Skill]: Physics-based animations
import { Code, MessageSquare, Navigation, ChevronDown, Sparkles, ArrowLeft } from 'lucide-react' // [UI-UX Pro Max Skill]: Minimalist SVG icons


// Navigation items for the section tabs (technical, behavioral, roadmap).
const NAV_ITEMS = [
    { id: 'technical', label: 'Technical Questions', icon: <Code size={16} /> },
    { id: 'behavioral', label: 'Behavioral Questions', icon: <MessageSquare size={16} /> },
    { id: 'roadmap', label: 'Road Map', icon: <Navigation size={16} /> },
]

// ── Sub-components ────────────────────────────────────────────────────────────

/** 
 * QuestionCard — Expandable accordion card for a single question.
 * Styled with UI-UX Pro Max tokens + Motion AI spring physics.
 */
const QuestionCard = ({ item, index }) => {
    const [open, setOpen] = useState(false)
    return (
        // [Motion AI Skill]: Stagger entrance for each card using spring physics
        <motion.div
            className='q-card'
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * index, type: "spring", stiffness: 300, damping: 30 }}
        >
            <div className='q-card__header' onClick={() => setOpen(o => !o)}>
                {/* [UI-UX Pro Max Skill]: Monospace question index badge */}
                <span className='q-card__index'>Q{index + 1}</span>
                <p className='q-card__question'>{item.question}</p>
                
                {/* [Motion AI Skill]: Rotate chevron smoothly by 180 degrees when toggled */}
                <motion.span
                    className='q-card__chevron'
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronDown size={16} />
                </motion.span>
            </div>

            {/* [Motion AI Skill]: Animate accordion body open/close with dynamic height */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        className='q-card__body'
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                        {/* [UI-UX Pro Max Skill]: Intention tag & description */}
                        <div className='q-card__section'>
                            <span className='q-card__tag q-card__tag--intention'>Intention</span>
                            <p>{item.intention}</p>
                        </div>
                        {/* [UI-UX Pro Max Skill]: Model Answer tag & response */}
                        <div className='q-card__section'>
                            <span className='q-card__tag q-card__tag--answer'>Model Answer</span>
                            <p>{item.answer}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

/** 
 * RoadMapDay — A single day card in the preparation roadmap.
 * Styled with UI-UX Pro Max tokens + Motion AI spring physics.
 */
const RoadMapDay = ({ day, index }) => (
    // [Motion AI Skill]: Staggered entrance for roadmap cards
    <motion.div
        className='roadmap-day'
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.08 * index, type: "spring", stiffness: 300, damping: 30 }}
    >
        {/* [UI-UX Pro Max Skill]: Day badge and focus title */}
        <div className='roadmap-day__header'>
            <span className='roadmap-day__badge'>Day {day.day}</span>
            <h3 className='roadmap-day__focus'>{day.focus}</h3>
        </div>
        <ul className='roadmap-day__tasks'>
            {day.tasks.map((task, i) => (
                <li key={i}>
                    <span className='roadmap-day__bullet' />
                    {task}
                </li>
            ))}
        </ul>
    </motion.div>
)

// ── Main Component ────────────────────────────────────────────────────────────
const Interview = () => {
    const [activeNav, setActiveNav] = useState('technical')
    const { report, getReportById, loading, getResumePdf } = useInterview()
    const { interviewId } = useParams()
    const navigate = useNavigate()

    // Fetch report data when component mounts or interviewId changes
    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId)
        }
    }, [interviewId])

    // Loading screen during fetch
    if (loading || !report) {
        return (
            <main className='loading-screen'>
                <div className='spinner' />
                <p>Loading your interview preparation kit...</p>
            </main>
        )
    }

    // [UI-UX Pro Max Skill]: Determine color class for match score (high/mid/low)
    const scoreColor =
        report.matchScore >= 80 ? 'score--high' :
            report.matchScore >= 60 ? 'score--mid' : 'score--low'

    return (
        <div className='interview-page'>
            <div className='interview-layout'>

                {/* ── [UI-UX Pro Max Skill]: Left Navigation Panel ── */}
                <motion.nav
                    className='interview-nav'
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <div className="nav-content">
                        {/* Back button */}
                        <button className='back-btn' onClick={() => navigate('/')}>
                            <ArrowLeft size={14} />
                            Back to Prepcraft Studio
                        </button>

                        <p className='interview-nav__label'>Sections</p>
                        {NAV_ITEMS.map(item => (
                            // [Motion AI Skill]: Button with subtle hover slide effect
                            <motion.button
                                key={item.id}
                                className={`interview-nav__item ${activeNav === item.id ? 'interview-nav__item--active' : ''}`}
                                onClick={() => setActiveNav(item.id)}
                                whileHover={{ x: 4 }}
                                whileTap={{ scale: 0.97 }}
                            >
                                <span className='interview-nav__icon'>{item.icon}</span>
                                {item.label}
                            </motion.button>
                        ))}
                    </div>

                    {/* [UI-UX Pro Max Skill]: Download Tailored Resume button */}
                    {/* [Motion AI Skill]: Spring hover and click scale */}
                    <motion.button
                        onClick={() => { getResumePdf(interviewId) }}
                        className='download-resume-btn'
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                    >
                        <Sparkles size={14} />
                        Download Tailored Resume
                    </motion.button>
                </motion.nav>

                <div className='interview-divider' />

                {/* ── [UI-UX Pro Max Skill]: Center Content Area ── */}
                <main className='interview-content'>
                    {/* [Motion AI Skill]: Tab transition animations */}
                    <AnimatePresence mode="wait">
                        {activeNav === 'technical' && (
                            <motion.section
                                key="technical"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.25 }}
                            >
                                <div className='content-header'>
                                    <h2>Technical Questions</h2>
                                    <span className='content-header__count'>{report.technicalQuestions?.length || 0} questions</span>
                                </div>
                                <div className='q-list'>
                                    {report.technicalQuestions?.map((q, i) => (
                                        <QuestionCard key={i} item={q} index={i} />
                                    ))}
                                </div>
                            </motion.section>
                        )}

                        {activeNav === 'behavioral' && (
                            <motion.section
                                key="behavioral"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.25 }}
                            >
                                <div className='content-header'>
                                    <h2>Behavioral Questions</h2>
                                    <span className='content-header__count'>{report.behavioralQuestions?.length || 0} questions</span>
                                </div>
                                <div className='q-list'>
                                    {report.behavioralQuestions?.map((q, i) => (
                                        <QuestionCard key={i} item={q} index={i} />
                                    ))}
                                </div>
                            </motion.section>
                        )}

                        {activeNav === 'roadmap' && (
                            <motion.section
                                key="roadmap"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.25 }}
                            >
                                <div className='content-header'>
                                    <h2>Preparation Road Map</h2>
                                    <span className='content-header__count'>{report.preparationPlan?.length || 0}-day plan</span>
                                </div>
                                <div className='roadmap-list'>
                                    {report.preparationPlan?.map((day, i) => (
                                        <RoadMapDay key={day.day || i} day={day} index={i} />
                                    ))}
                                </div>
                            </motion.section>
                        )}
                    </AnimatePresence>
                </main>

                <div className='interview-divider' />

                {/* ── [UI-UX Pro Max Skill]: Right Sidebar Widget Panel ── */}
                <motion.aside
                    className='interview-sidebar'
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                >
                    {/* Report Position Title */}
                    <div className='report-title-widget'>
                        <p className='report-title-widget__label'>Target Position</p>
                        <p className='report-title-widget__value'>{report.title}</p>
                    </div>

                    <div className='sidebar-divider' />

                    {/* [UI-UX Pro Max Skill]: Match Score Widget */}
                    <div className='match-score-widget'>
                        <p className='match-score-widget__label'>Candidate Match Score</p>
                        {/* [Motion AI Skill]: Spring scale animation on the circular score ring */}
                        <motion.div
                            className={`match-score-widget__ring ${scoreColor}`}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.3 }}
                        >
                            <motion.span
                                className='match-score-widget__value'
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                            >
                                {report.matchScore}
                            </motion.span>
                            <span className='match-score-widget__pct'>%</span>
                        </motion.div>
                        <p className='match-score-widget__sub'>
                            {report.matchScore >= 80 ? 'Strong match for this role' :
                                report.matchScore >= 60 ? 'Good match with some gaps' :
                                    'Significant preparation needed'}
                        </p>
                    </div>

                    <div className='sidebar-divider' />

                    {/* [UI-UX Pro Max Skill]: Skill Gaps tags with severity badges */}
                    <div className='skill-gaps'>
                        <p className='skill-gaps__label'>Identified Skill Gaps</p>
                        <div className='skill-gaps__list'>
                            {report.skillGaps?.map((gap, i) => (
                                // [Motion AI Skill]: Stagger skill gap tag entrance
                                <motion.span
                                    key={i}
                                    className={`skill-tag skill-tag--${gap.severity}`}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.4 + (0.05 * i) }}
                                >
                                    {gap.skill}
                                </motion.span>
                            ))}
                        </div>
                    </div>

                </motion.aside>
            </div>
        </div>
    )
}

export default Interview