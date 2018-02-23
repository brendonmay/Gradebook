import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Courses } from '../../../lib/collections.js';
import { Accounts } from 'meteor/accounts-base';
import { CourseWeighting } from '../../../lib/collections.js';
import { Assessments } from '../../../lib/collections.js';

import '../../main.html';

Template.deleteCourseworkAssessment.helpers({
    assessmentName: function () {
        const assessmentId = Session.get("currentAssessmentID");
        let currentCourseId = Session.get('courseId');
        let assessmentTypes = Assessments.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).courseAssessmentTypes;
        for (var i = 0; i < assessmentTypes.length; i++) {
            if (assessmentTypes[i].assessmentTypeId == assessmentId) {
                return assessmentTypes[i].assessmentType;
            }
        }
    }
});

Template.deleteCourseworkAssessment.events({
    'click .yes-delete-modal': function () {
        Session.set("deleteFinalAssessmentModal", "yes");
    },
    'click .no-delete-modal': function () {
        Session.set("deleteFinalAssessmentModal", "no");
    },
});