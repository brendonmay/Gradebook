import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Courses } from '../../../lib/collections.js';
import { Accounts } from 'meteor/accounts-base';

import '../../main.html';

Template.courseTabs.helpers({
    courseSelected: function () {
      let courseId = Session.get('courseId');
      return courseId != 0;
    },

    hasCourse: function() {
      return Courses.findOne({ownerId: Meteor.userId()}).courses.length != 0;
    },
  });
  