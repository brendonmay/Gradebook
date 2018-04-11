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
        return Meteor.users.findOne({ _id: Meteor.userId() }).subscribed.type == "free"
    },
    getExpiryDate: function () {
        var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
        var currentDate = CurrentDate.findOne();
        var today = currentDate.date;
        var expiryDate = Meteor.users.findOne({ _id: Meteor.userId() }).subscribed.expirationDate;

        var diffDays = Math.round((expiryDate.getTime() - today.getTime()) / (oneDay));

        if ( diffDays < 0){
            diffDays = 0
        }

        return diffDays
    },
    lessThanFifteenDays: function(diffDays){
        return diffDays <= 15
    },
});

Template.successfulLoginNoCourseView.events({
    'click #subscription-link': function () {
        $('#paymentModalId').modal('open');
    }
});