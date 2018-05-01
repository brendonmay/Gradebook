import { Template } from 'meteor/templating';
import { Accounts } from 'meteor/accounts-base';

import '../../main.html';
import { CurrentDate } from '../../../lib/collections';

Template.cancelSubscription.events({
    'click #cancelSub-yes': function () {
        var customerId = Meteor.users.findOne({ _id: Meteor.userId() }).subscribed.braintreeId;
        Meteor.call('cancelSubscriptionBT', customerId, function(){
            Meteor.call('cancelSubscriptionCollection', customerId);
        });
    }
});

Template.cancelSubscription.helpers({
    canCancel: function(){
        var oneDay = 24*60*60*1000;
        var dateOfPurchase = Meteor.users.findOne({_id: Meteor.userId()}).subscribed.dateOfPurchase;
        var currentDate = CurrentDate.findOne({}).date;
        var diffDays = Math.round(Math.abs((currentDate.getTime() - dateOfPurchase.getTime())/(oneDay)));
        return diffDays >= 7
    },
    cancelationDate: function(){
        Date.prototype.addDays = function(days) {
            var dat = new Date(this.valueOf());
            dat.setDate(dat.getDate() + days);
            return dat;
        }
        var dateOfPurchase = Meteor.users.findOne({_id: Meteor.userId()}).subscribed.dateOfPurchase;
        var cancelationDate = dateOfPurchase.addDays(7);
        return cancelationDate.toDateString()
    }
});