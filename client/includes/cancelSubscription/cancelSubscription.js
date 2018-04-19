import { Template } from 'meteor/templating';
import { Accounts } from 'meteor/accounts-base';

import '../../main.html';

Template.cancelSubscription.events({
    'click #cancelSub-yes': function () {
        var customerId = Meteor.users.findOne({ _id: Meteor.userId() }).subscribed.braintreeId;
        Meteor.call('cancelSubscriptionBT', customerId, function(){
            Meteor.call('cancelSubscriptionCollection', customerId);
        });
    }
});