// ===========================================================================================
// AUTH.MIDDLEWARE.JS — Authentication middleware for protecting private routes.
// This middleware runs BEFORE any controller on protected routes. Its job is to:
//   1. Extract the JWT token from the request cookie
//   2. Check if the token has been blacklisted (user logged out)
//   3. Verify the token's signature and decode the payload
//   4. Attach the decoded user data to req.user so controllers can access it
//
// HOW MIDDLEWARE WORKS: Middleware is a function that sits between the incoming request
// and the route handler (controller). It can modify the request, reject it, or pass it
// along to the next middleware/handler using next().
// ===========================================================================================

// Import jsonwebtoken library for verifying JWT tokens.
// jwt.verify() checks: (1) the token hasn't been tampered with (signature check),
// (2) the token hasn't expired (checks the 'exp' claim), and (3) decodes the payload.
const jwt = require("jsonwebtoken")

// Import the token blacklist model to check if a token has been invalidated.
const tokenBlacklistModel = require("../models/blacklist.model")



// The main auth middleware function.
// Parameters: req (request), res (response), next (function to call the next middleware/controller).
// If authentication fails at any point, we return a 401 response and DON'T call next().
// If authentication succeeds, we call next() to pass control to the route handler.
async function authUser(req, res, next) {

    // STEP 1: Extract the JWT token from the HTTP cookie.
    // The token was set as a cookie during login/register (res.cookie("token", token)).
    // req.cookies is populated by the cookie-parser middleware configured in app.js.
    const token = req.cookies.token

    // If no token exists in the cookie, the user is not logged in.
    // Return 401 Unauthorized immediately — don't proceed to the controller.
    if (!token) {
        return res.status(401).json({
            message: "Token not provided."
        })
    }

    // STEP 2: Check if this token has been blacklisted (user logged out).
    // When a user logs out, their token is added to the blacklist collection.
    // Even though the JWT might still be technically valid (not expired), we reject it
    // because the user explicitly logged out.
    const isTokenBlacklisted = await tokenBlacklistModel.findOne({
        token  // Shorthand for { token: token } — find a document where token matches.
    })

    // If the token was found in the blacklist, reject the request.
    if (isTokenBlacklisted) {
        return res.status(401).json({
            message: "token is invalid"
        })
    }

    try {
        // STEP 3: Verify the JWT token.
        // jwt.verify() does three things:
        //   1. Checks the signature using JWT_SECRET (ensures the token wasn't tampered with).
        //   2. Checks the expiration (tokens expire after 1 day, set during login).
        //   3. Decodes the payload and returns it: { id: "userId", username: "name", iat: ..., exp: ... }
        // If verification fails (invalid/expired token), it throws an error caught below.
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        // STEP 4: Attach the decoded user info to the request object.
        // req.user will now contain { id: "userId", username: "name" }.
        // All subsequent middleware and controllers can access req.user.id and req.user.username
        // to know which user is making the request.
        req.user = decoded

        // Call next() to pass control to the next middleware or the route controller.
        // Without this call, the request would hang and never reach the controller.
        next()

    } catch (err) {

        // If jwt.verify() throws (token is invalid or expired), return 401.
        return res.status(401).json({
            message: "Invalid token."
        })
    }

}


// Export the authUser function so route files can use it as middleware.
// Usage in routes: router.get("/protected-route", authMiddleware.authUser, controllerFunction)
module.exports = { authUser }