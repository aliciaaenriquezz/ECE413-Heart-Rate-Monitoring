$(function (){
    $.ajax({
        url: '/users/status',
        method: 'GET',
        headers: { 'x-auth' : window.localStorage.getItem("token") },
        dataType: 'json'
    })
    .done(function (data, textStatus, jqXHR) {
        //This way you can insert personalized data directly to the html web page
        $('#name').html(data.map(obj => obj['name']));              //use element with id = "name"
        $('#userEmail').html(data.map(obj => obj['email']));        //use element with id = "userEmail"
        $('#fullName').val(data.map(obj => obj['name']).join());    //use input with id = "fullname"
        $('#email').val(data.map(obj => obj['email']).join());      //use input with id = "email"
    })
    .fail(function (jqXHR, textStatus, errorThrown) {
        window.alert("Failure /javascripts/accountInfo.js");
    });
});
