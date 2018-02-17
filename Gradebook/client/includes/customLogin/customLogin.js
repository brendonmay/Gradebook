import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Courses } from '../../../lib/collections.js';
import { CourseWeighting } from '../../../lib/collections.js';
import { Accounts } from 'meteor/accounts-base';

import '../../main.html';

if(Meteor.isClient){
    Template.customLogin.events({
        'submit form': function(event, template) {
            event.preventDefault();
            var emailVar = template.find('#email').value;
            var passwordVar = template.find('#password').value;
            if(emailVar == "" || passwordVar == ""){
                Materialize.toast('Field was left unfilled, please enter an email and password', 2000)
            }
            else{
                Meteor.loginWithPassword(emailVar, passwordVar);
            }
        },

        'click .register': function(){
            $('#customRegisterModal').modal('open');
            $('#customLoginModal').modal('close');
        }
    }),

    Template.customRegister.events({
        'submit form': function(event, template) {
            event.preventDefault();
            var emailVar = event.target.registerEmail.value;
            var passwordVar = event.target.registerPassword.value;
            Accounts.createUser({
                email: emailVar,
                password: passwordVar
            });
        }
    })
}