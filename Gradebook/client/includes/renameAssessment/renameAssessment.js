import { Template } from 'meteor/templating';
import { Accounts } from 'meteor/accounts-base';
import { Assessments } from '../../../lib/collections.js';
import jqueryValidation from 'jquery-validation';

import '../../main.html';

function renameAssessment(){
    var courseId = Session.get('courseId');
    var assessmentId = Session.get('selectedAssessment').assessmentId;
    var assessmentTypeId = assessmentId.slice(0, assessmentId.indexOf('-'));
    var newAssessmentName = document.getElementById("editAssessmentName").value;
    var courseAssessmentTypes = Assessments.findOne({ownerId: Meteor.userId(), courseId: courseId}).courseAssessmentTypes;

    console.log(courseId, assessmentId, assessmentTypeId, newAssessmentName, courseAssessmentTypes);

    for (i = 0; i < courseAssessmentTypes.length; i++){
        if (courseAssessmentTypes[i].assessmentTypeId == assessmentTypeId){
            let assessments = courseAssessmentTypes[i].assessments;
            for(z = 0; z < assessments.length; z++){
                if (courseAssessmentTypes[i].assessments[z].assessmentId == assessmentId){
                    courseAssessmentTypes[i].assessments[z].assessmentName = newAssessmentName;
                    z = assessments.length;
                    i = courseAssessmentTypes.length;
                }
            }
        }
    }
    Meteor.call('assessments.updateAssessments', courseId, courseAssessmentTypes);
    $('#renameAssessmentModal').modal('close');
    Materialize.toast('Your changes have been saved', 3000, 'amber darken-3');
}

Template.renameAssessment.helpers({
    getAssessmentName: function(){
        var assessmentName = Session.get('selectedAssessment').assessmentName;
        return assessmentName
    }
});

Template.renameAssessment.events({
    'click #save-changes-edit-assessmentName': function(){
        renameAssessment()
    },
    'submit #renameAssessmentModalForm': function(){
        renameAssessment()
    }
});

Template.renameAssessment.onRendered(function() {
    $("#renameAssessmentModalForm").validate({
        errorClass: 'invalid',
        validClass: 'jquery-validation-valid',
        rules: {
            renameAssessmentName: {
                required: true,
                maxlength: 15
            }
        },
        messages: {
            courseName: {
                maxlength: "Course Names cannot exceed 15 characters"
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