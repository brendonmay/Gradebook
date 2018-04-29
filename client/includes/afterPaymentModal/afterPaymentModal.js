import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Accounts } from 'meteor/accounts-base';
import jqueryValidation from 'jquery-validation';
import { Meteor } from "meteor/meteor";
import '../../main.html';

var transactionFailed = "initialLoad";

function closePreloader() {
    document.getElementById("blurredSideNav").style = "display: none";
    document.getElementById("preloader").style = "display: none";
}

Template.afterPaymentModal.helpers({
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
            closePreloader();
            return "Payment Successful";
        } else if (transactionFailed == "true") {
            closePreloader();
            transactionFailed = "initialLoad";
            return "Payment Unsuccessful"
        } else {
            return "Processing Payment.....";
        } 
    },
    getModalBodyTextOne: function () {
        var newPayment = Session.get('newPayment');
        var user = Meteor.users.findOne({ _id: Meteor.userId() });
        if (user) {
            transactionFailed = Meteor.users.findOne({ _id: Meteor.userId() }).subscribed.transactionFailed;

            Tracker.nonreactive(function () {
                Session.set('newPayment', null);
            });
        }
        if (transactionFailed == "false") {
            Template.instance().showCloseButton.set(true);
            return "You have successful subscribed to Ontario Gradebook! If you have any feedback or comments, please leave them by clicking the provided link in the website's footer.";
        } else if (transactionFailed == "true") {
            Template.instance().showCloseButton.set(true);
            return "Unfortunately, your transaction did not go through. Your credit card provider has provided the following reason: ";
        } else {
            Template.instance().showCloseButton.set(false);
            return "This will just take a moment";
        } 
    },
    getModalBodyTextTwo: function () {
        var newPayment = Session.get('newPayment');
        var user = Meteor.users.findOne({ _id: Meteor.userId() });
        if (user) {
            transactionFailed = Meteor.users.findOne({ _id: Meteor.userId() }).subscribed.transactionFailed;

            Tracker.nonreactive(function () {
                Session.set('newPayment', null);
            });
        }
        if (transactionFailed == "true") {
            Template.instance().showCloseButton.set(true);
            return errorMessageClass()
        } 
          
    },
    getModalBodyTextThree: function () {
        var newPayment = Session.get('newPayment');
        var user = Meteor.users.findOne({ _id: Meteor.userId() });
        if (user) {
            transactionFailed = Meteor.users.findOne({ _id: Meteor.userId() }).subscribed.transactionFailed;

            Tracker.nonreactive(function () {
                Session.set('newPayment', null);
            });
        }
        if (transactionFailed == "true") {
            Template.instance().showCloseButton.set(true);
            return ". Please contact your credit card provider or try again with a different card."
        }
    },
    showCloseButton: function() {
        return Template.instance().showCloseButton.get();
    }

});

Template.afterPaymentModal.onCreated(function () {
    this.showCloseButton = new ReactiveVar(false);
});

function errorMessageClass() {
    return Meteor.users.findOne({ _id: Meteor.userId() }).subscribed.errorMessage;
}


