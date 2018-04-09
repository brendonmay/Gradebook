import { Template } from 'meteor/templating';
import { Meteor } from "meteor/meteor";
import { CurrentDate } from "../../../lib/collections.js"

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
        // return Meteor.users.findOne({ _id: Meteor.userId() }).subscribed[0].type == "free"
        return false
    },
    getExpiryDate: function () {
        var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
        var currentDate = CurrentDate.findOne();
        var today = currentDate.date;
        console.log("today: " + today);
        var expiryDate = new Date(2018, 04, 11); //expiration Date (YYYY/MM/DD) where Jan = 00, Dec = 11. i.e month = month number-1
        console.log("expiry: " + expiryDate);

        var diffDays = Math.round(Math.abs((today.getTime() - expiryDate.getTime()) / (oneDay)));

        return diffDays
    },
    lessThanFifteenDays: function(diffDays){
        return diffDays <= 15
    },
});

Template.successfulLoginNoCourseView.events({
    'click #subscription-link': function () {
        console.log("clicked");
        $('#paymentModalId').modal('open');
    }
});