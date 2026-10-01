/**
 * ===========================================================================================
 * LOGIN.JSX — User Authentication (Login) Page
 * ===========================================================================================
 * 
 * 🎨 SKILLS USED IN THIS FILE:
 * 
 * 1. [UI-UX Pro Max Skill]:
 *    - Glassmorphic card container with dark obsidian theme (auth.form.scss)
 *    - Minimalist brand identity icon badge with Lucide Sparkles
 *    - Floating labels, high-contrast text hierarchy (Plus Jakarta Sans + Inter)
 *    - Subdued sapphire/indigo focus rings on inputs and primary CTA button
 * 
 * 2. [Motion AI Skill] (from 'motion/react'):
 *    - Page entrance fade-in (<motion.main>)
 *    - Form container spring entrance (<motion.div> with stiffness: 300, damping: 30)
 *    - Staggered horizontal slide-in for Email and Password input groups
 *    - Tactile button press physics: whileHover={{ scale: 1.02 }}, whileTap={{ scale: 0.98 }}
 * 
 * NOTE: For backend logic (useAuth hook, cookie session, API calls), see hooks/useAuth.js.
 * ===========================================================================================
 */
import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { motion } from 'motion/react' // [Motion AI Skill]: Physics-based animation engine
import { Sparkles } from 'lucide-react' // [UI-UX Pro Max Skill]: Minimalist SVG icon
import "../auth.form.scss" // [UI-UX Pro Max Skill]: Form styling and glassmorphism tokens
import { useAuth } from '../hooks/useAuth'

const Login = () => {

    // Get auth state and login handler from custom useAuth hook (see hooks/useAuth.js for details)
    const { loading, handleLogin } = useAuth()

    // Programmatic routing hook from react-router
    const navigate = useNavigate()

    // Controlled inputs for email and password
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    // Form submission handler — calls the auth hook's login function with credentials
    const handleSubmit = async (e) => {
        e.preventDefault()                      // Prevent default browser page reload
        await handleLogin({ email, password })  // Call Express API → sets HTTP-only cookie
        navigate('/')                            // Redirect to Home workbench on success
    }

    // Loading screen while initial session check (GET /api/auth/get-me) resolves
    if (loading) {
        return (<main className='loading-screen'><h1>Loading.......</h1></main>)
    }

    return (
        // [Motion AI Skill]: Smooth fade-in of the page on mount
        <motion.main
            className="auth-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            {/* [Motion AI Skill]: Spring-based card entrance with scale and y-axis translation */}
            {/* [UI-UX Pro Max Skill]: .form-container provides the elevated dark card surface */}
            <motion.div
                className="form-container"
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.1 }}
            >
                {/* [UI-UX Pro Max Skill]: Minimalist brand mark with rounded icon container */}
                <div className="auth-brand">
                    <div className="brand-icon">
                        <Sparkles size={20} />
                    </div>
                    <span className="brand-name">Prepcraft AI</span>
                </div>

                <h1>Welcome Back</h1>
                <p className="auth-subtitle">Sign in to access your interview plans</p>

                <form onSubmit={handleSubmit}>
                    {/* [Motion AI Skill]: Staggered entrance for Email input (delay: 0.2s) */}
                    {/* [UI-UX Pro Max Skill]: High-contrast dark input with custom focus ring */}
                    <motion.div
                        className="input-group"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <label htmlFor="email">Email</label>
                        <input
                            onChange={(e) => { setEmail(e.target.value) }}
                            type="email" id="email" name='email' placeholder='Enter email address' />
                    </motion.div>

                    {/* [Motion AI Skill]: Staggered entrance for Password input (delay: 0.3s) */}
                    {/* [UI-UX Pro Max Skill]: High-contrast dark input with custom focus ring */}
                    <motion.div
                        className="input-group"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <label htmlFor="password">Password</label>
                        <input
                            onChange={(e) => { setPassword(e.target.value) }}
                            type="password" id="password" name='password' placeholder='Enter password' />
                    </motion.div>

                    {/* [Motion AI Skill]: whileHover (scale: 1.02) and whileTap (scale: 0.98) micro-interactions */}
                    {/* [UI-UX Pro Max Skill]: Sapphire blue gradient button with subtle bevel and shadow */}
                    <motion.button
                        className='auth-button'
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        Sign In
                    </motion.button>
                </form>

                <p>Don't have an account? <Link to={"/register"}>Create one</Link></p>
            </motion.div>
        </motion.main>
    )
}

export default Login