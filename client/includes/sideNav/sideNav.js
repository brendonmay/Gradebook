import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Courses } from '../../../lib/collections.js';
import { Accounts } from 'meteor/accounts-base';

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
  // highlightCorrectCourse: function () {
  //   var newCourseYear = Session.get('courseYear');
  //   var currentCourseId = Session.get('courseId');

  //   if (currentCourseId != 0 && document.getElementById("sideNav" + currentCourseId)) {
  //     var currentSideNavCourse = document.getElementById("sideNav" + currentCourseId);
  //     currentSideNavCourse.classList.add("active");
  //     currentSideNavCourse.classList.add("green");
  //   }
  //   // document.getElementById("" + newCourseYear).click();
  // }

});