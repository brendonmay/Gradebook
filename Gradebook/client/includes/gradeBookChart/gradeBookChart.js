import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Courses } from '../../../lib/collections.js';
import { Accounts } from 'meteor/accounts-base';
import { CourseWeighting } from '../../../lib/collections.js';
import { Assessments } from '../../../lib/collections.js';

import '../../main.html';

function canAssignFinalEvaluation() {
    let currentCourseId = Session.get('courseId');
    let finalAssessmentTypes = CourseWeighting.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).finalAssessmentTypes;
    var finalAssessmentTypeObjects = Assessments.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).finalAssessmentTypes;
    var unassignedFinalEvaluationIds = [];
    var arrayOfEvaluationsToReturn = [];

    //check which final assessment Type Ids have not already been assigned
    for (i = 0; i < finalAssessmentTypeObjects.length; i++) {
        if (finalAssessmentTypeObjects[i].K == "N/A" && finalAssessmentTypeObjects[i].A == "N/A" && finalAssessmentTypeObjects[i].T == "N/A" && finalAssessmentTypeObjects[i].C == "N/A") {
            let unassignedAssessmentTypeId = finalAssessmentTypeObjects[i].assessmentTypeId;
            unassignedFinalEvaluationIds[unassignedFinalEvaluationIds.length] = unassignedAssessmentTypeId;
        }
    }

    //We now have all the Ids of the unassigned final assessments. We must find their names
    for (i = 0; i < unassignedFinalEvaluationIds.length; i++) {
        for (z = 0; z < finalAssessmentTypes.length; z++) {
            if (unassignedFinalEvaluationIds[i] == finalAssessmentTypes[z].assessmentTypeId) {
                //console.log(finalAssessmentTypes[z].assessmentType + " is the name of assessmentTypeId: " + unassignedFinalEvaluationIds[i]);
                var assessmentName = finalAssessmentTypes[z].assessmentType;
                var unassignedEvaluation = { assessmentType: assessmentName };
                arrayOfEvaluationsToReturn[arrayOfEvaluationsToReturn.length] = unassignedEvaluation;
            }
        }
    }

    return arrayOfEvaluationsToReturn.length != 0
}

Template.gradeBookChart.onRendered(function() {
    var $table = $('#main_table');
    $table.floatThead();
});
$(document).ready(function() {
    $(window).scroll(function(e) { //detect a scroll event on the tbody
        var studentNameCells = document.getElementsByClassName('studNameCell');
        var offset = document.getElementsByClassName('floatThead-container')[0].style.left;
        var newoffset = (parseInt(offset) * -1);
        console.log(newoffset)
        for (var i = 0; i < studentNameCells.length; i++) {            
            if (newoffset >= 0) {
                studentNameCells[i].style.left = '' + newoffset + 'px';
            }
        }

      //$('tbody tr td:nth-child(1)').css("left", -$(".floatThead-container").css("left")); //fix the first column of tdbody
    });
  });
  


Template.gradeBookChart.events({
    'click .assignFinalEvalButtonGradeBook': function () {
        //check if you have no more evaluations to assign
        if (canAssignFinalEvaluation() == true) {
            $('#assignFinalModal').modal('open');
            $('select').material_select();
        }
        else {
            Materialize.toast("All of your final evaluations have already been assigned", 5000, 'amber darken-3');
        }
    },
    'click .createAssessmentButtonGradeBook': function () {
        $('#createAssessmentModal').modal('open');
        $('select').material_select();
    },
    
});