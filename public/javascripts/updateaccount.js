
var errors = [];

document.addEventListener("DOMContentLoaded", loadedHandler);

document.addEventListener('DOMContentLoaded', () => {
  const backButton = document.getElementById('back-button');

  // Add click event listener to navigate to mainmenu.html
  backButton.addEventListener('click', () => {
      window.location.href = 'mainmenu.html'; // Redirect to main menu
  });
});

function loadedHandler() {
  var fullName = document.getElementById("fullName");
  var email = document.getElementById("email");
  var password = document.getElementById("password");
  var passwordConfirm = document.getElementById("passwordConfirm");
  var submitButton = document.getElementById("submit");
  submitButton.addEventListener("click", checkErrors);
}


function updateProfile(){

  let x = $('#fullName').val().toLowerCase();
  let capName = x.split(' ').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');

  let txdata = {
    name: capName,
    email: $('#email').val(), 
    password: $('#password').val()
  };

  $.ajax({
    url: '/users/update',
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify(txdata),
    dataType: 'json'
})
.done(function (data, textStatus, jqXHR) {
  window.alert("Information has been successfully updated");
  //window.location.href = 'mainmenu.html';
})
.fail(function (jqXHR, textStatus, errorThrown) {
  window.alert("Failure /javascripts/updateaccount.js/updateProfile()");
});
}

function checkErrors() {
  errors = []; //reset errors array
  const hasLower = /[a-z]/;
  const hasUpper = /[A-Z]/;
  const hasDigit = /\d/;
  const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/;
  let isError = false;
  let passwordError = false;

  //NAME ERRORS
  if (fullName.value.trim().length < 1) {
    errors.push("Missing full name.");
    isError = true;
    fullName.style.borderColor = "red";
    fullName.style.borderWidth = "2px";
  } else {
    fullName.style.borderColor = "rgb(170, 170, 170)";
    fullName.style.borderWidth = "1px";
  }

  //EMAIL ERRORS
  if (!email.value.match(emailPattern)) {
    errors.push("Invalid or missing email address.");
    isError = true;
    email.style.borderColor = "red";
    email.style.borderWidth = "2px";
  }else {
    email.style.borderColor = "rgb(170, 170, 170)";
    email.style.borderWidth = "1px";
  }
  //PASSWORD ERRORS
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
  //PASSWORD CONFIRM ERRORS
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
  if (passwordError == false) {
    password.style.borderColor = "rgb(170, 170, 170)";
    password.style.borderWidth = "1px";
  }
  if (isError) {
    showErrors();
  } else {
    document.getElementById("formErrors").style.display = "none";
    updateProfile();
  }
}

function showErrors() {
  document.getElementById('formErrors').innerHTML = '<ul>' + errors.map(error => `<li>${error}</li>`).join('') + '</ul>';
  document.getElementById("formErrors").style.display = "block";
}
