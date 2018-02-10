import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Courses } from '../lib/collections.js';
import { Accounts } from 'meteor/accounts-base';

import './main.html';


Template.addCourse.events({
  //type of event is a submit, the element is a form with class add-form, when its called run a function
  'submit .add-form': function(){

  //after form is submitted, this will update the Users document in the collection to include the newly registered course
    
    //prevent from being submitted into another file
    event.preventDefault();

    //Get input value
    const target = event.target;
    const course = target.courseName.value;
    const year = target.courseYear.value;

    //check if user has ever created a course
    //if user has not created a course,
    if (Courses.findOne({ownerId: Meteor.userId()}) == null) {
      Meteor.call('courses.createFirstCourse', course, year);  
    } 
    else {
      var teacherInfo = Courses.find({ownerId: Meteor.userId()}, {_id: 0, ownerId: 0});
      //first determine courseID, previous courseId + 1
      let newCourseId = 0;
      teacherInfo.forEach(
        function(doc){
          const docLength = doc.courses.length;
          const lastCourseId = doc.courses[docLength-1].courseId;
          newCourseId = lastCourseId + 1;
        });
      
      //insert new course into collection

      //determine courses they currently have
      let currentCourses = Courses.findOne({ownerId: Meteor.userId()}, {_id: 0, ownerId: 0}).courses; //array of course objects

      //create a new course object to be inserted
      const newCourse = {courseId: newCourseId, courseName: course, courseYear: year};

      //create updated array of course objects
      currentCourses[newCourseId - 1] = newCourse;

      Meteor.call('courses.updateCourses', currentCourses);
    }

    //Clear form
    target.courseName.value="";
    target.courseYear.value="";

    //Close Modal
    $('#addModal').modal('close');
  }

});

Template.sideNav.helpers({
  hasNoCourses: function(){
    return Courses.findOne({ownerId: Meteor.userId()}) == null
  },

});

Template.sideNavDropDown.onRendered(function() {
  this.$('.collapsible').collapsible();
});

Template.sideNavDropDown.helpers({

  courses: function(year){
    //need to put all courses with the courseYear == year into object and return that
    let coursesWithSameYear = [];

    const teacherInfo = Courses.find({ownerId: Meteor.userId()}, {_id: 0, ownerId: 0});
    teacherInfo.forEach(
      function(doc) {
        let index = 0;
        for (var i = 0; i < doc.courses.length; i++) {
          const entryYear = doc.courses[i].courseYear;
          if (year == entryYear) {
            coursesWithSameYear[index] = doc.courses[i];
            index++;
          }
        }
      });
    return coursesWithSameYear;
  },

  years: function() {
    //creates an array of courseYear objects, where each courseYear is a unique year from the collection
    //Ex: [{courseYear: "2017-2018"}, {courseYear: "2018-2019"}]

    let uniqueYears = [];
    const teacherInfo = Courses.find({ownerId: Meteor.userId()}, {_id: 0, ownerId: 0});
    teacherInfo.forEach(
      function(doc) {
        for (var i = 0; i < doc.courses.length; i++) {
          const entryYear = doc.courses[i].courseYear;
          let counter = 0;
          for (index = 0; index < uniqueYears.length; index++){
            if (entryYear != uniqueYears[index].courseYear){
              counter++;
            }
          }
          if (counter == uniqueYears.length){
            uniqueYears[uniqueYears.length]={"courseYear": entryYear}
          }
        }
      });
    return uniqueYears;
  },

});

Template.tabsContent.onRendered(function() {
  this.$('.tabs').tabs();
});

Template.tabsContent.onRendered(function() {
  this.$('.tabs').tabs();
});

Template.sideNavDropDown.events({
  //event allows the main page to change as you click the side bar
  'click .sections': function(){
    event.preventDefault();

    const target = event.target;
    var courseId = target.id;

    Session.set('courseIdDisplay', courseId);
    //Use Session.get('courseIdDisplay'); to grab the courseId from sessions

  }
});

Template.testContent.helpers({
  display: function(){
    return Session.get('courseIdDisplay');
  }
});


