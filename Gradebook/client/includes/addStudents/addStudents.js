import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Courses } from '../../../lib/collections.js';
import { Accounts } from 'meteor/accounts-base';
import { CourseWeighting } from '../../../lib/collections.js';
import { Assessments } from '../../../lib/collections.js';
import { Students } from '../../../lib/collections.js';

import '../../main.html';

function generateGradesArray() {
    let courseId = Session.get('courseId');
    var coursework = Assessments.findOne({ ownerId: Meteor.userId(), courseId: courseId }).courseAssessmentTypes;
    var finalEvaluations = Assessments.findOne({ ownerId: Meteor.userId(), courseId: courseId }).finalAssessmentTypes;
    var grades = [];

    for (i = 0; i < coursework.length; i++) {
        for (z = 0; z < coursework[i].assessments.length; z++) {
            var assessmentId = coursework[i].assessments[z].assessmentId;
            var gradesObject = {
                assessmentId: assessmentId,
                K: "N/A",
                A: "N/A",
                T: "N/A",
                C: "N/A"
            };
            grades[grades.length] = gradesObject;
        }
    }

    for (i = 0; i < finalEvaluations.length; i++) {
        var assessmentId = finalEvaluations[i].assessmentTypeId;
        var gradesObject = {
            assessmentId: assessmentId,
            K: "N/A",
            A: "N/A",
            T: "N/A",
            C: "N/A"
        };
        grades[grades.length] = gradesObject;
    }

    return grades
};

function addFirstStudent() {
    let lastName = document.getElementById("studentLastName").value;
    let firstName = document.getElementById("studentFirstName").value;
    let courseId = Session.get('courseId');

    Meteor.call('students.addFirstStudent', Meteor.userId(), courseId, firstName, lastName, generateGradesArray());
}

function addNewStudent() {
    let lastName = document.getElementById("studentLastName").value;
    let firstName = document.getElementById("studentFirstName").value;
    let courseId = Session.get('courseId');

    var newStudentsDocument = Students.findOne({ownerId: Meteor.userId(), courseId: courseId}).students;
    var oldStudentId = newStudentsDocument[newStudentsDocument.length - 1].studentId;
    var oldStudentIdNumber = Number(oldStudentId.slice(2, oldStudentId.length));
    var newStudentIdNumber = oldStudentIdNumber + 1;
    var newStudentId = "s-" + newStudentIdNumber;

    newStudentsDocument[newStudentsDocument.length] = {
        studentLastName: lastName,
        studentFirstName: firstName,
        studentId: newStudentId,
        grades: generateGradesArray()
    }

    Meteor.call('students.addNewStudent', Meteor.userId(), courseId, newStudentsDocument);
}

Template.addStudents.events({
    'submit #addStudentsModalForm': function () {
        let courseId = Session.get('courseId');
        var studentsDocument = Students.findOne({ownerId: Meteor.userId, courseId: courseId}).students;
        
        if( studentsDocument.length == 0 ){
            addFirstStudent();
        }
        else{
            addNewStudent();
        }

        //send toast saying student has been added

        //clear form so they can add another student
    },
});