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
            Meteor.loginWithPassword(emailVar, passwordVar);
        },

        'click .register': function(){
            $('#customRegisterModal').modal('open');
            $('#customLoginModal').modal('close');
        }
    });
}