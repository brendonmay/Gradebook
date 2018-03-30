import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Courses } from '../../../lib/collections.js';
import { Accounts } from 'meteor/accounts-base';
import { CourseWeighting } from '../../../lib/collections.js';
import { Students } from '../../../lib/collections.js';

import '../../main.html';

function collapseAll() {
    $(".collapsible-header").removeClass(function () {
        return "active";
    });
    $(".collapsible").collapsible({ accordion: true });
    $(".collapsible").collapsible({ accordion: false });
}

function arrayOfStudentIds() {
    var arrayofStudentIds = [];
    var ownerId = Meteor.userId();
    var courseId = Session.get("courseId");
    var students = Students.findOne({ ownerId, courseId }).students;
    for (i = 0; i < students.length; i++) {
        arrayofStudentIds[arrayofStudentIds.length] = students[i].studentId
    }
    return arrayofStudentIds
};

function findOldStudentGradeValue(studentId, assessmentId, category, ownerId, courseId) {
    var students = Students.findOne({ ownerId: ownerId, courseId: courseId }).students;
    var oldValue = 0;
    for (j = 0; j < students.length; j++) {
        if (students[j].studentId == studentId) {
            var grades = students[j].grades;
            for (k = 0; k < grades.length; k++) {
                if (grades[k].assessmentId == assessmentId) {
                    oldValue = grades[k][category];
                    k = grades.length;
                    j = students.length;
                }
            }
        }
    }
    return oldValue
}

function sectionsClickEvent() {
    return new Promise(function (resolve, reject) {
        event.preventDefault();

        const target = event.target;
        var courseId = Number(target.id);

        if (Number(courseId) != Number(Session.get('courseId'))) {
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
            Session.set('currentSelectedStudentID', '0');
            Session.set('gradebookUpdated', true);

            collapseAll();
        }
        if (document.getElementById('gradeBookCourseTab')) { //this allows us to navigate back to gradebook page when new course is clicked
            document.getElementById('gradeBookCourseTab').click();
        }
        if (document.getElementById('GSClick')) {
            document.getElementById('GSClick').click();
            Session.set('settingScreenText', "General Settings");
        }
        resolve();
    })
}

function updateGradebookColors() {
    var categoryCells = document.getElementsByClassName("categoryCell");
    var arrayofStudentIds = arrayOfStudentIds();
    var courseId = Session.get('courseId');

    for (i = 0; i < categoryCells.length; i++) {
        var id = categoryCells[i].id;
        var category = id[0];
        var assessmentId = id.slice(id.indexOf("#") + 1, id.indexOf("%"));
        var categoryValue = id.slice(id.indexOf("%") + 1, id.length);

        if (categoryValue == "-") { //turns disabled ones grey
            categoryCells[i].style = "background-color: #9e9e9e";

            for (z = 0; z < arrayofStudentIds.length; z++) {
                if (category == "C") {
                    var studentId = arrayofStudentIds[z];
                    if (studentId != "s-0") {
                        document.getElementById(category + "?" + studentId + "#" + assessmentId).parentElement.style = "background-color: #9e9e9e; border-right: 1px solid black";
                        document.getElementById(category + "?" + studentId + "#" + assessmentId).disabled = "true";
                        document.getElementById(category + "?" + studentId + "#" + assessmentId).value = "N/A";
                    }
                }
                else {
                    var studentId = arrayofStudentIds[z];
                    if (studentId != "s-0") {
                        document.getElementById(category + "?" + studentId + "#" + assessmentId).parentElement.style = "background-color: #9e9e9e";
                        document.getElementById(category + "?" + studentId + "#" + assessmentId).disabled = "true";
                        document.getElementById(category + "?" + studentId + "#" + assessmentId).value = "N/A";
                    }
                }
            }
        }
        if (categoryValue != "-") { //adds color to enabled ones; work here
            categoryCells[i].style = "";

            for (z = 0; z < arrayofStudentIds.length; z++) {
                var studentId = arrayofStudentIds[z];
                if (studentId != "s-0") {
                    document.getElementById(category + "?" + studentId + "#" + assessmentId).parentElement.style = "";
                    document.getElementById(category + "?" + studentId + "#" + assessmentId).removeAttribute("disabled");
                    var oldValue = findOldStudentGradeValue(studentId, assessmentId, category, Meteor.userId(), courseId);
                    document.getElementById(category + "?" + studentId + "#" + assessmentId).value = oldValue;
                    if (category == "C") {
                        document.getElementById(category + "?" + studentId + "#" + assessmentId).parentElement.style = "border-right: 1px solid black";
                    }
                }
            }
        }
    }
};

function updateColorsInGradebook() {
    return new Promise(function (resolve, reject) {
        updateGradebookColors();
        resolve();
    })
}

function updateTableHeadFixer() {
    return new Promise(function (resolve, reject) {
        $("#main_table").tableHeadFixer({ "left": 1, 'head': true })
        resolve();
    })
}

function sectionsClickEventComplete() {
    sectionsClickEvent().then(function () {
        if (Session.get('gradebookUpdated') == true) {
            document.getElementById("preloader").style = "";
            // setTimeout(function () {
            //     updateColorsInGradebook().then(function () {
            //         updateTableHeadFixer();
            //     });
            //     document.getElementById("preloader").style = "display: none";
            //     Session.set('gradebookUpdated', false);
            // }, 1000);
            if (document.getElementById('gradeBookChartId')){
                var view = Blaze.getView(document.getElementById('gradeBookChartId'));
                Blaze.remove(view);
                Blaze.render(Template.gradeBookChart, document.getElementById('gradeBookChartHolder'));
            }
        }
    })
}

function resetStudentReportsSideNav() {
    var studentReportsSideNav = document.getElementById('slide-out-studentReport');
    if (studentReportsSideNav && studentReportsSideNav.children) {
        for (var i = 0; i < studentReportsSideNav.children.length; i++) {
            var currentChild = studentReportsSideNav.children[i];
            if (currentChild.children) {
                currentChild = currentChild.children[0];
                currentChild.classList.remove('active');
                currentChild.classList.remove('green');
            }
        }
    }
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
        resetStudentReportsSideNav();
        sectionsClickEventComplete();
    },

    'click .course-dropdown': function () {
        var element = event.target.parentElement;
        if (!element.classList.contains('active')) {
            var activeElement = document.getElementsByClassName('course-dropdown active green')[0];
            if (activeElement != null) {
                activeElement.classList.remove("active");
                activeElement.classList.remove("green");
            }
            element.classList.add("active");
            element.classList.add("green");
        }
    }

});