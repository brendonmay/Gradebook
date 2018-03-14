import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Courses } from '../../../lib/collections.js';
import { Accounts } from 'meteor/accounts-base';
import { CourseWeighting } from '../../../lib/collections.js';

import '../../main.html';

const requiredText = "Please fill in the required fields.";
const isIntegerText = "A selected category's mark must be an integer.";
const isPositiveText = "A selected category's mark must be greater than 0.";
const addsTo100Text = "Coursework and Final Evaluations must add to 100";

function doneEditing() { //works
    let editButtonElement = document.getElementById("edit-button");
    let saveButtonElement = document.getElementById("save-button");
    let cancelButtonElement = document.getElementById("cancel-button");

    let addFinalAssessmentType = document.getElementById('finalAddAssessment');
    let addCourseAssessmentType = document.getElementById('courseAddAssessment');
    let courseStyler = document.getElementById('courseStyler');
    let courseStyler2 = document.getElementById('courseStyler2');

    editButtonElement.classList.remove("hide");
    saveButtonElement.classList.add("hide");
    cancelButtonElement.classList.add("hide");

    addFinalAssessmentType.classList.remove("hide");
    addCourseAssessmentType.classList.remove('hide');
    courseStyler.classList.remove("hide");
    courseStyler2.classList.remove("hide");

    let currentCourseId = Session.get('courseId');
    const courseworkAssessmentTypes = CourseWeighting.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).courseworkAssessmentTypes;
    const finalAssessmentTypes = CourseWeighting.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).finalAssessmentTypes;

    for (i = 0; i < courseworkAssessmentTypes.length; i++) {
        //coursework AssessmentType Weights Inputs Disabled
        let id = "inputc" + courseworkAssessmentTypes[i].assessmentTypeId;
        let assessmentTypeWeightCourse = document.getElementById(id);
        assessmentTypeWeightCourse.disabled = true;
        assessmentTypeWeightCourse.value = courseworkAssessmentTypes[i].assessmentWeight;

        //unhide coursework Delete Icons
        let id1 = "deletec" + courseworkAssessmentTypes[i].assessmentTypeId;
        let deleteIcon = document.getElementById(id1);
        deleteIcon.classList.remove('hide');

        //hide coursework Edit Icons
        let editCourseId = "editc" + courseworkAssessmentTypes[i].assessmentTypeId;
        let editCourseIcon = document.getElementById(editCourseId);
        editCourseIcon.classList.add('hide');

        //show display assessment-type
        let courseDisplayId = "displayc" + courseworkAssessmentTypes[i].assessmentTypeId;
        let courseDisplay = document.getElementById(courseDisplayId);
        courseDisplay.classList.remove('hide');

        //hide input assessment-type
        let courseInputId = "changeNamec" + courseworkAssessmentTypes[i].assessmentTypeId;
        let courseInput = document.getElementById(courseInputId);
        courseInput.classList.add('hide');
    };

    for (i = 0; i < finalAssessmentTypes.length; i++) {
        //final Assessment type weights remove disabled
        let id = "inputf" + finalAssessmentTypes[i].assessmentTypeId;
        let assessmentTypeWeightFinal = document.getElementById(id);
        assessmentTypeWeightFinal.disabled = true;
        assessmentTypeWeightFinal.value = finalAssessmentTypes[i].assessmentWeight;

        //unhide final delete icons
        let id1 = "deletef" + finalAssessmentTypes[i].assessmentTypeId;
        let deleteIcon = document.getElementById(id1);
        deleteIcon.classList.remove('hide');

        //hide final Edit Icons
        let editFinalId = "editf" + finalAssessmentTypes[i].assessmentTypeId;
        let editFinalIcon = document.getElementById(editFinalId);
        editFinalIcon.classList.add('hide');

        //show display assessment-type
        let finalDisplayId = "displayf" + finalAssessmentTypes[i].assessmentTypeId;
        let finalDisplay = document.getElementById(finalDisplayId);
        finalDisplay.classList.remove('hide');

        //hide input assessment-type
        let finalInputId = "changeNamef" + finalAssessmentTypes[i].assessmentTypeId;
        let finalInput = document.getElementById(finalInputId);
        finalInput.classList.add('hide');
    };

    let courseWeight = document.getElementById('assessments-courseWorkWeight');
    let finalWeight = document.getElementById('assessments-finalWeight');

    courseWeight.disabled = true;
    courseWeight.value = CourseWeighting.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).courseworkWeight;
    finalWeight.disabled = true;
    finalWeight.value = CourseWeighting.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).finalWeight;
    clearValidation(document.getElementById('assessmentSettingsForm'));
}

function addError(text, error) {
    //document.getElementById('assessmentSettingsTabRequiredError').children.length;
    var isRequired = false;
    var isInteger = false;
    var isPositive = false;
    var addsTo100 = false;
    var ele = document.getElementById('assessmentSettingsTabRequiredError').children;
    if (ele.length == 0) {
        $('#assessmentSettingsTabRequiredError').append(error);
        return;
    } 
    for (var i = 0; i < ele.length; i++) {
        if (ele[i].textContent == requiredText) isRequired = true;
        if (ele[i].textContent == isIntegerText) isInteger = true;
        if (ele[i].textContent == isPositiveText) isPositive = true;
        if (ele[i].textContent == addsTo100Text) addsTo100 = true;
    }
    if (!isRequired && text == requiredText) {
        $('#assessmentSettingsTabRequiredError').append(error);
    } else if (!isInteger && text == isIntegerText) {
        $('#assessmentSettingsTabRequiredError').append(error);
    } else if (!isPositive && text == isPositiveText) {
        $('#assessmentSettingsTabRequiredError').append(error);
    } else if (!addsTo100 && text == addsTo100Text) {
        $('#assessmentSettingsTabRequiredError').append(error);
    }
}

function addValidationRulesOnInputs() {
    $.validator.addMethod('isInteger', (input) => {
        return (input == "N/A" || Math.floor(input) == input);
    });
    $.validator.addMethod('isPositive', (input) => {
        return (input >= 0);
    });
    $.validator.addMethod('addsTo100', (input) => {
        var courseWorkWeight = Number(document.getElementById('assessments-courseWorkWeight').value);
        var finalWeight = Number(document.getElementById('assessments-finalWeight').value);

        return finalWeight + courseWorkWeight == 100;
    });
    $("#assessmentSettingsForm").validate({
        errorClass: 'invalid',
        validClass: 'jquery-validation-valid',
        rules: {
            finalWeight: {
                required: true,
                isInteger: true,
                isPositive: true,
                addsTo100: true
            },
            courseWorkWeight: {
                required: true,
                isInteger: true,
                isPositive: true,
                addsTo100: true
            }
        },
        messages: {
            finalWeight: {
                required: requiredText,
                isInteger: isIntegerText,
                isPositive: isPositiveText,
                addsTo100: addsTo100Text
            },
            courseWorkWeight: {
                required: requiredText,
                isInteger: isIntegerText,
                isPositive: isPositiveText,
                addsTo100: addsTo100Text
            }
        },
        errorElement: 'div',
        errorPlacement: function (error, element) {
            //for each error, need to determine WHAT error it is 
            //then based on each case have a specific error div to add too
            //check the error div if an item already exists 
            //if not add it
            //if yes, dont

            var text = $(error)[0].textContent;
            addError(text, error);

            // var placement = $(element).data('error');
            // if (placement) {
            //     $(placement).append(error);
            // }
            // } else {
            //     error.insertAfter(element);
            // }
        }
    });
    let currentCourseId = Session.get('courseId');
    const courseworkAssessmentTypes = CourseWeighting.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).courseworkAssessmentTypes;
    const finalAssessmentTypes = CourseWeighting.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).finalAssessmentTypes;

    addValidationRules(courseworkAssessmentTypes, "c");
    addValidationRules(finalAssessmentTypes, "f");
}

function addValidationRules(assessmentsObj, prefix) {
    for (var i = 0; i < assessmentsObj.length; i++) {

        var assessment = assessmentsObj[i];
        const changeNameID = "#changeName" + prefix + assessment.assessmentTypeId;
        const weightInputID = "#input" + prefix + assessment.assessmentTypeId;
        $(changeNameID).rules("add", {
            required: true,
            messages: {
                required: requiredText
            }
        });
        $(weightInputID).rules("add", {
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

Template.assessmentsTab.helpers({
    courseAssessmentTypes: function () {
        let currentCourseId = Session.get('courseId');
        const courseworkAssessmentTypes = CourseWeighting.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).courseworkAssessmentTypes;
        return courseworkAssessmentTypes
    },

    finalAssessmentTypes: function () {
        let currentCourseId = Session.get('courseId');
        const finalAssessmentTypes = CourseWeighting.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).finalAssessmentTypes;
        return finalAssessmentTypes
    },
    courseWorkWeight: function () {
        let currentCourseId = Session.get('courseId');
        const currentCourseWorkWeight = CourseWeighting.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).courseworkWeight;
        return currentCourseWorkWeight;
    },
    finalWeight: function () {
        let currentCourseId = Session.get('courseId');
        const currentFinalWeight = CourseWeighting.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).finalWeight;
        return currentFinalWeight;
    },
});

Template.assessmentsTab.onRendered(function () {
    $('.collapsible').collapsible();
    addValidationRulesOnInputs();
});

Template.assessmentsTab.events({
    'click .delete-courseworkAssessmentType': function () { //works
        //check that weight is 0
        target = event.target;
        assessmentTypeId = target.parentElement.id;
        assessmentTypeName = target.parentElement.name;
        assessmentTypeWeight = document.getElementById("inputc" + assessmentTypeId).value;

        if (Number(assessmentTypeWeight) == 0) {
            let sessionObject = {
                type: 'courseworkAssessmentTypes',
                assessmentTypeName: assessmentTypeName,
                assessmentTypeId: assessmentTypeId
            };

            Session.set('selectedAssessmentType', sessionObject);
            $('#deleteCourseworkAssessmentTypeModal').modal('open');
        }
        else {
            Materialize.toast('Set the weight of ' + assessmentTypeName + ' to 0% before deleting it.', 5000, 'amber darken-3');
            //console.log("set your weight to 0 before deleting");
        }
    },
    'click .delete-finalAssessmentType': function () { //works
        target = event.target;
        assessmentTypeId = target.parentElement.id;
        assessmentTypeName = target.parentElement.name;
        assessmentTypeWeight = document.getElementById("inputf" + assessmentTypeId).value;

        if (Number(assessmentTypeWeight) == 0) {
            let sessionObject = {
                type: 'finalAssessmentTypes',
                assessmentTypeName: assessmentTypeName,
                assessmentTypeId: assessmentTypeId
            };

            Session.set('selectedAssessmentType', sessionObject);
            $('#deleteFinalAssessmentTypeModal').modal('open');
        }
        else {
            //console.log("set your weight to 0 before deleting")
            Materialize.toast('Set the weight of ' + assessmentTypeName + ' to 0% before deleting it.', 5000, 'amber darken-3');
        }
    },
    'click .edit-button': function () { //working
        let editButtonElement = document.getElementById("edit-button");
        let saveButtonElement = document.getElementById("save-button");
        let cancelButtonElement = document.getElementById("cancel-button");

        let addFinalAssessmentType = document.getElementById('finalAddAssessment');
        let addCourseAssessmentType = document.getElementById('courseAddAssessment');
        let courseStyler = document.getElementById('courseStyler');
        let courseStyler2 = document.getElementById('courseStyler2');

        editButtonElement.classList.add("hide");
        saveButtonElement.classList.remove("hide");
        cancelButtonElement.classList.remove("hide");

        addFinalAssessmentType.classList.add('hide');
        addCourseAssessmentType.classList.add('hide');
        courseStyler.classList.add("hide");
        courseStyler2.classList.add("hide");

        let currentCourseId = Session.get('courseId');
        const courseworkAssessmentTypes = CourseWeighting.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).courseworkAssessmentTypes;
        const finalAssessmentTypes = CourseWeighting.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).finalAssessmentTypes;

        for (i = 0; i < courseworkAssessmentTypes.length; i++) {
            //hide coursework Delete Icons
            let deleteCourseId = "deletec" + courseworkAssessmentTypes[i].assessmentTypeId;
            let deleteCourseIcon = document.getElementById(deleteCourseId);
            deleteCourseIcon.classList.add('hide');

            //show coursework Edit Icons
            let editCourseId = "editc" + courseworkAssessmentTypes[i].assessmentTypeId;
            let editCourseIcon = document.getElementById(editCourseId);
            editCourseIcon.classList.remove('hide');

            //coursework weights remove disabled attribute
            let inputCourseId = "inputc" + courseworkAssessmentTypes[i].assessmentTypeId;
            let assessmentTypeWeightCourse = document.getElementById(inputCourseId);
            assessmentTypeWeightCourse.removeAttribute('disabled');

            //hide display assessment-type
            let courseDisplayId = "displayc" + courseworkAssessmentTypes[i].assessmentTypeId;
            let courseDisplay = document.getElementById(courseDisplayId);
            courseDisplay.classList.add('hide');

            //show input assessment-type
            let courseInputId = "changeNamec" + courseworkAssessmentTypes[i].assessmentTypeId;
            let courseInput = document.getElementById(courseInputId);
            courseInput.classList.remove('hide');
        };

        for (i = 0; i < finalAssessmentTypes.length; i++) {
            //hide final Delete icons
            let deleteFinalId = "deletef" + finalAssessmentTypes[i].assessmentTypeId;
            let deleteFinalIcon = document.getElementById(deleteFinalId);
            deleteFinalIcon.classList.add('hide');

            //show final Edit Icons
            let editFinalId = "editf" + finalAssessmentTypes[i].assessmentTypeId;
            let editFinalIcon = document.getElementById(editFinalId);
            editFinalIcon.classList.remove('hide');

            //final weights remove disabled attribute
            let inputFinalId = "inputf" + finalAssessmentTypes[i].assessmentTypeId;
            let assessmentTypeWeightFinal = document.getElementById(inputFinalId);
            assessmentTypeWeightFinal.removeAttribute('disabled');

            //hide display assessment-type
            let finalDisplayId = "displayf" + finalAssessmentTypes[i].assessmentTypeId;
            let finalDisplay = document.getElementById(finalDisplayId);
            finalDisplay.classList.add('hide');

            //show input assessment-type
            let finalInputId = "changeNamef" + finalAssessmentTypes[i].assessmentTypeId;
            let finalInput = document.getElementById(finalInputId);
            finalInput.classList.remove('hide');
        };

        let courseWeight = document.getElementById('assessments-courseWorkWeight');
        let finalWeight = document.getElementById('assessments-finalWeight');

        finalWeight.removeAttribute('disabled');
        courseWeight.removeAttribute('disabled');
        addValidationRulesOnInputs();
    },
    'click .cancel-button': function () { //working
        doneEditing();
    },
    'submit .assessmentsTabForm': function () { //working
        const currentCourseId = Session.get('courseId');
        const target = event.target;

        const courseworkAssessmentTypes = CourseWeighting.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).courseworkAssessmentTypes;
        const finalAssessmentTypes = CourseWeighting.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).finalAssessmentTypes;

        //assessmentTypeWeightCourse
        let newcourseworkAssessmentTypes = [];
        let courseWorkWeightTotal = 0;
        let newCourseWorkWeight = Number(document.getElementById("assessments-courseWorkWeight").value);
        //console.log("newCourseWorkWeight: " + newCourseWorkWeight);

        for (i = 0; i < courseworkAssessmentTypes.length; i++) {
            let currentId = "inputc" + courseworkAssessmentTypes[i].assessmentTypeId;
            let courseAssessmentTypeWeight = Number(document.getElementById(currentId).value);
            let courseNameId = "changeNamec" + courseworkAssessmentTypes[i].assessmentTypeId;
            let courseAssessmentTypeName = document.getElementById(courseNameId).value;
            courseWorkWeightTotal = courseWorkWeightTotal + courseAssessmentTypeWeight;
            let courseAssessmentTypeObject = { assessmentType: courseAssessmentTypeName, assessmentWeight: courseAssessmentTypeWeight, assessmentTypeId: courseworkAssessmentTypes[i].assessmentTypeId };
            newcourseworkAssessmentTypes[newcourseworkAssessmentTypes.length] = courseAssessmentTypeObject;
        };
        //console.log(newcourseworkAssessmentTypes);

        //assessmentTypeWeightFinal
        let newfinalAssessmentTypes = [];
        let finalWeightTotal = 0;
        let newFinalWeight = Number(document.getElementById("assessments-finalWeight").value);
        //console.log("newFinalWeight: " + newFinalWeight);

        for (i = 0; i < finalAssessmentTypes.length; i++) {
            let currentId = "inputf" + finalAssessmentTypes[i].assessmentTypeId;
            let finalAssessmentTypeWeight = Number(document.getElementById(currentId).value);
            let courseNameId = "changeNamef" + finalAssessmentTypes[i].assessmentTypeId;
            let finalAssessmentTypeName = document.getElementById(courseNameId).value;
            finalWeightTotal = finalWeightTotal + finalAssessmentTypeWeight;
            let finalAssessmentTypeObject = { assessmentType: finalAssessmentTypeName, assessmentWeight: finalAssessmentTypeWeight, assessmentTypeId: finalAssessmentTypes[i].assessmentTypeId };
            newfinalAssessmentTypes[newfinalAssessmentTypes.length] = finalAssessmentTypeObject;
        };
        //console.log(newfinalAssessmentTypes);

        //run a check that the courseworkweights add up to courseworkWeight
        if (newCourseWorkWeight + newFinalWeight != 100) {
            //console.log("Course Weight + Final Weight must add up to 100! They currently add to " + (newCourseWorkWeight + newFinalWeight))
            Materialize.toast("Coursework Weight and Final Evaluation Weight must add up to 100%. They currently add to " + (newCourseWorkWeight + newFinalWeight) + "%.", 5000, 'amber darken-3');
        }
        //run a check that courseWeights add up to newCourseWeight
        else if (courseWorkWeightTotal != newCourseWorkWeight) {
            //console.log("Your coursework Weights should add up to " + newCourseWorkWeight + ". They currently add up to " + courseWorkWeightTotal)
            Materialize.toast("Your Coursework Weights should add up to " + newCourseWorkWeight + ". They currently add up to " + courseWorkWeightTotal + '%.', 5000, 'amber darken-3');

        }
        //run a check that finalWeights add up to newFinalWeight
        else if (finalWeightTotal != newFinalWeight) {
            //console.log("Your final evaluation weights should add up to " + newFinalWeight + ". They currently add up to " + finalWeightTotal)
            Materialize.toast("Your final evaluation weights should add up to " + newFinalWeight + "%. They currently add up to " + finalWeightTotal + '%.', 5000, 'amber darken-3');
        }
        else {
            //update assessmentTypeWeights
            Meteor.call('courseInformation.updateCourseWork', currentCourseId, newcourseworkAssessmentTypes);
            Meteor.call('courseInformation.updateFinalWork', currentCourseId, newfinalAssessmentTypes);
            //update courseWeight and finalWeight
            Meteor.call('courseInformation.updateCourseworkWeight', currentCourseId, newCourseWorkWeight);
            Meteor.call('courseInformation.updateFinalWeight', currentCourseId, newFinalWeight);

            //doneEditing
            doneEditing();
        }
    },
    'click #addCourseworkAssessmentType': function () {
        $('#addCourseWork').modal({
            dismissible: true,
            complete: function () {
                clearValidation(document.getElementById('addAssessmentTypeForm'));
            }

        });
        $('#addCourseWork').modal('open');
    },
    'click #addFinalAssessmentType': function () {
        $('#addFinalWork').modal({
            dismissible: true,
            complete: function () {
                clearValidation(document.getElementById('addFinalTypeForm'));
            }

        });
        $('#addFinalWork').modal('open');
    },
});
