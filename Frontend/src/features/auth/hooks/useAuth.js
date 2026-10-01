// ===========================================================================================
// USEAUTH.JS — Custom React Hook for Authentication Management.
//
// WHAT IS A CUSTOM HOOK?
// In React, a custom hook is a JavaScript function whose name starts with "use" that can
// call other hooks (useState, useEffect, useContext). It packages reusable stateful logic
// so multiple components can share authentication actions without duplicating code.
//
// WHAT THIS HOOK DOES:
//   1. Subscribes to AuthContext to access the current `user` and `loading` states.
//   2. Exposes authentication actions: `handleLogin`, `handleRegister`, `handleLogout`.
//   3. Runs a mount-time effect (useEffect) that calls the backend /api/auth/get-me endpoint
//      to automatically verify existing cookie sessions on page reload (silent auth).
// ===========================================================================================

// Import useContext and useEffect from React.
// useContext reads values from AuthContext.
// useEffect runs side-effects (fetching current user profile) when the component mounts.
import { useContext, useEffect } from "react";

// Import AuthContext to access shared user and loading states across the application.
import { AuthContext } from "../auth.context";

// Import API communication functions that make HTTP requests to the Express backend.
import { login, register, logout, getMe } from "../services/auth.api";

// ── Custom Hook Definition ───────────────────────────────────────────────────
export const useAuth = () => {

    // Consume the AuthContext object provided by <AuthProvider> in App.jsx.
    const context = useContext(AuthContext);

    // Destructure the state variables and setter functions from the auth context value.
    const { user, setUser, loading, setLoading } = context;

    // ── 1. Handle User Login ─────────────────────────────────────────────────
    // Receives { email, password } from the Login form.
    // Sets loading to true, calls the backend login API, updates the global user state,
    // and resets loading to false.
    const handleLogin = async ({ email, password }) => {
        // Indicate to UI that an auth request is in flight (shows spinner / disables button).
        setLoading(true);
        try {
            // Send POST /api/auth/login with email and password credentials.
            // Backend validates credentials and sets an HTTP-only JWT cookie.
            const data = await login({ email, password });

            // Store the authenticated user object ({ id, username, email }) in global context.
            setUser(data.user);
        } catch (err) {
            // Silently catch errors; in a production app, this would set an error message state.
            console.error("Login failed:", err);
        } finally {
            // Reset loading state whether the request succeeded or failed.
            setLoading(false);
        }
    };

    // ── 2. Handle User Registration ──────────────────────────────────────────
    // Receives { username, email, password } from the Register form.
    // Calls the registration API, automatically logs the user in upon success, and updates user state.
    const handleRegister = async ({ username, email, password }) => {
        // Set loading state to true for UI feedback.
        setLoading(true);
        try {
            // Send POST /api/auth/register with user registration fields.
            // Backend creates the user in MongoDB, hashes password, and sets JWT cookie.
            const data = await register({ username, email, password });

            // Set the registered user in global context.
            setUser(data.user);
        } catch (err) {
            // Log any registration errors.
            console.error("Registration failed:", err);
        } finally {
            // Reset loading state when the request completes.
            setLoading(false);
        }
    };

    // ── 3. Handle User Logout ────────────────────────────────────────────────
    // Calls the backend logout endpoint which blacklists the JWT cookie,
    // then clears the user object in frontend state to redirect to /login.
    const handleLogout = async () => {
        // Set loading to true while logging out.
        setLoading(true);
        try {
            // Call GET /api/auth/logout to invalidate the JWT token on the server.
            await logout();

            // Clear the user from global context — this immediately triggers
            // Protected routes to redirect the user to /login.
            setUser(null);
        } catch (err) {
            console.error("Logout failed:", err);
        } finally {
            // Reset loading state.
            setLoading(false);
        }
    };

    // ── 4. Auto-Login on Mount (Session Persistence) ─────────────────────────
    // This effect runs once when the hook is first mounted (empty dependency array []).
    // It verifies whether the user already has a valid HTTP-only JWT cookie from a prior session.
    useEffect(() => {

        // Async helper function to fetch current user data from /api/auth/get-me.
        const getAndSetUser = async () => {
            try {
                // Backend checks the incoming cookie against JWT verification + blacklist.
                // If valid, returns the user record.
                const data = await getMe();

                // If token is valid, restore the user session in React state.
                setUser(data.user);
            } catch (err) {
                // If the user has no cookie or the token expired, getMe() fails.
                // We keep user as null, so Protected routes will prompt for login.
            } finally {
                // Whether successful or not, initial session check is complete; disable loading.
                setLoading(false);
            }
        };

        // Invoke the session verification helper.
        getAndSetUser();

    }, []); // Empty dependency array means this runs only once on mount.

    // Return the state and action methods for consumption by components (Login, Register, Home, Protected).
    return { user, loading, handleRegister, handleLogin, handleLogout };
};