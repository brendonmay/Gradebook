import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Courses } from '../../../lib/collections.js';
import { CourseWeighting } from '../../../lib/collections.js'; 
import { Accounts } from 'meteor/accounts-base';
import { Meteor } from "meteor/meteor";

import '../../main.html';

function finishedEditing(){
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
    fetchKnowledge: function(){
        return Session.get('knowledgeWeight');
    },

    fetchApplication: function(){
        return Session.get('applicationWeight')
    },

    fetchThinking: function(){
        return Session.get('thinkingWeight')
    },

    fetchCommunication: function(){
        return Session.get('communicationWeight')
    },

    checkIfEditing: function(){

    },

});

Template.categoryWeightingsTab.events({
    'click .edit-category-weightings': function(){
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
    'click .cancel-category-weightings': function(){
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

    'submit .categoryWeightingsForm': function(){ //include check that they add to 100,  disable forms

        const currentCourseId = Session.get('courseId');
        const target = event.target;
        const knowledgeWeight = Number(target.knowledge.value);
        const applicationWeight = Number(target.application.value);
        const thinkingWeight = Number(target.thinking.value);
        const communicationWeight = Number(target.communication.value);

        //check that sum is 100
        let totalWeight = +knowledgeWeight + +applicationWeight + +thinkingWeight + +communicationWeight;

        if (totalWeight == 100){
            let newCategoryWeighting = {K: knowledgeWeight, A: applicationWeight, T: thinkingWeight, C: communicationWeight};

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
        else{
            console.log("they must add to 100");
        }
        
    },
});