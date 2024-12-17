$(function (){
    // When the document is ready, the following function is executed

    $.ajax({
        // Perform an AJAX request to the server
        url: '/users/status', // The endpoint to fetch the user's status
        method: 'GET', // The HTTP method is GET
        headers: { 
            'x-auth' : window.localStorage.getItem("token") // Attach the authentication token from local storage in the request header
        },
        dataType: 'json' // The expected response data type is JSON
    })
    .done(function (data, textStatus, jqXHR) {
        // If the request is successful, this function is executed
        // Insert the data into the HTML page dynamically

        $('#name').html(data.map(obj => obj['name'])); 
        // Use element with id = "name" and set its HTML content to the user's name
        
        $('#userEmail').html(data.map(obj => obj['email'])); 
        // Use element with id = "userEmail" and set its HTML content to the user's email
        
        $('#fullName').val(data.map(obj => obj['name']).join());  
        // Use input with id = "fullName" and set its value to the user's name
        
        $('#email').val(data.map(obj => obj['email']).join()); 
        // Use input with id = "email" and set its value to the user's email
    })
    .fail(function (jqXHR, textStatus, errorThrown) {
        // If the request fails, this function is executed
        window.alert("Failure /javascripts/accountInfo.js"); 
        // Show an alert box indicating failure
    });
});
