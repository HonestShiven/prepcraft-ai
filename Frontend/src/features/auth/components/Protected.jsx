// ===========================================================================================
// PROTECTED.JSX — Client-Side Authentication Route Guard.
//
// WHAT IS A ROUTE GUARD?
// A route guard (or protected route wrapper) prevents unauthenticated users from accessing
// private application pages (like / or /interview/:id).
// If a user is NOT logged in, they are redirected to /login.
// If the authentication check is still loading, it renders a loading fallback.
// If the user IS logged in, it renders the protected child components.
// ===========================================================================================

// Import the useAuth custom hook to access current user and loading state.
import { useAuth } from "../hooks/useAuth";

// Import Navigate component from react-router to perform programmatic client-side redirects.
import { Navigate } from "react-router";

// Import React.
import React from 'react';

// The Protected wrapper component receives child elements via the { children } prop.
const Protected = ({ children }) => {
    // Destructure loading and user from our custom useAuth hook.
    const { loading, user } = useAuth();

    // ── 1. Loading State ─────────────────────────────────────────────────────
    // While the initial auto-login check (GET /api/auth/get-me) is verifying cookies,
    // show a loading state so the page doesn't prematurely redirect to /login.
    if (loading) {
        return (
            <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#09090b", color: "#f4f4f5" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
                    <div style={{ width: "40px", height: "40px", border: "3px solid rgba(255,255,255,0.1)", borderTop: "3px solid #6366f1", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                    <p style={{ color: "#a1a1aa", fontSize: "0.9rem" }}>Verifying session...</p>
                </div>
            </main>
        );
    }

    // ── 2. Unauthenticated State ─────────────────────────────────────────────
    // If the session check is complete and no user object exists in state,
    // redirect the unauthenticated user to the /login page immediately.
    if (!user) {
        return <Navigate to={'/login'} replace />;
    }

    // ── 3. Authenticated State ───────────────────────────────────────────────
    // If the user is authenticated, render the requested child components (e.g. Home or Interview page).
    return children;
};

// Export the Protected component for route wrapping in app.routes.jsx.
export default Protected;