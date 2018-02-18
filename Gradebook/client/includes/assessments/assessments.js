import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Courses } from '../../../lib/collections.js';
import { Accounts } from 'meteor/accounts-base';
import { CourseWeighting } from '../../../lib/collections.js';

import '../../main.html';

Template.assessments.onRendered(function() {
    $(document).ready(function () {
        $('.collapsible').collapsible();
    });
});