import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Courses } from '../../../lib/collections.js';
import { Accounts } from 'meteor/accounts-base';

import '../../main.html';

Template.sideNav.onCreated(function () {
  Session.set('courseId', 0);
});

Template.sideNav.helpers({
  hasNoCourses: function () {
    return Courses.findOne({ ownerId: Meteor.userId() }) == null
  },
  highlightCorrectCourse: function () {
    var newCourseYear = Session.get('courseYear');
    var currentCourseId = Session.get('courseId');
    if (currentCourseId != 0) {

      document.getElementById("active" + currentCourseId).classList.add("active");
      document.getElementById("active" + currentCourseId).classList.add("green");
      document.getElementById("" + newCourseYear).click();

    }
  }

});