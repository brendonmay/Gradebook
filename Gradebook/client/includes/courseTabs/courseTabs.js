import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Courses } from '../../../lib/collections.js';
import { Accounts } from 'meteor/accounts-base';

import '../../main.html';

Template.courseTabs.helpers({
    courseSelected: function () {
      let courseId = Session.get('courseIdDisplay');
      return courseId != 0;
    }
  });
  