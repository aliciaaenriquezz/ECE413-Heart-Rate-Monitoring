var express = require('express');
var router = express.Router();
var User = require("../models/user");

// CRUD implementation

router.post("/create", function (req, res) {
    const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
    });
    newUser.save(function (err, user) {
        if (err) {
            res.status(400).send(err);
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

module.exports = router;
