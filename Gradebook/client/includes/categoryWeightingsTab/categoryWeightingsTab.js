import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Courses } from '../../../lib/collections.js';
import { CourseWeighting } from '../../../lib/collections.js';
import { Accounts } from 'meteor/accounts-base';
import { Meteor } from "meteor/meteor";
import jqueryValidation from 'jquery-validation';

import '../../main.html';

function clearCategoryWeightingsValidation() {
    var pageForm = document.getElementById('categoryWeightingsFormID');
    clearValidation(pageForm);

    var formElements = pageForm.elements;
    for (var i = 0, element; element = formElements[i++];) {
        if (element.classList.contains('invalid')) {
            element.classList.remove("invalid");
        } 
        if (element.classList.contains('jquery-validation-valid')) {
            element.classList.remove('jquery-validation-valid');
        }
    }
    removeAddTo100Error();
}

function doCategoriesAddTo100() {
    const knowledge = document.getElementById('knowledge').value;
    const application = document.getElementById('application').value;
    const thinking = document.getElementById('thinking').value;
    const communication = document.getElementById('communication').value;

    const knowledgeWeight = Number(knowledge);
    const applicationWeight = Number(application);
    const thinkingWeight = Number(thinking);
    const communicationWeight = Number(communication);

    return (knowledgeWeight + applicationWeight + thinkingWeight + communicationWeight == 100);
}

function populateAddTo100Error() {

    const addTo100Errors = document.getElementById("addTo100InputErrorID");
    addTo100Errors.innerHTML = "Your Category Weightings must add up to 100%. They currently add up to " + getCurrentCatWeight() + "%.";
    addTo100Errors.style.display = "";
}

function removeAddTo100Error() {
    const addTo100Errors = document.getElementById("addTo100InputErrorID");
    addTo100Errors.style.display = "none";
}

function getCurrentCatWeight() {
    const knowledge = document.getElementById('knowledge').value;
    const application = document.getElementById('application').value;
    const thinking = document.getElementById('thinking').value;
    const communication = document.getElementById('communication').value;

    const knowledgeWeight = Number(knowledge);
    const applicationWeight = Number(application);
    const thinkingWeight = Number(thinking);
    const communicationWeight = Number(communication);

    return knowledgeWeight +applicationWeight + thinkingWeight + communicationWeight;
}

function finishedEditing() {
    let editButtonElement = document.getElementById("edit-button");
    let saveButtonElement = document.getElementById("save-button");
    let cancelButtonElement = document.getElementById("cancel-button");

    editButtonElement.classList.remove("hide");
    saveButtonElement.classList.add("hide");
    cancelButtonElement.classList.add("hide");

    let knowledgeWeight = document.getElementById("knowledge");
    let applicationWeight = document.getElementById("application");
    let thinkingWeight = document.getElementById("thinking");
    let communicationWeight = document.getElementById("communication");

    knowledgeWeight.disabled = true;
    applicationWeight.disabled = true;
    thinkingWeight.disabled = true;
    communicationWeight.disabled = true;
    clearCategoryWeightingsValidation();
}

Template.categoryWeightingsTab.helpers({
    fetchKnowledge: function () {
        return Session.get('knowledgeWeight');
    },

    fetchApplication: function () {
        return Session.get('applicationWeight')
    },

    fetchThinking: function () {
        return Session.get('thinkingWeight')
    },

    fetchCommunication: function () {
        return Session.get('communicationWeight')
    },

    checkIfEditing: function () {

    },

});

Template.categoryWeightingsTab.events({
    'click .edit-category-weightings': function () {
        let editButtonElement = document.getElementById("edit-button");
        let saveButtonElement = document.getElementById("save-button");
        let cancelButtonElement = document.getElementById("cancel-button");

        editButtonElement.classList.add("hide");
        saveButtonElement.classList.remove("hide");
        cancelButtonElement.classList.remove("hide");

        let knowledgeWeight = document.getElementById("knowledge");
        let applicationWeight = document.getElementById("application");
        let thinkingWeight = document.getElementById("thinking");
        let communicationWeight = document.getElementById("communication");

        knowledgeWeight.removeAttribute("disabled");
        applicationWeight.removeAttribute("disabled");
        thinkingWeight.removeAttribute("disabled");
        communicationWeight.removeAttribute("disabled");

    },
    'click .cancel-category-weightings': function () {
        finishedEditing();

        let knowledgeWeight = document.getElementById("knowledge");
        let applicationWeight = document.getElementById("application");
        let thinkingWeight = document.getElementById("thinking");
        let communicationWeight = document.getElementById("communication");

        knowledgeWeight.value = Session.get("knowledgeWeight");
        applicationWeight.value = Session.get("applicationWeight");
        thinkingWeight.value = Session.get("thinkingWeight");
        communicationWeight.value = Session.get("communicationWeight");


    },
    'submit .categoryWeightingsForm': function () { //include check that they add to 100,  disable forms
        if (!doCategoriesAddTo100()) {
            populateAddTo100Error();
            return false;
        }

        const currentCourseId = Session.get('courseId');
        const target = event.target;
        const knowledgeWeight = Number(target.knowledge.value);
        const applicationWeight = Number(target.application.value);
        const thinkingWeight = Number(target.thinking.value);
        const communicationWeight = Number(target.communication.value);

        //check that sum is 100
        let totalWeight = +knowledgeWeight + +applicationWeight + +thinkingWeight + +communicationWeight;

        if (totalWeight == 100) {
            let newCategoryWeighting = { K: knowledgeWeight, A: applicationWeight, T: thinkingWeight, C: communicationWeight };

            //update document
            Meteor.call('courseInformation.updateCategories', currentCourseId, newCategoryWeighting);

            //update session vars
            Session.set('knowledgeWeight', knowledgeWeight);
            Session.set('applicationWeight', applicationWeight);
            Session.set('thinkingWeight', thinkingWeight);
            Session.set('communicationWeight', communicationWeight);

            //buttons back to normal, disable forms
            finishedEditing();
        }
        else {
            Materialize.toast('Your Category Weightings must add up to 100%. They currently add up to ' + totalWeight + '%.', 5000, 'amber darken-3');
        }
        return false;
    },
    'click .save-category-weightings': function () {
        document.getElementById('categoryWeightingsSubmit').click();
        return false;
    }
});

Template.categoryWeightingsTab.onRendered(function () {
    $.validator.addMethod('isInteger', (input) => {
        return (input == "N/A" || Math.floor(input) == input);
    });
    $.validator.addMethod('isPositive', (input) => {
        return (input > 0);
    });
    $.validator.addMethod('addTo100', (input) => {
        if (!doCategoriesAddTo100()) {
            populateAddTo100Error();
        } else {
            removeAddTo100Error();
        }
        return true;
    });
    $("#categoryWeightingsFormID").validate({
        errorClass: 'invalid',
        validClass: 'jquery-validation-valid',
        rules: {
            knowledgeName: {
                required: true,
                isInteger: true,
                isPositive: true,
                addTo100: true
            },
            applicationName: {
                required: true,
                isInteger: true,
                isPositive: true,
                addTo100: true
            },
            thinkingName: {
                required: true,
                isInteger: true,
                isPositive: true,
                addTo100: true
            },
            communicationName: {
                required: true,
                isInteger: true,
                isPositive: true,
                addTo100: true
            },
        },
        messages: {
            knowledgeName: {
                isInteger: "A selected category's mark must be an integer.",
                isPositive: "A selected category's mark must be greater than 0."
            },
            applicationName: {
                isInteger: "A selected category's mark must be an integer.",
                isPositive: "A selected category's mark must be greater than 0."
            },
            thinkingName: {
                isInteger: "A selected category's mark must be an integer.",
                isPositive: "A selected category's mark must be greater than 0."
            },
            communicationName: {
                isInteger: "A selected category's mark must be an integer.",
                isPositive: "A selected category's mark must be greater than 0."
            },
        },
        errorElement: 'div',
        errorPlacement: function (error, element) {
            var placement = $(element).data('error');
            if (placement) {
                $(placement).append(error);
            } else {
                error.insertAfter(element);
            }
        }
    });
});