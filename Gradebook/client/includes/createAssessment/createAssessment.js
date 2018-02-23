import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Courses } from '../../../lib/collections.js';
import { Accounts } from 'meteor/accounts-base';
import { CourseWeighting } from '../../../lib/collections.js';
import { Assessments } from '../../../lib/collections.js';

import '../../main.html';

Template.createAssessment.helpers({
    getAssessmentTypes: function(){
        let currentCourseId = Session.get('courseId');
        let courseworkAssessmentTypes = CourseWeighting.findOne({ownerId: Meteor.userId(), courseId: currentCourseId}).courseworkAssessmentTypes;
        return courseworkAssessmentTypes
    }
});