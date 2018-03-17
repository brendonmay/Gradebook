import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Courses } from '../../../lib/collections.js';
import { Accounts } from 'meteor/accounts-base';
import { CourseWeighting } from '../../../lib/collections.js';
import { Assessments } from '../../../lib/collections.js';

import '../../main.html';

const requiredText = "Must contain a positive number or N/A"; //"Please fill in the required fields.";
const isIntegerText = "Must contain a positive number or N/A"; // "A selected category's mark must be an integer.";
const isPositiveText = "Must contain a positive number or N/A"; //"A selected category's mark must be greater than 0.";

function canAssignFinalEvaluation() {
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

    return arrayOfEvaluationsToReturn.length != 0
}

function areMarkFieldsValid(markK, markA, markT, markC) {
    if (markK == "N/A" && markA == "N/A" && markT == "N/A" && markC == "N/A") {
        Materialize.toast('You must assess the students in at least one category.', 5000, 'amber darken-3');
        return false
    }

    if (markK <= 0 || markA <= 0 || markT <= 0 || markC <= 0) {
        Materialize.toast("A selected category's mark must be an integer greater than 0 or N/A.", 5000, 'amber darken-3');
        return false
    }

    if (!((markK == "N/A" || Math.floor(markK) == markK) && (markA == "N/A" || Math.floor(markA) == markA) && (markT == "N/A" || Math.floor(markT) == markT) && (markC == "N/A" || Math.floor(markC) == markC))) {
        Materialize.toast("A selected category's mark must be an integer greater than 0 or N/A.", 5000, 'amber darken-3');
        return false
    }

    return true;
}

function updateAssessments(courseAssessmentTypes, assessmentTypeId, assessmentId, markK, markA, markT, markC, newDate) {
    var fieldsChanged = false;
    let currentCourseId = Session.get('courseId');
    var courseName;
    var breakFromInside = false;
    for (i = 0; i < courseAssessmentTypes.length; i++) {
        if (courseAssessmentTypes[i].assessmentTypeId == assessmentTypeId) {
            for (z = 0; z < courseAssessmentTypes[i].assessments.length; z++) {
                if (courseAssessmentTypes[i].assessments[z].assessmentId == assessmentId) {
                    courseName = courseAssessmentTypes[i].assessments[z].assessmentName;
                    if (didFieldsChange(courseAssessmentTypes[i].assessments[z], markK, markA, markT, markC, newDate)) {
                        courseAssessmentTypes[i].assessments[z].K = markK;
                        courseAssessmentTypes[i].assessments[z].A = markA;
                        courseAssessmentTypes[i].assessments[z].T = markT;
                        courseAssessmentTypes[i].assessments[z].C = markC;
                        courseAssessmentTypes[i].assessments[z].Date = newDate;
                        fieldsChanged = true;
                    }
                    break;
                    breakFromInside = true;
                }
            }
            if (breakFromInside) break;
        }
    }

    if (fieldsChanged) {
        Meteor.call('assessments.updateAssessments', currentCourseId, courseAssessmentTypes)

        //at the end, push a message to the user saying the changes have been saved.
        Materialize.toast('Your changes to ' + courseName + ' have been saved', 3000, 'amber darken-3'); //make it so that toast includes assessment name
    }
}

function updateFinalAssessments(finalAssessmentTypes, assessmentTypeId, markK, markA, markT, markC, newDate) {
    var fieldsChanged = false;
    let currentCourseId = Session.get('courseId');
    for (i = 0; i < finalAssessmentTypes.length; i++) {
        if (finalAssessmentTypes[i].assessmentTypeId == assessmentTypeId) {
            if (didFieldsChange(finalAssessmentTypes[i], markK, markA, markT, markC, newDate)) {
                finalAssessmentTypes[i].K = markK;
                finalAssessmentTypes[i].A = markA;
                finalAssessmentTypes[i].T = markT;
                finalAssessmentTypes[i].C = markC;
                finalAssessmentTypes[i].Date = newDate;
                fieldsChanged = true;
            }
            break;
        }
    }
    if (fieldsChanged) {
        var finalEvalName = getFinalEvalName(currentCourseId, assessmentTypeId);
        Meteor.call('assessments.updateFinalAssessments', currentCourseId, finalAssessmentTypes)
        Materialize.toast('Your changes to ' + finalEvalName + ' have been saved', 3000, 'amber darken-3'); //make it so that toast includes assessment name
    }
}

function getFinalEvalName(courseID, assessmentTypeId) {
    var finalEvaluations = CourseWeighting.findOne({ ownerId: Meteor.userId(), courseId: courseID }).finalAssessmentTypes;
    for (var i = 0; i < finalEvaluations.length; i++) {
        if (finalEvaluations[i].assessmentTypeId == assessmentTypeId) {
            return finalEvaluations[i].assessmentType;
        }
    }
}

function didFieldsChange(assessments, markK, markA, markT, markC, newDate) {
    if (assessments.K != markK) return true;
    if (assessments.A != markA) return true;
    if (assessments.T != markT) return true;
    if (assessments.C != markC) return true;
    if (assessments.Date != newDate) return true;
    return false;
}

function beginValidation() {
    $.validator.addMethod('isInteger', (input) => {
        return (input == "N/A" || Math.floor(input) == input);
    });
    $.validator.addMethod('isPositive', (input) => {
        return (input >= 0 || input == "N/A");
    });
    $(".edit-courseassessment-form").validate({
        errorClass: 'invalid',
        validClass: 'jquery-validation-valid',
        errorElement: 'div',
        errorPlacement: function (error, element) {
            // var text = $(error)[0].textContent;
            // addError(text, error);
            var placement = $(element).data('error');
            if (placement) {
                $(placement).append(error)
            } else {
                error.insertAfter(element);
            }
        }
    });

    let currentCourseId = Session.get('courseId');
    const courseworkAssessmentTypes = Assessments.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).courseAssessmentTypes;
    const finalAssessmentTypes = Assessments.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).finalAssessmentTypes;
    addCourseValidationRules(courseworkAssessmentTypes);
    addFinalValidationRules(finalAssessmentTypes);
}

function addFinalValidationRules(assessmentsObj) {
    for (var i = 0; i < assessmentsObj.length; i++) {
        var assessment = assessmentsObj[i];
        var assessmentID = assessment.assessmentTypeId;
        var formID = "#form" + assessmentID;
        $(formID).validate({
            errorClass: 'invalid',
            validClass: 'jquery-validation-valid',
            errorElement: 'div',
            errorPlacement: function (error, element) {
                // var text = $(error)[0].textContent;
                // addError(text, error);
                var placement = $(element).data('error');
                if (placement) {
                    $(placement).append(error)
                } else {
                    error.insertAfter(element);
                }
            }
        });
        const KField = "#finalK" + assessmentID;
        const AField = "#finalA" + assessmentID;
        const TField = "#finalT" + assessmentID;
        const CField = "#finalC" + assessmentID;

        $(KField).rules("add", {
            required: true,
            isInteger: true,
            isPositive: true,
            messages: {
                required: requiredText,
                isInteger: isIntegerText,
                isPositive: isPositiveText
            }
        });
        $(AField).rules("add", {
            required: true,
            isInteger: true,
            isPositive: true,
            messages: {
                required: requiredText,
                isInteger: isIntegerText,
                isPositive: isPositiveText
            }
        });
        $(TField).rules("add", {
            required: true,
            isInteger: true,
            isPositive: true,
            messages: {
                required: requiredText,
                isInteger: isIntegerText,
                isPositive: isPositiveText
            }
        });
        $(CField).rules("add", {
            required: true,
            isInteger: true,
            isPositive: true,
            messages: {
                required: requiredText,
                isInteger: isIntegerText,
                isPositive: isPositiveText
            }
        });
    }

}

function addCourseValidationRules(assessmentsObj) {
    for (var i = 0; i < assessmentsObj.length; i++) {
        for (var j = 0; j < assessmentsObj[i].assessments.length; j++) {
            var assessment = assessmentsObj[i].assessments[j];
            var formID = "#form" + assessment.assessmentId;
            $(formID).validate({
                errorClass: 'invalid',
                validClass: 'jquery-validation-valid',
                errorElement: 'div',
                errorPlacement: function (error, element) {
                    // var text = $(error)[0].textContent;
                    // addError(text, error);
                    var placement = $(element).data('error');
                    if (placement) {
                        $(placement).append(error)
                    } else {
                        error.insertAfter(element);
                    }
                }
            });
            const KField = "#courseK" + assessment.assessmentId;
            const AField = "#courseA" + assessment.assessmentId;
            const TField = "#courseT" + assessment.assessmentId;
            const CField = "#courseC" + assessment.assessmentId;

            $(KField).rules("add", {
                required: true,
                isInteger: true,
                isPositive: true,
                messages: {
                    required: requiredText,
                    isInteger: isIntegerText,
                    isPositive: isPositiveText
                }
            });
            $(AField).rules("add", {
                required: true,
                isInteger: true,
                isPositive: true,
                messages: {
                    required: requiredText,
                    isInteger: isIntegerText,
                    isPositive: isPositiveText
                }
            });
            $(TField).rules("add", {
                required: true,
                isInteger: true,
                isPositive: true,
                messages: {
                    required: requiredText,
                    isInteger: isIntegerText,
                    isPositive: isPositiveText
                }
            });
            $(CField).rules("add", {
                required: true,
                isInteger: true,
                isPositive: true,
                messages: {
                    required: requiredText,
                    isInteger: isIntegerText,
                    isPositive: isPositiveText
                }
            });
        }
    }
}

Template.assessments.onRendered(function () {
    $(document).ready(function () {
        $('.collapsible').collapsible();
    });
    beginValidation();
});

Template.assessments.helpers({
    courseworkAssessmentTypes: function () {
        let currentCourseId = Session.get('courseId');
        let courseAssessmentsTypes = CourseWeighting.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).courseworkAssessmentTypes;
        return courseAssessmentsTypes
    },

    courseworkAssessments: function (assessmentTypeId) {
        let currentCourseId = Session.get('courseId');
        let courseAssessmentsTypes = Assessments.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).courseAssessmentTypes;
        for (i = 0; i < courseAssessmentsTypes.length; i++) {
            if (courseAssessmentsTypes[i].assessmentTypeId == assessmentTypeId) {
                return courseAssessmentsTypes[i].assessments;
            }
        }
        return false
    },

    hasCourseworkAssessments: function (assessmentTypeId) {
        let currentCourseId = Session.get('courseId');
        let courseAssessmentsTypes = Assessments.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).courseAssessmentTypes;
        for (i = 0; i < courseAssessmentsTypes.length; i++) {
            if (courseAssessmentsTypes[i].assessmentTypeId == assessmentTypeId) {
                return courseAssessmentsTypes[i].assessments.length != 0;
            }
        }
        return false
    },

    finalAssessmentTypes: function () {
        let currentCourseId = Session.get('courseId');
        let finalAssessmentTypes = CourseWeighting.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).finalAssessmentTypes;
        return finalAssessmentTypes
    },

    finalAssessments: function (assessmentTypeId) {
        let currentCourseId = Session.get('courseId');
        let finalAssessmentTypes = Assessments.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).finalAssessmentTypes;
        let assessments = [];
        for (i = 0; i < finalAssessmentTypes.length; i++) {
            if (finalAssessmentTypes[i].assessmentTypeId == assessmentTypeId) {
                assessments[0] = finalAssessmentTypes[i];
                return assessments
            }
        }
        return false
    },

    hasFinalAssessments: function (assessmentTypeId) {
        let currentCourseId = Session.get('courseId');
        let finalAssessmentTypes = Assessments.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).finalAssessmentTypes;
        let assessments = [];
        for (i = 0; i < finalAssessmentTypes.length; i++) {
            if (finalAssessmentTypes[i].assessmentTypeId == assessmentTypeId) {
                assessments[0] = finalAssessmentTypes[i];
                break;
            }
        }
        if (assessments[0].K == "N/A" && assessments[0].A == "N/A" && assessments[0].T == "N/A" && assessments[0].C == "N/A") {
            return false;
        }
        else {
            return true;
        }

    }
});

Template.assessments.events({
    'click .assignFinalEvalButton': function () {
        //check if you have no more evaluations to assign
        if (canAssignFinalEvaluation() == true) {
            $('#assignFinalModal').modal({
                dismissible: true,
                complete: function () {
                    document.getElementById('assignFinalFormId').reset();

                    document.getElementById("finalCheckboxK").removeAttribute("checked");
                    document.getElementById("finalCheckboxK").value = "N/A";
                    document.getElementById("inputFinalMarkK").disabled = "true";
                    if (document.getElementById("inputFinalMarkK-error")) {
                        document.getElementById("inputFinalMarkK-error").remove();
                    }

                    document.getElementById("finalCheckboxA").removeAttribute("checked");
                    document.getElementById("finalCheckboxA").value = "N/A";
                    document.getElementById("inputFinalMarkA").disabled = "true";
                    if (document.getElementById("inputFinalMarkA-error")) {
                        document.getElementById("inputFinalMarkA-error").remove();
                    }

                    document.getElementById("finalCheckboxT").removeAttribute("checked");
                    document.getElementById("finalCheckboxT").value = "N/A";
                    document.getElementById("inputFinalMarkT").disabled = "true";
                    if (document.getElementById("inputFinalMarkT-error")) {
                        document.getElementById("inputFinalMarkT-error").remove();
                    }

                    document.getElementById("finalCheckboxC").removeAttribute("checked");
                    document.getElementById("finalCheckboxC").value = "N/A";
                    document.getElementById("inputFinalMarkC").disabled = "true";
                    if (document.getElementById("inputFinalMarkC-error")) {
                        document.getElementById("inputFinalMarkC-error").remove();
                    }
                }
            });
            $('#assignFinalModal').modal('open');
            $('select').material_select();
        }
        else {
            Materialize.toast("All of your final evaluations have already been assigned", 5000, 'amber darken-3');
        }
    },
    'click .createAssessmentButton': function () {
        $('#createAssessmentModal').modal({
            dismissible: true,
            complete: function () {
                document.getElementById('createAssessmentFormId').reset();

                document.getElementById("checkboxK").removeAttribute("checked");
                document.getElementById("checkboxK").value = "N/A";
                document.getElementById("inputMarkK").disabled = "true";
                if (document.getElementById("inputMarkK-error")) {
                    document.getElementById("inputMarkK-error").remove();
                }

                document.getElementById("checkboxA").removeAttribute("checked");
                document.getElementById("checkboxA").value = "N/A";
                document.getElementById("inputMarkA").disabled = "true";
                if (document.getElementById("inputMarkA-error")) {
                    document.getElementById("inputMarkA-error").remove();
                }

                document.getElementById("checkboxT").removeAttribute("checked");
                document.getElementById("checkboxT").value = "N/A";
                document.getElementById("inputMarkT").disabled = "true";
                if (document.getElementById("inputMarkT-error")) {
                    document.getElementById("inputMarkT-error").remove();
                }

                document.getElementById("checkboxC").removeAttribute("checked");
                document.getElementById("checkboxC").value = "N/A";
                document.getElementById("inputMarkC").disabled = "true";
                if (document.getElementById("inputMarkC-error")) {
                    document.getElementById("inputMarkC-error").remove();
                }

                if (document.getElementById('createNewAssessment-error')) {
                    document.getElementById('createNewAssessment-error').remove();
                }
            }
        });
        $('#createAssessmentModal').modal('open');
        $('select').material_select();
    },
    'click .deleteFinalEval': function () {
        let courseSettings = document.getElementById("courseSettingsTabId");
        courseSettings.click();
        let assessmentSettings = document.getElementById("ASClick");
        assessmentSettings.click();
    },
    'click .deleteAssessmentType': function () {
        var assessmentId = 0;
        if (event.target.classList.contains("deleteAssessmentType")) {
            assessmentId = event.target.id;
        } else {
            assessmentId = event.target.parentNode.id;
        }
        const elementToRemove = document.getElementById(assessmentId);
        const assessmentTypeId = elementToRemove.parentNode.id;
        let currentCourseId = Session.get('courseId');
        var removeAssessmentObj = {
            assessmentTypeId: assessmentTypeId,
            assessmentId: assessmentId,
            removeCourse: ""
        };
        Session.set("removeAssessmentObj", removeAssessmentObj);
        document.getElementById(assessmentId).click();

        $('.delete-courseworkAssessment-modal').modal({
            complete: function () {
                if (Session.get('removeAssessmentObj').removeCourse == "yes") {
                    var courseAssessmentsTypes = Assessments.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).courseAssessmentTypes;
                    for (var i = 0; i < courseAssessmentsTypes.length; i++) {
                        if (courseAssessmentsTypes[i].assessmentTypeId == assessmentTypeId) {
                            let assessmentType = courseAssessmentsTypes[i].assessments;
                            for (var j = 0; j < assessmentType.length; j++) {
                                if (assessmentType[j].assessmentId == assessmentId) {
                                    assessmentType.splice(j, 1);
                                    break;
                                }
                            }
                            courseAssessmentsTypes[i].assessments = assessmentType;
                            break;
                        }
                    }
                    Meteor.call('assessments.updateAssessments', currentCourseId, courseAssessmentsTypes);
                    Meteor.call('students.deleteAssessment', Meteor.userId(), currentCourseId, assessmentId);
                }
                let removeAssessmentObj = Session.get("removeAssessmentObj");
                removeAssessmentObj.removeCourse = "";
                Session.set("removeAssessmentObj", removeAssessmentObj);
                $('#deleteCourseworkAssessmentModal').modal('close');
            }
        });
        $('#deleteCourseworkAssessmentModal').modal('open');
    },
    'click .collapsible-header': function () {
        $('.datepicker').pickadate({
            selectMonths: true, // Creates a dropdown to control month
            selectYears: 15, // Creates a dropdown of 15 years to control year,
            today: 'Today',
            clear: 'Clear',
            close: 'Ok',
            container: 'body',
            closeOnSelect: false // Close upon selecting a date,
        });
        $('.collapsible').collapsible();
    },
    'submit .edit-courseassessment-form': function () {
        //determine which form has been changed
        let target = event.target;
        let formId = target.id;

        //assign all the new values to variables
        let assessmentId = formId.substring(4);
        let assessmentTypeId = assessmentId.substring(0, assessmentId.indexOf('-'));
        let currentCourseId = Session.get('courseId');

        //console.log("assessmentTypeId: " + assessmentTypeId + ". AssessmentId: " + assessmentId)

        let dateId = "courseDate" + assessmentId;
        let kId = "courseK" + assessmentId;
        let aId = "courseA" + assessmentId;
        let tId = "courseT" + assessmentId;
        let cId = "courseC" + assessmentId;

        let markK = document.getElementById(kId).value;
        let markA = document.getElementById(aId).value;
        let markT = document.getElementById(tId).value;
        let markC = document.getElementById(cId).value;
        var newDate = document.getElementById(dateId).value;

        if (newDate == "") {
            newDate = "N/A"
        }

        //check that each variable is of the correct type/format
        if (!areMarkFieldsValid(markK, markA, markT, markC)) {
            let focusedEle = document.activeElement;
            focusedEle.classList.add('invalid');
            return false;
        } else {
            let focusedEle = document.activeElement;
            if (focusedEle.classList.contains('invalid')) {
                focusedEle.classList.remove('invalid');
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
        //update collection
        var courseAssessmentTypes = Assessments.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).courseAssessmentTypes;
        updateAssessments(courseAssessmentTypes, assessmentTypeId, assessmentId, markK, markA, markT, markC, newDate);
        Session.set("gradebookUpdated", true);
    },
    'submit .edit-finalevaluation-form': function () {
        //determine which form has been changed
        let target = event.target;
        let formId = target.id;

        //assign all the new values to variables
        let assessmentTypeId = formId.substring(4);
        let currentCourseId = Session.get('courseId');

        let dateId = "finalDate" + assessmentTypeId;
        let kId = "finalK" + assessmentTypeId;
        let aId = "finalA" + assessmentTypeId;
        let tId = "finalT" + assessmentTypeId;
        let cId = "finalC" + assessmentTypeId;

        let markK = document.getElementById(kId).value;
        let markA = document.getElementById(aId).value;
        let markT = document.getElementById(tId).value;
        let markC = document.getElementById(cId).value;
        var newDate = document.getElementById(dateId).value;

        if (newDate == "") {
            newDate = "N/A"
        }

        //check that each variable is of the correct type/format
        if (markK == "N/A" && markA == "N/A" && markT == "N/A" && markC == "N/A") {
            Materialize.toast('You must assess the students in at least one category.', 5000, 'amber darken-3');
            return false
        }

        if (markK <= 0 || markA <= 0 || markT <= 0 || markC <= 0) {
            Materialize.toast("A selected category's mark must be an integer greater than 0 or N/A.", 5000, 'amber darken-3');
            return false
        }

        if (!(
            (markK == "N/A" || Math.floor(markK) == markK) &&
            (markA == "N/A" || Math.floor(markA) == markA) &&
            (markT == "N/A" || Math.floor(markT) == markT) &&
            (markC == "N/A" || Math.floor(markC) == markC)
        )) {
            Materialize.toast("A selected category's mark must be an integer greater than 0 or N/A.", 5000, 'amber darken-3');
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

        //update collection
        var finalAssessmentTypes = Assessments.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).finalAssessmentTypes;

        for (i = 0; i < finalAssessmentTypes.length; i++) {
            if (finalAssessmentTypes[i].assessmentTypeId == assessmentTypeId) {
                finalAssessmentTypes[i].K = markK;
                finalAssessmentTypes[i].A = markA;
                finalAssessmentTypes[i].T = markT;
                finalAssessmentTypes[i].C = markC;
                finalAssessmentTypes[i].Date = newDate;
                break;
            }
        }

        Meteor.call('assessments.updateFinalAssessments', currentCourseId, finalAssessmentTypes);
        Session.set("gradebookUpdated", true);

        //at the end, push a message to the user saying the changes have been saved.
        Materialize.toast('Your changes have been saved', 3000, 'amber darken-3'); //make it so that toast includes assessment name
    },
    'blur .course-edit-fields-blur': function () {
        let target = event.target;
        let formId = target.id;
        //assign all the new values to variables
        let assessmentId = formId.substring(7);
        let assessmentTypeId = assessmentId.substring(0, assessmentId.indexOf('-'));
        let currentCourseId = Session.get('courseId');

        //console.log("assessmentTypeId: " + assessmentTypeId + ". AssessmentId: " + assessmentId);
        let dateId = "courseDate" + assessmentId;
        let kId = "courseK" + assessmentId;
        let aId = "courseA" + assessmentId;
        let tId = "courseT" + assessmentId;
        let cId = "courseC" + assessmentId;

        let markK = document.getElementById(kId).value;
        let markA = document.getElementById(aId).value;
        let markT = document.getElementById(tId).value;
        let markC = document.getElementById(cId).value;
        var newDate = document.getElementById(dateId).value;

        if (newDate == "") {
            newDate = "N/A"
        }

        if (!areMarkFieldsValid(markK, markA, markT, markC)) {
            target.focus();
            target.classList.add('invalid');
            return false;
        } else {
            if (target.classList.contains('invalid')) {
                target.classList.remove('invalid');
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

        //update collection
        var courseAssessmentTypes = Assessments.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).courseAssessmentTypes;
        updateAssessments(courseAssessmentTypes, assessmentTypeId, assessmentId, markK, markA, markT, markC, newDate);
        Session.set("gradebookUpdated", true);
    },
    'blur .final-blur-class': function () {
        let target = event.target;
        let formId = target.id;
        //assign all the new values to variables
        let assessmentTypeId = formId.substring(6);
        let currentCourseId = Session.get('courseId');

        let dateId = "finalDate" + assessmentTypeId;
        let kId = "finalK" + assessmentTypeId;
        let aId = "finalA" + assessmentTypeId;
        let tId = "finalT" + assessmentTypeId;
        let cId = "finalC" + assessmentTypeId;

        let markK = document.getElementById(kId).value;
        let markA = document.getElementById(aId).value;
        let markT = document.getElementById(tId).value;
        let markC = document.getElementById(cId).value;
        var newDate = document.getElementById(dateId).value;

        if (newDate == "") {
            newDate = "N/A"
        }

        if (!areMarkFieldsValid(markK, markA, markT, markC)) {
            target.focus();
            target.classList.add('invalid');
            return false;
        } else {
            if (target.classList.contains('invalid')) {
                target.classList.remove('invalid');
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

        //update collection
        var finalAssessmentTypes = Assessments.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).finalAssessmentTypes;
        updateFinalAssessments(finalAssessmentTypes, assessmentTypeId, markK, markA, markT, markC, newDate);
        Session.set("gradebookUpdated", true);
    },

    'click .rename-assessment': function () {
        var id = event.target.id;
        var assessmentId = id.slice(0, id.indexOf("?LmUtGwN?"));
        var assessmentName = id.slice(id.indexOf("?LmUtGwN?") + 9, id.length);
        var element = document.getElementsByName("collHead" + assessmentId);

        element[0].click();

        //store assessmentId and assessmentName in Session Variable
        Session.set('selectedAssessment', { assessmentId, assessmentName });

        //open modal
        $('#renameAssessmentModal').modal({
            dismissible: true,
            complete: function () {
                document.getElementById("renameAssessmentModalForm").reset();
            }
        }
        );
        $('#renameAssessmentModal').modal('open');
    }
});

