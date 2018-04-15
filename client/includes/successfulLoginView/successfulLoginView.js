import { Template } from 'meteor/templating';
import { Meteor } from "meteor/meteor";
import { CurrentDate } from "../../../lib/collections.js"

Template.successfulLoginView.someReactiveVar = new ReactiveVar(false);

Template.successfulLoginView.onRendered(function () {
    //document.getElementById("preloader-main").style = "display: none";
    document.getElementById("preloader-full").style = "display: none";
    $('.slider').slider();
});

Template.successfulLoginView.events({
    'click #subscription-link': function () {
        $('#paymentModalId').modal('open');
    },
    'click .resend-verification-email': function () {
        Meteor.call('resendVerificationEmail', function () {
            $('#emailVerificationModal').modal('open');
        });
    },
    'click #feedbackLinkView': function () {
        $('#feedbackModal').modal({
            complete: function () {
                document.getElementById("email_form").reset();
            }
        });
        $('#feedbackModal').modal('open');
    }
});

Template.successfulLoginView.helpers({
    isNotVerified: function () {
        return Meteor.users.findOne({ _id: Meteor.userId() }).emails[0].verified == false
    },
    onFreeTrial: function () {
        var user = Meteor.users.findOne({ _id: Meteor.userId() });
        if (user && user.subscribed) {
            return user.subscribed.type == "free"
        }
    },
    getExpiryDate: function () {
        var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
        var currentDate = CurrentDate.findOne();
        if (currentDate) {
            today = currentDate.date;
        } else {
            return;
        }
        var expiryDate = Meteor.users.findOne({ _id: Meteor.userId() }).subscribed.expirationDate;

        var diffDays = Math.round((expiryDate.getTime() - today.getTime()) / (oneDay));

        if (diffDays < 0) {
            diffDays = 0
        }

        return diffDays
    },
    expired: function (diffDays) {
        return diffDays <= 0
    },
    lessThanFifteenDays: function (diffDays) {
        return diffDays <= 15
    },
})