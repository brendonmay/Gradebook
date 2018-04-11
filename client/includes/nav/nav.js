import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Courses, CurrentDate } from '../../../lib/collections.js';
import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';
import { Blaze } from 'meteor/blaze';

import '../../main.html';

Template.nav.onRendered(function () {
  this.$("[data-activates=slide-out-l]").sideNav({
    // this.$('.button-collapse').sideNav({
    // menuWidth: 200, // Default is 300 // Choose the horizontal origin
    menuWidth: document.getElementById('side-nav-section').style.width,
    edge: 'left',
  });

});

Template.nav.helpers({
  currentEmail: function () {
    let account = Meteor.users.findOne({ _id: Meteor.userId() });
    return account.emails[0].address;
  },
  turnOffMainLoader: function () {
    if (document.getElementById("preloader-full") != null) {
      document.getElementById("preloader-full").style = "display: none";
    }
  },
  notExpired: function () {
    var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    var currentDate = CurrentDate.findOne();
    var today;
    if (currentDate) {
      today = currentDate.date;
    } else {
      return;
    }
    var expiryDate = Meteor.users.findOne({ _id: Meteor.userId() }).subscribed.expirationDate;

    var diffDays = Math.round((expiryDate.getTime() - today.getTime()) / (oneDay));

    if (diffDays <= 0) {
      return false
    }
    else {
      return true
    }
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

    document.getElementById("preloader-full").style = "";

    var view1 = Blaze.getView(document.getElementById('loginViewId1'));
    Blaze.remove(view1);

    var view2 = Blaze.getView(document.getElementById('loginViewId2'));
    Blaze.remove(view2);

    // var view3 = Blaze.getView(document.getElementById('loginViewId3'));
    // Blaze.remove(view3);

    Blaze.render(Template.nav, document.getElementById('headerForNav'));

    Meteor.logout();
  },
  'click .change-password-dropdown': function () {
    event.preventDefault();
    $('#changePasswordModal').modal({
      dismissable: true,
      complete: function () {
        //
      }
    });
    $('#changePasswordModal').modal('open');
  }
});
