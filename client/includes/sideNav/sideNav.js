import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Courses } from '../../../lib/collections.js';
import { Accounts } from 'meteor/accounts-base';
import { CurrentDate } from '../../../lib/collections.js';

import '../../main.html';

function removeAllActiveAndGreen() {
  var allCoursesInDropdown = document.getElementsByClassName('course-dropdown');
  if (allCoursesInDropdown) {
    for (var i = 0; i < allCoursesInDropdown.length; i++) {
      var course = allCoursesInDropdown[i];
      if (course.classList.contains("active")) {
        course.classList.remove("active");
      }
      if (course.classList.contains("green")) {
        course.classList.remove("green");
      }
    }
  }
}

Template.sideNav.onCreated(function () {
  Session.set('courseId', 0);
});

Template.sideNav.helpers({
  hasNoCourses: function () {
    return Courses.findOne({ ownerId: Meteor.userId() }) == null
  },
  expired: function () {
    var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    var currentDate = CurrentDate.findOne();
    if (currentDate) {
      today = currentDate.date;
    } else {
      return;
    }
    var expiryDate = Meteor.users.findOne({ _id: Meteor.userId() }).subscribed.expirationDate;

    var diffDays = Math.round((expiryDate.getTime() - today.getTime()) / (oneDay));

    if (diffDays <= 0) {
      return true
    }
    else {
      return false
    }
  }

});

Template.sideNav.events({
  "click #purchSubsc": function () {
    $('#paymentModalId').modal('open');
  }
})