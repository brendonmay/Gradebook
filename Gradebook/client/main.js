import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Courses } from '../lib/collections.js';
import { Accounts } from 'meteor/accounts-base';

import './main.html';

// Template.addCourse.onCreated(function addCourseOnCreated() {
//  
// });

Template.addCourse.events({
  //type of event is a submit, the element is a form with class add-form, when its called run a function
  'submit .add-form': function(){
    //prevent from being submitted into another file
    event.preventDefault();

    //Get input value
    const target = event.target;
    const course = target.courseName.value;
    const year = target.courseYear.value;
    //const courseId = 3;
    console.log(year);

    //check if user has ever created a course
    //if user has not created a course,
    if (Courses.findOne({ownerId: Meteor.userId()}) == null) {
      Courses.insert({
        ownerId: Meteor.userId(),
        courses:[
          {courseId: 1, courseName: course, courseYear: year}
        ]
      });  
    } 
    else {
      var teacherInfo = Courses.find({ownerId: Meteor.userId()}, {_id: 0, ownerId: 0});
      //determine courseID, previous courseId + 1
      let newCourseId = 0;
      teacherInfo.forEach(
        function(doc){
          const docLength = doc.courses.length;
          const lastCourseId = doc.courses[docLength-1].courseId;
          newCourseId = lastCourseId + 1;
          console.log("new course id: " + newCourseId)
        });
      
      let doesCurrentYearExist = false;
      teacherInfo.forEach(
        function(doc) {
          for (var i = 0; i < doc.courses.length; i++) {
            const entryYear = doc.courses[i].courseYear;
            if (year == entryYear) {
              doesCurrentYearExist = true;
              break;
            }
          }
        });
        if (!doesCurrentYearExist) {
          // Courses.insert({
          //   ownerId: Meteor.userId(),
          //   courses:[
          //     {courseId: newCourseId, courseName: course, courseYear: year}
          //   ]
          // });
        }
        Courses.insert({
          ownerId: Meteor.userId(),
          courses:[
            {courseId: newCourseId, courseName: course, courseYear: year}
          ]
        });
      
      //appending new course to year
    }

  

    //console test
    // const courseSorting = Courses.find({ownerId: Meteor.userId()}, {_id: 0, ownerId: 0, 'courses.courseId':0}).fetch();
    // console.log(courseSorting);
    console.log(Courses.findOne({ownerId: Meteor.userId()}, {_id: 0, ownerId: 0}));

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
  // courses:[
  //   {course: "Math"},
  //   {course: "Science"},
  //   {course: "History"}
  // ],

  courses: function(year){
    //need to put all courses with the courseYear == year into object and return that
    let coursesWithSameYear = [];
    console.log(year);
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
      console.log(coursesWithSameYear);
    return coursesWithSameYear;
  },
  years: function() {
    //gather all the courses and their respective years into 1 object. Making sure object of years is unique
    const teacherInfo = Courses.findOne({ownerId: Meteor.userId()}, {_id: 0, ownerId: 0});

    return teacherInfo.courses;
  }

});

Template.tabsContent.onRendered(function() {
  this.$('.tabs').tabs();
});