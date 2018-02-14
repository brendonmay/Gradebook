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

        //accesses the database and uses the courseId variable to display the courseName
        const teacherInfo = Courses.find({ ownerId: Meteor.userId() }, { _id: 0, ownerId: 0 });
        teacherInfo.forEach(
            function (doc) {
                const courseName = doc.courses[courseId].courseName;
                Session.set('courseName', courseName); //using a Session method to bring the information from outside of the function and into the return result
            });

        var courseName = Session.get('courseName');
        return courseName;
    },
});