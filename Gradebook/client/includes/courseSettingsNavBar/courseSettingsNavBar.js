import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Courses } from '../../../lib/collections.js';
import { Accounts } from 'meteor/accounts-base';

import '../../main.html';

Template.courseSettingsNavBar.onRendered(function () {
    Session.set('settingScreenText', "General Settings");
});

Template.courseSettingsNavBar.events({
    //function that changes the body display based off of settings side bar click.
    'click .settings-nav': function () {
        event.preventDefault();

        const target = event.target;
        var settingId = target.id;
        var settingScreen;

        if (settingId == "CW") {
            settingScreen = "Category Weightings";
        } else if (settingId == "AS") {
            settingScreen = "Assessments";
        } else if (settingId == "AW") {
            settingScreen = "Assessment Weightings";
        } else {
            settingScreen = "General Settings"
        }

        //console.log(settingScreen);
        Session.set('settingScreenText', settingScreen);
    },

    'click .pag-click': function () {
        var element = event.target.parentElement; //why do we need to access the parentElement??
        if (!element.classList.contains('active')) {
            var activeElement = document.getElementsByClassName('pag-click active green')[0];
            activeElement.classList.remove("active");
            activeElement.classList.remove("green");
            // activeElement.classList.remove("lighten-1");

            element.classList.add("active");
            element.classList.add("green");
            // element.classList.add("lighten-1");
        }
    }
});