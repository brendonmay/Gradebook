import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Courses } from '../../../lib/collections.js';
import { Accounts } from 'meteor/accounts-base';

import '../../main.html';

Template.generalSettingsTab.helpers({
    currentCourse: function(){
        return Session.get('courseName');
    },

    currentYear: function(){
        return Session.get('courseYear');
    }
});

Template.generalSettingsTab.events({
    'click .edit-general-settings': function() {
        let editButtonElement = document.getElementById("generalSettings-EditButton");
        editButtonElement.style.display = "none";
        let saveButtonElement = document.getElementById("generalSettings-SaveButton");
        saveButtonElement.style.display = "block";
        //initialize edit settings

        let courseName = document.getElementById("generalSettings-courseName");
        let courseYear = document.getElementById("generalSettings-courseYear");

        courseName.removeAttribute("disabled");
        courseYear.removeAttribute("disabled");

    },
    'click .save-general-settings': function() {
        let saveButtonElement = document.getElementById("generalSettings-SaveButton");
        saveButtonElement.style.display = "none";
        let editButtonElement = document.getElementById("generalSettings-EditButton");
        editButtonElement.style.display = "block";
        
        let newCourseName = document.getElementById("generalSettings-courseName").value;
        let newCourseYear = document.getElementById("generalSettings-courseYear").value;

        let courseName = document.getElementById("generalSettings-courseName");
        let courseYear = document.getElementById("generalSettings-courseYear");
        courseName.disabled = true;
        courseYear.disabled = true;

        
        //save dirty modals to db
    },
    
});