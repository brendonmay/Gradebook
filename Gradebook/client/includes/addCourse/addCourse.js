import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Courses } from '../../../lib/collections.js';
import { CourseWeighting } from '../../../lib/collections.js';
import { Accounts } from 'meteor/accounts-base';
import { Assessments } from '../../../lib/collections.js';

import '../../main.html';

function closeAddCourseModal() {
    document.getElementById("addCourseModalForm").reset();
}

Template.addCourse.events({
    //type of event is a submit, the element is a form with class add-form, when its called run a function
    'submit .add-form': function () {

        //after form is submitted, this will update the Users document in the collection to include the newly registered course

        //prevent from being submitted into another file
        event.preventDefault();

        //Get input value
        const target = event.target;
        const course = target.courseName.value;
        const year = document.getElementById("courseYear").value;

        //check that courseName <= 20 characters
        if (course.length > 15) {
            //console.log("courseName too long. Try again.")
        }
        else {
            //check if user has ever created a course
            //if user has not created a course,

            if (Courses.findOne({ ownerId: Meteor.userId() }) == null) {
                Meteor.call('courses.createFirstCourse', course, year);
            }
            else {
                var teacherInfo = Courses.find({ ownerId: Meteor.userId() }, { _id: 0, ownerId: 0 });
                //first determine courseID, previous courseId + 1
                let newCourseId = 0;
                teacherInfo.forEach(
                    function (doc) {
                        const docLength = doc.courses.length;
                        const lastCourseId = doc.courses[docLength - 1].courseId;
                        newCourseId = lastCourseId + 1;
                    });

                //insert new course into collection

                //determine courses they currently have
                let currentCourses = Courses.findOne({ ownerId: Meteor.userId() }, { _id: 0, ownerId: 0 }).courses; //array of course objects    

                //create a new course object to be inserted
                const newCourse = { courseId: newCourseId, courseName: course, courseYear: year };

                //create updated array of course objects
                currentCourses[newCourseId - 1] = newCourse;

                for (var i = 0; i < currentCourses.length; i++) { //error checking for null value
                    if (currentCourses[i] == null) {
                        currentCourses.splice(i, 1);
                        i--;
                    }
                }
                Meteor.call('courses.addNewCourse', currentCourses);
                Meteor.call('courseInformation.defaultSettings', newCourseId);
            }

            //Clear form
            target.courseName.value = "";

            //Close Modal
            $('#addModal').modal('close');
        }
    },
    'click #addCourseCancel': function() {
        $('addCourseModal').modal('close');
    }

});

Template.addCourse.helpers({
    getYear: function () {
        //return yearList = [{year: "2017-2018"}, {year:"2018-2019"}];
        currentYear = new Date().getFullYear();
        option1 = (Number(currentYear) - 1) + "-" + currentYear;
        option2 = currentYear + "-" + (Number(currentYear) + 1);
        option3 = (Number(currentYear) + 1) + "-" + (Number(currentYear) + 2);
        yearlist = [{ year: option1 }, { year: option2 }, { year: option3 }];
        return yearlist
    }
});

Template.addCourse.onRendered(function () {
    $(document).ready(function () {
        $('input#addCourseNameModal, textarea#textarea1').characterCounter();
    });
    $('.addCourseModal').modal({
        dismissible: true, 
        complete: function() { 
            closeAddCourseModal();
        } 
      }
    );
});
