// ===========================================================================================
// AUTH.ROUTES.JS — Defines all authentication-related API endpoints.
// Routes map HTTP methods + URL paths to specific controller functions.
// Think of routes as a "menu" — they tell Express: "when someone hits this URL with this
// HTTP method, run this function."
//
// Route table:
//   POST /api/auth/register → registerUserController (create new account)
//   POST /api/auth/login    → loginUserController    (authenticate user)
//   GET  /api/auth/logout   → logoutUserController   (invalidate session)
//   GET  /api/auth/get-me   → getMeController        (get current user info)
// ===========================================================================================

// Import Router from Express.
// Router() creates a modular, mountable route handler (a "mini-app").
// We define routes on this router, then mount it at "/api/auth" in app.js.
const { Router } = require('express')

// Import all auth controller functions that handle the business logic.
const authController = require("../controllers/auth.controller")

// Import the auth middleware — used to protect private routes.
// When placed before a controller in the route chain, it verifies the JWT
// and populates req.user before the controller runs.
const authMiddleware = require("../middlewares/auth.middleware")

// Create a new Router instance for auth routes.
const authRouter = Router()

/**
 * @route POST /api/auth/register
 * @description Register a new user
 * @access Public
 */
// POST = creating a new resource (a new user account).
// No middleware needed — anyone (even unauthenticated users) can register.
authRouter.post("/register", authController.registerUserController)


/**
 * @route POST /api/auth/login
 * @description login user with email and password
 * @access Public
 */
// POST = submitting credentials for authentication.
// No middleware needed — login is a public endpoint.
authRouter.post("/login", authController.loginUserController)


/**
 * @route GET /api/auth/logout
 * @description clear token from user cookie and add the token in blacklist
 * @access public
 */
// GET = simple action with no request body needed.
// No auth middleware — even if the token is invalid, we still want to clear the cookie.
authRouter.get("/logout", authController.logoutUserController)


/**
 * @route GET /api/auth/get-me
 * @description get the current logged in user details
 * @access private
 */
// This route is PROTECTED — notice authMiddleware.authUser is placed BEFORE the controller.
// Express processes middleware left to right:
//   1. authMiddleware.authUser runs first → verifies JWT, sets req.user
//   2. If auth succeeds, getMeController runs → returns user data
//   3. If auth fails, authMiddleware returns 401 and getMeController never runs
authRouter.get("/get-me", authMiddleware.authUser, authController.getMeController)


// Export the router so app.js can mount it at "/api/auth".
module.exports = authRouter