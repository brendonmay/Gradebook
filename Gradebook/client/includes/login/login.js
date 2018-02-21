import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Accounts } from 'meteor/accounts-base';

import '../../main.html';

if(Meteor.isClient){
    Template.login.events({
        'submit .login-form': function(event, template) { //there is no check for if a user exists or if password is incorrect
            event.preventDefault();
            const target = event.target;
            var emailVar = template.find('#email').value;
            var passwordVar = template.find('#password').value;
            if(emailVar == "" || passwordVar ==""){
                Materialize.toast('Field was left unfilled, please enter an email and password', 2000, 'amber darken-3')
                return false;
            }
            else{
                Meteor.loginWithPassword(emailVar, passwordVar);
                document.getElementById("loginForm").reset();
                $('#loginModal').modal('close');
            }
        },

        'click .register': function(){
            document.getElementById("loginForm").reset();

            // document.getElementById("password").value = "";
            $('#registerModal').modal('open');
            $('#loginModal').modal('close');
        },

        'click .cancel-button': function(){
            //clear the input fields
            document.getElementById("loginForm").reset();

            //if cancel button is clicked, close the modal
            $('#loginModal').modal('close');
        },
    })
}