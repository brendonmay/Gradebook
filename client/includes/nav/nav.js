import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Courses } from '../../../lib/collections.js';
import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';
import { Blaze } from 'meteor/blaze';

import '../../main.html';

/*START*/

// $( document ).ready(function(){
//   this.$('.button-collapse').sideNav({
//     closeOnClick: true
//     menuWith
//   });
// })

$( document ).ready(function() {
  $("[data-activates=slide-out-l]").sideNav();
});

Template.nav.onRendered(function () {
  this.$("[data-activates=slide-out-l]").sideNav({
    menuWidth: document.getElementById('side-nav-section').style.width,
    edge: 'left',
    closeOnClick: true
  });
});
/*END*/

Template.nav.helpers({
  currentEmail: function () {
    let account = Meteor.users.findOne({ _id: Meteor.userId() });
    return account.emails[0].address;
  },
  turnOffMainLoader: function() {
    if (document.getElementById("preloader") != null) {
      document.getElementById("preloader").style = "display: none";
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

    var view1 = Blaze.getView(document.getElementById('loginViewId1'));
    Blaze.remove(view1);
    var view2 = Blaze.getView(document.getElementById('loginViewId2'));
    Blaze.remove(view2);

    Blaze.render(Template.nav, document.getElementById('headerForNav'));

    Meteor.logout();
  },

  'click .sideNavButton': function () {
    $('.button-collapse').sideNav('show');
  }
});
