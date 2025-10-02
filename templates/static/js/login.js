

function getValueCookie(key) {
    return $.cookie(key)
}
$(document).ready(function () {
    $('#login').on('click', function (e) {
        const data = {
            username: $('#username').val().trim(),
            password: $('#password').val().trim()
        }
        if (data.username == "" || data.password == "") {
            $('#error-alert').html('Пожалуйста, заполните все поля')
            $('#error-alert').slideDown(300)
            $('#error-alert').delay(2000).slideUp()
            return
        } else {
            $.ajax({
                url: '/auth/jwt/login',
                type: 'POST',
                data: data,
                success: function (data) {
                    window.location.href = "/";
                },
                error: function (xhr, status, error) {
                    let message = 'Неверные имя логин и пароль'; // стандартное сообщение
                    try {
                        const response = JSON.parse(xhr.responseText);
                        if (response.detail) {
                            message = response.detail;
                        }
                    } catch (e) {
                        // если парсинг не удался, оставить стандартное сообщение
                    }
                    $('#error-alert').html(message);
                    $('#error-alert').slideDown(300);
                    $('#error-alert').delay(2000).slideUp();
                }
            });
        }
    });
});