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

  //after form is submitted, this will update the Users document in the collection to include the newly registered course
    
    //prevent from being submitted into another file
    event.preventDefault();

    //Get input value
    const target = event.target;
    const course = target.courseName.value;
    const year = target.courseYear.value;
    //console.log(year);

    //check if user has ever created a course
    //if user has not created a course,
    if (Courses.findOne({ownerId: Meteor.userId()}) == null) {
      // Courses.insert({
      //   ownerId: Meteor.userId(),
      //   courses:[
      //     {courseId: 1, courseName: course, courseYear: year}
      //   ]
      // });
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
          //console.log("new course id: " + newCourseId)
        });
      
      //insert new course into collection

      //determine courses they currently have
      let currentCourses = Courses.findOne({ownerId: Meteor.userId()}, {_id: 0, ownerId: 0}).courses; //array of course objects
      //console.log("current courses: " + currentCourses);

      //create a new course object to be inserted
      const newCourse = {courseId: newCourseId, courseName: course, courseYear: year};
      //console.log("new course: " + newCourse);

      //create updated array of course objects
      currentCourses[newCourseId - 1] = newCourse;
      //console.log("updated courses" + currentCourses);

      //update document in collection to include the new course
      // Courses.update( //won't work until you change this to a method since its considered insecure, to make it temp. work, query {"_id": "SqfkSQWNpEmjosBia"}
      //   {"ownerId": Meteor.userId()},
      //   {$set:
      //     {"courses": currentCourses}
      //   }
      // );
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
  /* courses:[
    {course: "Math"},
    {course: "Science"},
    {course: "History"}
  ],*/

  courses(){
    return Courses.find({});
  },

});

Template.tabsContent.onRendered(function() {
  this.$('.tabs').tabs();
});

Template.sideNavDropDown.events({
  //event allows the main page to change as you click the side bar
  'click .sections': function(){
    event.preventDefault();

    

    console.log("This works");
  }
});

/*Template.testContent.helpers({
  courses(){
    return Courses.find({});
  },
});*/

