import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Accounts } from 'meteor/accounts-base';
import jqueryValidation from 'jquery-validation';
import { Meteor } from "meteor/meteor";
import '../../main.html';

Template.verifyEmailModal.helpers({
    getModalText: function() {
        if (Session.get('verifyEmailSuccess')) {
            return "Thank you! Your email has been verified."
        } else {
            return "There was an issue verifying your email. If your account is not already verified, request that a new verification email be sent."
        }

    }
});

Template.verifyEmailModal.onRendered(function () {
    Session.set('verifyEmailModalRendered', true);
});


