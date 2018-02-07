import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Courses } from '../lib/collections.js';
import { Accounts } from 'meteor/accounts-base';

import './main.html';

Template.addCourse.onCreated(function addCourseOnCreated() {
  // counter starts at 0
  let counter = 0;
});

Template.addCourse.events({
  //type of event is a submit, the element is a form with class add-form, when its called run a function
  'submit .add-form': function(){
    //prevent from being submitted into another file
    event.preventDefault();

    //Get input value
    const target = event.target;
    const course = target.courseName.value;
    const year = target.courseYear.value;
    console.log(year);

    //check if user has ever created a course
    if (Courses.find({owner: Meteor.userId}) == null)


    //if user has created a course, insert course into their object in Mongo

    //if user has not created a course, 

    //Generate unique courseId


    //insert course and year into collection Courses
    Courses.insert({
      ownerId: Meteor.userId(),
      courses:[
        {courseId: 1, courseName: course, courseYear: year} //change courseId so that it increases by 1 each time.
      ]
    });

    //Clear form
    target.courseName.value="";
    target.courseYear.value="";

    //Close Modal
    $('#addModal').modal('close');
  }

});

Template.sideNavDropDown.onRendered(function() {
  this.$('.collapsible').collapsible();
});

Template.sideNavDropDown.helpers({
  // courses:[
  //   {course: "Math"},
  //   {course: "Science"},
  //   {course: "History"}
  // ],

  courses(){
    return Courses.find({});
  },

});

Template.tabsContent.onRendered(function() {
  this.$('.tabs').tabs();
});
