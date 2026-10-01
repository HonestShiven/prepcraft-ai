// ===========================================================================================
// AUTH.CONTROLLER.JS — Handles all authentication-related business logic.
// Controllers receive the parsed request (after middleware), execute business logic,
// interact with the database via models, and send back a response.
//
// This file contains 4 controllers:
//   1. registerUserController — Create a new user account
//   2. loginUserController    — Authenticate and log in an existing user
//   3. logoutUserController   — Log out by blacklisting the JWT token
//   4. getMeController        — Get the currently logged-in user's details
// ===========================================================================================

// Import the User model — used to create, find, and query user documents in MongoDB.
const userModel = require("../models/user.model")

// Import bcryptjs — a library for hashing passwords.
// Hashing converts "password123" into an irreversible string like "$2a$10$X8k...".
// Even if the database is breached, attackers can't recover the original passwords.
// bcrypt.compare() is used during login to check if the entered password matches the hash.
const bcrypt = require("bcryptjs")

// Import jsonwebtoken — used to create (sign) JWT tokens.
// A JWT contains a payload (user ID, username) encoded with a secret key.
// The frontend stores this token in a cookie and sends it with every request to prove identity.
const jwt = require("jsonwebtoken")

// Import the token blacklist model — used during logout to invalidate tokens.
const tokenBlacklistModel = require("../models/blacklist.model")

/**
 * @name registerUserController
 * @description register a new user, expects username, email and password in the request body
 * @access Public
 */
async function registerUserController(req, res) {

    // Destructure the three required fields from the request body.
    // req.body is populated by express.json() middleware (configured in app.js).
    const { username, email, password } = req.body

    // Validation: ensure all three fields are provided.
    // If any field is missing (null, undefined, or empty string), return a 400 Bad Request.
    if (!username || !email || !password) {
        return res.status(400).json({
            message: "Please provide username, email and password"
        })
    }

    // Check if a user already exists with the same username OR email.
    // $or is a MongoDB operator that matches documents where ANY of the conditions is true.
    // This prevents duplicate accounts — a user can't register with an existing email or username.
    const isUserAlreadyExists = await userModel.findOne({
        $or: [ { username }, { email } ]
    })

    // If a matching user was found, reject the registration.
    if (isUserAlreadyExists) {
        return res.status(400).json({
            message: "Account already exists with this email address or username"
        })
    }

    // Hash the password using bcrypt with a salt round of 10.
    // Salt rounds determine how many times the hashing algorithm runs (2^10 = 1024 iterations).
    // Higher rounds = more secure but slower. 10 is the industry standard balance.
    // The resulting hash looks like: "$2a$10$KfRJxP3Zq..." (60 characters).
    const hash = await bcrypt.hash(password, 10)

    // Create a new user document in MongoDB.
    // We store the hashed password, NOT the original plain text password.
    // userModel.create() is shorthand for new userModel({...}).save().
    const user = await userModel.create({
        username,
        email,
        password: hash  // Store the bcrypt hash, never the raw password.
    })

    // Generate a JWT (JSON Web Token) for the newly registered user.
    // Payload: { id: user._id, username: user.username } — this data is encoded in the token.
    // Secret: process.env.JWT_SECRET — used to sign the token (proves it came from our server).
    // Options: { expiresIn: "1d" } — token automatically expires after 1 day.
    const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    )

    // Set the JWT as an HTTP cookie in the response.
    // The browser will automatically include this cookie in all subsequent requests to our API.
    // This is more secure than storing tokens in localStorage because cookies can be HttpOnly.
    res.cookie("token", token)


    // Send a success response with the user's public info (NOT the password or token).
    // Status 201 = "Created" — a new resource was successfully created.
    res.status(201).json({
        message: "User registered successfully",
        user: {
            id: user._id,       // MongoDB's auto-generated unique ID.
            username: user.username,
            email: user.email
            // NOTE: We deliberately exclude the password hash from the response.
        }
    })

}


/**
 * @name loginUserController
 * @description login a user, expects email and password in the request body
 * @access Public
 */
async function loginUserController(req, res) {

    // Extract email and password from the request body.
    const { email, password } = req.body

    // Find a user in the database by their email.
    // If no user exists with this email, 'user' will be null.
    const user = await userModel.findOne({ email })

    // If no user was found, return a generic "Invalid email or password" error.
    // SECURITY: We don't say "email not found" because that would let attackers
    // enumerate which emails are registered in our system.
    if (!user) {
        return res.status(400).json({
            message: "Invalid email or password"
        })
    }

    // Compare the entered password with the stored bcrypt hash.
    // bcrypt.compare() hashes the entered password with the same salt used during registration
    // and checks if the result matches the stored hash. Returns true or false.
    const isPasswordValid = await bcrypt.compare(password, user.password)

    // If the password doesn't match, return the same generic error.
    // SECURITY: Same message as "email not found" — prevents attackers from knowing
    // that the email exists but the password is wrong.
    if (!isPasswordValid) {
        return res.status(400).json({
            message: "Invalid email or password"
        })
    }

    // Password is correct — generate a new JWT for this session.
    const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    )

    // Set the JWT as a cookie so the browser sends it with future requests.
    res.cookie("token", token)

    // Return success with the user's public info.
    res.status(200).json({
        message: "User loggedIn successfully.",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
}


/**
 * @name logoutUserController
 * @description clear token from user cookie and add the token in blacklist
 * @access public
 */
async function logoutUserController(req, res) {

    // Read the current JWT from the cookie.
    const token = req.cookies.token

    // If a token exists, add it to the blacklist collection.
    // Next time someone tries to use this token, auth.middleware.js will reject it.
    // This is necessary because JWTs are stateless — they can't be "revoked" without
    // maintaining a server-side blacklist.
    if (token) {
        await tokenBlacklistModel.create({ token })
    }

    // Clear the "token" cookie from the browser.
    // This tells the browser to delete the cookie, so it won't be sent in future requests.
    res.clearCookie("token")

    // Return a success response confirming logout.
    res.status(200).json({
        message: "User logged out successfully"
    })
}

/**
 * @name getMeController
 * @description get the current logged in user details.
 * @access private
 */
async function getMeController(req, res) {

    // req.user was set by auth.middleware.js after verifying the JWT.
    // req.user.id contains the MongoDB ObjectId of the logged-in user.
    // We query the database to get the full, fresh user document.
    const user = await userModel.findById(req.user.id)



    // Return the user's public details.
    // The frontend calls this on page load (via useAuth hook) to check if the user
    // is still logged in and to populate the user state.
    res.status(200).json({
        message: "User details fetched successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })

}



// Export all four controller functions so auth.routes.js can map them to routes.
module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController
}