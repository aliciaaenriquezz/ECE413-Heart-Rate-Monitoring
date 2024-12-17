// Importing mongoose to interact with MongoDB
const mongoose = require("mongoose");

// Setting strict query mode to true, which ensures that queries will not include fields that are not defined in the schema
mongoose.set('strictQuery', true);

// Connecting to MongoDB using Mongoose. 
// The connection string points to the MongoDB Atlas cluster. Replace this with your actual MongoDB URI.
mongoose.connect("mongodb+srv://aenriquez45:HBq6xD4jFLRWGDVZ@heartratemonitor.8dia7.mongodb.net/", {
    useNewUrlParser: true,    // Ensures the new URL parser is used to avoid deprecation warnings
    useUnifiedTopology: true // Enables the new connection management engine for more stable and efficient connections
})
.then(() => {
    console.log("Connected to MongoDB successfully.");
})
.catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
});

// Exporting mongoose instance so it can be used in other parts of the application
module.exports = mongoose;
