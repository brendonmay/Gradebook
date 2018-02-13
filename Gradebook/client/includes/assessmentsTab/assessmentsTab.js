import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Courses } from '../../../lib/collections.js';
import { Accounts } from 'meteor/accounts-base';
import { CourseWeighting } from '../../../lib/collections.js';

import '../../main.html';

Template.assessmentsTab.helpers({
    courseAssessmentTypes: function(){
        let currentCourseId = Session.get('courseId');
        const courseworkAssessmentTypes = CourseWeighting.findOne({ownerId: Meteor.userId(), courseId: currentCourseId}).courseworkAssessmentTypes;
        return courseWorkAssessmentTypes
    },

    finalAssessmentTypes: function(){
        let currentCourseId = Session.get('courseId');
        const finalAssessmentTypes = CourseWeighting.findOne({ownerId: Meteor.userId(), courseId: currentCourseId}).finalAssessmentTypes;
        return finalAssessmentTypes
    },
});