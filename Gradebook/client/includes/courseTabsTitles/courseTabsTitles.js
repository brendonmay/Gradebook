import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Courses } from '../../../lib/collections.js';
import { Accounts } from 'meteor/accounts-base';

import '../../main.html';

Template.courseTabsTitles.onRendered(function () {
  this.$('.tabs').tabs();
});

Template.courseTabsTitles.events({
  'click #courseSettingsTabId': function(){
    document.getElementById("GS").parentElement.classList.add("active");
  }
});