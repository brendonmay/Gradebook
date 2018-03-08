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
        //clear the input fields
        document.getElementById("registerForm").reset();

        //if cancel button is clicked, close the modal
        $('#registerModal').modal('close');
    },

    'click .back-button': function () {
        document.getElementById("registerForm").reset();

        $('#registerModal').modal('close');
        $('#loginModal').modal({
            complete: function () {
                var message = document.getElementById('login-failed');
                message.style.display = "none";
            } // Callback for Modal close
        }
        );
        $('#loginModal').modal('open');
    },

    'submit .register-form': function (event, template) {
        event.preventDefault();

        var emailVar = event.target.registerEmail.value;
        var passwordVar = event.target.registerPassword.value;
        var confirmPass = event.target.confirmPassword.value;

        //regEx used for password verification
        var lowercase = /[a-z]/g;
        var uppercase = /[A-Z]/g;
        var number = /[0-9]/g;

        // const emailCheck = Meteor.users.find({ "emails.address": emailVar }).fetch();

        //a count that will allow us to post multiple toasts to appear on the screen at once
        var toastCount = 0;

        if (emailCheck[0] != null) {
            Materialize.toast('User already exists', 5000, 'amber darken-3')
            toastCount++;
        }
        if (!(passwordVar.match(lowercase))) {
            Materialize.toast('Password must contain a lowercase letter', 5000, 'amber darken-3')
            toastCount++;
        }
        if (!(passwordVar.match(uppercase))) {
            Materialize.toast('Password must contain an uppercase letter', 5000, 'amber darken-3')
            toastCount++;
        }
        if (!(passwordVar.match(number))) {
            Materialize.toast('Password must contain a number', 5000, 'amber darken-3')
            toastCount++;
        }
        if (confirmPass != passwordVar) {
            Materialize.toast('Your passwords do not match.', 5000, 'amber darken-3')
            toastCount++;
        }
        if (toastCount > 0) {
            document.getElementById("registerForm").reset();
            //return false;
        }
        else {
            Accounts.createUser({
                email: emailVar,
                password: passwordVar
            });
            document.getElementById("registerForm").reset();
            $('#registerModal').modal('close');
        }
    }
})


Template.register.onRendered(function () {
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
        errorClass: "validation-red-text",
        validClass: "",
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
                containsUppercase: "Your password must contain atleast 1 upper case letter.",
                containsNumber: "Your password must contain atleast 1 number."

            },
            confirmPassword: {
                required: "Re-enter your password.",
                equalTo: "The passwords you entered do not match."
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


