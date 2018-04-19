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

Template.successfulLoginView.someReactiveVar = new ReactiveVar(false);

Template.successfulLoginView.onRendered(function () {
    //document.getElementById("preloader-main").style = "display: none";
    //document.getElementById("preloader-full").style = "display: none";
    document.getElementById("blurredSideNav").style = "display: none";
    document.getElementById("preloader").style = "display: none";
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
    notOnFreeTrial: function(){
        var user = Meteor.users.findOne({ _id: Meteor.userId() });
        if (user && user.subscribed) {
            return (user.subscribed.type != "free" && user.subscribed.type != "canceled")
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
    expiredPaid: function () {
        return Meteor.users.findOne({ _id: Meteor.userId() }).subscribed.type == "expired"
    },
    lessThanFifteenDays: function (diffDays) {
        return diffDays <= 15
    },
    expiredFree: function () {
        var accountType = Meteor.users.findOne({ _id: Meteor.userId() }).subscribed.type;
        if (accountType == "free") {
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

            return diffDays == 0
        }
        return false
    },
    checkIfSubscribed: function () {
        document.getElementById("blurredSideNav").style = "";
        document.getElementById("preloader").style = "";

        var currentUserObj = Meteor.users.findOne({ _id: Meteor.userId() });
        var currentUser = Meteor.users.findOne({ _id: Meteor.userId() }).subscribed;
        var customerId = currentUser.braintreeId;
        var userId = Meteor.userId();

        //check if user has canceled
        if(currentUser.type == "paid"){
            Meteor.call('checkIfCanceled', customerId, currentUserObj, userId);
        }
        if (currentUser.type == "paid" || currentUser.type == "canceled") {
            //check if they have been autobilled after expiration
            var expirationDate = currentUser.expirationDate;
            var numberOfDaysRemaining = getExpiryDateCheck();
            if (expiredCheck(numberOfDaysRemaining)) {
                Meteor.call('checkIfStillSubscribed', customerId, currentUserObj, userId);
            }
        }
        setTimeout(function () {
            document.getElementById("preloader").style = "display: none";
            document.getElementById("blurredSideNav").style = "display: none";
        }, 2000);
    },
    canceled: function(){
        return Meteor.users.findOne({_id: Meteor.userId()}).subscribed.type == "canceled"
    }
})