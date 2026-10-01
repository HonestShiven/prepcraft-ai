// ===========================================================================================
// SERVER.JS — The entry point of the entire backend application.
// This file is responsible for three things: loading environment variables, connecting to the
// database, and starting the HTTP server. Think of it as the "ignition key" for the app.
// ===========================================================================================

// Load all environment variables from the .env file into process.env.
// dotenv reads the .env file in the project root and makes variables like MONGO_URI,
// JWT_SECRET, and GOOGLE_GENAI_API_KEY available as process.env.VARIABLE_NAME.
// .config() must be called BEFORE any other code that uses process.env values.
require("dotenv").config()

// Import the Express app instance that has all routes and middleware already configured.
// We separate "app configuration" (app.js) from "server startup" (server.js) for cleaner
// code organization and easier testing — you can import app.js in tests without starting a server.
const app = require("./src/app")

// Import the database connection function. This function uses Mongoose to connect to MongoDB.
const connectToDB = require("./src/config/database")

// Call the async function to establish a connection to MongoDB.
// This runs BEFORE the server starts listening, ensuring the database is ready.
connectToDB()


// Start the Express HTTP server on port 3000.
// app.listen() tells Node.js to bind to port 3000 and start accepting incoming HTTP requests.
// The callback function runs once the server is successfully listening — confirming it's alive.
app.listen(3000, () => {
    console.log("Server is running on port 3000")
})