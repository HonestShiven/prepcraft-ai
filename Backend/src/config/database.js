// ===========================================================================================
// DATABASE.JS — MongoDB connection configuration.
// This file exports a single async function that establishes a connection to MongoDB using
// Mongoose (an ODM — Object Data Modeling library for MongoDB and Node.js).
// Mongoose lets us define schemas, validate data, and query MongoDB using JavaScript objects
// instead of raw MongoDB query syntax.
// ===========================================================================================

// Import the Mongoose library.
// Mongoose provides: schema definitions, model creation, data validation, query building,
// and middleware hooks (pre/post save). It's the bridge between our Node.js code and MongoDB.
const mongoose = require("mongoose")



// Async function to connect to the MongoDB database.
// We use async/await because mongoose.connect() is an asynchronous operation — it takes
// time to establish a network connection to the MongoDB server.
async function connectToDB() {

    try {
        // mongoose.connect() establishes a connection to the MongoDB server.
        // process.env.MONGO_URI contains the connection string, which looks like:
        //   mongodb+srv://username:password@cluster.mongodb.net/dbname
        // This URI specifies: protocol, credentials, cluster address, and database name.
        // Mongoose will automatically create the database if it doesn't exist yet.
        await mongoose.connect(process.env.MONGO_URI)

        // If we reach this line, the connection was successful.
        console.log("Connected to Database")
    }
    catch (err) {
        // If the connection fails (wrong URI, network issue, auth failure), log the error.
        // Common causes: incorrect password, IP not whitelisted in MongoDB Atlas, network down.
        console.log(err)
    }
}

// Export the function so server.js can call it before starting the HTTP server.
// This ensures the database is connected before the app starts handling requests.
module.exports = connectToDB