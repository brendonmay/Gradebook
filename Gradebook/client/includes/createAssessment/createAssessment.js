import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Courses } from '../../../lib/collections.js';
import { Accounts } from 'meteor/accounts-base';
import { CourseWeighting } from '../../../lib/collections.js';
import { Assessments } from '../../../lib/collections.js';

import '../../main.html';

Template.createAssessment.helpers({
    getAssessmentTypes: function(){
        let currentCourseId = Session.get('courseId');
        let courseworkAssessmentTypes = CourseWeighting.findOne({ownerId: Meteor.userId(), courseId: currentCourseId}).courseworkAssessmentTypes;
        return courseworkAssessmentTypes
    }
});

Template.createAssessment.events({
    'click .check-box': function(){
        let target = event.target;
        let elementId = target.id;
        //console.log(elementId);
        if(elementId != "dontTarget"){
            let element = document.getElementById(elementId);
            let inputId = "inputMark" + elementId[elementId.length-1];
            let inputField = document.getElementById(inputId);
            console.log(inputId);

            if(element.hasAttribute("checked") == true){
                console.log("This element has the attribute checked");
                element.removeAttribute("checked");
                inputField.disabled = true;
                inputField.value = "N/A"
            }

            else if(element.hasAttribute("checked") == false){
                console.log("This element does not have the attribute checked");
                element.setAttribute("checked", "checked");
                inputField.disabled = false;
            }

        }

    },
    'submit .createAssessmentForm': function(){
        console.log("Form has been submitted")
    }
});