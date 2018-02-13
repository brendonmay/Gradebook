import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Courses } from '../../../lib/collections.js';
import { CourseWeighting } from '../../../lib/collections.js'; 
import { Accounts } from 'meteor/accounts-base';
import { Meteor } from "meteor/meteor";

import '../../main.html';

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

    
});