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