// Importing required modules
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const bodyParser = require('body-parser');     // Parses JSON in body for incoming requests

// Importing the User model for MongoDB interaction
const User = require("./models/user");

// Importing routers for different routes
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

// Initializing Express app
var app = express();

// Setting up view engine (using Jade for templating)
app.set('views', path.join(__dirname, 'views'));  // Path for views directory
app.set('view engine', 'jade');  // Setting Jade as the view engine

// Middleware for enabling cross-origin resource sharing (CORS)
app.use(function (req, res, next) {
  // Allowing access from all origins
  res.setHeader('Access-Control-Allow-Origin', '*');
  // Defining allowed request methods
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  // Allowing specific headers
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  // Enabling cookies in the requests if needed
  res.setHeader('Access-Control-Allow-Credentials', true);
  // Moving to the next middleware function
  next();
});

// Setting up middleware for logging HTTP requests
app.use(logger('dev'));

// Middleware to parse incoming JSON and URL-encoded requests
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Middleware for parsing cookies from incoming requests
app.use(cookieParser());

// Serving static files (public directory)
app.use(express.static(path.join(__dirname, 'public')));

// Using routers for handling requests to the root and /users endpoints
app.use('/', indexRouter);
app.use('/users', usersRouter);

// Error handling middleware for 404 errors (route not found)
app.use(function(req, res, next) {
  next(createError(404));  // Trigger a 404 error if no route matches
});

// General error handler
app.use(function(err, req, res, next) {
  // Setting locals to provide error information in the development environment
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};  // Only show detailed error in development

  // Rendering the error page with the error status
  res.status(err.status || 500);  // Default to 500 if no status is provided
  res.render('error');  // Render the error page with appropriate message
});

// Exporting the app to be used in other files (e.g., server.js)
module.exports = app;
