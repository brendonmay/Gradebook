import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Accounts } from 'meteor/accounts-base';

import '../../main.html';

if(Meteor.isClient){
    Template.customLogin.events({
        'submit .login-form': function(event, template) { //there is no check for if a user exists or if password is incorrect
            event.preventDefault();
            const target = event.target;
            var emailVar = template.find('#email').value;
            var passwordVar = template.find('#password').value;
            if(emailVar == "" || passwordVar == ""){
                Materialize.toast('Field was left unfilled, please enter an email and password', 2000)
            }
            else{
                Meteor.loginWithPassword(emailVar, passwordVar);
                document.getElementById("loginForm").reset();
                $('#customLoginModal').modal('close');
            }
        },

        'click .register': function(){
            document.getElementById("loginForm").reset();

            // document.getElementById("password").value = "";
            $('#customRegisterModal').modal('open');
            $('#customLoginModal').modal('close');
        },

        'click .cancel-button': function(){
            //clear the input fields
            document.getElementById("loginForm").reset();

            //if cancel button is clicked, close the modal
            $('#customLoginModal').modal('close');
        },
    }),

    Template.customRegister.events({
        'click .cancel-button': function(){
            //clear the input fields
            document.getElementById("registerForm").reset();

            //if cancel button is clicked, close the modal
            $('#customRegisterModal').modal('close');
        },

        'click .back-button': function(){
            document.getElementById("registerForm").reset();

            $('#customRegisterModal').modal('close');
            $('#customLoginModal').modal('open');
        },

        'submit .register-form': function(event, template) {
            event.preventDefault();

            var emailVar = event.target.registerEmail.value;
            var passwordVar = event.target.registerPassword.value;

            Accounts.createUser({
                email: emailVar,
                password: passwordVar
            });

            document.getElementById("registerForm").reset();
            $('#customRegisterModal').modal('close');
        }
    })
}