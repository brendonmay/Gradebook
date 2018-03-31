import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Courses } from '../../../lib/collections.js';
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

  // 'click #printPDF': function () {
  //   // Blaze.saveAsPDF(Template.studentReports, {
  //   //   filename: "report.pdf", // optional, default is "document.pdf
  //   //   x: 0, // optional, left starting position on resulting PDF, default is 4 units
  //   //   y: 0, // optional, top starting position on resulting PDF, default is 4 units
  //   //   orientation: "landscape", // optional, "landscape" or "portrait" (default)
  //   //   // format: "letter" // optional, see Page Formats, default is "a4"
  //   // });
  //   return xepOnline.Formatter.Format('studentReportsPrint', {render:'download',filename:'studentReport'});

  // }
});
