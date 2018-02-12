import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Courses } from '../../../lib/collections.js';
import { Accounts } from 'meteor/accounts-base';

import '../../main.html';

Template.generalSettingsTab.helpers({
    currentCourse: function(){
        return Session.get('courseNameDisplay');
    },

    currentYear: function(){
        return Session.get('courseYearDisplay');
    }
});

Template.generalSettingsTab.events({
    'click .edit-general-settings': function() {
        let editButtonElement = document.getElementById("generalSettings-EditButton");
        editButtonElement.style.display = "none";
        let saveButtonElement = document.getElementById("generalSettings-SaveButton");
        saveButtonElement.style.display = "block";
        //initialize edit settings
        
    },
    'click .save-general-settings': function() {
        let saveButtonElement = document.getElementById("generalSettings-SaveButton");
        saveButtonElement.style.display = "none";
        let editButtonElement = document.getElementById("generalSettings-EditButton");
        editButtonElement.style.display = "block";
        
        //save dirty modals to db
    },
    
});