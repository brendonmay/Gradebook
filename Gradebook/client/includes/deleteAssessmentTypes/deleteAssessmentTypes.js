import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Courses } from '../../../lib/collections.js';
import { Accounts } from 'meteor/accounts-base';
import { CourseWeighting } from '../../../lib/collections.js';

import '../../main.html';

function getSelectedAssessmentType(){
    //run a null check as selectedAssessmentType isn't always available
    return Session.get("selectedAssessmentType")
}

function getAssessmentType(){
    return getSelectedAssessmentType().type
}

function getAssessmentTypeName(){
    return getSelectedAssessmentType().assessmentTypeName
}

function getAssessmentTypeId(){
    return getSelectedAssessmentType().assessmentTypeId
}

Template.deleteCourseworkAssessmentType.helpers({
    assessmentTypeName: function(){
        return getAssessmentTypeName();
    }
});

Template.deleteCourseworkAssessmentType.events({
    'click .yes-delete-modal': function(){
        //create new array of assessmentType objects excluding the selected one
        let newcourseworkAssessmentTypes = [];
        let currentCourseId = Session.get('courseId');
        let selectedAssessmentTypeId = getAssessmentTypeId();

        let courseworkAssessmentTypes = CourseWeighting.findOne({ownerId: Meteor.userId(), courseId: currentCourseId}).courseworkAssessmentTypes;
        
        for (i = 0; i < courseworkAssessmentTypes.length; i++){
            if (courseworkAssessmentTypes[i].assessmentTypeId != selectedAssessmentTypeId){
                newcourseworkAssessmentTypes[newcourseworkAssessmentTypes.length] = courseworkAssessmentTypes[i];
            }
        }

        //console.log(newcourseworkAssessmentTypes);

        //update the document with new array of assessmentType objects
        Meteor.call('courseInformation.addNewCourseWork', currentCourseId, newcourseworkAssessmentTypes)

        //close modal
        $('#deleteCourseworkAssessmentTypeModal').modal('close');
    }
});



Template.deleteFinalAssessmentType.helpers({
    assessmentTypeName: function(){
        return getAssessmentTypeName();
    }
});

Template.deleteFinalAssessmentType.events({
    'click .yes-delete-modal': function(){
        //create new array of assessmentType objects excluding the selected one
        let newfinalAssessmentTypes = [];
        let currentCourseId = Session.get('courseId');
        let selectedAssessmentTypeId = getAssessmentTypeId();

        let finalAssessmentTypes = CourseWeighting.findOne({ownerId: Meteor.userId(), courseId: currentCourseId}).finalAssessmentTypes;
        
        for (i = 0; i < finalAssessmentTypes.length; i++){
            if (finalAssessmentTypes[i].assessmentTypeId != selectedAssessmentTypeId){
                newfinalAssessmentTypes[newfinalAssessmentTypes.length] = finalAssessmentTypes[i];
            }
        }

        //console.log(newfinalAssessmentTypes);

        //update the document with new array of assessmentType objects
        Meteor.call('courseInformation.addNewFinalWork', currentCourseId, newfinalAssessmentTypes)

        //close modal
        $('#deleteFinalAssessmentTypeModal').modal('close');
    }
});