import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Courses } from '../../../lib/collections.js';
import { Accounts } from 'meteor/accounts-base';

import '../../main.html';

Template.uniqueDisplayContent.helpers({ //seems to be displaying a template error in console
    display: function () {
        //grabs the courseId variable from the session.
        //since the index is the id subtracted by 1 I subtract it.
        var courseId = (Session.get('courseId')) - 1;

        var courseName = Session.get('courseName');
        return courseName;
    },
});