import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Accounts } from 'meteor/accounts-base';
import { Students } from '../../../../lib/collections.js';
import { Assessments } from '../../../../lib/collections.js';
import { CourseWeighting } from '../../../../lib/collections.js';

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
                if (assessments[z].assessmentId == courseAssessmentId){
                    var assessmentName = assessments[z].assessmentName;
                    var assessmentDate = assessments[z].Date;
                    var K = assessments[z].K;
                    var A = assessments[z].A;
                    var T = assessments[z].T;
                    var C = assessments[z].C;
                    if (K == "N/A"){
                        K = "-";
                    }
                    if (A == "N/A"){
                        A = "-";
                    }
                    if (T == "N/A"){
                        T = "-";
                    }
                    if (C == "N/A"){
                        C = "-";
                    }
                    var assessmentNameObject = {assessmentName: assessmentName, assessmentId: courseAssessmentId, assessmentDate: assessmentDate, K:K, A:A, T:T, C:C};
                    arrayOfAssessmentNames[arrayOfAssessmentNames.length] = assessmentNameObject;
                    z = assessments.length;
                }
            }
        }
        else { //it is a final assessment
            var assessmentName = "";

            for (z = 0; z < finalAssessmentTypes.length; z++){
                if (finalAssessmentTypes[z].assessmentTypeId == arrayOfAssessmentIds[i]){
                    assessmentName = finalAssessmentTypes[z].assessmentType;
                    z = finalAssessmentTypes.length;
                }
            }
            let finalAssessentTypesWithDate = Assessments.findOne({ ownerId: Meteor.userId(), courseId: courseId }).finalAssessmentTypes;
            for (z = 0; z < finalAssessentTypesWithDate.length; z++){
                if (finalAssessentTypesWithDate[z].assessmentTypeId == arrayOfAssessmentIds[i]){
                    var assessmentDate = finalAssessentTypesWithDate[z].Date;
                    var K = finalAssessentTypesWithDate[z].K;
                    var A = finalAssessentTypesWithDate[z].A;
                    var T = finalAssessentTypesWithDate[z].T;
                    var C = finalAssessentTypesWithDate[z].C;
                    if (K == "N/A"){
                        K = "-";
                    }
                    if (A == "N/A"){
                        A = "-";
                    }
                    if (T == "N/A"){
                        T = "-";
                    }
                    if (C == "N/A"){
                        C = "-";
                    }
                    var assessmentNameObject = {assessmentName: assessmentName, assessmentId: arrayOfAssessmentIds[i], assessmentDate: assessmentDate, K:K, A:A, T:T, C:C};
                    arrayOfAssessmentNames[arrayOfAssessmentNames.length] = assessmentNameObject;
                    z = finalAssessentTypesWithDate.length;
                }
            }
        }
    }
    return arrayOfAssessmentNames
}

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
})