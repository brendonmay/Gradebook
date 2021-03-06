import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Courses } from '../../../lib/collections.js';
import { Accounts } from 'meteor/accounts-base';
import { CourseWeighting } from '../../../lib/collections.js';
import { Assessments } from '../../../lib/collections.js';
import jqueryValidation from 'jquery-validation';

import '../../main.html';

function closeAssignFinalModal() {
    document.getElementById("finalMustHaveOneErrorMessage").style.display = "none";
    var form = document.getElementById("assignFinalFormId");
    form.reset();
    clearValidation(form);

    let checkboxK = document.getElementById("finalCheckboxK");
    let checkboxA = document.getElementById("finalCheckboxA");
    let checkboxT = document.getElementById("finalCheckboxT");
    let checkboxC = document.getElementById("finalCheckboxC");

    if (checkboxK.hasAttribute("checked")) {
        checkboxK.removeAttribute("checked");
    }
    if (checkboxA.hasAttribute("checked")) {
        checkboxA.removeAttribute("checked");
    }
    if (checkboxT.hasAttribute("checked")) {
        checkboxT.removeAttribute("checked");
    }
    if (checkboxC.hasAttribute("checked")) {
        checkboxC.removeAttribute("checked");
    }

    let inputMarkK = document.getElementById("inputFinalMarkK");
    let inputMarkA = document.getElementById("inputFinalMarkA");
    let inputMarkT = document.getElementById("inputFinalMarkT");
    let inputMarkC = document.getElementById("inputFinalMarkC");

    inputMarkK.setAttribute('disabled', "disabled")
    inputMarkA.setAttribute('disabled', "disabled")
    inputMarkT.setAttribute('disabled', "disabled")
    inputMarkC.setAttribute('disabled', "disabled")

    $('#assignFinalModal').modal('close');
}

Template.assignFinal.helpers({
    getAssessmentTypes: function () {
        let currentCourseId = Session.get('courseId');
        let finalAssessments = CourseWeighting.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId });
        if (!finalAssessments || !finalAssessments.finalAssessmentTypes) return;
        let finalAssessmentTypes = finalAssessments.finalAssessmentTypes;
        finalAssessments = Assessments.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId });
        if (!finalAssessments || !finalAssessments.finalAssessmentTypes) return;
        var finalAssessmentTypeObjects = finalAssessments.finalAssessmentTypes;
        var unassignedFinalEvaluationIds = [];
        var arrayOfEvaluationsToReturn = [];

        //check which final assessment Type Ids have not already been assigned
        for (i = 0; i < finalAssessmentTypeObjects.length; i++) {
            if (finalAssessmentTypeObjects[i].K == "N/A" && finalAssessmentTypeObjects[i].A == "N/A" && finalAssessmentTypeObjects[i].T == "N/A" && finalAssessmentTypeObjects[i].C == "N/A") {
                let unassignedAssessmentTypeId = finalAssessmentTypeObjects[i].assessmentTypeId;
                unassignedFinalEvaluationIds[unassignedFinalEvaluationIds.length] = unassignedAssessmentTypeId;
            }
        }

        //We now have all the Ids of the unassigned final assessments. We must find their names
        for (i = 0; i < unassignedFinalEvaluationIds.length; i++) {
            for (z = 0; z < finalAssessmentTypes.length; z++) {
                if (unassignedFinalEvaluationIds[i] == finalAssessmentTypes[z].assessmentTypeId) {
                    //console.log(finalAssessmentTypes[z].assessmentType + " is the name of assessmentTypeId: " + unassignedFinalEvaluationIds[i]);
                    var assessmentName = finalAssessmentTypes[z].assessmentType;
                    var unassignedEvaluation = { assessmentType: assessmentName };
                    arrayOfEvaluationsToReturn[arrayOfEvaluationsToReturn.length] = unassignedEvaluation;
                }
            }
        }

        return arrayOfEvaluationsToReturn
    }
});

Template.assignFinal.events({
    'submit .assignFinalForm': function () {
        let currentCourseId = Session.get('courseId');
        let assessmentType = document.getElementById("finalAssessmentType").value;
        var assessmentDate = document.getElementById("createNewFinalAssessmentDate").value;

        var markK = document.getElementById("inputFinalMarkK").value;
        var markA = document.getElementById("inputFinalMarkA").value;
        var markT = document.getElementById("inputFinalMarkT").value;
        var markC = document.getElementById("inputFinalMarkC").value;

        let finalAssessmentTypes = CourseWeighting.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).finalAssessmentTypes;
        var assessmentObjects = Assessments.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).finalAssessmentTypes;

        if ((markK == "" || markK == "N/A") &&
            (markA == "" || markA == "N/A") &&
            (markT == "" || markT == "N/A") &&
            (markC == "" || markC == "N/A")) {

            document.getElementById("finalMustHaveOneErrorMessage").style.display = "";
            return false;
        } else {
            document.getElementById("finalMustHaveOneErrorMessage").style.display = "none";
        }

        var assessmentTypeId = "";
        for (i = 0; i < finalAssessmentTypes.length; i++) {
            if (finalAssessmentTypes[i].assessmentType == assessmentType) {
                assessmentTypeId = finalAssessmentTypes[i].assessmentTypeId
            }
        }

        if (markK != "N/A") {
            markK = Number(markK)
        }
        if (markA != "N/A") {
            markA = Number(markA)
        }
        if (markT != "N/A") {
            markT = Number(markT)
        }
        if (markC != "N/A") {
            markC = Number(markC)
        }
        if (assessmentDate == "") {
            assessmentDate = "N/A"
        }

        for (i = 0; i < assessmentObjects.length; i++) {
            if (assessmentObjects[i].assessmentTypeId == assessmentTypeId) {
                assessmentObjects[i].K = markK;
                assessmentObjects[i].A = markA;
                assessmentObjects[i].T = markT;
                assessmentObjects[i].C = markC;
                assessmentObjects[i].Date = assessmentDate;
            }
        }
        Meteor.call('assessments.updateFinalAssessments', currentCourseId, assessmentObjects);
        Meteor.call('students.addNewAssessment', Meteor.userId(), currentCourseId, assessmentTypeId);
        Session.set("gradebookUpdated", true);

        closeAssignFinalModal();
    },
    'click .final-check-box': function () {
        let target = event.target;
        let elementId = target.id;
        if (elementId != "dontTargetFinal") {
            let element = document.getElementById(elementId);
            let inputId = "inputFinalMark" + elementId[elementId.length - 1];
            let inputField = document.getElementById(inputId);

            if (element.hasAttribute("checked") == true) {
                element.removeAttribute("checked");
                inputField.disabled = true;
                var errorElement = document.getElementById(inputId + "-error");
                if (errorElement) {
                    errorElement.remove();
                }
                inputField.classList.remove("invalid");
                inputField.value = "N/A"
            }

            else if (element.hasAttribute("checked") == false) {
                element.setAttribute("checked", "checked");
                inputField.disabled = false;
                inputField.value = ""
                inputField.focus();
            }
        }
    },
    'click #assignFinalCancel': function () {
        closeAssignFinalModal();
        $('.assignFinalModal').modal('close');
    },
});

Template.assignFinal.onRendered(function () {
    // $('.datepicker').pickadate({
    //     selectMonths: true, // Creates a dropdown to control month
    //     selectYears: 15, // Creates a dropdown of 15 years to control year,
    //     today: 'Today',
    //     clear: 'Clear',
    //     close: 'Ok',
    //     container: '#modalsWithDatePicker',
    //     closeOnSelect: false // Close upon selecting a date,
    // });
    // $('.assignFinalModal').modal({
    //     dismissible: true, // Modal can be dismissed by clicking outside of the modal
    //     complete: function () {
    //         closeAssignFinalModal();
    //     }
    // }
    // );
    $.validator.addMethod('isInteger', (input) => {
        return (input == "N/A" || Math.floor(input) == input);
    });
    $.validator.addMethod('isPositive', (input) => {
        return (input > 0);
    });
    $("#assignFinalFormId").validate({
        errorClass: 'invalid',
        validClass: 'jquery-validation-valid',
        rules: {
            marksKFinal: {
                isInteger: true,
                isPositive: true
            },
            marksAFinal: {
                isInteger: true,
                isPositive: true
            },
            marksTFinal: {
                isInteger: true,
                isPositive: true
            },
            marksCFinal: {
                isInteger: true,
                isPositive: true
            },
            finalAssessmentTypeSelect: {
                required: true
            }
        },
        messages: {
            marksKFinal: {
                isInteger: "A selected category's mark must be an integer.",
                isPositive: "A selected category's mark must be greater than 0."
            },
            marksAFinal: {
                isInteger: "A selected category's mark must be an integer.",
                isPositive: "A selected category's mark must be greater than 0."
            },
            marksTFinal: {
                isInteger: "A selected category's mark must be an integer.",
                isPositive: "A selected category's mark must be greater than 0."
            },
            marksCFinal: {
                isInteger: "A selected category's mark must be an integer.",
                isPositive: "A selected category's mark must be greater than 0."
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