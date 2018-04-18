import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Courses } from '../../../lib/collections.js';
import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';

import '../../main.html';

Template.emailDropdown.onRendered(function() {
    $(".dropdown-button").dropdown();
});

Template.emailDropdown.helpers({
    paid: function(){
        return Meteor.users.findOne({_id: Meteor.userId()}).subscribed.type == "paid"
    }
});