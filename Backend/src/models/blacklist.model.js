// ===========================================================================================
// BLACKLIST.MODEL.JS — Mongoose schema and model for the "blacklistTokens" collection.
// When a user logs out, their JWT token gets added to this "blacklist" collection.
// On every authenticated request, the auth middleware checks if the token is in this list.
// If it is, the request is rejected — even if the JWT hasn't expired yet.
// This solves the problem of JWT tokens being valid even after logout (since JWTs are
// stateless and can't be "revoked" without a server-side blacklist like this).
// ===========================================================================================

// Import Mongoose for schema definition and model creation.
const mongoose = require('mongoose')


// Define the schema for blacklisted tokens.
// Each document stores a single invalidated JWT token string.
const blacklistTokenSchema = new mongoose.Schema({

    // The JWT token string that has been invalidated (user logged out).
    // required: [ true, "message" ] — A token must be provided when adding to the blacklist.
    //   The custom error message helps with debugging if someone tries to blacklist without a token.
    token: {
        type: String,
        required: [ true, "token is required to be added in blacklist" ]
    }
}, {
    // Enable timestamps — Mongoose will automatically add createdAt and updatedAt fields.
    // createdAt tells us WHEN the user logged out / when the token was blacklisted.
    // This is useful for cleanup: you could periodically delete old blacklisted tokens
    // whose original JWT would have expired anyway (since JWTs have a 1-day expiry).
    timestamps: true
})

// Create the Mongoose model. The collection in MongoDB will be named "blacklistTokens".
// (Mongoose does NOT pluralize here because we explicitly passed "blacklistTokens".)
const tokenBlacklistModel = mongoose.model("blacklistTokens", blacklistTokenSchema)


// Export the model for use in:
//   - auth.controller.js (to ADD tokens on logout)
//   - auth.middleware.js (to CHECK if a token is blacklisted on every request)
module.exports = tokenBlacklistModel