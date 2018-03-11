import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Courses } from '../../../lib/collections.js';
import { CourseWeighting } from '../../../lib/collections.js';
import { Accounts } from 'meteor/accounts-base';
import { Meteor } from "meteor/meteor";
import jqueryValidation from 'jquery-validation';

import '../../main.html';

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
            console.log("they must add to 100");
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
        return (input >= 0);
    });
    $.validator.addMethod('addTo100', (input) => {
        const knowledgeWeight = Number(document.getElementById('knowledge'));
        const applicationWeight = Number(document.getElementById('application'));
        const thinkingWeight = Number(document.getElementById('thinking'));
        const communicationWeight = Number(document.getElementById('communication'));

        return (knowledgeWeight + applicationWeight + thinkingWeight + communicationWeight == 100);
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
                isPositive: "A selected category's mark must be greater than 0.",
                addTo100: "Your Category Weightings must add up to 100%."
            },
            applicationName: {
                isInteger: "A selected category's mark must be an integer.",
                isPositive: "A selected category's mark must be greater than 0.",
                addTo100: "Your Category Weightings must add up to 100%."
            },
            thinkingName: {
                isInteger: "A selected category's mark must be an integer.",
                isPositive: "A selected category's mark must be greater than 0.",
                addTo100: "Your Category Weightings must add up to 100%."
            },
            communicationName: {
                isInteger: "A selected category's mark must be an integer.",
                isPositive: "A selected category's mark must be greater than 0.",
                addTo100: "Your Category Weightings must add up to 100%."
            },
        },
        errorElement: 'div',
        errorPlacement: function (error, element) {
            for (var i = 0; i < error.length; i++) {
                var errorElement = new jQuery.fn.init(error[i]);
                const isAddTo100Error = (errorElement[0].textContent.includes("100%"));
                if (isAddTo100Error) {
                    const addTo100Errors = document.getElementsByClassName("addTo100ErrorPlacement");
                    if (addTo100Errors.length == 0) {
                        var newElement = $('.addTo100InputError');
                        var placement = $('.addTo100InputError').data('error');
                        errorElement[0].classList.add("addTo100ErrorPlacement");
                        if (placement) {
                            $(placement).append(errorElement)
                        } else {
                            errorElement.insertAfter(newElement);
                        }
                    }
                } else {
                    var placement = $(element).data('error');
                    if (placement) {
                        $(placement).append(errorElement)
                    } else {
                        errorElement.insertAfter(element);
                    }
                }
            }
        }
    });
});