import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Accounts } from 'meteor/accounts-base';

import '../../main.html';

Meteor.subscribe("users");

Template.login.events({
    'submit .login-form': function(event, template) { //there is no check for if  the user password is incorrect
        event.preventDefault();
        const target = event.target;

        var emailVar = template.find('#email').value;
        var passwordVar = template.find('#password').value;

        const emailCheck = Meteor.users.find({"emails.address" : emailVar}).fetch();
        console.log(emailCheck[0]);
        const passwordCheck = Meteor.users.find({"passwords" : passwordVar}).fetch();

        if(emailVar == "" || passwordVar ==""){
            Materialize.toast('Field was left unfilled, please enter an email and password', 5000, 'amber darken-3')
            document.getElementById("loginForm").reset();
            return false;
        }
        if(emailCheck[0] == null){
            Materialize.toast('User does not exist on the server. Please register to use this email', 5000, 'amber darken-3')
            document.getElementById("loginForm").reset();
            //return false;
        }
        else{
            //This is where the password check issue is occuring
            var hashPassword = Package.sha.SHA256("DDRealms124");
            console.log(hashPassword);
            
                if(Meteor.call('checkPassword', emailVar, hashPassword)){
                    console.log("it worked");
                }
                else{
                    console.log("it didn't work");
                }
            
            Meteor.loginWithPassword(emailVar, passwordVar)
            document.getElementById("loginForm").reset();
            $('#loginModal').modal('close');
        }
    },

    'click .register': function(){
        document.getElementById("loginForm").reset();

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