import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Accounts } from 'meteor/accounts-base';
import { Students } from '../../../../lib/collections.js';
import { Assessments } from '../../../../lib/collections.js';
import { CourseWeighting } from '../../../../lib/collections.js';

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

function setGradebookColors() {
    var categoryCells = document.getElementsByClassName("categoryCell");
    var arrayofStudentIds = arrayOfStudentIds();

    for (i = 0; i < categoryCells.length; i++) {
        var id = categoryCells[i].id;
        var category = id[0];
        var assessmentId = id.slice(id.indexOf("#") + 1, id.indexOf("%"));
        var categoryValue = id.slice(id.indexOf("%") + 1, id.length);

        if (categoryValue == "-") {
            categoryCells[i].style = "background-color: #9e9e9e";

            for (z = 0; z < arrayofStudentIds.length; z++) {
                if (category == "C"){
                    var studentId = arrayofStudentIds[z];
                    if (studentId != "s-0"){
                        document.getElementById(category + "?" + studentId + "#" + assessmentId).parentElement.style = "background-color: #9e9e9e; border-right: 2px solid black";
                        document.getElementById(category + "?" + studentId + "#" + assessmentId).disabled = "true";
                        document.getElementById(category + "?" + studentId + "#" + assessmentId).value = "N/A";
                    }
                }
                else{
                    var studentId = arrayofStudentIds[z];
                    if (studentId != "s-0"){
                        document.getElementById(category + "?" + studentId + "#" + assessmentId).parentElement.style = "background-color: #9e9e9e";
                        document.getElementById(category + "?" + studentId + "#" + assessmentId).disabled = "true";
                        document.getElementById(category + "?" + studentId + "#" + assessmentId).value = "N/A";
                    }
                }
            }
        }
    }
};

function convertAssessmentIdIntoAssessmentName(arrayOfAssessmentIds, courseId) {
    var courseAssessmentTypes = Assessments.findOne({ ownerId: Meteor.userId(), courseId: courseId }).courseAssessmentTypes;
    var finalAssessmentTypes = CourseWeighting.findOne({ ownerId: Meteor.userId(), courseId: courseId }).finalAssessmentTypes;
    var arrayOfAssessmentNames = [];
    var assessments = [];

    for (i = 0; i < arrayOfAssessmentIds.length; i++) {
        var specificAssessmentId = arrayOfAssessmentIds[i];
        if (arrayOfAssessmentIds[i].indexOf("-") != -1) { //if it is a course assessment
            var courseAssessmentId = arrayOfAssessmentIds[i];
            var courseAssessmentTypeId = courseAssessmentId.substr(0, courseAssessmentId.indexOf("-"));
            for (z = 0; z < courseAssessmentTypes.length; z++) {
                if (courseAssessmentTypeId == courseAssessmentTypes[z].assessmentTypeId) {
                    assessments = courseAssessmentTypes[z].assessments;
                    z = courseAssessmentTypes.length;
                }
            }
            for (z = 0; z < assessments.length; z++) {
                if (assessments[z].assessmentId == courseAssessmentId) {
                    var assessmentName = assessments[z].assessmentName;
                    var assessmentDate = assessments[z].Date;
                    var K = assessments[z].K;
                    var A = assessments[z].A;
                    var T = assessments[z].T;
                    var C = assessments[z].C;
                    if (K == "N/A") {
                        K = "-";
                    }
                    if (A == "N/A") {
                        A = "-";
                    }
                    if (T == "N/A") {
                        T = "-";
                    }
                    if (C == "N/A") {
                        C = "-";
                    }
                    var assessmentNameObject = { assessmentName: assessmentName, assessmentId: courseAssessmentId, assessmentDate: assessmentDate, K: K, A: A, T: T, C: C };
                    arrayOfAssessmentNames[arrayOfAssessmentNames.length] = assessmentNameObject;
                    z = assessments.length;
                }
            }
        }
        else { //it is a final assessment
            var assessmentName = "";

            for (z = 0; z < finalAssessmentTypes.length; z++) {
                if (finalAssessmentTypes[z].assessmentTypeId == arrayOfAssessmentIds[i]) {
                    assessmentName = finalAssessmentTypes[z].assessmentType;
                    z = finalAssessmentTypes.length;
                }
            }
            let finalAssessentTypesWithDate = Assessments.findOne({ ownerId: Meteor.userId(), courseId: courseId }).finalAssessmentTypes;
            for (z = 0; z < finalAssessentTypesWithDate.length; z++) {
                if (finalAssessentTypesWithDate[z].assessmentTypeId == arrayOfAssessmentIds[i]) {
                    var assessmentDate = finalAssessentTypesWithDate[z].Date;
                    var K = finalAssessentTypesWithDate[z].K;
                    var A = finalAssessentTypesWithDate[z].A;
                    var T = finalAssessentTypesWithDate[z].T;
                    var C = finalAssessentTypesWithDate[z].C;
                    if (K == "N/A") {
                        K = "-";
                    }
                    if (A == "N/A") {
                        A = "-";
                    }
                    if (T == "N/A") {
                        T = "-";
                    }
                    if (C == "N/A") {
                        C = "-";
                    }
                    var assessmentNameObject = { assessmentName: assessmentName, assessmentId: arrayOfAssessmentIds[i], assessmentDate: assessmentDate, K: K, A: A, T: T, C: C };
                    arrayOfAssessmentNames[arrayOfAssessmentNames.length] = assessmentNameObject;
                    z = finalAssessentTypesWithDate.length;
                }
            }
        }
    }
    return arrayOfAssessmentNames
};

Template.assessmentNameHeader.helpers({
    getAssessmentNames: function () {
        let courseId = Session.get('courseId');
        let studentsArray = Students.findOne({ ownerId: Meteor.userId(), courseId: courseId }).students;
        var arrayOfAssessmentIds = [];
        if (studentsArray.length == 0) {
            return false
        }
        else {
            let gradesArray = studentsArray[0].grades;
            if (gradesArray.length == 0) {
                return false
            }
            else {
                for (i = 0; i < gradesArray.length; i++) {
                    arrayOfAssessmentIds[arrayOfAssessmentIds.length] = gradesArray[i].assessmentId;
                }

            }
            let arrayOfAssessmentObjects = convertAssessmentIdIntoAssessmentName(arrayOfAssessmentIds, courseId);
            return arrayOfAssessmentObjects
        }
    }
});

Template.assessmentNameHeader.events({
    'click .gradebook-edit-ass-icon': function () {
        var id = event.target.parentElement.id;
        var assessmentId = id.slice(id.indexOf('?') + 1, id.length);
        if (!(assessmentId[0] == "f")) {
            var assessmentTypeId = assessmentId.slice(0, assessmentId.indexOf('-'));
            document.getElementById("assessmentsTabId").click();

            var assessmentTypeHeader = document.getElementById(assessmentTypeId + "?dropdownId");
            if (!(assessmentTypeHeader.classList.contains("active"))) {
                assessmentTypeHeader.click();
            }

            var assessmentIdHeader = document.getElementById(assessmentId + "?dropdownAss");
            if (!(assessmentIdHeader.parentElement.classList.contains("active"))) {
                assessmentIdHeader.click();
            }

            document.getElementById("courseK" + assessmentId).focus();

        }
        else {
            document.getElementById("assessmentsTabId").click();

            var assessmentTypeHeader = document.getElementById(assessmentId + "?dropdownId");
            if (!(assessmentTypeHeader.classList.contains("active"))) {
                assessmentTypeHeader.click();
            }
            document.getElementById("finalK" + assessmentId).focus();
        }
    },
    'click .gradebook-del-ass-icon': function () {
        var id = event.target.parentElement.id;
        let currentCourseId = Session.get('courseId');
        var assessmentId = id.slice(id.indexOf('?') + 1, id.length);
        //if deleting coursework
        if (assessmentId[0] != "f") {
            var assessmentTypeId = assessmentId.slice(0, assessmentId.indexOf("-"));
            var removeAssessmentObj = {
                assessmentTypeId: assessmentTypeId,
                assessmentId: assessmentId,
                removeCourse: ""
            };
            Session.set("removeAssessmentObj", removeAssessmentObj);

            $('.delete-courseworkAssessment-modal').modal({
                complete: function () {
                    if (Session.get('removeAssessmentObj').removeCourse == "yes") {
                        var courseAssessmentsTypes = Assessments.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).courseAssessmentTypes;
                        for (var i = 0; i < courseAssessmentsTypes.length; i++) {
                            if (courseAssessmentsTypes[i].assessmentTypeId == assessmentTypeId) {
                                let assessmentType = courseAssessmentsTypes[i].assessments;
                                for (var j = 0; j < assessmentType.length; j++) {
                                    if (assessmentType[j].assessmentId == assessmentId) {
                                        assessmentType.splice(j, 1);
                                        break;
                                    }
                                }
                                courseAssessmentsTypes[i].assessments = assessmentType;
                                break;
                            }
                        }
                        Meteor.call('assessments.updateAssessments', currentCourseId, courseAssessmentsTypes);
                        Meteor.call('students.deleteAssessment', Meteor.userId(), currentCourseId, assessmentId);
                    }
                    let removeAssessmentObj = Session.get("removeAssessmentObj");
                    removeAssessmentObj.removeCourse = "";
                    Session.set("removeAssessmentObj", removeAssessmentObj);
                    $('#deleteCourseworkAssessmentModal').modal('close');
                }
            });
            $('#deleteCourseworkAssessmentModal').modal('open');
        }
        //if deleting final evaluation
        else {
            let courseSettings = document.getElementById("courseSettingsTabId");
            courseSettings.click();
            let assessmentSettings = document.getElementById("ASClick");
            assessmentSettings.click();
            Materialize.toast('You can delete Final Evaluations from this page.', 5000, 'amber darken-3');
        }
    }
});

Template.assessmentNameHeader.onRendered(function () {
    setGradebookColors();
});