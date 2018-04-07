import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Accounts } from 'meteor/accounts-base';
import jqueryValidation from 'jquery-validation';
import { Meteor } from "meteor/meteor";
import '../../main.html';

function changePassword() {
    var currentPassword = document.getElementById('currentPassword').value;
    var newPassword = document.getElementById('newPassword').value;

    Accounts.changePassword(currentPassword, newPassword, function (error) {
        if (error) {
            if (error.reason == "Incorrect password") {
                document.getElementById('change-password-incorrect-failed').style.display = "";
            } else {
                document.getElementById('change-password-failed-general').style.display = "";   
            }
        } else {
            Materialize.toast('Your password has been successfully changed!');
            closeModal();

        }
    });
}

function closeModal() {
    document.getElementById('change-password-incorrect-failed').style.display = "none";
    document.getElementById('change-password-failed-general').style.display = "none";   
    var changePasswordForm = document.getElementById('changePasswordForm');
    changePasswordForm.reset();
    clearValidation(changePasswordForm);

    $('#changePasswordModal').modal('close');
}

Template.changePassword.events({
    'submit #changePasswordForm': function (event, template) { //there is no check for if  the user password is incorrect
        event.preventDefault();
        changePassword();
    },

    'click .cancel-button': function () {
        closeModal();
    },
})

Template.changePassword.onRendered(function () {
    $.validator.addMethod('containsUppercase', (input) => {
        const uppercase = /[A-Z]/g;
        return (input.match(uppercase));
    });
    $.validator.addMethod('containsNumber', (input) => {
        const numbers = /[0-9]/g;
        return (input.match(numbers));
    });
    $("#changePasswordForm").validate({
        errorClass: "invalid",
        validClass: "jquery-validation-valid",
        rules: {
            currentPassword: {
                required: true
            },
            newPassword: {
                required: true,
                containsUppercase: true,
                containsNumber: true,
                minlength: 7
            },
            confirmNewPassword: {
                required: true,
                equalTo: "#newPassword"
            }
        },
        messages: {
            currentPassword: {
                required: "Enter your current password"
            },
            newPassword: {
                required: "You must enter a new password.",
                minlength: "Your password must be at least 7 characters.",
                containsUppercase: "Your password must contain at least 1 upper case letter.",
                containsNumber: "Your password must contain at least 1 number."
            },
            confirmNewPassword: {
                required: "Re-enter your new password.",
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