import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Accounts } from 'meteor/accounts-base';

import '../../main.html';

if(Meteor.isClient){
    Template.customLogin.events({
        'submit form': function(event, template) {
            event.preventDefault();
            const target = event.target;
            var emailVar = template.find('#email').value;
            var passwordVar = template.find('#password').value;
            if(emailVar == "" || passwordVar == ""){
                Materialize.toast('Field was left unfilled, please enter an email and password', 2000)
            }
            else{
                Meteor.loginWithPassword(emailVar, passwordVar);
                target.userEmail.value = "";
                target.userPassword.value = "";
                $('#customLoginModal').modal('close');
            }
        },

        'click .register': function(){
            $('#customRegisterModal').modal('open');
            $('#customLoginModal').modal('close');
        }
    }),

    Template.customRegister.events({
        //I dont know what you are trying to do with this.
        // 'click button': function(){
        //     const target = event.target;
        //     eventId = target.id;
        //     return eventId;
        // },

        'click .cancel-button': function(){
            //clear the input fields
            registerEmail.value = "";
            registerPassword.value = "";

            //if cancel button is clicked, close the modal
            $('#customRegisterModal').modal('close');
        },

        'click .back-button': function(){
            registerEmail.value = "";
            registerPassword.value = "";

            $('#customRegisterModal').modal('close');
            $('#customLoginModal').modal('open');
        },

        'submit form': function(event, template) {
            event.preventDefault();

            var emailVar = event.target.registerEmail.value;
            var passwordVar = event.target.registerPassword.value;

            Accounts.createUser({
                email: emailVar,
                password: passwordVar
            });

            registerEmail.value = "";
            registerPassword.value = "";
            $('#customRegisterModal').modal('close');
        }
    })
}