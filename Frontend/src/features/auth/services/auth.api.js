// ===========================================================================================
// AUTH.API.JS — Axios HTTP Client & Authentication API Endpoints.
//
// WHAT THIS FILE DOES:
//   1. Creates a pre-configured Axios instance (`api`) pointing to the Express backend.
//   2. Enables `withCredentials: true` so HTTP-only JWT cookies are sent with every cross-origin request.
//   3. Exports clean async API wrapper functions for:
//      - register: POST /api/auth/register (create new user account)
//      - login:    POST /api/auth/login    (authenticate and set JWT cookie)
//      - logout:   GET  /api/auth/logout   (blacklist token on backend and clear cookie)
//      - getMe:    GET  /api/auth/get-me   (verify existing session on mount)
// ===========================================================================================

// Import axios — a promise-based HTTP client for browser and Node.js.
import axios from "axios";

// ── Axios Instance Configuration ─────────────────────────────────────────────
// We create a shared Axios instance with default settings for all auth requests.
const api = axios.create({
    // baseURL: Target Express backend server address (running locally on port 3000).
    baseURL: "http://localhost:3000",

    // withCredentials: true is CRITICAL for cookie-based authentication!
    // By default, browsers do NOT send cookies on cross-origin requests (port 5173 → port 3000).
    // Setting this to true instructs the browser to include our 'token' cookie in request headers.
    withCredentials: true
});

// ── 1. Register User API ─────────────────────────────────────────────────────
// Sends user credentials to create a new account in MongoDB.
// Returns the response data containing { message, user: { id, username, email } }.
export async function register({ username, email, password }) {
    try {
        // Send POST request with JSON payload { username, email, password }.
        const response = await api.post('/api/auth/register', {
            username, email, password
        });

        // Return the parsed JSON response body from the backend.
        return response.data;
    } catch (err) {
        // Log errors to console (e.g., 400 validation error, 409 user already exists).
        console.error("API register error:", err);
        throw err;
    }
}

// ── 2. Login User API ────────────────────────────────────────────────────────
// Validates credentials on the backend. If valid, backend sets an HTTP-only JWT cookie.
// Returns { message, user: { id, username, email } }.
export async function login({ email, password }) {
    try {
        // Send POST request with credentials.
        const response = await api.post("/api/auth/login", {
            email, password
        });

        // Return backend response data.
        return response.data;
    } catch (err) {
        console.error("API login error:", err);
        throw err;
    }
}

// ── 3. Logout User API ───────────────────────────────────────────────────────
// Informs the backend to blacklist the current JWT token in MongoDB and clear the cookie.
export async function logout() {
    try {
        // Send GET request to logout route; browser automatically attaches the 'token' cookie.
        const response = await api.get("/api/auth/logout");

        return response.data;
    } catch (err) {
        console.error("API logout error:", err);
        throw err;
    }
}

// ── 4. Get Current Authenticated User (Session Verification) ─────────────────
// Called on app mount to check if the user has an active, valid JWT cookie session.
export async function getMe() {
    try {
        // Send GET request to /api/auth/get-me with attached cookie credentials.
        const response = await api.get("/api/auth/get-me");

        return response.data;
    } catch (err) {
        // If 401 Unauthorized (e.g. no cookie or expired token), rethrow or log.
        console.error("API getMe error:", err);
        throw err;
    }
}