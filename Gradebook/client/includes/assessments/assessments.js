import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Courses } from '../../../lib/collections.js';
import { Accounts } from 'meteor/accounts-base';
import { CourseWeighting } from '../../../lib/collections.js';
import { Assessments } from '../../../lib/collections.js';

import '../../main.html';

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
        Meteor.call('assessments.deleteAssessment', currentCourseId, courseAssessmentsTypes);
    },
    'click .deleteFinalType': function() {
        let currentCourseId = Session.get('courseId');
        var assessmentId = 0;
        if (event.target.classList.contains("deleteFinalAssessmentType")) {
            assessmentId = event.target.id;
        } else {
            assessmentId = event.target.parentNode.id; //probably
        }
        //get id based on where the 'x' is going to be

        var finalAssessmentTypes = Assessments.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).finalAssessmentTypes;
        for (var i = 0; i <finalAssessmentTypes.length; i++) {
            if (finalAssessmentTypes[i].assessmentTypeId == assessmentId) {
                finalAssessmentTypes.splice(i,1);
                break;
            }
        }
        Meteor.call('assessments.deleteFinalAssessment', currentCourseId, finalAssessmentTypes);
    }
});