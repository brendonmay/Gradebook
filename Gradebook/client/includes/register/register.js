import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Accounts } from 'meteor/accounts-base';

import '../../main.html';

if(Meteor.isClient){
    Template.register.events({
        'click .cancel-button': function(){
            //clear the input fields
            document.getElementById("registerForm").reset();

            //if cancel button is clicked, close the modal
            $('#registerModal').modal('close');
        },

        'click .back-button': function(){
            document.getElementById("registerForm").reset();

            $('#registerModal').modal('close');
            $('#loginModal').modal('open');
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
            $('#registerModal').modal('close');
        }
    })
}