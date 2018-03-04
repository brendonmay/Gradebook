import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import jqueryValidation from 'jquery-validation'
// import { Accounts } from 'meteor/accounts-base'

import '../../main.html';

Template.login.events({
    'submit .login-form': function (event, template) { //there is no check for if  the user password is incorrect
        event.preventDefault();
        const target = event.target;

        var emailVar = template.find('#email').value;
        var passwordVar = template.find('#password').value;

        Meteor.loginWithPassword(emailVar, passwordVar, function(error) {
            if (error) {
                console.log(error);
                const reason = error.reason;
                switch(error.error) {
                    case 400:
                        //user name/password aren't strings/objects or an unrecognized option
                        break;
                    case 403:
                        //one of "User not found", "Incorrect password"
                        Materialize.toast(reason, 5000, 'amber darken-3');
                        break;
                    default:
                        //unidentified error 
                }
            } else {
                //no error on login, so user Logs in fine
                $('#loginModal').modal('close');
            }
        });
    },

    'click .register': function () {
        document.getElementById("loginForm").reset();

        $('#registerModal').modal('open');
        $('#loginModal').modal('close');
    },

    'click .cancel-button': function () {
        //clear the input fields
        document.getElementById("loginForm").reset();

        //if cancel button is clicked, close the modal
        $('#loginModal').modal('close');
    },
})

Template.login.onRendered(function() {

    $.validate.addMethod( 'isValidUserID', (input) => {
        Users
    });

    $("#formValidate").validate({
        rules: {
            userEmail: {
                required: true,
                isValidUserID: true
            },
            userPassword: {
                required: true
            }
        },
        //For custom messages
        messages: {
            userEmail:{
                required: "Enter your username",
                isValidUserID: "This userID is not valid"
            },
            userPassword: {
                required: "Enter your password"
            }
        },
        errorElement : 'div',
        errorPlacement: function(error, element) {
          var placement = $(element).data('error');
          if (placement) {
            $(placement).append(error)
          } else {
            error.insertAfter(element);
          }
        }
     });
});