import { Students } from '../../../lib/collections.js';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Accounts } from 'meteor/accounts-base';

Template.deleteStudent.helpers({
    studentName: function(){
        return Session.get('selectedStudent').studentName;
    }

});

Template.deleteStudent.events({
    'click #deleteStudent-yes': function(){
        let courseId = Session.get('courseId');
        let studentId = Session.get('selectedStudent').studentId;
        let studentName = Session.get('selectedStudent').studentName;
        var currentStudentArray = Students.findOne({ownerId: Meteor.userId(), courseId: courseId}).students;

        for (i = 0; i < currentStudentArray.length; i++){
            if (currentStudentArray[i].studentId == studentId){
                currentStudentArray.splice(i, 1);
                break
            }
        }
        Meteor.call('students.addNewStudent', Meteor.userId(), courseId, currentStudentArray);
        $('#deleteStudentModal').modal('close');
        $('#addStudentsModal').modal('open');
        Materialize.toast(studentName + " has been removed from the student roster.", 3000, 'amber darken-3');
    },
    'click #deleteStudent-no': function(){
        $('#addStudentsModal').modal('open');
    }
});