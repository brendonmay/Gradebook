import { Students } from '../../../lib/collections.js';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Accounts } from 'meteor/accounts-base';

function clearFormValidation() {
    var form = document.getElementById('editStudentsModalForm');
    clearValidation(form);
}

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
        clearFormValidation();
        $('#editStudentModal').modal('close');
        $('#addStudentsModal').modal('open');
        return false;
    },
    'click #save-changes-edit-student': function(){
        document.getElementById("submit-edit-student").click();
        return false;
    },
});

Template.editStudent.onRendered(function () {
    $.validator.addMethod('containsIllegalCharacters', (input) => {
        const illegalCharacters = /[,<.>/?;:'"{}|`~!@#$%^&*()_+=\]\[\\1234567890]/g;
        return !(input.match(illegalCharacters)); 
    });
    $("#editStudentsModalForm").validate({
        errorClass: 'invalid',
        validClass: 'jquery-validation-valid',
        rules: {
            editStudentLastName: {
                required: true,
                containsIllegalCharacters: true
            },
            editStudentFirstName: {
                required: true,
                containsIllegalCharacters: true
            }
        },
        messages: {
            editStudentLastName: {
                containsIllegalCharacters: "Names can only contain alphabet letters and dashes(-)"
            },
            editStudentFirstName: {
                containsIllegalCharacters: "Names can only contain alphabet letters and dashes(-)"
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