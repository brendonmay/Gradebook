import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Courses } from '../../../lib/collections.js';
import { Accounts } from 'meteor/accounts-base';
import { CourseWeighting } from '../../../lib/collections.js';
import { Assessments } from '../../../lib/collections.js';

import '../../main.html';

Template.deleteCourseworkAssessment.helpers({
    assessmentName: function () {
        const removeAssessmentObj = Session.get("removeAssessmentObj");
        let currentCourseId = Session.get('courseId');
        if (removeAssessmentObj) {
            const assessmentTypeId = removeAssessmentObj.assessmentTypeId;
            const assessmentId = removeAssessmentObj.assessmentId;

            let assessmentTypes = Assessments.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).courseAssessmentTypes;
            for (var i = 0; i < assessmentTypes.length; i++) {
                if (assessmentTypes[i].assessmentTypeId == assessmentTypeId) {
                    const assessments = assessmentTypes[i].assessments;
                    for (var j = 0; j < assessments.length; j++) {
                        if (assessments[j].assessmentId == assessmentId) {
                            return assessments[j].assessmentName;
                        }
                    }
                }
            }
        }
    }
});

Template.deleteCourseworkAssessment.events({
    'click .yes-delete-modal': function () {
        var removeAssessmentObj = Session.get("removeAssessmentObj");

        if (removeAssessmentObj.inAssessments != true){
            document.getElementById("preloader").style = "";
        }

        let assessmentId = removeAssessmentObj.assessmentId;
        let assessmentTypeId = removeAssessmentObj.assessmentTypeId;

        var currentCourseId = Session.get('courseId');
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
        Meteor.call('calculatedgrades.deleteAssessment', Meteor.userId(), Session.get('courseId'), removeAssessmentObj.assessmentId);
        
        Session.set('gradebookUpdated', true);

        removeAssessmentObj.removeCourse = "";
        removeAssessmentObj.inAssessments = false;
        Session.set("removeAssessmentObj", removeAssessmentObj);

        $('#deleteCourseworkAssessmentModal').modal('close');
    },
    'click .no-delete-modal': function () {
        let removeAssessmentObj = Session.get("removeAssessmentObj");
        removeAssessmentObj.removeCourse = "no";
        Session.set("removeAssessmentObj", removeAssessmentObj);
    },
});