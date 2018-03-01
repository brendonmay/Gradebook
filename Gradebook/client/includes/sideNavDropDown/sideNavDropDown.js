import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Courses } from '../../../lib/collections.js';
import { Accounts } from 'meteor/accounts-base';
import { CourseWeighting } from '../../../lib/collections.js';

import '../../main.html';

function collapseAll() {
    $(".collapsible-header").removeClass(function () {
        return "active";
    });
    $(".collapsible").collapsible({ accordion: true });
    $(".collapsible").collapsible({ accordion: false });
}

Template.sideNavDropDown.onRendered(function () {
    this.$('.collapsible-nav').collapsible();
});

Template.sideNavDropDown.helpers({

    courses: function (year) {
        //need to put all courses with the courseYear == year into object and return that
        let coursesWithSameYear = [];

        const teacherInfo = Courses.find({ ownerId: Meteor.userId() }, { _id: 0, ownerId: 0 });
        teacherInfo.forEach(
            function (doc) {
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

    years: function () {
        //creates an array of courseYear objects, where each courseYear is a unique year from the collection
        //Ex: [{courseYear: "2017-2018"}, {courseYear: "2018-2019"}]

        let uniqueYears = [];
        const teacherInfo = Courses.find({ ownerId: Meteor.userId() }, { _id: 0, ownerId: 0 });
        teacherInfo.forEach(
            function (doc) {
                for (var i = 0; i < doc.courses.length; i++) {
                    var entryYear = doc.courses[i].courseYear;
                    let uniqueYear = true;
                    for (index = 0; index < uniqueYears.length; index++) {
                        if (entryYear == uniqueYears[index].courseYear) {
                            uniqueYear = false;
                            break;
                        }
                    }
                    if (uniqueYear) {
                        var splitYear = entryYear.split("-"); //splits the year so it may be compared
                        for (index = 0; index < uniqueYears.length; index++) {
                            var grabYear = uniqueYears[index].courseYear; //grabs the year to compare with
                            var comparisonYear = grabYear.split("-"); //splits off the first part for comparison
                            if (splitYear[0] > comparisonYear[0]) {
                                /*if the new entry is a more recent year than the old entry it will trade places
                                 with that entry in the array */
                                var newEntryYear = grabYear;
                                uniqueYears[index] = { "courseYear": entryYear }
                                entryYear = newEntryYear;
                                splitYear = entryYear.split("-");
                            }
                        }
                        //otherwise it is inserted as normal
                        uniqueYears[uniqueYears.length] = { "courseYear": entryYear }
                    }
                }
            });

        return uniqueYears;
    },

});

Template.sideNavDropDown.events({
    //event allows the main page to change as you click the side bar
    'click .sections': function () {
        event.preventDefault();

        const target = event.target;
        var courseId = Number(target.id);
        var courseYear = target.name;
        const courseName = target.innerText;
        const categoryWeighting = CourseWeighting.findOne({ ownerId: Meteor.userId(), courseId: courseId }).categoryWeighting;
        var knowledgeWeight = categoryWeighting.K;
        var applicationWeight = categoryWeighting.A;
        var thinkingWeight = categoryWeighting.T;
        var communicationWeight = categoryWeighting.C;
        var courseworkWeight = CourseWeighting.findOne({ ownerId: Meteor.userId(), courseId: courseId }).courseworkWeight;
        var finalWeight = CourseWeighting.findOne({ ownerId: Meteor.userId(), courseId: courseId }).finalWeight;

        //Set Session Variables for Selected Course
        Session.set('courseId', courseId);
        Session.set('courseYear', courseYear);
        Session.set('courseName', courseName);
        Session.set('knowledgeWeight', knowledgeWeight);
        Session.set('applicationWeight', applicationWeight);
        Session.set('thinkingWeight', thinkingWeight);
        Session.set('communicationWeight', communicationWeight);
        Session.set('courseworkWeight', courseworkWeight);
        Session.set('finalWeight', finalWeight);

        collapseAll();

        if (document.getElementById('gradeBookCourseTab')) { //this allows us to navigate back to gradebook page when new course is clicked
            document.getElementById('gradeBookCourseTab').click();
        }
        if (document.getElementById('GS')) {
            document.getElementById('GS').click();
            Session.set('settingScreenText', "General Settings");
        }


    },

    'click .course-dropdown': function () {
        var element = event.target.parentElement; //why do we need to access the parentElement??
        if (!element.classList.contains('active')) {
            var activeElement = document.getElementsByClassName('course-dropdown active green')[0];
            if (activeElement != null) {
                activeElement.classList.remove("active");
                activeElement.classList.remove("green");
                //activeElement.classList.remove("lighten-2");
            }
            element.classList.add("active");
            element.classList.add("green");
            //element.classList.add("lighten-2");
        }
    }

});