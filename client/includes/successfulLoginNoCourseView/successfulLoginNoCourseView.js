import { Template } from 'meteor/templating';
import { Meteor } from "meteor/meteor";
import { CurrentDate } from "../../../lib/collections.js"

function getExpiryDateCheck() {
    var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    var currentDate = CurrentDate.findOne();
    if (currentDate) {
        today = currentDate.date;
    } else {
        return;
    }
    var expiryDate = Meteor.users.findOne({ _id: Meteor.userId() }).subscribed.expirationDate;

    var diffDays = Math.round((expiryDate.getTime() - today.getTime()) / (oneDay));

    return diffDays
}

function expiredCheck(diffDays) {
    return diffDays <= -1
}

Template.successfulLoginNoCourseView.onRendered(function () {
    //document.getElementById("preloader-main").style = "display: none";
    document.getElementById("preloader-full").style = "display: none";
    $('.slider').slider();
});

Template.successfulLoginNoCourseView.helpers({
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
    lessThanFifteenDays: function (diffDays) {
        return diffDays <= 15
    },
    expired: function (diffDays) {
        return diffDays <= 0
    },
    expiredPaid: function () {
        return Meteor.users.findOne({ _id: Meteor.userId() }).subscribed.type == "expired"
    },
    checkIfSubscribed: function () {
        document.getElementById("blurredSideNav").style = "";
        document.getElementById("preloader").style = "";
        var currentUser = Meteor.users.findOne({ _id: Meteor.userId() }).subscribed;
        if (currentUser.type == "paid") {
            var expirationDate = currentUser.expirationDate;
            var numberOfDaysRemaining = getExpiryDateCheck();
            if (expiredCheck(numberOfDaysRemaining)) {
                var customerId = currentUser.braintreeId;
                var currentUser = Meteor.users.findOne({ _id: Meteor.userId() })
                var userId = Meteor.userId();
                Meteor.call('checkIfStillSubscribed', customerId, currentUser, userId);
            }
        }
        setTimeout(function(){
            document.getElementById("preloader").style = "display: none";
            document.getElementById("blurredSideNav").style = "display: none";
        }, 2000);
    },
});

Template.successfulLoginNoCourseView.events({
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