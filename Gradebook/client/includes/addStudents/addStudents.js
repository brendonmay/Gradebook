import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Courses } from '../../../lib/collections.js';
import { Accounts } from 'meteor/accounts-base';
import { CourseWeighting } from '../../../lib/collections.js';
import { Assessments } from '../../../lib/collections.js';
import { Students } from '../../../lib/collections.js';

import '../../main.html';

function addFirstStudent(){
    let lastName = document.getElementById("studentLastName").value;
    let firstName = document.getElementById("studentFirstName").value;
    let courseId = Session.get('courseId');

    Meteor.call('students.addFirstStudent', Meteor.userId(), courseId, firstName, lastName);
}

function addNewStudent(){
    
}

Template.addStudents.events({
    'submit #addStudentsModalForm': function(){
        console.log("tst");
        //check if adding first student
        addFirstStudent();

        //update collection with the new student
        //addNewStudent();

        //send toast saying student has been added
        
        //clear form so they can add another student
    },
});