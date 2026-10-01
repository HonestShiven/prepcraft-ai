// ===========================================================================================
// APP.JSX — The root React component that sets up the application structure.
// This component wraps the entire app with:
//   1. AuthProvider — React Context for authentication state (user, loading)
//   2. InterviewProvider — React Context for interview report state (reports, loading)
//   3. RouterProvider — React Router v7 for client-side navigation
//
// ARCHITECTURE: Providers are nested from outermost (Auth) to innermost (Router).
// This means the Router (and all pages) can access both Auth and Interview context.
// Auth wraps Interview because Interview pages need to know WHO the user is.
// ===========================================================================================

// Import RouterProvider — the React Router v7 component that provides routing to the app.
// It takes a 'router' object (created by createBrowserRouter) and renders the matching route.
import { RouterProvider } from "react-router"

// Import the router configuration — defines which URL paths render which page components.
import { router } from "./app.routes.jsx"

// Import the AuthProvider — wraps the app to provide authentication state via React Context.
// Any component can access the user, setUser, loading, setLoading via useContext(AuthContext).
import { AuthProvider } from "./features/auth/auth.context.jsx"

// Import the InterviewProvider — wraps the app to provide interview report state via React Context.
// Any component can access report, reports, loading via useContext(InterviewContext).
import { InterviewProvider } from "./features/interview/interview.context.jsx"

// The root App component — renders the provider hierarchy and router.
function App() {

  return (
    // AuthProvider is the outermost wrapper — authentication state is available everywhere.
    <AuthProvider>
      {/* InterviewProvider is nested inside AuthProvider — can access auth state if needed. */}
      <InterviewProvider>
        {/* RouterProvider renders the page component that matches the current URL. */}
        {/* The 'router' object defines all route → component mappings (see app.routes.jsx). */}
        <RouterProvider router={router} />
      </InterviewProvider>
    </AuthProvider>
  )
}

// Export App as the default export — imported by main.jsx for mounting.
export default App
