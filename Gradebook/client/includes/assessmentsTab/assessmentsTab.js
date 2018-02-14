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
        console.log(courseworkAssessmentTypes);
        return courseworkAssessmentTypes
    },

    finalAssessmentTypes: function(){
        let currentCourseId = Session.get('courseId');
        const finalAssessmentTypes = CourseWeighting.findOne({ownerId: Meteor.userId(), courseId: currentCourseId}).finalAssessmentTypes;
        return finalAssessmentTypes
    },
    courseWorkWeight: function(){
        let currentCourseId = Session.get('courseId');
        const currentCourseWorkWeight = CourseWeighting.findOne({ownerId: Meteor.userId(), courseId: currentCourseId}).courseworkWeight;
        return currentCourseWorkWeight;
    },
    finalWeight: function(){
        let currentCourseId = Session.get('courseId');
        const currentFinalWeight = CourseWeighting.findOne({ownerId: Meteor.userId(), courseId: currentCourseId}).finalWeight;
        return currentFinalWeight;
    },
});

Template.assessmentsTab.onRendered(function() {
    $(document).ready(function () {
        $('.collapsible').collapsible();
    });
});

//assessments-courseWorkWeight -> CourseWork % weight 