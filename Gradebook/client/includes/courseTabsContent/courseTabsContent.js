import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Courses } from '../../../lib/collections.js';
import { Accounts } from 'meteor/accounts-base';

import '../../main.html';

Template.courseTabsContent.helpers({
    displaySettings: function () { //helper that grabs the setting display ID (i.e. the courseId)
      var setting = (Session.get('settingScreenText'));
  
      return setting;
    },

    generalSettingsSelected: function(){
      return  Session.get('settingScreenText') == "General Settings";
      console.log("General Settings is selected")
    },

    categoryWeightingsSelected: function(){
      return Session.get('settingScreenText') == "Category Weightings";
      console.log("Category Weightings is selected")
    },

    assessmentsSelected: function(){
      return Session.get('settingScreenText') == "Assessments";
      console.log("Assessments is selected")
    },
  });