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
        let removeAssessmentObj = Session.get("removeAssessmentObj");
        removeAssessmentObj.removeCourse = "yes";
        Session.set("removeAssessmentObj", removeAssessmentObj);
        Session.set('gradebookUpdated', true);
        Meteor.call('calculatedgrades.deleteAssessment', Meteor.userId(), Session.get('courseId'), removeAssessmentObj.assessmentId);
    },
    'click .no-delete-modal': function () {
        let removeAssessmentObj = Session.get("removeAssessmentObj");
        removeAssessmentObj.removeCourse = "no";
        Session.set("removeAssessmentObj", removeAssessmentObj);
    },
});