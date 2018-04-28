import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Accounts } from 'meteor/accounts-base';
import jqueryValidation from 'jquery-validation';
import { Meteor } from "meteor/meteor";
import '../../main.html';

var transactionFailed = "initialLoad";

Template.successfulPayment.helpers({
    getModalHeaderText: function () {
        var newPayment = Session.get('newPayment');
        var user = Meteor.users.findOne({ _id: Meteor.userId() });
        if (user) {
            transactionFailed = Meteor.users.findOne({ _id: Meteor.userId() }).subscribed.transactionFailed;

            Tracker.nonreactive(function () {
                Session.set('newPayment', null);
            });
        }
        if (transactionFailed == "false") {
            transactionFailed = "initialLoad";
            return "Payment Successful";
        } else if (transactionFailed == "true") {
            transactionFailed = "initialLoad";
            return "Payment Unsuccessful"
        } else {
            return "Processing Payment.....";
        } 
    },
    getModalBodyText: function () {
        var newPayment = Session.get('newPayment');
        var user = Meteor.users.findOne({ _id: Meteor.userId() });
        if (user) {
            transactionFailed = Meteor.users.findOne({ _id: Meteor.userId() }).subscribed.transactionFailed;

            Tracker.nonreactive(function () {
                Session.set('newPayment', null);
            });
        }
        if (transactionFailed == "false") {
            transactionFailed = "initialLoad";
            return "You have successful subscribed to Ontario Gradebook! If you have any feedback or comments, please leave them by clicking the provided link in the website's footer.";
        } else if (transactionFailed == "true") {
            transactionFailed = "initialLoad";
            return "Unfortunately, your transaction did not go through. Your credit card provider has provided the following reason: " + errorMessageClass() + " Please contact your credit card provider or try again with a different card."
        } else {
            return "This will just take a moment";
        } 
    },

});

Template.successfulPayment.onCreated(function () {
});

function errorMessageClass() {
    return Meteor.users.findOne({ _id: Meteor.userId() }).subscribed.errorMessage;
}


