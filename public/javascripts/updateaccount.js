var errors = [];  // Array to store error messages

// Event listener for when the document content is fully loaded
document.addEventListener("DOMContentLoaded", loadedHandler);

// Event listener to navigate back to the main menu when the back button is clicked
document.addEventListener('DOMContentLoaded', () => {
  const backButton = document.getElementById('back-button');

  // Add click event listener to navigate to mainmenu.html
  backButton.addEventListener('click', () => {
      window.location.href = 'mainmenu.html'; // Redirect to main menu
  });
});

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

/// ------ PROFILE UPDATE FUNCTIONS ------ ///

// Function to update the user profile
function updateProfile(){
  // Capitalize the full name
  let x = $('#fullName').val().toLowerCase();
  let capName = x.split(' ').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');

  // Prepare the data for the update request
  let txdata = {
    name: capName,
    email: $('#email').val(), 
    password: $('#password').val()
  };

  // Send an AJAX request to update the user profile in the database
  $.ajax({
    url: '/users/update',
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify(txdata),
    dataType: 'json'
  })
  .done(function (data, textStatus, jqXHR) {
    // Display a success message upon successful update
    window.alert("Information has been successfully updated");
    // Optionally, redirect to the main menu or another page
    // window.location.href = 'mainmenu.html';
  })
  .fail(function (jqXHR, textStatus, errorThrown) {
    // Handle failure in updating the profile
    window.alert("Failure /javascripts/updateaccount.js/updateProfile()");
  });
}

/// ------ FORM ERROR CHECKING ------ ///

// Function to check for errors in the form inputs before submission
function checkErrors() {
  errors = []; // Reset errors array
  const hasLower = /[a-z]/;  // Regular expression for lowercase letters
  const hasUpper = /[A-Z]/;  // Regular expression for uppercase letters
  const hasDigit = /\d/;     // Regular expression for digits
  const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/; // Email regex pattern
  let isError = false;  // Flag to track if there are any errors
  let passwordError = false;  // Flag to track if there are password-related errors

  // Validate full name
  if (fullName.value.trim().length < 1) {
    errors.push("Missing full name.");
    isError = true;
    fullName.style.borderColor = "red";  // Mark field as invalid
    fullName.style.borderWidth = "2px";
  } else {
    fullName.style.borderColor = "rgb(170, 170, 170)"; // Valid field appearance
    fullName.style.borderWidth = "1px";
  }

  // Validate email
  if (!email.value.match(emailPattern)) {
    errors.push("Invalid or missing email address.");
    isError = true;
    email.style.borderColor = "red";
    email.style.borderWidth = "2px";
  } else {
    email.style.borderColor = "rgb(170, 170, 170)";
    email.style.borderWidth = "1px";
  }

  // Validate password
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

  // Validate password confirmation
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
    // If no errors, hide the error display and proceed to update the profile
    document.getElementById("formErrors").style.display = "none";
    updateProfile();
  }
}

// Function to display errors on the page
function showErrors() {
  document.getElementById('formErrors').innerHTML = '<ul>' + errors.map(error => `<li>${error}</li>`).join('') + '</ul>';
  document.getElementById("formErrors").style.display = "block";
}
