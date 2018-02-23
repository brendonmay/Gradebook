import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Accounts } from 'meteor/accounts-base';

import '../../main.html';

Meteor.subscribe("users");

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

        //regEx used for password verification
        var lowercase = /[a-z]/g;
        var uppercase = /[A-Z]/g;
        var number = /[0-9]/g;

        const emailCheck = Meteor.users.find({"emails.address" : emailVar}).fetch();

        //a count that will allow us to post multiple toasts to appear on the screen at once
        var toastCount = 0;

        if(emailCheck[0] != null){
            Materialize.toast('User already exists', 3000, 'amber darken-3')
            toastCount++;
        }
        if(!(passwordVar.match(lowercase))){
            Materialize.toast('Password must contain a lowercase letter', 3000, 'amber darken-3')
            toastCount++;
        }
        if(!(passwordVar.match(uppercase))){
            Materialize.toast('Password must contain an uppercase letter', 3000, 'amber darken-3')
            toastCount++;
        }
        if(!(passwordVar.match(number))){
            Materialize.toast('Password must contain a number letter', 3000, 'amber darken-3')
            toastCount++;
        }
        if(toastCount > 0){
            document.getElementById("registerForm").reset();
            return false;
        }
        else{
            Accounts.createUser({
                email: emailVar,
                password: passwordVar
            });
            document.getElementById("registerForm").reset();
            $('#registerModal').modal('close');
        }
    }
})


