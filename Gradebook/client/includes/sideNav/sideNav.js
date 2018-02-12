import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Courses } from '../../../lib/collections.js';
import { Accounts } from 'meteor/accounts-base';

import '../../main.html';

Template.sideNav.onCreated(function () {
    Session.set('courseIdDisplay', 0);
  });
  
  Template.sideNav.helpers({
    hasNoCourses: function () {
      return Courses.findOne({ ownerId: Meteor.userId() }) == null
    },
  
  });