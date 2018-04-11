import { Template } from 'meteor/templating';
import { Accounts } from 'meteor/accounts-base';
import { Assessments } from '../../../lib/collections.js';
import jqueryValidation from 'jquery-validation';

import '../../main.html';

function renameAssessment() {
    var courseId = Session.get('courseId');
    var assessmentId = Session.get('selectedAssessment').assessmentId;
    var assessmentTypeId = assessmentId.slice(0, assessmentId.indexOf('-'));
    var newAssessmentName = document.getElementById("editAssessmentName").value;
    var courseAssessmentTypes = Assessments.findOne({ ownerId: Meteor.userId(), courseId: courseId }).courseAssessmentTypes;

    for (i = 0; i < courseAssessmentTypes.length; i++) {
        if (courseAssessmentTypes[i].assessmentTypeId == assessmentTypeId) {
            let assessments = courseAssessmentTypes[i].assessments;
            for (z = 0; z < assessments.length; z++) {
                if (courseAssessmentTypes[i].assessments[z].assessmentId == assessmentId) {
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
    getAssessmentName: function () {
        var assessment = Session.get('selectedAssessment');
        if (assessment) {
            var assessmentName = assessment.assessmentName;
            return assessmentName
        }
        return "";
    },
    fillAssessmentName: function () {
        var assessment = Session.get('selectedAssessment');
        if (assessment && document.getElementById('editAssessmentName')) {
            document.getElementById('editAssessmentName').value = Session.get('selectedAssessment').assessmentName;
        }
        return "";
    }
});

Template.renameAssessment.events({
    'click #save-changes-edit-assessmentName': function () {
        renameAssessment()
    },
    'submit #renameAssessmentModalForm': function () {
        renameAssessment()
    }
});

Template.renameAssessment.onRendered(function () {
    $("#renameAssessmentModalForm").validate({
        errorClass: 'invalid',
        validClass: 'jquery-validation-valid',
        rules: {
            renameAssessmentName: {
                required: true
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