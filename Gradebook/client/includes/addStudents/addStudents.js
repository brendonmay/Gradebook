import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Courses } from '../../../lib/collections.js';
import { Accounts } from 'meteor/accounts-base';
import { CourseWeighting } from '../../../lib/collections.js';
import { Assessments } from '../../../lib/collections.js';
import { Students } from '../../../lib/collections.js';

import '../../main.html';

function organizeStudentsIntoColumns(col) {
    let sortedStudentArray = generateSortedStudentArray();
    let arrayOfStudentObjects = generateArrayOfStudentObjects(sortedStudentArray);

    var columnOneStudentsArray = [];
    var columnTwoStudentsArray = [];
    var columnThreeStudentsArray = [];

    let numberOfStudents = arrayOfStudentObjects.length;
    let numberOfStudentsModThree = numberOfStudents % 3;

    let numberOfStudentsInEachColumn = ((numberOfStudents - numberOfStudentsModThree) / 3);

    var numberOfStudentsInColumnOne = numberOfStudentsInEachColumn;
    var numberOfStudentsInColumnTwo = numberOfStudentsInEachColumn;
    var numberOfStudentsInColumnThree = numberOfStudentsInEachColumn;

    if (numberOfStudentsModThree == 1) {
        numberOfStudentsInColumnOne++;
    }
    if (numberOfStudentsModThree == 2) {
        numberOfStudentsInColumnOne++;
        numberOfStudentsInColumnTwo++;
    }

    var counter = 0;
    for (i = 0; i < numberOfStudentsInColumnOne; i++) {
        columnOneStudentsArray[columnOneStudentsArray.length] = arrayOfStudentObjects[counter];
        counter++;
    }

    for (i = 0; i < numberOfStudentsInColumnTwo; i++) {
        columnTwoStudentsArray[columnTwoStudentsArray.length] = arrayOfStudentObjects[counter];
        counter++;
    }

    for (i = 0; i < numberOfStudentsInColumnThree; i++) {
        columnThreeStudentsArray[columnThreeStudentsArray.length] = arrayOfStudentObjects[counter];
        counter++;
    }

    if (col == 1) {
        return columnOneStudentsArray
    }
    if (col == 2) {
        return columnTwoStudentsArray
    }

    if (col == 3) {
        return columnThreeStudentsArray
    }


};

function generateSortedStudentArray() {
    let courseId = Session.get('courseId');
    var studentsDocument = Students.findOne({ ownerId: Meteor.userId(), courseId: courseId }).students;

    var unsortedStudentArray = [];

    for (i = 0; i < studentsDocument.length; i++) {
        let lastName = studentsDocument[i].studentLastName;
        let firstName = studentsDocument[i].studentFirstName;
        let studentId = studentsDocument[i].studentId;

        unsortedStudentArray[unsortedStudentArray.length] = lastName + ", " + firstName + "?" + studentId;
    }

    let sortedStudentArray = unsortedStudentArray.sort();
    return sortedStudentArray

}

function generateArrayOfStudentObjects(sortedStudentArray) {
    var arrayOfStudentObjects = [];

    for (i = 0; i < sortedStudentArray.length; i++) {
        var studentName = sortedStudentArray[i].substr(0, sortedStudentArray[i].indexOf('?'));
        var studentId = sortedStudentArray[i].substr(sortedStudentArray[i].indexOf('?') + 1, sortedStudentArray[i].length);
        var studentObject = {
            studentName: studentName,
            studentId: studentId,
            listNumber: i + 1
        }
        arrayOfStudentObjects[arrayOfStudentObjects.length] = studentObject;
    }

    return arrayOfStudentObjects
}

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

    var newStudentsDocument = Students.findOne({ ownerId: Meteor.userId(), courseId: courseId }).students;
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
        event.preventDefault();
        let courseId = Session.get('courseId');
        var studentsDocument = Students.findOne({ ownerId: Meteor.userId, courseId: courseId }).students;

        if (studentsDocument.length == 0) {
            addFirstStudent();
        }
        else {
            addNewStudent();
        }

        document.getElementById("studentLastName").focus()

        //send a toast
        let firstName = document.getElementById('studentFirstName').value;
        let lastName = document.getElementById('studentLastName').value;
        Materialize.toast(firstName + " " + lastName + " has been added to the student roster.", 3000, 'amber darken-3');

        document.getElementById("addStudentsModalForm").reset();
    },
    'click .addStudentsModalButton': function () {
        event.preventDefault();
        let courseId = Session.get('courseId');
        var studentsDocument = Students.findOne({ ownerId: Meteor.userId, courseId: courseId }).students;

        if (studentsDocument.length == 0) {
            addFirstStudent();
        }
        else {
            addNewStudent();
        }

        document.getElementById("studentLastName").focus()

        //send a toast
        let firstName = document.getElementById('studentFirstName').value;
        let lastName = document.getElementById('studentLastName').value;
        Materialize.toast(firstName + " " + lastName + " has been added to the student roster.", 3000, 'amber darken-3');

        document.getElementById("addStudentsModalForm").reset();
    },
    'click .addStudentsCancelButton': function(){
        document.getElementById("addStudentsModalForm").reset();
        $('#addStudentsModal').modal('close');
    }
});

Template.addStudents.helpers({
    studentsForColumnOne: function () {
        return organizeStudentsIntoColumns(1);
    },
    studentsForColumnTwo: function () {
        return organizeStudentsIntoColumns(2);
    },
    studentsForColumnThree: function () {
        return organizeStudentsIntoColumns(3);
    },
    hasStudents: function(){
        let courseId = Session.get('courseId');
        return Students.findOne({ownerId: Meteor.userId(), courseId: courseId}).students.length > 0;
    }
});