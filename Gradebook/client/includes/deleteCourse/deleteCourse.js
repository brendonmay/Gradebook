import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Courses } from '../../../lib/collections.js';
import { Accounts } from 'meteor/accounts-base';

import '../../main.html';

Template.deleteCourse.helpers({
    CurrentCourseName: function () {
        return Session.get('courseName');
    }
});

Template.deleteCourse.events({
    'click .yes-delete-modal': function () {
        const currentCourseId = Session.get('courseId');

        var courseInfo = Courses.find({ ownerId: Meteor.userId() }, { _id: 0, ownerId: 0 });
        var courseObj = [];

        courseInfo.forEach(
            function (doc) {
                const docLength = doc.courses.length;
                let courses = doc.courses;
                for (var i = 0; i < docLength; i++) {
                    if (courses[i].courseId == currentCourseId) { }
                    else {
                        courseObj.push(courses[i]);
                    }
                }
            }
        );
        Session.set('courseName', "");
        Session.set('courseYear', "");
        Session.set('courseId', 0);
        Session.set('knowledgeWeight', "");
        Session.set('applicationWeight', "");
        Session.set('thinkingWeight', "");
        Session.set('communicationWeight', "");
        Session.set('courseworkWeight', "");
        Session.set('finalWeight', "");

        let activeElement = document.getElementById(currentCourseId);
        activeElement.classList.remove("active");
        activeElement.classList.remove("green");

        let activeElements = document.getElementsByClassName("course-dropdown");
        console.log(activeElements);
        for(i = 0; i < activeElements.length; i++){
            if(activeElements[i].classList.contains("active")){
                activeElements[i].classList.remove("active");
                activeElements[i].classList.remove("green");
                break
            }
        }


        Meteor.call('courses.deleteCourse', currentCourseId, courseObj);

    },
});