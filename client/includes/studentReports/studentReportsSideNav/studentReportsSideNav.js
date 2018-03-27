import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Students } from '../../../../lib/collections.js';
import { Assessments } from '../../../../lib/collections.js';
import { Accounts } from 'meteor/accounts-base';
import { CourseWeighting } from '../../../../lib/collections.js';

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

Template.studentReportsSideNav.helpers({
    getStudents: function () {
        let sortedStudentArray = generateSortedStudentArray();
        return generateArrayOfStudentObjects(sortedStudentArray)
    },
});

Template.studentReportsSideNav.events({
    'click .studentSideNavElements': function() {
        var elementID = event.target.id;
        let sortedStudentArray = generateSortedStudentArray();
        const studentArray = generateArrayOfStudentObjects(sortedStudentArray) 
        for (var i = 0; i < studentArray.length; i++) {
            const studElementID = "studentDropDown-" + studentArray[i].studentId;
            var studDropDownEle = document.getElementById(studElementID);
            if (studDropDownEle.classList.contains('active')) {
                studDropDownEle.classList.remove('active');
                studDropDownEle.classList.remove('green');
            }
        }
        var elementSplit = elementID.split("-");
        var currentStudentID = elementSplit[1] + "-" + elementSplit[2];
        
        Session.set("currentSelectedStudentID", currentStudentID);
        document.getElementById(elementID).classList.add('active');
        document.getElementById(elementID).classList.add('green');
    },
});