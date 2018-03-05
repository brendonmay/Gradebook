import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Courses } from '../../../lib/collections.js';
import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';

import '../../main.html';

Template.nav.onRendered(function () {
  this.$("[data-activates=slide-out-l]").sideNav({
    // this.$('.button-collapse').sideNav({
    menuWidth: 200, // Default is 300 // Choose the horizontal origin
    edge: 'left',
  });

});

Template.nav.helpers({
  currentEmail: function () {
    let account = Meteor.users.findOne({ _id: Meteor.userId() });
    return account.emails[0].address;
  }
});

Template.nav.events({
  'click .loginModal': function () {
    $('#loginModal').modal({
      complete: function () {
        var message = document.getElementById('login-failed');
        message.style.display = "none";
      } // Callback for Modal close
    }
    );
    $('#loginModal').modal('open');
  },

  'click .logout': function () {
    event.preventDefault();
    Meteor.logout();
  },
});
