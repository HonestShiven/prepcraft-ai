// ===========================================================================================
// APP.JS — The Express application configuration file.
// This file creates the Express app instance, registers all middleware (JSON parsing,
// cookies, CORS), and mounts all route handlers. It's the "central hub" where everything
// plugs in. We export the configured app so server.js can start it.
// ===========================================================================================

// Import the Express framework — the core library for building HTTP APIs in Node.js.
// Express provides methods like app.use(), app.get(), app.post() etc. to handle requests.
const express = require("express")

// Import cookie-parser middleware — it reads cookies from incoming HTTP request headers
// and makes them available as req.cookies object. We need this because our auth system
// stores JWT tokens in HTTP cookies (not localStorage) for better security.
const cookieParser = require("cookie-parser")

// Import CORS (Cross-Origin Resource Sharing) middleware.
// By default, browsers block requests from one origin (e.g., localhost:5173) to another
// origin (e.g., localhost:3000). CORS middleware tells the browser "yes, allow this."
const cors = require("cors")

// Create a new Express application instance.
// This 'app' object is what we configure with middleware, routes, and then start listening on.
const app = express()

// Register the JSON body parser middleware.
// When a client sends a POST/PUT request with JSON data in the body (Content-Type: application/json),
// this middleware automatically parses the raw JSON string into a JavaScript object and puts it
// in req.body. Without this, req.body would be undefined for JSON requests.
app.use(express.json())

// Register the cookie-parser middleware.
// This parses the Cookie header from incoming requests and populates req.cookies as a
// key-value object. For example, if the browser sends Cookie: token=abc123, then
// req.cookies.token will be "abc123". Our auth middleware uses this to read the JWT.
app.use(cookieParser())

// Register CORS middleware with specific configuration.
// origin: "http://localhost:5173" — Only allow requests from the Vite dev server (frontend).
//   This prevents random websites from making API calls to our backend.
// credentials: true — Allow cookies to be sent with cross-origin requests.
//   Without this, the browser won't include our auth cookie in requests to localhost:3000.
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))

/* require all the routes here */
// Import the auth router — handles /api/auth/register, /api/auth/login, /api/auth/logout, /api/auth/get-me
const authRouter = require("./routes/auth.routes")

// Import the interview router — handles /api/interview/ (CRUD for interview reports + resume PDF)
const interviewRouter = require("./routes/interview.routes")


/* using all the routes here */
// Mount the auth router at the /api/auth path prefix.
// Any request to /api/auth/* will be forwarded to the authRouter for handling.
// Example: POST /api/auth/register → authRouter handles it
app.use("/api/auth", authRouter)

// Mount the interview router at the /api/interview path prefix.
// Any request to /api/interview/* will be forwarded to the interviewRouter.
// Example: POST /api/interview/ → interviewRouter handles it
app.use("/api/interview", interviewRouter)



// Export the configured Express app so server.js can import it and call app.listen().
// This separation allows us to test the app without actually starting the HTTP server.
module.exports = app