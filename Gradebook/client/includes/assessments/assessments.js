import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Courses } from '../../../lib/collections.js';
import { Accounts } from 'meteor/accounts-base';
import { CourseWeighting } from '../../../lib/collections.js';
import { Assessments } from '../../../lib/collections.js';

import '../../main.html';

function canAssignFinalEvaluation () {
    let currentCourseId = Session.get('courseId');
    let finalAssessmentTypes = CourseWeighting.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).finalAssessmentTypes;
    var finalAssessmentTypeObjects = Assessments.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).finalAssessmentTypes;
    var unassignedFinalEvaluationIds = [];
    var arrayOfEvaluationsToReturn = [];

    //check which final assessment Type Ids have not already been assigned
    for (i = 0; i < finalAssessmentTypeObjects.length; i++){
        if (finalAssessmentTypeObjects[i].K == "N/A" && finalAssessmentTypeObjects[i].A == "N/A" && finalAssessmentTypeObjects[i].T == "N/A" && finalAssessmentTypeObjects[i].C == "N/A"){
            let unassignedAssessmentTypeId = finalAssessmentTypeObjects[i].assessmentTypeId;
            unassignedFinalEvaluationIds[unassignedFinalEvaluationIds.length] = unassignedAssessmentTypeId;
        }
    }

    //We now have all the Ids of the unassigned final assessments. We must find their names
    for (i = 0; i < unassignedFinalEvaluationIds.length; i++){
        for (z = 0; z < finalAssessmentTypes.length; z ++){
            if ( unassignedFinalEvaluationIds[i] == finalAssessmentTypes[z].assessmentTypeId ){
                //console.log(finalAssessmentTypes[z].assessmentType + " is the name of assessmentTypeId: " + unassignedFinalEvaluationIds[i]);
                var assessmentName = finalAssessmentTypes[z].assessmentType;
                var unassignedEvaluation = {assessmentType: assessmentName};
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
    courseworkAssessmentTypes: function(){
        let currentCourseId = Session.get('courseId');
        let courseAssessmentsTypes = CourseWeighting.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).courseworkAssessmentTypes;
        return courseAssessmentsTypes
    },

    courseworkAssessments: function(assessmentTypeId){
        let currentCourseId = Session.get('courseId');
        let courseAssessmentsTypes = Assessments.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).courseAssessmentTypes;
        for(i = 0; i < courseAssessmentsTypes.length; i++){
            if(courseAssessmentsTypes[i].assessmentTypeId == assessmentTypeId){
                return courseAssessmentsTypes[i].assessments;
            }
        }
        return false
    },

    hasCourseworkAssessments: function(assessmentTypeId){
        let currentCourseId = Session.get('courseId');
        let courseAssessmentsTypes = Assessments.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).courseAssessmentTypes;
        for(i = 0; i < courseAssessmentsTypes.length; i++){
            if(courseAssessmentsTypes[i].assessmentTypeId == assessmentTypeId){
                return courseAssessmentsTypes[i].assessments.length != 0;
            }
        }
        return false
    },

    finalAssessmentTypes: function(){
        let currentCourseId = Session.get('courseId');
        let finalAssessmentTypes = CourseWeighting.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).finalAssessmentTypes;
        return finalAssessmentTypes
    },

    finalAssessments: function(assessmentTypeId){
        let currentCourseId = Session.get('courseId');
        let finalAssessmentTypes = Assessments.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).finalAssessmentTypes;
        let assessments = [];
        for(i = 0; i < finalAssessmentTypes.length; i++){
            if(finalAssessmentTypes[i].assessmentTypeId == assessmentTypeId){
                assessments[0] = finalAssessmentTypes[i];
                return assessments
            }
        }
        return false
    },

    hasFinalAssessments: function(assessmentTypeId){
        let currentCourseId = Session.get('courseId');
        let finalAssessmentTypes = Assessments.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).finalAssessmentTypes;
        let assessments = [];
        for(i = 0; i < finalAssessmentTypes.length; i++){
            if(finalAssessmentTypes[i].assessmentTypeId == assessmentTypeId){
                assessments[0] = finalAssessmentTypes[i];
                break;
            }
        }
        if(assessments[0].K == "N/A" && assessments[0].A == "N/A" && assessments[0].T == "N/A" && assessments[0].C == "N/A"){
            return false;
        }
        else{
            return true;
        }

    }
});

Template.assessments.events({
    'click .assignFinalEvalButton': function(){
        //check if you have no more evaluations to assign
        if (canAssignFinalEvaluation () == true){
            $('#assignFinalModal').modal('open');
            $('select').material_select();
        }
        else{
            Materialize.toast("All of your final evaluations have already been assigned", 5000, 'amber darken-3');
        }
    },

    'click .deleteFinalEval': function(){
        let courseSettings = document.getElementById("courseSettingsTabId");
        courseSettings.click();
        let assessmentSettings = document.getElementById("AS");
        assessmentSettings.click();
    },
    'click .deleteAssessmentType': function() {
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
                Session.set("removeAssessmentObj",removeAssessmentObj);
                $('#deleteCourseworkAssessmentModal').modal('close');
            } 
        });
        $('#deleteCourseworkAssessmentModal').modal('open');
    }
});