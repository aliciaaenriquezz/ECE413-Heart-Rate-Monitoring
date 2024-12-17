// Importing necessary modules
var express = require('express');
var router = express.Router();
var User = require("../models/user");
const jwt = require("jwt-simple");
const bcrypt = require("bcryptjs");
const fs = require('fs');

// Reading the secret key from a file for JWT encoding/decoding
const secret = fs.readFileSync(__dirname + '/../keys/jwtkey').toString();

// CRUD implementation

// Route to create a new user
router.post("/create", function (req, res) {
    // Hashing the user's password using bcrypt
    const passwordHash = bcrypt.hashSync(req.body.password, 10);
    
    // Creating a new user object
    const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: passwordHash
    });

    // Saving the new user to the database
    newUser.save(function (err, user) {
        if (err) {
            // Sending error response if something goes wrong
            res.status(400).send({success: false, err: err});
        }
        else {
            // Sending success response with a message
            let msgStr = `User (${req.body.name}) info has been saved.`;
            res.status(201).json({ message: msgStr });
            console.log(msgStr);
        }
    });
});

// Route to read all users from the database
router.get('/readAll', function (req, res) {
    User.find(function (err, docs) {
        if (err) {
            // Sending error response if something goes wrong
            let msgStr = `Something wrong....`;
            res.status(201).json({ message: msgStr });
        }
        else {
            // Sending back all user documents
            res.status(201).json(docs);
        }
    });
});

// Route to get the count of all users
router.get('/count', function (req, res) {
    User.estimatedDocumentCount(function (err, count) {
        if (err) {
            // Sending error response if something goes wrong
            let msgStr = `Something wrong....`;
            res.status(201).json({ message: msgStr });
        }
        else {
            // Sending back the count of users
            res.status(201).json({ count: count });
        }
    });
});

// Route to update an existing user
router.post("/update", function (req, res) {
    // Hashing the updated password
    const passwordHash = bcrypt.hashSync(req.body.password, 10);

    // Finding and updating the user based on email
    User.findOneAndUpdate({ email: req.body.email }, { name: req.body.name, password: passwordHash }, function (err, doc) {
        if (err) {
            // Sending error response if something goes wrong
            let msgStr = `Something wrong....`;
            res.status(201).json({ message: msgStr, err: err });
        }
        else {
            // Checking if the user exists
            let msgStr;
            if (doc == null) {
                msgStr = `User (name: ${req.body.name}) info does not exist in DB.`;
            }
            else {
                msgStr = `User (name: ${req.body.name}) info has been updated.`;
            }
            res.status(201).json({ message: msgStr });
        }
    })
});

// Route to delete a user based on email
router.post("/delete", function (req, res) {
    User.deleteOne({ email: req.body.email }, function (err, result) {
        if (err) {
            // Sending error response if something goes wrong
            let msgStr = `Something wrong....`;
            res.status(201).json({ message: msgStr, err: err });
        }
        else {
            // Sending back the result of the delete operation
            let msgStr = result;
            res.status(201).json({ message: msgStr });
        }
    })
});

// Route to search for a user based on email
router.post("/search", function (req, res) {
    User.find({ email: req.body.email }, function (err, docs) {
        if (err) {
            // Sending error response if something goes wrong
            let msgStr = `Something wrong....`;
            res.status(201).json({ message: msgStr });
        }
        else {
            // Sending back the found users
            res.status(201).json(docs);
        }
    });
});

// Route to read a specific user's information by email
router.post("/read", function (req, res) {
    User.find({ email: req.body.email }, function (err, docs) {
        if (err) {
            // Sending error response if something goes wrong
            let msgStr = `Something wrong....`;
            res.status(201).json({ message: msgStr });
        }
        else {
            // Sending back the user's information
            res.status(201).json(docs);
        }
    });
});

// Route to log in a user by validating credentials
router.post("/logIn", function (req, res) {
    console.log("POST /logIn received");

    // Checking if both email and password are provided
    if (!req.body.email || !req.body.password) {
        res.status(401).json({ error: "Missing email and/or password" });
        return;
    }

    // Getting user from the database based on the email
    User.findOne({ email: req.body.email }, function (err, user) {
        if (err) {
            res.status(400).send(err);
        }
        else if (!user) {
            // User not found
            res.status(401).json({ error: "Login failure!!" });
        }
        else {
            // Comparing the provided password with the stored hashed password
            if (bcrypt.compareSync(req.body.password, user.password)) {
                // Encoding a JWT token if the login is successful
                const token = jwt.encode({ email: user.email }, secret);
                
                // Updating user's last access time
                user.lastAccess = new Date();
                user.save((err, user) => {
                    console.log("User's LastAccess has been update.");
                });

                // Sending back the JWT token and a success message
                res.status(201).json({ success: true, token: token, msg: "Login success" });
            }
            else {
                // Sending error message if password does not match
                res.status(401).json({ success: false, msg: "Email or password invalid." });
            }
        }
    });
});

// Route to check the status of a user using the JWT token
router.get("/status", function (req, res) {
    // Checking if the X-Auth header is set
    if (!req.headers["x-auth"]) {
        return res.status(401).json({ success: false, msg: "Missing X-Auth header" });
    }

    // Decoding the token from the X-Auth header
    const token = req.headers["x-auth"];
    try {
        const decoded = jwt.decode(token, secret);
        // Sending back the user's name and email
        User.find({ email: decoded.email }, "name email", function (err, users) {
            if (err) {
                res.status(400).json({ success: false, message: "Error contacting DB. Please contact support." });
            }
            else {
                res.status(200).json(users);
            }
        });
    }
    catch (ex) {
        // Sending error response if the token is invalid
        res.status(401).json({ success: false, message: "Invalid JWT" });
    }
});

// Exporting the router to use it in the main app
module.exports = router;
