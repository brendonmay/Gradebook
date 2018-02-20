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
        'click button': function(){
            const target = event.target;
            eventId = target.id;
            return eventId;
        },

        'submit form': function(event, template) {
            event.preventDefault();
            var emailVar = event.target.registerEmail.value;
            var passwordVar = event.target.registerPassword.value;
            var buttonName = event.target.name;
            console.log(event.target);

            // if(registerTarget.id = "back"){
            //     console.log("back was pressed");
            //     registerTarget.registerEmail.value = "";
            //     registerTarget.registerPassword.value = "";
            //     $('#customRegisterModal').modal('close');
            // }
            // else if (registerTarget.id = "cancel-registration"){
            //     console.log("cancel was pressed");
            //     registerTarget.registerEmail.value = "";
            //     registerTarget.registerPassword.value = "";
            //     $('#customRegisterModal').modal('close');
            //     $('#customLoginModal').modal('open');
            // }
            // else if(registerTarget.id = "register"){
            //     console.log("submit was pressed");
            //     //document.getElementById("register").type = email;
            //     console.log(registerTarget.type);
            //     // Accounts.createUser({
            //     //     email: emailVar,
            //     //     password: passwordVar
            //     // });
            //     $('#customRegisterModal').modal('close');
            // }
        }
    })
}