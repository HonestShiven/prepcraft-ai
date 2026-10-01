// ===========================================================================================
// USER.MODEL.JS — Mongoose schema and model for the "users" collection.
// This defines the shape of a user document in MongoDB. Every user has a username, email,
// and password (stored as a bcrypt hash, NOT the raw password).
// Mongoose enforces these rules at the application level before data reaches MongoDB.
// ===========================================================================================

// Import Mongoose to define schemas and create models.
const mongoose = require("mongoose")


// Define the user schema — this is a blueprint for what a user document looks like in MongoDB.
// Each key (username, email, password) maps to a field in the MongoDB document.
const userSchema = new mongoose.Schema({

    // The user's chosen display name.
    // unique: true — Mongoose creates a unique index in MongoDB, preventing duplicate usernames.
    //   The array syntax [ true, "message" ] provides a custom error message when validation fails.
    // required: true — This field must be provided when creating a new user. Without it,
    //   Mongoose will throw a validation error and refuse to save the document.
    username: {
        type: String,
        unique: [ true, "username already taken" ],
        required: true,
    },

    // The user's email address — used for login authentication.
    // unique: true — No two users can register with the same email.
    // required: true — Must be provided during registration.
    email: {
        type: String,
        unique: [ true, "Account already exists with this email address" ],
        required: true,
    },

    // The user's password — stored as a bcrypt hash (NOT the plain text password).
    // The hashing happens in auth.controller.js BEFORE this model's .create() is called.
    // required: true — Every user must have a password.
    password: {
        type: String,
        required: true
    }
})

// Create and compile the Mongoose model from the schema.
// mongoose.model("users", userSchema) does two things:
//   1. Creates a model class called "users" that can perform CRUD operations.
//   2. Maps to a MongoDB collection called "users" (Mongoose uses the first argument as
//      the collection name).
// The resulting 'userModel' gives us methods like: .create(), .findOne(), .findById(), etc.
const userModel = mongoose.model("users", userSchema)

// Export the model so controllers can import it to create, read, update, and delete users.
module.exports = userModel