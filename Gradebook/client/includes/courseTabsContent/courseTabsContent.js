import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Courses } from '../../../lib/collections.js';
import { Accounts } from 'meteor/accounts-base';

import '../../main.html';

Template.courseTabsContent.helpers({
    displaySettings: function () { //helper that grabs the setting display ID (i.e. the courseId)
      var setting = (Session.get('settingScreenText'));
  
      return setting;
    }
  });