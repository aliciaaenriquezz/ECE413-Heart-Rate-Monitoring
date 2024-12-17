// Referencing MongoDB_Activities_Source_Code

// Import the database connection from the '../db' file
const db = require("../db");

// Define the schema for the 'User' collection in MongoDB
const userSchema = new db.Schema({
    name: String, // User's name as a string
    email: String, // User's email as a string
    password: String, // User's password as a string (Note: Passwords should be hashed for security)
    lastAccess: { 
        type: Date, // Date type to track user's last access time
        default: Date.now // Defaults to the current date and time when a new user is created
    }
});

// Create a model for the 'User' collection using the defined schema
const User = db.model("User", userSchema);

// Export the 'User' model so it can be used in other parts of the application
module.exports = User;
