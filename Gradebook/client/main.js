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
    const courseId = 3;
    //const id = i where i = 0
    console.log(year);

    //check if user has ever created a course
    //if user has not created a course,
    if (Courses.findOne({ownerId: Meteor.userId()}) == null) {
      Courses.insert({
        ownerId: Meteor.userId(),
        courses:[
          {courseId: 1, courseName: course, courseYear: year} //change courseId so that it increases by 1 each time.
        ]
      });  
    } 
    else {
      //determine courseID, previous courseId + 1
      let newCourseId = 0;
      Courses.find(
        {ownerId: Meteor.userId()},
        {_id: 0, ownerId: 0}).forEach(
          function(doc){
            const docLength = doc.courses.length;
            const lastCourseId = doc.courses[docLength-1].courseId;
            newCourseId = lastCourseId + 1;
            console.log("new course id: " + newCourseId)
          }
        );

      //check if course year exists
        //create new dropdown
      
      //add to dropdown 
    }

  

    //console test
    const courseSorting = Courses.find({ownerId: Meteor.userId()}, {_id: 0, ownerId: 0, 'courses.courseId':0}).fetch();
    console.log(courseSorting);

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
    //const courseSorting = Courses.find({ownerId: Meteor.userId});
  
  },

});

Template.tabsContent.onRendered(function() {
  this.$('.tabs').tabs();
});