function login() {
  // This function handles the login process when called

  let txdata = {
      email: $('#email').val().toUpperCase(), // Get the email from the input field and convert to uppercase
      password: $('#password').val() // Get the password from the input field
  };

  $.ajax({
      url: '/users/logIn', // Endpoint for the login API
      method: 'POST', // HTTP method is POST
      contentType: 'application/json', // Sending JSON data
      data: JSON.stringify(txdata), // Convert txdata object to JSON string
      dataType: 'json' // Expecting a JSON response from the server
  })
  .done(function (data, textStatus, jqXHR) {
      // If the login is successful, this function is executed
      localStorage.setItem("token", data.token); // Store the returned token in localStorage
      window.location.replace("mainmenu.html"); // Redirect to main menu page
  })
  .fail(function (jqXHR, textStatus, errorThrown) {
      // If the login fails, this function is executed
      $('#rxData').html(JSON.stringify(jqXHR, null, 2)); // Display the error response in a formatted manner
  });
}

$(function () {
  // Wait until the document is ready and then attach the click event listener
  $('#submit').click(login); // When the submit button is clicked, call the login function
});
