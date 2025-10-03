
function UserForm() {
    return {
        email: $("#email").val(),
        password: $("#password").val(),
        password_double: $("#password-double").val()
    }
}

$(document).ready(function() {
    $("#register").on("click", function() {
        var form = UserForm()
        if (form.password === form.password_double) {
            delete form.password_double
            console.log(form)
            $.ajax({
                type: "POST",
                url: "/auth/register",
                contentType: "application/json",
                proccesData: false,
                async: true,
                data: JSON.stringify(form),
                success: (data) => {
                    window.location.href = "/login";
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
            })
        } else {
            
            $('#error-alert').html("Пароли не соответсвуют");
            $('#error-alert').slideDown(300);
            $('#error-alert').delay(2000).slideUp();
        }
        
    })
})