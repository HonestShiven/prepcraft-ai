// ===========================================================================================
// APP.ROUTES.JSX — Client-side route configuration using React Router v7.
// This file defines the mapping between URL paths and page components.
// It uses createBrowserRouter (the modern API) which supports data loading,
// error boundaries, and nested routes (though we use flat routes here).
//
// ROUTE TABLE:
//   /login              → Login page     (public)
//   /register           → Register page  (public)
//   /                   → Home page      (protected — requires auth)
//   /interview/:id      → Interview page (protected — requires auth)
// ===========================================================================================

// Import createBrowserRouter from React Router v7.
// createBrowserRouter uses the browser's History API (pushState/popState)
// for navigation without full page reloads. This is what makes it a "Single Page App" (SPA).
import { createBrowserRouter } from "react-router";

// Import page components.
import Login from "./features/auth/pages/Login";      // Public login page.
import Register from "./features/auth/pages/Register"; // Public registration page.

// Import the Protected wrapper component.
// Protected checks if the user is authenticated and redirects to /login if not.
import Protected from "./features/auth/components/Protected";

// Import the main app pages.
import Home from "./features/interview/pages/Home";        // Dashboard for generating reports.
import Interview from "./features/interview/pages/Interview"; // Report detail view.


// Create the router configuration — an array of route objects.
// Each object maps a 'path' (URL pattern) to an 'element' (React component to render).
export const router = createBrowserRouter([
    {
        // /login — Public route, no auth required.
        path: "/login",
        element: <Login />
    },
    {
        // /register — Public route, no auth required.
        path: "/register",
        element: <Register />
    },
    {
        // / (root) — Protected route.
        // <Protected> wraps <Home />, checking authentication before rendering.
        // If user is not logged in, Protected redirects to /login using <Navigate>.
        path: "/",
        element: <Protected><Home /></Protected>
    },
    {
        // /interview/:interviewId — Protected route with a URL parameter.
        // :interviewId is a dynamic segment — React Router extracts it as useParams().interviewId.
        // Example: /interview/abc123 → useParams() returns { interviewId: "abc123" }.
        path: "/interview/:interviewId",
        element: <Protected><Interview /></Protected>
    }
])