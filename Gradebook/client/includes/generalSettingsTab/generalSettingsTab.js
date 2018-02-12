import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Courses } from '../../../lib/collections.js';
import { Accounts } from 'meteor/accounts-base';

import '../../main.html';

Template.generalSettingsTab.helpers({
    currentCourse: function(){
        return Session.get('courseNameDisplay');
    },

    currentYear: function(){
        return Session.get('courseYearDisplay');
    }

});