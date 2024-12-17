// Importing the express module
var express = require('express');

// Creating a new router instance
var router = express.Router();

/* GET home page route handler */
router.get('/', function(req, res, next) {
  // Rendering the 'index' view with a 'title' variable to be used in the template
  res.render('index', { title: 'Express' });
});

// Exporting the router so it can be used in other parts of the application
module.exports = router;
