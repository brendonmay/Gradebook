import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Courses } from '../../../lib/collections.js';
import { Accounts } from 'meteor/accounts-base';

import '../../main.html';

Template.courseTabsContent.onRendered( function() {
  $('.dropdown-button').dropdown();
  $('input#input_text, textarea#textarea1').characterCounter();
  $('select').material_select();
  $('.collapsible').collapsible();
  $('.datepicker').pickadate({
    selectMonths: false, // Creates a dropdown to control month
    selectYears: 15, // Creates a dropdown of 15 years to control year,
    today: 'Today',
    clear: 'Clear',
    close: 'Ok',
    container: 'body',
    closeOnSelect: false // Close upon selecting a date,
  });
})

Template.courseTabsContent.helpers({
  displaySettings: function () { //helper that grabs the setting display ID (i.e. the courseId)
    var setting = (Session.get('settingScreenText'));

    return setting;
  },

  generalSettingsSelected: function () {
    return Session.get('settingScreenText') == "General Settings";
  },

  categoryWeightingsSelected: function () {
    return Session.get('settingScreenText') == "Category Weightings";
  },

  assessmentsSelected: function () {
    return Session.get('settingScreenText') == "Assessments";
  },
});

Template.courseTabsContent.onRendered(function () {
  $(document).ready(function() {
      $('select').material_select();
  });
});