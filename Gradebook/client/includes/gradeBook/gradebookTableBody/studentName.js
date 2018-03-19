import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Students } from '../../../../lib/collections.js';
import { Accounts } from 'meteor/accounts-base';

function generateSortedStudentArray() {
    let courseId = Session.get('courseId');
    var studentsDocument = Students.findOne({ ownerId: Meteor.userId(), courseId: courseId }).students;

    var unsortedStudentArray = [];

    for (i = 0; i < studentsDocument.length; i++) {
        let lastName = studentsDocument[i].studentLastName;
        let firstName = studentsDocument[i].studentFirstName;
        let studentId = studentsDocument[i].studentId;

        if (studentId != "s-0"){
            unsortedStudentArray[unsortedStudentArray.length] = lastName + ", " + firstName + "?" + studentId;
        }
    }

    let sortedStudentArray = unsortedStudentArray.sort();
    return sortedStudentArray

}

function insertGrade() {
    const courseId = Session.get('courseId');
    const inputId = event.target.id;
    const category = inputId[0];
    const studentId = inputId.slice(inputId.indexOf("?") + 1, inputId.indexOf("#"));
    const assessmentId = inputId.slice(inputId.indexOf("#") + 1, inputId.length);
    const grade = event.target.value;

    Meteor.call('students.insertGrade', Meteor.userId(), courseId, category, studentId, assessmentId, grade);
}

function generateArrayOfStudentObjects(sortedStudentArray) {
    var arrayOfStudentObjects = [];

    for (i = 0; i < sortedStudentArray.length; i++) {
        var studentName = sortedStudentArray[i].substr(0, sortedStudentArray[i].indexOf('?'));
        var lastName = studentName.substr(0, studentName.indexOf(',')) + ",";
        var firstName = studentName.substr(studentName.indexOf(',') + 2, studentName.length);
        var studentId = sortedStudentArray[i].substr(sortedStudentArray[i].indexOf('?') + 1, sortedStudentArray[i].length);
        var studentObject = {
            fullName: studentName,
            firstName: firstName,
            lastName: lastName,
            studentId: studentId,
            listNumber: i + 1
        }
        arrayOfStudentObjects[arrayOfStudentObjects.length] = studentObject;
    }

    return arrayOfStudentObjects
}

Template.studentName.helpers({
    getStudents: function () {
        let sortedStudentArray = generateSortedStudentArray();
        return generateArrayOfStudentObjects(sortedStudentArray)
    },
    getCurrentGrade: function (studentId) { //design this function last
        return "98%"
    },
    getStudentGradesForAssessments: function (studentId) {
        let courseId = Session.get('courseId');
        var students = Students.findOne({ ownerId: Meteor.userId(), courseId: courseId }).students;
        var grades = []
        for (i = 0; i < students.length; i++) {
            if (students[i].studentId == studentId) {
                grades = students[i].grades;
                i = students.length;
            }
        }
        return grades
    }
});

Template.studentName.events({
    'blur .gradeInput': function () {
        insertGrade()
    },
    'click .gradeInput': function () {
        event.target.setSelectionRange(0, event.target.value.length)
    },
    'keyup .gradeInput': function () {
        if (event.keyCode === 13) { //if enter is hit
            var inputId = event.target.id;
            var category = inputId[0];
            var studentId = inputId.slice(inputId.indexOf("?") + 1, inputId.indexOf("#"));
            var sortedStudentArray = generateSortedStudentArray();
            var sortedStudentObjects = generateArrayOfStudentObjects(sortedStudentArray);
            var assessmentId = inputId.slice(inputId.indexOf("#") + 1, inputId.length);

            if (category == "K") {
                var potentialNewInputId = "A" + inputId.slice(1, inputId.length);
                if (!document.getElementById(potentialNewInputId).hasAttribute("disabled")) {
                    document.getElementById(potentialNewInputId).focus();
                    document.getElementById(potentialNewInputId).setSelectionRange(0, document.getElementById(potentialNewInputId).value.length);
                    //console.log("A is not disabled");
                }
                else {
                    var potentialNewInputId = "T" + inputId.slice(1, inputId.length);
                    if (!document.getElementById(potentialNewInputId).hasAttribute("disabled")) {
                        document.getElementById(potentialNewInputId).focus();
                        document.getElementById(potentialNewInputId).setSelectionRange(0, document.getElementById(potentialNewInputId).value.length);
                        //console.log("T is not disabled");
                    }
                    else {
                        var potentialNewInputId = "C" + inputId.slice(1, inputId.length);
                        if (!document.getElementById(potentialNewInputId).hasAttribute("disabled")) {
                            document.getElementById(potentialNewInputId).focus();
                            document.getElementById(potentialNewInputId).setSelectionRange(0, document.getElementById(potentialNewInputId).value.length);
                            //console.log("C is not disabled");
                        }
                        else {
                            //move to next row
                            for (i = 0; i < sortedStudentObjects.length; i++) {
                                if (sortedStudentObjects[i].studentId == studentId) {
                                    //check it isnt the last student
                                    if (i == (sortedStudentObjects.length - 1)) {
                                        //console.log("last student");
                                        return false
                                    }
                                    else {
                                        studentId = sortedStudentObjects[i + 1].studentId;
                                        i = sortedStudentObjects.length;
                                    }
                                }
                            }
                            var newInputIdK = "K?" + studentId + "#" + assessmentId;
                            var newInputIdA = "A?" + studentId + "#" + assessmentId;
                            var newInputIdT = "T?" + studentId + "#" + assessmentId;
                            var newInputIdC = "C?" + studentId + "#" + assessmentId;
                            if (!document.getElementById(newInputIdK).hasAttribute("disabled")) {
                                document.getElementById(newInputIdK).focus();
                                document.getElementById(newInputIdK).setSelectionRange(0, document.getElementById(newInputIdK).value.length);
                            }
                            else if (!document.getElementById(newInputIdA).hasAttribute("disabled")) {
                                document.getElementById(newInputIdA).focus();
                                document.getElementById(newInputIdA).setSelectionRange(0, document.getElementById(newInputIdA).value.length);

                            }
                            else if (!document.getElementById(newInputIdT).hasAttribute("disabled")) {
                                document.getElementById(newInputIdT).focus();
                                document.getElementById(newInputIdT).setSelectionRange(0, document.getElementById(newInputIdT).value.length);

                            }
                            else if (!document.getElementById(newInputIdC).hasAttribute("disabled")) {
                                document.getElementById(newInputIdC).focus();
                                document.getElementById(newInputIdC).setSelectionRange(0, document.getElementById(newInputIdC).value.length);

                            }
                        }
                    }
                }
            }
            if (category == "A") {
                var potentialNewInputId = "T" + inputId.slice(1, inputId.length);
                if (!document.getElementById(potentialNewInputId).hasAttribute("disabled")) {
                    document.getElementById(potentialNewInputId).focus();
                    document.getElementById(potentialNewInputId).setSelectionRange(0, document.getElementById(potentialNewInputId).value.length);
                    //console.log("T is not disabled");
                }
                else {
                    var potentialNewInputId = "C" + inputId.slice(1, inputId.length);
                    if (!document.getElementById(potentialNewInputId).hasAttribute("disabled")) {
                        document.getElementById(potentialNewInputId).focus();
                        document.getElementById(potentialNewInputId).setSelectionRange(0, document.getElementById(potentialNewInputId).value.length);
                        //console.log("C is not disabled");
                    }
                    else {
                        //move to next row
                        for (i = 0; i < sortedStudentObjects.length; i++) {
                            if (sortedStudentObjects[i].studentId == studentId) {
                                //check it isnt the last student
                                if (i == (sortedStudentObjects.length - 1)) {
                                    //console.log("last student");
                                    return false
                                }
                                else {
                                    studentId = sortedStudentObjects[i + 1].studentId;
                                    i = sortedStudentObjects.length;
                                }
                            }
                        }
                        var newInputIdK = "K?" + studentId + "#" + assessmentId;
                        var newInputIdA = "A?" + studentId + "#" + assessmentId;
                        var newInputIdT = "T?" + studentId + "#" + assessmentId;
                        var newInputIdC = "C?" + studentId + "#" + assessmentId;
                        if (!document.getElementById(newInputIdK).hasAttribute("disabled")) {
                            document.getElementById(newInputIdK).focus();
                            document.getElementById(newInputIdK).setSelectionRange(0, document.getElementById(newInputIdK).value.length);
                        }
                        else if (!document.getElementById(newInputIdA).hasAttribute("disabled")) {
                            document.getElementById(newInputIdA).focus();
                            document.getElementById(newInputIdA).setSelectionRange(0, document.getElementById(newInputIdA).value.length);

                        }
                        else if (!document.getElementById(newInputIdT).hasAttribute("disabled")) {
                            document.getElementById(newInputIdT).focus();
                            document.getElementById(newInputIdT).setSelectionRange(0, document.getElementById(newInputIdT).value.length);

                        }
                        else if (!document.getElementById(newInputIdC).hasAttribute("disabled")) {
                            document.getElementById(newInputIdC).focus();
                            document.getElementById(newInputIdC).setSelectionRange(0, document.getElementById(newInputIdC).value.length);

                        }
                    }
                }
            }
            if (category == "T") {
                var potentialNewInputId = "C" + inputId.slice(1, inputId.length);
                if (!document.getElementById(potentialNewInputId).hasAttribute("disabled")) {
                    document.getElementById(potentialNewInputId).focus();
                    document.getElementById(potentialNewInputId).setSelectionRange(0, document.getElementById(potentialNewInputId).value.length);
                    //console.log("C is not disabled");
                }
                else {
                    //move to next row
                    for (i = 0; i < sortedStudentObjects.length; i++) {
                        if (sortedStudentObjects[i].studentId == studentId) {
                            //check it isnt the last student
                            if (i == (sortedStudentObjects.length - 1)) {
                                //console.log("last student");
                                return false
                            }
                            else {
                                studentId = sortedStudentObjects[i + 1].studentId;
                                i = sortedStudentObjects.length;
                            }
                        }
                    }
                    var newInputIdK = "K?" + studentId + "#" + assessmentId;
                    var newInputIdA = "A?" + studentId + "#" + assessmentId;
                    var newInputIdT = "T?" + studentId + "#" + assessmentId;
                    var newInputIdC = "C?" + studentId + "#" + assessmentId;
                    if (!document.getElementById(newInputIdK).hasAttribute("disabled")) {
                        document.getElementById(newInputIdK).focus();
                        document.getElementById(newInputIdK).setSelectionRange(0, document.getElementById(newInputIdK).value.length);
                    }
                    else if (!document.getElementById(newInputIdA).hasAttribute("disabled")) {
                        document.getElementById(newInputIdA).focus();
                        document.getElementById(newInputIdA).setSelectionRange(0, document.getElementById(newInputIdA).value.length);

                    }
                    else if (!document.getElementById(newInputIdT).hasAttribute("disabled")) {
                        document.getElementById(newInputIdT).focus();
                        document.getElementById(newInputIdT).setSelectionRange(0, document.getElementById(newInputIdT).value.length);

                    }
                    else if (!document.getElementById(newInputIdC).hasAttribute("disabled")) {
                        document.getElementById(newInputIdC).focus();
                        document.getElementById(newInputIdC).setSelectionRange(0, document.getElementById(newInputIdC).value.length);

                    }
                }
            }
            if (category == "C") {
                for (i = 0; i < sortedStudentObjects.length; i++) {
                    if (sortedStudentObjects[i].studentId == studentId) {
                        //check it isnt the last student
                        if (i == (sortedStudentObjects.length - 1)) {
                            //console.log("last student");
                            return false
                        }
                        else {
                            studentId = sortedStudentObjects[i + 1].studentId;
                            i = sortedStudentObjects.length;
                        }
                    }
                }
                var newInputIdK = "K?" + studentId + "#" + assessmentId;
                var newInputIdA = "A?" + studentId + "#" + assessmentId;
                var newInputIdT = "T?" + studentId + "#" + assessmentId;
                var newInputIdC = "C?" + studentId + "#" + assessmentId;
                if (!document.getElementById(newInputIdK).hasAttribute("disabled")) {
                    document.getElementById(newInputIdK).focus();
                    document.getElementById(newInputIdK).setSelectionRange(0, document.getElementById(newInputIdK).value.length);
                }
                else if (!document.getElementById(newInputIdA).hasAttribute("disabled")) {
                    document.getElementById(newInputIdA).focus();
                    document.getElementById(newInputIdA).setSelectionRange(0, document.getElementById(newInputIdA).value.length);

                }
                else if (!document.getElementById(newInputIdT).hasAttribute("disabled")) {
                    document.getElementById(newInputIdT).focus();
                    document.getElementById(newInputIdT).setSelectionRange(0, document.getElementById(newInputIdT).value.length);

                }
                else if (!document.getElementById(newInputIdC).hasAttribute("disabled")) {
                    document.getElementById(newInputIdC).focus();
                    document.getElementById(newInputIdC).setSelectionRange(0, document.getElementById(newInputIdC).value.length);

                }
            }
        }
    }
})