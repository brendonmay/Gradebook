import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Courses } from '../../../lib/collections.js';
import { Accounts } from 'meteor/accounts-base';
import { CourseWeighting } from '../../../lib/collections.js';
import { Assessments } from '../../../lib/collections.js';

import '../../main.html';

function canAssignFinalEvaluation() {
    let currentCourseId = Session.get('courseId');
    let finalAssessmentTypes = CourseWeighting.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).finalAssessmentTypes;
    var finalAssessmentTypeObjects = Assessments.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).finalAssessmentTypes;
    var unassignedFinalEvaluationIds = [];
    var arrayOfEvaluationsToReturn = [];

    //check which final assessment Type Ids have not already been assigned
    for (i = 0; i < finalAssessmentTypeObjects.length; i++) {
        if (finalAssessmentTypeObjects[i].K == "N/A" && finalAssessmentTypeObjects[i].A == "N/A" && finalAssessmentTypeObjects[i].T == "N/A" && finalAssessmentTypeObjects[i].C == "N/A") {
            let unassignedAssessmentTypeId = finalAssessmentTypeObjects[i].assessmentTypeId;
            unassignedFinalEvaluationIds[unassignedFinalEvaluationIds.length] = unassignedAssessmentTypeId;
        }
    }

    //We now have all the Ids of the unassigned final assessments. We must find their names
    for (i = 0; i < unassignedFinalEvaluationIds.length; i++) {
        for (z = 0; z < finalAssessmentTypes.length; z++) {
            if (unassignedFinalEvaluationIds[i] == finalAssessmentTypes[z].assessmentTypeId) {
                //console.log(finalAssessmentTypes[z].assessmentType + " is the name of assessmentTypeId: " + unassignedFinalEvaluationIds[i]);
                var assessmentName = finalAssessmentTypes[z].assessmentType;
                var unassignedEvaluation = { assessmentType: assessmentName };
                arrayOfEvaluationsToReturn[arrayOfEvaluationsToReturn.length] = unassignedEvaluation;
            }
        }
    }

    return arrayOfEvaluationsToReturn.length != 0
}

Template.assessments.onRendered(function () {
    $(document).ready(function () {
        $('.collapsible').collapsible();
    });
});

Template.assessments.helpers({
    courseworkAssessmentTypes: function () {
        let currentCourseId = Session.get('courseId');
        let courseAssessmentsTypes = CourseWeighting.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).courseworkAssessmentTypes;
        return courseAssessmentsTypes
    },

    courseworkAssessments: function (assessmentTypeId) {
        let currentCourseId = Session.get('courseId');
        let courseAssessmentsTypes = Assessments.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).courseAssessmentTypes;
        for (i = 0; i < courseAssessmentsTypes.length; i++) {
            if (courseAssessmentsTypes[i].assessmentTypeId == assessmentTypeId) {
                return courseAssessmentsTypes[i].assessments;
            }
        }
        return false
    },

    hasCourseworkAssessments: function (assessmentTypeId) {
        let currentCourseId = Session.get('courseId');
        let courseAssessmentsTypes = Assessments.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).courseAssessmentTypes;
        for (i = 0; i < courseAssessmentsTypes.length; i++) {
            if (courseAssessmentsTypes[i].assessmentTypeId == assessmentTypeId) {
                return courseAssessmentsTypes[i].assessments.length != 0;
            }
        }
        return false
    },

    finalAssessmentTypes: function () {
        let currentCourseId = Session.get('courseId');
        let finalAssessmentTypes = CourseWeighting.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).finalAssessmentTypes;
        return finalAssessmentTypes
    },

    finalAssessments: function (assessmentTypeId) {
        let currentCourseId = Session.get('courseId');
        let finalAssessmentTypes = Assessments.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).finalAssessmentTypes;
        let assessments = [];
        for (i = 0; i < finalAssessmentTypes.length; i++) {
            if (finalAssessmentTypes[i].assessmentTypeId == assessmentTypeId) {
                assessments[0] = finalAssessmentTypes[i];
                return assessments
            }
        }
        return false
    },

    hasFinalAssessments: function (assessmentTypeId) {
        let currentCourseId = Session.get('courseId');
        let finalAssessmentTypes = Assessments.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).finalAssessmentTypes;
        let assessments = [];
        for (i = 0; i < finalAssessmentTypes.length; i++) {
            if (finalAssessmentTypes[i].assessmentTypeId == assessmentTypeId) {
                assessments[0] = finalAssessmentTypes[i];
                break;
            }
        }
        if (assessments[0].K == "N/A" && assessments[0].A == "N/A" && assessments[0].T == "N/A" && assessments[0].C == "N/A") {
            return false;
        }
        else {
            return true;
        }

    }
});

Template.assessments.events({
    'click .assignFinalEvalButton': function () {
        //check if you have no more evaluations to assign
        if (canAssignFinalEvaluation() == true) {
            $('#assignFinalModal').modal('open');
            $('select').material_select();
        }
        else {
            Materialize.toast("All of your final evaluations have already been assigned", 5000, 'amber darken-3');
        }
    },
    'click .deleteFinalEval': function () {
        let courseSettings = document.getElementById("courseSettingsTabId");
        courseSettings.click();
        let assessmentSettings = document.getElementById("AS");
        assessmentSettings.click();
    },
    'click .deleteAssessmentType': function () {
        var assessmentId = 0;
        if (event.target.classList.contains("deleteAssessmentType")) {
            assessmentId = event.target.id;
        } else {
            assessmentId = event.target.parentNode.id;
        }
        const elementToRemove = document.getElementById(assessmentId);
        const assessmentTypeId = elementToRemove.parentNode.id;
        let currentCourseId = Session.get('courseId');
        var removeAssessmentObj = {
            assessmentTypeId: assessmentTypeId,
            assessmentId: assessmentId,
            removeCourse: ""
        };
        Session.set("removeAssessmentObj", removeAssessmentObj);
        document.getElementById(assessmentId).click();

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
                }
                let removeAssessmentObj = Session.get("removeAssessmentObj");
                removeAssessmentObj.removeCourse = "";
                Session.set("removeAssessmentObj", removeAssessmentObj);
                $('#deleteCourseworkAssessmentModal').modal('close');
            }
        });
        $('#deleteCourseworkAssessmentModal').modal('open');
    },
    'click .collapsible-header': function () {
        $('.datepicker').pickadate({
            selectMonths: true, // Creates a dropdown to control month
            selectYears: 15, // Creates a dropdown of 15 years to control year,
            today: 'Today',
            clear: 'Clear',
            close: 'Ok',
            container: 'body',
            closeOnSelect: false // Close upon selecting a date,
        });
    },
    'submit .edit-courseassessment-form': function () {
        //determine which form has been changed
        let target = event.target;
        let formId = target.id;

        //assign all the new values to variables
        let assessmentId = formId.substring(4);
        let assessmentTypeId = assessmentId.substring(0, assessmentId.indexOf('-'));
        let currentCourseId = Session.get('courseId');

        //console.log("assessmentTypeId: " + assessmentTypeId + ". AssessmentId: " + assessmentId)

        let dateId = "courseDate" + assessmentId;
        let kId = "courseK" + assessmentId;
        let aId = "courseA" + assessmentId;
        let tId = "courseT" + assessmentId;
        let cId = "courseC" + assessmentId;

        let markK = document.getElementById(kId).value;
        let markA = document.getElementById(aId).value;
        let markT = document.getElementById(tId).value;
        let markC = document.getElementById(cId).value;
        let newDate = document.getElementById(dateId).value

        //check that each variable is of the correct type/format
        if (markK == "N/A" && markA == "N/A" && markT == "N/A" && markC == "N/A") {
            Materialize.toast('You must assess the students in at least one category.', 5000, 'amber darken-3');
            return false
        }

        if (markK <= 0 || markA <= 0 || markT <= 0 || markC <= 0) {
            Materialize.toast("A selected category's mark must be an integer greater than 0 or N/A.", 5000, 'amber darken-3');
            return false
        }

        if (!((markK == "N/A" || Math.floor(markK) == markK) && (markA == "N/A" || Math.floor(markA) == markA) && (markT == "N/A" || Math.floor(markT) == markT) && (markC == "N/A" || Math.floor(markC) == markC))) {
            Materialize.toast("A selected category's mark must be an integer greater than 0 or N/A.", 5000, 'amber darken-3');
            return false
        }

        if (markK != "N/A") {
            markK = Number(markK)
        }
        if (markA != "N/A") {
            markA = Number(markA)
        }
        if (markT != "N/A") {
            markT = Number(markT)
        }
        if (markC != "N/A") {
            markC = Number(markC)
        }

        //update collection
        var courseAssessmentTypes = Assessments.findOne({ownerId: Meteor.userId(), courseId: currentCourseId}).courseAssessmentTypes;

        var courseName;
        for (i = 0; i < courseAssessmentTypes.length; i++){
            if(courseAssessmentTypes[i].assessmentTypeId == assessmentTypeId){
                for(z = 0; z < courseAssessmentTypes[i].assessments.length; z++){
                    if(courseAssessmentTypes[i].assessments[z].assessmentId == assessmentId){
                        courseName = courseAssessmentTypes[i].assessments[z].assessmentName;
                        courseAssessmentTypes[i].assessments[z].K = markK;
                        courseAssessmentTypes[i].assessments[z].A = markA;
                        courseAssessmentTypes[i].assessments[z].T = markT;
                        courseAssessmentTypes[i].assessments[z].C = markC;
                        courseAssessmentTypes[i].assessments[z].Date = newDate;
                        break;
                    }
                }
            }
        }

        Meteor.call('assessments.updateAssessments', currentCourseId, courseAssessmentTypes)

        //at the end, push a message to the user saying the changes have been saved.
        Materialize.toast('Your changes to ' + courseName + ' have been saved', 3000, 'amber darken-3'); //make it so that toast includes assessment name
    },
    'submit .edit-finalevaluation-form': function () {
        //determine which form has been changed
        let target = event.target;
        let formId = target.id;

        //assign all the new values to variables
        let assessmentTypeId = formId.substring(4);
        let currentCourseId = Session.get('courseId');

        let dateId = "finalDate" + assessmentTypeId;
        let kId = "finalK" + assessmentTypeId;
        let aId = "finalA" + assessmentTypeId;
        let tId = "finalT" + assessmentTypeId;
        let cId = "finalC" + assessmentTypeId;

        let markK = document.getElementById(kId).value;
        let markA = document.getElementById(aId).value;
        let markT = document.getElementById(tId).value;
        let markC = document.getElementById(cId).value;
        let newDate = document.getElementById(dateId).value

        //check that each variable is of the correct type/format
        if (markK == "N/A" && markA == "N/A" && markT == "N/A" && markC == "N/A") {
            Materialize.toast('You must assess the students in at least one category.', 5000, 'amber darken-3');
            return false
        }

        if (markK <= 0 || markA <= 0 || markT <= 0 || markC <= 0) {
            Materialize.toast("A selected category's mark must be an integer greater than 0 or N/A.", 5000, 'amber darken-3');
            return false
        }

        if (!(
            (markK == "N/A" || Math.floor(markK) == markK) && 
            (markA == "N/A" || Math.floor(markA) == markA) && 
            (markT == "N/A" || Math.floor(markT) == markT) && 
            (markC == "N/A" || Math.floor(markC) == markC)
        )) {
            Materialize.toast("A selected category's mark must be an integer greater than 0 or N/A.", 5000, 'amber darken-3');
            return false
        }

        if (markK != "N/A") {
            markK = Number(markK)
        }
        if (markA != "N/A") {
            markA = Number(markA)
        }
        if (markT != "N/A") {
            markT = Number(markT)
        }
        if (markC != "N/A") {
            markC = Number(markC)
        }

        //update collection
        var finalAssessmentTypes = Assessments.findOne({ownerId: Meteor.userId(), courseId: currentCourseId}).finalAssessmentTypes;

        for (i = 0; i < finalAssessmentTypes.length; i++){
            if(finalAssessmentTypes[i].assessmentTypeId == assessmentTypeId){
                finalAssessmentTypes[i].K = markK;
                finalAssessmentTypes[i].A = markA;
                finalAssessmentTypes[i].T = markT;
                finalAssessmentTypes[i].C = markC;
                finalAssessmentTypes[i].Date = newDate;
                break;
            }
        }

        Meteor.call('assessments.updateFinalAssessments', currentCourseId, finalAssessmentTypes)

        //at the end, push a message to the user saying the changes have been saved.
        Materialize.toast('Your changes have been saved', 3000, 'amber darken-3'); //make it so that toast includes assessment name
    },
    'blur .editable-assessment-fields': function() {
        let target = event.target;
        let formId = target.id;
        //assign all the new values to variables
        let assessmentId = formId.substring(7);
        let assessmentTypeId = assessmentId.substring(0, assessmentId.indexOf('-'));
        let currentCourseId = Session.get('courseId');
        
        target.focus();

        //console.log("assessmentTypeId: " + assessmentTypeId + ". AssessmentId: " + assessmentId);
        let dateId = "courseDate" + assessmentId;
        let kId = "courseK" + assessmentId;
        let aId = "courseA" + assessmentId;
        let tId = "courseT" + assessmentId;
        let cId = "courseC" + assessmentId;

        let markK = document.getElementById(kId).value;
        let markA = document.getElementById(aId).value;
        let markT = document.getElementById(tId).value;
        let markC = document.getElementById(cId).value;
        let newDate = document.getElementById(dateId).value

        //check that each variable is of the correct type/format
        if (markK == "N/A" && markA == "N/A" && markT == "N/A" && markC == "N/A") {
            Materialize.toast('You must assess the students in at least one category.', 5000, 'amber darken-3');
            return false
        }

        if (markK <= 0 || markA <= 0 || markT <= 0 || markC <= 0) {
            Materialize.toast("A selected category's mark must be an integer greater than 0 or N/A.", 5000, 'amber darken-3');
            return false
        }

        if (!((markK == "N/A" || Math.floor(markK) == markK) && (markA == "N/A" || Math.floor(markA) == markA) && (markT == "N/A" || Math.floor(markT) == markT) && (markC == "N/A" || Math.floor(markC) == markC))) {
            Materialize.toast("A selected category's mark must be an integer greater than 0 or N/A.", 5000, 'amber darken-3');
            return false
        }

        if (markK != "N/A") {
            markK = Number(markK)
        }
        if (markA != "N/A") {
            markA = Number(markA)
        }
        if (markT != "N/A") {
            markT = Number(markT)
        }
        if (markC != "N/A") {
            markC = Number(markC)
        }

        //update collection
        var courseAssessmentTypes = Assessments.findOne({ownerId: Meteor.userId(), courseId: currentCourseId}).courseAssessmentTypes;

        var courseName;
        for (i = 0; i < courseAssessmentTypes.length; i++){
            if(courseAssessmentTypes[i].assessmentTypeId == assessmentTypeId){
                for(z = 0; z < courseAssessmentTypes[i].assessments.length; z++){
                    if(courseAssessmentTypes[i].assessments[z].assessmentId == assessmentId){
                        courseName = courseAssessmentTypes[i].assessments[z].assessmentName;
                        courseAssessmentTypes[i].assessments[z].K = markK;
                        courseAssessmentTypes[i].assessments[z].A = markA;
                        courseAssessmentTypes[i].assessments[z].T = markT;
                        courseAssessmentTypes[i].assessments[z].C = markC;
                        courseAssessmentTypes[i].assessments[z].Date = newDate;
                        break;
                    }
                }
            }
        }

        Meteor.call('assessments.updateAssessments', currentCourseId, courseAssessmentTypes)

        //at the end, push a message to the user saying the changes have been saved.
        Materialize.toast('Your changes to ' + courseName + ' have been saved', 3000, 'amber darken-3'); //make it so that toast includes assessment name
    }
});

