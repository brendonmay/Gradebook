import { Template } from 'meteor/templating';
import { Accounts } from 'meteor/accounts-base';
import { Meteor } from "meteor/meteor";

import '../../main.html';

Template.unsuccessfulPayment.helpers({
    getErrorMessage: function(){
        return Meteor.users.findOne({_id: Meteor.userId()}).subscribed.errorMessage
    }
})