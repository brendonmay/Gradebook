import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Courses } from '../../../lib/collections.js';
import { Accounts } from 'meteor/accounts-base';
import { CourseWeighting } from '../../../lib/collections.js';
import { Assessments } from '../../../lib/collections.js';
import jqueryValidation from 'jquery-validation';

import '../../main.html';

function clearValidation(formElement) {
    //Internal $.validator is exposed through $(form).validate()
    var validator = $(formElement).validate();
    //Iterate through named elements inside of the form, and mark them as error free
    $('[name]', formElement).each(function () {
        validator.successList.push(this);//mark as error free
        validator.showErrors();//remove error messages if present
    });
    validator.resetForm();//remove error class on name elements and clear history
    validator.reset();//remove all error and success data
}

function closeAssignFinalModal() {
    //clear the input fields
    var form = document.getElementById("assignFinalFormId");
    form.reset();
    clearValidation(form);

    //uncheck the checkboxes
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

    //disable inputs
    let inputMarkK = document.getElementById("inputFinalMarkK");
    let inputMarkA = document.getElementById("inputFinalMarkA");
    let inputMarkT = document.getElementById("inputFinalMarkT");
    let inputMarkC = document.getElementById("inputFinalMarkC");

    inputMarkK.setAttribute('disabled', "disabled")
    inputMarkA.setAttribute('disabled', "disabled")
    inputMarkT.setAttribute('disabled', "disabled")
    inputMarkC.setAttribute('disabled', "disabled")

    //close the modal
    $('#assignFinalModal').modal('close');
}

Template.assignFinal.helpers({ //make sure that this only returns assessments that have not been assigned yet
    getAssessmentTypes: function () {
        let currentCourseId = Session.get('courseId');
        let finalAssessmentTypes = CourseWeighting.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).finalAssessmentTypes;
        var finalAssessmentTypeObjects = Assessments.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).finalAssessmentTypes;
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
        let assessmentDate = document.getElementById("createNewFinalAssessmentDate").value;

        var markK = document.getElementById("inputFinalMarkK").value;
        var markA = document.getElementById("inputFinalMarkA").value;
        var markT = document.getElementById("inputFinalMarkT").value;
        var markC = document.getElementById("inputFinalMarkC").value;

        let finalAssessmentTypes = CourseWeighting.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).finalAssessmentTypes;
        var assessmentObjects = Assessments.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).finalAssessmentTypes;


        //find assessmentTypeId
        var assessmentTypeId = "";
        for (i = 0; i < finalAssessmentTypes.length; i++) {
            if (finalAssessmentTypes[i].assessmentType == assessmentType) {
                assessmentTypeId = finalAssessmentTypes[i].assessmentTypeId
            }
        }

        //checks
        if (markK == "N/A" && markA == "N/A" && markT == "N/A" && markC == "N/A") {
            Materialize.toast('You must assess the students in at least one category.', 5000, 'amber darken-3');
            return false
        }

        if (markK <= 0 || markA <= 0 || markT <= 0 || markC <= 0) {
            Materialize.toast("A selected category's mark must be an integer greater than 0.", 5000, 'amber darken-3');
            return false
        }

        if (!((markK == "N/A" || Math.floor(markK) == markK) && (markA == "N/A" || Math.floor(markA) == markA) && (markT == "N/A" || Math.floor(markT) == markT) && (markC == "N/A" || Math.floor(markC) == markC))) {
            console.log("the problem is here");
            Materialize.toast("A selected category's mark must be an integer greater than 0.", 5000, 'amber darken-3');
            return false
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

        //create new finalAssessmentTypes array for Assessments Collection.
        for (i = 0; i < assessmentObjects.length; i++) {
            if (assessmentObjects[i].assessmentTypeId == assessmentTypeId) {
                assessmentObjects[i].K = markK;
                assessmentObjects[i].A = markA;
                assessmentObjects[i].T = markT;
                assessmentObjects[i].C = markC;
                assessmentObjects[i].Date = assessmentDate;
            }
        }

        //update the Assessments Collection
        Meteor.call('assessments.updateFinalAssessments', currentCourseId, assessmentObjects);

        //clean up and close modal
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
    $('.assignFinalModal').modal({
        dismissible: true, // Modal can be dismissed by clicking outside of the modal
        complete: function () {
            closeAssignFinalModal();
        }
    }
    );
    $.validator.addMethod('isInteger', (input) => {
        return (input == "N/A" || Math.floor(input) == input);
    });
    $.validator.addMethod('isPositive', (input) => {
        return (input >= 0);
    });
    $('.createAssessmentModal').modal({
        dismissible: true, // Modal can be dismissed by clicking outside of the modal
        complete: function () {
            closeCreateAssessmentModal();
        }
    });
    $("#assignFinalFormId").validate({
        errorClass: 'invalid',
        validClass: 'final-marks-valid',
        rules: {
            marksKFinal: {
                isInteger: true,
                isPositive: true,
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