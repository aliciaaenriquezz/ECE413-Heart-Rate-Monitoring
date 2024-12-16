function login() {

  let txdata = {
      email: $('#email').val().toUpperCase(),
      password: $('#password').val()
  };
  $.ajax({
      url: '/users/logIn',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(txdata),
      dataType: 'json'
  })
  .done(function (data, textStatus, jqXHR) {
      localStorage.setItem("token", data.token);
      window.location.replace("mainmenu.html");
  })
  .fail(function (jqXHR, textStatus, errorThrown) {
      $('#rxData').html(JSON.stringify(jqXHR, null, 2));
  });
}

$(function () {
  $('#submit').click(login);
});
