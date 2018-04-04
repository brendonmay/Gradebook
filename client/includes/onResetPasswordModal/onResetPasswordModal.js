import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Accounts } from 'meteor/accounts-base';
import jqueryValidation from 'jquery-validation';
import { Meteor } from "meteor/meteor";
import '../../main.html';

Template.onResetPasswordModal.events({

    'click #onResetPasswordSubmit': function () {
        document.getElementById('onResetPasswordModalFormSubmitID').click();
        $('#onResetPasswordModal').modal('close');
    },
    'submit #onResetPasswordModalForm': function (event) {
        $('#onResetPasswordModal').modal('close');
    }
})


Template.onResetPasswordModal.onRendered(function () {
    $.validator.addMethod('containsUppercase', (input) => {
        const uppercase = /[A-Z]/g;
        return (input.match(uppercase));
    });
    $.validator.addMethod('containsNumber', (input) => {
        const numbers = /[0-9]/g;
        return (input.match(numbers));
    });

    $("#registerForm").validate({
        errorClass: "invalid",
        validClass: "jquery-validation-valid",
        rules: {
            onResetPassword: {
                required: true,
                minlength: 7,
                containsUppercase: true,
                containsNumber: true,
            },
            confirmResetPassword: {
                required: true,
                equalTo: "#onResetPassword"
            }
        },
        //For custom messages
        messages: {
            onResetPassword: {
                required: "You must enter a password.",
                minlength: "Your password must be at least 7 characters.",
                containsUppercase: "Your password must contain at least 1 upper case letter.",
                containsNumber: "Your password must contain at least 1 number."

            },
            confirmResetPassword: {
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


