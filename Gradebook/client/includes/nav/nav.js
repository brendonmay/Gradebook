import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Courses } from '../../../lib/collections.js';
import { Accounts } from 'meteor/accounts-base';

import '../../main.html';

Template.nav.onRendered(function () {
  this.$("[data-activates=slide-out-l]").sideNav({
    // this.$('.button-collapse').sideNav({
    menuWidth: 200, // Default is 300 // Choose the horizontal origin
    edge: 'left',
  });
});

Template.nav.onCreated(function (){
  $('.dropdown-button').dropdown();
});

Template.nav.events({
  'click .customLoginModal': function () {
    $('#customLoginModal').modal('open');
  },

  // 'click .dropdown-button': function() {
  //   $('.dropdown-button').dropdown('open');
  // },
  
  'click .logout': function () {
    event.preventDefault();
    Meteor.logout();
  }
});

Template.dropdown.onRendered(function () {
  $('.dropdown-button').dropdown();0
});