import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import jqueryValidation from 'jquery-validation';
import { Accounts } from 'meteor/accounts-base'

import '../../main.html';
import { CurrentDate } from '../../../lib/collections';

function showLoginErrorMessageText(reason) {
    var message = document.getElementById('login-failed');
    message.style.display = "";
}
function removeLoginError() {
    var message = document.getElementById('login-failed');
    message.style.display = "none";
}
function getExpiryDate() {
    var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    var currentDate = CurrentDate.findOne();
    if (currentDate) {
        today = currentDate.date;
    } else {
        return;
    }
    var expiryDate = Meteor.users.findOne({ _id: Meteor.userId() }).subscribed.expirationDate;

    var diffDays = Math.round((expiryDate.getTime() - today.getTime()) / (oneDay));

    return diffDays
}
function expired(diffDays) {
    return diffDays <= -1
}

Template.login.events({
    'submit .login-form': function (event, template) { //there is no check for if  the user password is incorrect
        event.preventDefault();
        const target = event.target;

        var emailVar = template.find('#login-email').value;
        var passwordVar = template.find('#login-password').value;

        document.getElementById("preloader-full").style = "";

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
                document.getElementById("preloader-full").style = "display: none";
            } else {
                //no error on login, so user Logs in fine
                removeLoginError();

                var loginForm = document.getElementById('loginForm');
                loginForm.reset();
                clearValidation(loginForm);

                // var currentUser = Meteor.users.findOne({ _id: Meteor.userId() }).subscribed;
                // if (currentUser.type == "paid") {
                //     var expirationDate = currentUser.expirationDate;
                //     var numberOfDaysRemaining = getExpiryDate();
                //     if (expired(numberOfDaysRemaining)) {
                //         var customerId = currentUser.braintreeId;
                //         var currentUser = Meteor.users.findOne({ _id: Meteor.userId() })
                //         var userId = Meteor.userId();
                //         Meteor.call('checkIfStillSubscribed', customerId, currentUser, userId);
                //     }

                // }

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
    'click .resetPassword': function () {
        var loginForm = document.getElementById('loginForm');
        var registerForm = document.getElementById("registerForm");
        loginForm.reset();
        registerForm.reset();
        clearValidation(loginForm);
        clearValidation(registerForm);
        $('#resetPasswordModal').modal({
            dismissible: true,
            complete: function () {
                document.getElementById("reset-passed").style.display = "none";
                document.getElementById('resetPassword').style.display = "";
            }
        });

        $('#resetPasswordModal').modal('open');
        removeLoginError();
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