var express = require('express');
var router = express.Router();
var User = require("../models/user");
const jwt = require("jwt-simple");
const bcrypt = require("bcryptjs");
const fs = require('fs');


const secret = fs.readFileSync(__dirname + '/../keys/jwtkey').toString();

// CRUD implementation

router.post("/create", function (req, res) {
    const passwordHash = bcrypt.hashSync(req.body.password, 10);
    
    const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: passwordHash
    });
    newUser.save(function (err, user) {
        if (err) {
            res.status(400).send({success: false, err: err});
        }
        else {
            let msgStr = `User (${req.body.name}) info has been saved.`;
            res.status(201).json({ message: msgStr });
            console.log(msgStr);
        }
    });
});

router.get('/readAll', function (req, res) {
    User.find(function (err, docs) {
        if (err) {
            let msgStr = `Something wrong....`;
            res.status(201).json({ message: msgStr });
        }
        else {
            res.status(201).json(docs);
        }
    });
});

router.get('/count', function (req, res) {
    User.estimatedDocumentCount(function (err, count) {
        if (err) {
            let msgStr = `Something wrong....`;
            res.status(201).json({ message: msgStr });
        }
        else {
            res.status(201).json({ count: count });
        }
    });
});

router.post("/update", function (req, res) {
    User.findOneAndUpdate({ email: req.body.email }, req.body, function (err, doc) {
        if (err) {
            let msgStr = `Something wrong....`;
            res.status(201).json({ message: msgStr, err: err });
        }
        else {
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

router.post("/delete", function (req, res) {
    User.deleteOne({ email: req.body.email }, function (err, result) {
        if (err) {
            let msgStr = `Something wrong....`;
            res.status(201).json({ message: msgStr, err: err });
        }
        else {
            let msgStr = result;
            res.status(201).json({ message: msgStr });
        }
    })
});

router.post("/search", function (req, res) {
    User.find({email: req.body.email }, function (err, docs) {
        if (err) {
            let msgStr = `Something wrong....`;
            res.status(201).json({ message: msgStr });
        }
        else {
            res.status(201).json(docs);
        }
    });
});

router.post("/read", function (req, res) {
    User.find({ email: req.body.email }, function (err, docs) {
        if (err) {
            let msgStr = `Something wrong....`;
            res.status(201).json({ message: msgStr });
        }
        else {
            res.status(201).json(docs);
        }
    });
});

router.post("/logIn", function (req, res) {

    if (!req.body.email || !req.body.password) {
        res.status(401).json({ error: "Missing email and/or password" });
        return;
    }
    // Get user from the database
    User.findOne({ email: req.body.email }, function (err, user) {
        if (err) {
            res.status(400).send(err);
        }
        else if (!user) {
            // Username not in the database
            res.status(401).json({ error: "Login failure!!" });
        }
        else {
            if (bcrypt.compareSync(req.body.password, user.password)) {
                const token = jwt.encode({ email: user.email }, secret);
                //update user's last access time
                user.lastAccess = new Date();
                user.save((err, user) => {
                    console.log("User's LastAccess has been update.");
                });
                // Send back a token that contains the user's username
                res.status(201).json({ success: true, token: token, msg: "Login success" });
            }
            else {
                res.status(401).json({ success: false, msg: "Email or password invalid." });
            }
        }
    });
    
 });


module.exports = router;
