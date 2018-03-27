import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import jqueryValidation from 'jquery-validation';
// import { Accounts } from 'meteor/accounts-base'

import '../../main.html';

function showLoginErrorMessageText(reason) {
    var message = document.getElementById('login-failed');
    message.style.display = "";
}
function removeLoginError() {
    var message = document.getElementById('login-failed');
    message.style.display = "none";
}

Template.login.events({
    'submit .login-form': function (event, template) { //there is no check for if  the user password is incorrect
        event.preventDefault();
        const target = event.target;

        var emailVar = template.find('#login-email').value;
        var passwordVar = template.find('#login-password').value;

        Meteor.loginWithPassword(emailVar, passwordVar, function (error) {
            if (error) {
                const reason = error.reason;
                switch (error.error) {
                    case 400:
                        //user name/password aren't strings/objects or an unrecognized option
                        break;
                    case 403:
                        //one of "User not found", "Incorrect password"
                        showLoginErrorMessageText(reason);
                        //Materialize.toast(reason, 5000, 'amber darken-3');
                        break;
                    default:
                    //unidentified error 
                }
            } else {
                //no error on login, so user Logs in fine
                removeLoginError();

                var loginForm = document.getElementById('loginForm');
                loginForm.reset();
                clearValidation(loginForm);

                $('#loginModal').modal('close');
            }
        });
    },

    'click .register': function () {
        var loginForm = document.getElementById('loginForm');
        var registerForm = document.getElementById("registerForm");
        loginForm.reset();
        registerForm.reset();
        clearValidation(loginForm);        
        clearValidation(registerForm);

        $('#registerModal').modal('open');
        removeLoginError();
        $('#loginModal').modal('close');
    },

    'click .cancel-button': function () {
        //clear the input fields
        var loginForm = document.getElementById('loginForm');
        loginForm.reset();
        clearValidation(loginForm);

        removeLoginError();
        //if cancel button is clicked, close the modal
        $('#loginModal').modal('close');
    },
})

Template.login.onRendered(function () {
    $("#loginForm").validate({
        errorClass: "invalid",
        validClass: "jquery-validation-valid",
        rules: {
            userEmail: {
                required: true
            },
            userPassword: {
                required: true
            }
        },
        //For custom messages
        messages: {
            userEmail: {
                required: "Enter your email"
            },
            userPassword: {
                required: "Enter your password"
            }
        },
        errorElement: 'div',
        errorPlacement: function (error, element) {
            var placement = $(element).data('error');
            if (placement) {
                $(placement).append(error)
            } else {
                error.insertAfter(element);
            }
        }
    });
});