import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Accounts } from 'meteor/accounts-base';
import jqueryValidation from 'jquery-validation';
import { Meteor } from "meteor/meteor";
import '../../main.html';

function doesEmailAlreadyExist(allEmails, userEmail) {
    for (var i = 0; i < allEmails.length; i++) {
        if (userEmail == allEmails[i]) {
            return true;
        }
    }
    return false;
}

Template.register.events({
    'click .cancel-button': function () {
        var loginForm = document.getElementById('loginForm');
        var registerForm = document.getElementById("registerForm");
        loginForm.reset();
        registerForm.reset();
        clearValidation(loginForm);
        clearValidation(registerForm);
        $('#registerModal').modal('close');
    },

    'click .back-button': function () {
        var loginForm = document.getElementById('loginForm');
        var registerForm = document.getElementById("registerForm");
        loginForm.reset();
        registerForm.reset();
        clearValidation(loginForm);
        clearValidation(registerForm);

        $('#registerModal').modal('close');
        $('#loginModal').modal({
            complete: function () {
                var message = document.getElementById('login-failed');
                message.style.display = "none";
                var loginForm = document.getElementById('loginForm');
                loginForm.reset();
                clearValidation(loginForm);
            } // Callback for Modal close
        }
        );
        $('#loginModal').modal('open');
    },

    'submit .register-form': function (event) {
        //event.preventDefault();

        var email = event.target.registerEmail.value;
        var password = event.target.registerPassword.value;
        var firstName = event.target.firstName.value;
        var lastName = event.target.lastName.value;

        Session.set('firstName', firstName);
        Session.set('lastName', lastName);
        Session.set('newlyRegistered', "true");

        Accounts.createUser({
            email: email,
            password: password
        }
        // , function(error, result){
        //     if (error){
        //         console.log("error: " + error)
        //         console.log("error reason: " + error.reason);
        //     }
        //     else{
        //         console.log("success creating user");
        //     }
        // }
        );

        var registerForm = document.getElementById("registerForm");
        registerForm.reset();
        clearValidation(registerForm);

        $('#emailVerificationModal').modal({
            complete: function () {
                document.getElementById("blurredSideNav").style = "display: none";
                document.getElementById("preloader").style = "display: none";
                $('#registerModal').modal('close');
            }
        });

        $('#emailVerificationModal').modal('open');

    }
})


Template.register.onRendered(function () {
    $.validator.addMethod('containsIllegalCharacters', (input) => {
        const illegalCharacters = /[,<.>/?;:'"{}|`~!@#$%^&*()_+=\]\[\\1234567890]/g;
        return !(input.match(illegalCharacters));
    });
    $.validator.addMethod('containsUppercase', (input) => {
        const uppercase = /[A-Z]/g;
        return (input.match(uppercase));
    });
    $.validator.addMethod('containsNumber', (input) => {
        const numbers = /[0-9]/g;
        return (input.match(numbers));
    });
    $.validator.addMethod('emailNotInUse', (input) => {
        var emailsArray = [];
        const userList = Meteor.users.find({});
        userList.forEach(
            function (doc) {
                emailsArray.push(doc.emails[0].address);
            }
        );
        return !doesEmailAlreadyExist(emailsArray, input);
    });

    $("#registerForm").validate({
        errorClass: "invalid",
        validClass: "jquery-validation-valid",
        rules: {
            registerEmail: {
                required: true,
                email: true,
                emailNotInUse: true,

            },
            registerPassword: {
                required: true,
                minlength: 7,
                containsUppercase: true,
                containsNumber: true,
            },
            confirmPassword: {
                required: true,
                equalTo: "#registerPassword"
            },
            lastName: {
                required: true,
                containsIllegalCharacters: true,
            },
            firstName: {
                required: true,
                containsIllegalCharacters: true,
            }
        },
        //For custom messages
        messages: {
            registerEmail: {
                required: "Enter an email.",
                email: "You must enter an email.",
                emailNotInUse: "The email you entered already has an account assoicated with it."
            },
            registerPassword: {
                required: "You must enter a password.",
                minlength: "Your password must be at least 7 characters.",
                containsUppercase: "Your password must contain at least 1 upper case letter.",
                containsNumber: "Your password must contain at least 1 number."

            },
            confirmPassword: {
                required: "Re-enter your password.",
                equalTo: "The passwords you entered do not match."
            },
            lastName: {
                required: "Enter your last name.",
                containsIllegalCharacters: "Names can only contain alphabet letters and dashes(-)."
            },
            firstName: {
                required: "Enter your first name.",
                containsIllegalCharacters: "Names can only contain alphabet letters and dashes(-)."
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


