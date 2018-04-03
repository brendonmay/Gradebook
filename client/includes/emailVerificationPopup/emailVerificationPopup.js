import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Accounts } from 'meteor/accounts-base';
import jqueryValidation from 'jquery-validation';
import { Meteor } from "meteor/meteor";
import '../../main.html';

Template.emailVerificationPopup.events({
    'click .cancel-button': function () {
        $('#emailVerificationModal').modal('close');
    },
});