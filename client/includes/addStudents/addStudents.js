import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Courses } from '../../../lib/collections.js';
import { Accounts } from 'meteor/accounts-base';
import { CourseWeighting } from '../../../lib/collections.js';
import { Assessments } from '../../../lib/collections.js';
import { Students } from '../../../lib/collections.js';
import jqueryValidation from 'jquery-validation';
import { Meteor } from 'meteor/meteor';

import '../../main.html';

function clearAddStudentValidation() {
    var addStudentsForm = document.getElementById('addStudentsModalForm');
    clearValidation(addStudentsForm);
}

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

        if (studentId != "s-0") {
            unsortedStudentArray[unsortedStudentArray.length] = lastName + ", " + firstName + "?" + studentId;
        }
    }

    let sortedStudentArray = unsortedStudentArray.sort();
    return sortedStudentArray

}

function generateArrayOfStudentObjects(sortedStudentArray) {
    var arrayOfStudentObjects = [];

    for (i = 0; i < sortedStudentArray.length; i++) {
        var studentName = sortedStudentArray[i].substr(0, sortedStudentArray[i].indexOf('?'));
        var studentId = sortedStudentArray[i].substr(sortedStudentArray[i].indexOf('?') + 1, sortedStudentArray[i].length);
        if (studentName.length >= 20){
            var shortStudentName = studentName.substring(0, studentName.indexOf(",") + 3) + ".";
        }
        else{
            var shortStudentName = studentName;
        }
        var studentObject = {
            studentName: studentName,
            studentId: studentId,
            listNumber: i + 1,
            shortStudentName
        }
        arrayOfStudentObjects[arrayOfStudentObjects.length] = studentObject;
    }

    return arrayOfStudentObjects
}

function editStudentEvent() {
    let target = event.target;
    let targetId = target.parentElement.id
    let studentId = targetId.slice(3, targetId.indexOf('?'));
    let studentName = targetId.slice(targetId.indexOf('?') + 1, targetId.length);
    let lastName = studentName.slice(0, studentName.indexOf(', '));
    let firstName = studentName.slice(studentName.indexOf(', ') + 2, studentName.length);
    Session.set('selectedStudent', { studentId: "studentId", firstName: "firstName", lastName: "lastName" });
    Session.set('selectedStudent', { studentId: studentId, firstName: firstName, lastName: lastName });
    clearAddStudentValidation();
    $('#addStudentsModal').modal('close');
    $('#editStudentModal').modal({
        dismissible: true,
        ready: function (modal, trigger) {
            Materialize.updateTextFields();
        },
        complete: function () {
            clearAddStudentValidation();
            $('#addStudentsModal').modal('open');
            var form = document.getElementById('editStudentsModalForm');
            clearValidation(form);
        }
    }
    );
    $('#editStudentModal').modal('open');
}

function generateGradesArray() {
    let courseId = Session.get('courseId');
    var assessmentOrder = Students.findOne({ ownerId: Meteor.userId(), courseId }).students[0].grades;
    var grades = [];

    for (i = 0; i < assessmentOrder.length; i++) {
        var assessmentId = assessmentOrder[i].assessmentId;
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
    Meteor.call('calculatedgrades.addStudent', Meteor.userId(), courseId, newStudentId);
}

Template.addStudents.events({
    'submit #addStudentsModalForm': function () {
        event.preventDefault();
        let courseId = Session.get('courseId');
        var studentsDocument = Students.findOne({ ownerId: Meteor.userId, courseId: courseId }).students;

        var firstNameInput = document.getElementById('studentFirstName');
        var lastNameInput = document.getElementById('studentLastName');

        if (Students.findOne({ ownerId: Meteor.userId(), courseId: courseId }).students.length == 39) {
            Materialize.toast("Your student roster is currently full.", 3000, 'amber darken-3');
            return false
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
        clearAddStudentValidation();
    },
    'click .addStudentsModalButton': function () {
        document.getElementById("submit-add-student").click();
        return false
    },
    'click .addStudentsCancelButton': function () {
        document.getElementById("addStudentsModalForm").reset();
        clearAddStudentValidation();
        $('#addStudentsModal').modal('close');
    },
    'click .deleteStudent': function () {
        let target = event.target;
        let targetId = target.parentElement.id
        let studentId = targetId.slice(3, targetId.indexOf('?'));
        let studentName = targetId.slice(targetId.indexOf('?') + 1, targetId.length);
        let lastName = studentName.slice(0, studentName.indexOf(', '));
        let firstName = studentName.slice(studentName.indexOf(', ') + 2, studentName.length);
        let firstThenLastName = firstName + " " + lastName;

        Session.set('selectedStudent', { studentId: studentId, studentName: firstThenLastName });
        clearAddStudentValidation();
        $('#addStudentsModal').modal('close');
        $('#deleteStudentModal').modal({
            dismissible: true,
            complete: function () {
                clearAddStudentValidation();
                $('#addStudentsModal').modal('open');
            }
        }
        );
        $('#deleteStudentModal').modal('open');
    },
    'click .editStudent': function () {
        editStudentEvent();
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
    hasStudents: function () {
        let courseId = Session.get('courseId');
        let students = Students.findOne({ ownerId: Meteor.userId(), courseId: courseId });
        if (students && students.students) {
            return Students.findOne({ ownerId: Meteor.userId(), courseId: courseId }).students.length > 1;
        }
    }
});

Template.addStudents.onRendered(function () {
    $.validator.addMethod('containsIllegalCharacters', (input) => {
        const illegalCharacters = /[,<.>/?;:'"{}|`~!@#$%^&*()_+=\]\[\\1234567890]/g;
        return !(input.match(illegalCharacters));
    });
    $("#addStudentsModalForm").validate({
        errorClass: 'invalid',
        validClass: 'jquery-validation-valid',
        rules: {
            lastName: {
                required: true,
                containsIllegalCharacters: true,
                maxlength: 16
            },
            firstName: {
                required: true,
                containsIllegalCharacters: true,
                maxlength: 16
            }
        },
        messages: {
            lastName: {
                containsIllegalCharacters: "Names can only contain alphabet letters and dashes(-).",
                maxlength: "Last name cannot be longer then 16 characters."
            },
            firstName: {
                containsIllegalCharacters: "Names can only contain alphabet letters and dashes(-).",
                maxlength: "First name cannot be longer then 16 characters."
            }
        },
        errorElement: 'div',
        errorPlacement: function (error, element) {
            var placement = $(element).data('error');
            if (placement) {
                $(placement).append(error)
            } else {
                error.insertAfter(element);
            }
        }
    });
});