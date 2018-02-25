import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Courses } from '../../../lib/collections.js';
import { Accounts } from 'meteor/accounts-base';

import '../../main.html';

Template.generalSettingsTab.helpers({
    currentCourse: function () {
        return Session.get('courseName');
    },

    currentYear: function () {
        return Session.get('courseYear');
    },

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

Template.generalSettingsTab.events({
    'click .edit-general-settings': function () {
        let editButtonElement = document.getElementById("generalSettings-EditButton");
        let saveButtonElement = document.getElementById("generalSettings-SaveButton");
        let cancelButtonElement = document.getElementById("generalSettings-CancelButton");
        let courseName = document.getElementById("generalSettings-courseName");
        let courseYear = document.getElementById("generalSettings-courseYear");

        console.log("before: " + courseYear.disabled);
        editButtonElement.classList.add("hide");
        saveButtonElement.classList.remove("hide");
        cancelButtonElement.classList.remove("hide");
        courseName.disabled = false;
        courseYear.disabled = false;
        console.log("after: " + courseYear.disabled);

    },
    'submit .generalSettingsForm': function () {
        let saveButtonElement = document.getElementById("generalSettings-SaveButton");
        let editButtonElement = document.getElementById("generalSettings-EditButton");
        let cancelButtonElement = document.getElementById("generalSettings-CancelButton");
        editButtonElement.classList.remove("hide");
        saveButtonElement.classList.add("hide");
        cancelButtonElement.classList.add("hide");

        let newCourseName = document.getElementById("generalSettings-courseName").value;
        let newCourseYear = document.getElementById("generalSettings-courseYear").value;

        let courseName = document.getElementById("generalSettings-courseName");
        let courseYear = document.getElementById("generalSettings-courseYear");
        courseName.disabled = true;
        courseYear.disabled = true;

        const currentCourseId = Session.get('courseId');

        var courseInfo = Courses.find({ ownerId: Meteor.userId() }, { _id: 0, ownerId: 0 });
        var courseObj = [];

        courseInfo.forEach(
            function (doc) {
                const docLength = doc.courses.length;
                let courses = doc.courses;
                for (var i = 0; i < docLength; i++) {
                    if (courses[i].courseId == currentCourseId) {
                        const newCourseInfo = {
                            courseId: currentCourseId,
                            courseName: newCourseName,
                            courseYear: newCourseYear
                        };
                        courseObj.push(newCourseInfo);
                    }
                    else {
                        courseObj.push(courses[i]);
                    }
                }
            }
        );
        Session.set('courseName', newCourseName);
        Session.set('courseYear', newCourseYear);

        Meteor.call('courses.updateCourseNameAndYear', currentCourseId, courseObj);
    },
    'click .cancel-general-settings': function () {

        let editButtonElement = document.getElementById("generalSettings-EditButton");
        let saveButtonElement = document.getElementById("generalSettings-SaveButton");
        let cancelButtonElement = document.getElementById("generalSettings-CancelButton");
        let courseName = document.getElementById("generalSettings-courseName");
        let courseYear = document.getElementById("generalSettings-courseYear");

        courseName.value = Session.get('courseName');
        courseYear.value = Session.get('courseYear');

        editButtonElement.classList.remove("hide");
        saveButtonElement.classList.add("hide");
        cancelButtonElement.classList.add("hide");

        courseName.disabled = true;
        courseYear.disabled = true;
    },
});