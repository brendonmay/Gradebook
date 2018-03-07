import { Students } from '../../../lib/collections.js';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Accounts } from 'meteor/accounts-base';

Template.editStudent.helpers({
    getFirstName: function(){
        return Session.get('selectedStudent').firstName;
    },

    getLastName: function(){
        return Session.get('selectedStudent').lastName;
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