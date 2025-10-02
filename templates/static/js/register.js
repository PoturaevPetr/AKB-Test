
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

                }
            })
        } else {

        }
        
    })
})