import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Courses } from '../../../lib/collections.js';
import { Accounts } from 'meteor/accounts-base';
import { CourseWeighting } from '../../../lib/collections.js';
import { Assessments } from '../../../lib/collections.js';

import '../../main.html';

Template.deleteCourseworkAssessment.helpers({
    
});

Template.deleteCourseworkAssessment.events({
    'click .yes-delete-modal': function () {
        //create new array of assessmentType objects excluding the selected one
        let newcourseworkAssessmentTypes = [];
        let currentCourseId = Session.get('courseId');

        let courseworkAssessmentTypes = CourseWeighting.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).courseworkAssessmentTypes;

        for (i = 0; i < courseworkAssessmentTypes.length; i++) {
            if (courseworkAssessmentTypes[i].assessmentTypeId != selectedAssessmentTypeId) {
                newcourseworkAssessmentTypes[newcourseworkAssessmentTypes.length] = courseworkAssessmentTypes[i];
            }
        }

        Meteor.call('assessments.deleteAssessment', currentCourseId, newcourseworkAssessmentTypes)

        //close modal
        $('#deleteCourseworkAssessmentModal').modal('close');
    }
});