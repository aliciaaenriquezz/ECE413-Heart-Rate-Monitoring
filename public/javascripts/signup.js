//REFERENCES: ECE 413 Lab 3 and MongoDB_Activities_Source_Code

var errors = [];  // Array to store error messages

// Event listener for when the document content is fully loaded
document.addEventListener("DOMContentLoaded", loadedHandler);

// Function to initialize event listeners when the document is loaded
function loadedHandler() {
  var fullName = document.getElementById("fullName");
  var email = document.getElementById("email");
  var password = document.getElementById("password");
  var passwordConfirm = document.getElementById("passwordConfirm");
  var submitButton = document.getElementById("submit");

  // Add click event listener to the submit button, which triggers the error checking
  submitButton.addEventListener("click", checkErrors);
}

/// ------ DATA BASE FUNCTIONS ------ ///

// Function to create a new user and save to the database
function createUser(){
  // Validate fields before proceeding with user creation
  if ($('#fullName').val() === "") {
    window.alert("invalid name!");
    return;
  }
  if ($('#email').val() === "") {
    window.alert("invalid email!");
    return;
  }
  if ($('#password').val() === "") {
    window.alert("invalid password!");
    return;
  }

  // Capitalize the name correctly
  let x = $('#fullName').val().toLowerCase();
  let capName = x.split(' ').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');

  // Prepare data to be sent in the POST request
  let txdata = {
      name: capName,
      email: $('#email').val().toUpperCase(), 
      password: $('#password').val()
  };
  
  // Make an AJAX POST request to create the user in the database
  $.ajax({
      url: '/users/create',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(txdata),
      dataType: 'json'
  })
  .done(function (data, textStatus, jqXHR) {
    // Successful user creation logic (if needed)
  })
  .fail(function (data, textStatus, jqXHR) {
    window.alert("FAILURE javascripts/signup.js/createUser()");
  });
}

// Function to check if the email is already used (duplicate email check)
function isDuplicateEmails(){
   // Validate that the email field is not empty
  if ($('#email').val() === "") {
    window.alert("invalid email!");
    return;
  }

  // Prepare data to check for existing email
  let txdata = {
    email: $('#email').val().toUpperCase()
  };

  // Make an AJAX POST request to check for existing email
  $.ajax({
    url: '/users/search',
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify(txdata),
    dataType: 'json'
  })
  .done(function (data, textStatus, jqXHR) {
    // If email exists, display an alert and mark the email field as invalid
    if(data.length > 0){
      window.alert("This email is already in use on this site.");
      isError = true
      email.style.borderColor = "red";
      email.style.borderWidth = "2px";
    } else {
      // If no duplicates, reset the email field's appearance and proceed to create the user
      email.style.borderColor = "rgb(170, 170, 170)";
      email.style.borderWidth = "1px";
      createUser();
      // Redirect to login page after successful signup
      window.location.href = 'login.html';
    }
 })
 .fail(function (data, textStatus, jqXHR) {
     window.alert("FAILURE javascripts/signup.js/isDuplicateEmails()");
 });
}

/// ------ SIGN UP FUNCTIONS ------ ///

// Function to check for form errors before submission
function checkErrors() {
  errors = []; // Reset the errors array
  const hasLower = /[a-z]/;  // Regular expression for lowercase letters
  const hasUpper = /[A-Z]/;  // Regular expression for uppercase letters
  const hasDigit = /\d/;     // Regular expression for digits
  const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/; // Email regex pattern
  let isError = false;  // Flag to track if there are any errors
  let passwordError = false;  // Flag to track if password errors exist

  // Check for errors in the full name field
  if (fullName.value.trim().length < 1) {
    errors.push("Missing full name.");
    isError = true;
    fullName.style.borderColor = "red";  // Mark field as invalid
    fullName.style.borderWidth = "2px";
  } else {
    fullName.style.borderColor = "rgb(170, 170, 170)"; // Valid field appearance
    fullName.style.borderWidth = "1px";
  }

  // Check for errors in the email field
  if (!email.value.match(emailPattern)) {
    errors.push("Invalid or missing email address.");
    isError = true;
    email.style.borderColor = "red";
    email.style.borderWidth = "2px";
  } else {
    email.style.borderColor = "rgb(170, 170, 170)";
    email.style.borderWidth = "1px";
  }

  // Check for errors in the password field
  if (password.value.length < 10 || password.value.length > 20) {
    errors.push("Password must be between 10 and 20 characters.");
    isError = true;
    passwordError = true;
    password.style.borderColor = "red";
    password.style.borderWidth = "2px";
  }
  if (hasLower.exec(password.value) == null) {
    errors.push("Password must contain at least one lowercase character.");
    isError = true;
    passwordError = true;
    password.style.borderColor = "red";
    password.style.borderWidth = "2px";
  }
  if (hasUpper.exec(password.value) == null) {
    errors.push("Password must contain at least one uppercase character.");
    isError = true;
    passwordError = true;
    password.style.borderColor = "red";
    password.style.borderWidth = "2px";
  }
  if (hasDigit.exec(password.value) == null) {
    errors.push("Password must contain at least one digit.");
    isError = true;
    passwordError = true;
    password.style.borderColor = "red";
    password.style.borderWidth = "2px";
  }

  // Check for errors in password confirmation
  if (password.value !== passwordConfirm.value) {
    errors.push("Password and confirmation password don't match.");
    isError = true;
    passwordError = true;
    passwordConfirm.style.borderColor = "red";
    passwordConfirm.style.borderWidth = "2px";
    password.style.borderColor = "red";
    password.style.borderWidth = "2px";
  } else {
    passwordConfirm.style.borderColor = "rgb(170, 170, 170)";
    passwordConfirm.style.borderWidth = "1px";
  }

  // Reset the appearance of the password field if no errors
  if (passwordError == false) {
    password.style.borderColor = "rgb(170, 170, 170)";
    password.style.borderWidth = "1px";
  }

  // If there are errors, show them
  if (isError) {
    showErrors();
  } else {
    // If no errors, hide the error display and proceed with checking duplicate emails
    document.getElementById("formErrors").style.display = "none";
    isDuplicateEmails();
  }
}

// Function to display errors on the page
function showErrors() {
  document.getElementById('formErrors').innerHTML = '<ul>' + errors.map(error => `<li>${error}</li>`).join('') + '</ul>';
  document.getElementById("formErrors").style.display = "block";
}
