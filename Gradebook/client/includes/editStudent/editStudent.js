import { Students } from '../../../lib/collections.js';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Accounts } from 'meteor/accounts-base';

function getStudentName(part){
    let firstName = Session.get('selectedStudent').firstName;
    let lastName = Session.get('selectedStudent').lastName;
    let studentName = firstname + " " + lastname;

    if (part == "first"){
        return firstName
    }
    if (part == "last"){
        return lastName
    }
    if (part == "full"){
        return studentName
    }
    else{
        console.log("invalid arguement")
        return false
    }
};

Template.editStudent.helpers({
    studentName: function(){
        getStudentName("full");
    },
    getFirstName: function(){
        getStudentName("first");
    },
    getFirstName: function(){
        getStudentName("last");
    },
});

Template.editStudent.events({
    'submit #editStudentsModalForm': function(){
        let firstName = document.getElementById('editStudentFirstName').value;
        let lastName = document.getElementById('editStudentLastName').value;
        let studentId = Session.get('selectedStudent').studentId;
        let courseId = Session.get('courseId');

        var studentsDocument = Students.findOne({ownerId: Meteor.userId, courseId: courseId}).students;
        for (i = 0; i < studentsDocument.length; i++){
            if (studentsDocument[i].studentId == studentId){
                studentsDocument[i].studentFirstName = firstName;
                studentsDocument[i].studentLastName = lastName;
                break;
            }
        }
        Meteor.call('students.addNewStudent', Meteor.userId(), courseId, studentsDocument)
        Materialize.toast('Your changes have been saved', 3000, 'amber darken-3');
        $('#editStudentModal').modal('close');
        $('#addStudentsModal').modal('open');
    },
    'click #save-changes-edit-student': function(){
        let firstName = document.getElementById('editStudentFirstName').value;
        let lastName = document.getElementById('editStudentLastName').value;
        let studentId = Session.get('selectedStudent').studentId;
        let courseId = Session.get('courseId');

        var studentsDocument = Students.findOne({ownerId: Meteor.userId, courseId: courseId}).students;
        for (i = 0; i < studentsDocument.length; i++){
            if (studentsDocument[i].studentId == studentId){
                studentsDocument[i].studentFirstName = firstName;
                studentsDocument[i].studentLastName = lastName;
                break;
            }
        }
        Meteor.call('students.addNewStudent', Meteor.userId(), courseId, studentsDocument)
        Materialize.toast('Your changes have been saved', 3000, 'amber darken-3');
        $('#editStudentModal').modal('close');
        $('#addStudentsModal').modal('open');
    },
});