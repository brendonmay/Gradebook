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

Template.resetPassword.events({
    'submit #resetPasswordForm': function (event, template) { //there is no check for if  the user password is incorrect
        event.preventDefault();
        const target = event.target;

        var emailVar = template.find('#resetPassword-email').value;

        document.getElementById("preloader-full").style = "";

        Meteor.call('sendResetPassword', emailVar, function (error, result) {
            if (error) {
                console.log(error)
            } else {
                document.getElementById("reset-passed").style.display = "";
            }
            document.getElementById("preloader-full").style = "display: none;";
        });
    },

    'click .cancel-button': function () {
        var resetPasswordForm = document.getElementById('resetPasswordForm');
        resetPasswordForm.reset();
        clearValidation(resetPasswordForm);
        document.getElementById("reset-passed").style.display = "none";

        $('#resetPasswordModal').modal('close');
    },
})

Template.resetPassword.onRendered(function () {
    $.validator.addMethod('emailInUse', (input) => {
        var emailsArray = [];
        const userList = Meteor.users.find({});
        userList.forEach(
            function (doc) {
                emailsArray.push(doc.emails[0].address);
            }
        );
        return doesEmailAlreadyExist(emailsArray, input);
    });
    $("#resetPasswordForm").validate({
        errorClass: "invalid",
        validClass: "jquery-validation-valid",
        rules: {
            userEmail: {
                required: true,
                emailInUse: true
            }
        },
        //For custom messages
        messages: {
            userEmail: {
                required: "Enter your email",
                emailInUse: "There is no account associated with this email"
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