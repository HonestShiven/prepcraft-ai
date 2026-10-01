// ===========================================================================================
// AUTH.CONTEXT.JSX — React Context provider for authentication state.
//
// WHAT IS CONTEXT? React Context is a way to share state across the entire component tree
// without passing props manually at every level ("prop drilling"). You:
//   1. Create a context with createContext()
//   2. Wrap your app with a Provider component that holds the state
//   3. Access the state in any child component with useContext()
//
// This context stores:
//   - user: the currently logged-in user object (or null if not logged in)
//   - loading: whether an auth operation is in progress
//   - setUser/setLoading: setter functions to update the state
// ===========================================================================================

// Import createContext (to create the context) and useState (to manage state).
import { createContext, useState } from "react";


// Create the AuthContext.
// This creates a context object that components can subscribe to.
// The default value (undefined) is used when a component accesses this context
// without being wrapped in a Provider — which we prevent by wrapping the entire app.
export const AuthContext = createContext()


// AuthProvider — the wrapper component that provides auth state to all children.
// It receives { children } as a prop — this is whatever components are nested inside it.
// In App.jsx, everything inside <AuthProvider>...</AuthProvider> becomes 'children'.
export const AuthProvider = ({ children }) => { 

    // useState hook to store the current user object.
    // Initially null — means no user is logged in yet.
    // After successful login/register or getMe check, this gets set to { id, username, email }.
    const [user, setUser] = useState(null)

    // useState hook to track loading state.
    // Initially true — because on page load, we need to check if the user has a valid session
    // (via the getMe API call in useAuth hook). While checking, we show a loading screen.
    const [loading, setLoading] = useState(true)

    

    // Render the Provider component, passing the state values and setters to all children.
    // Any component that calls useContext(AuthContext) will receive this value object.
    // When user or loading changes, all components subscribed to this context will re-render.
    return (
        <AuthContext.Provider value={{user, setUser, loading, setLoading}} >
            {children}
        </AuthContext.Provider>
    )

    
}