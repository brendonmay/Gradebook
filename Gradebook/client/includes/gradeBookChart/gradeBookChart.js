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

function moveScroll() {
    var scroll_top = $(window).scrollTop();
    var scroll_left = $(window).scrollLeft();
    var anchor_top = $("#main_table").offset().top;
    var anchor_left = $("#main_table").offset().left;
    var anchor_bottom = $("#bottom_anchor").offset().top;
    
    $("#clone").find("thead").css({
        
        position: 'absolute',
        left: - scroll_left  + 'px'
    });
    
    $("#main_table").find(".first").css({
        position: 'absolute',
        left: scroll_left + anchor_left + 'px'
    });
    
    if (scroll_top >= anchor_top && scroll_top <= anchor_bottom) {
        clone_table = $("#clone");
        if (clone_table.length == 0) {
            clone_table = $("#main_table")
                .clone()
                .attr('id', 'clone')
                .attr('align', 'center')
                .css({
                    position: 'fixed',
                    pointerEvents: 'none',
                    left: $("#main_table").offset().left+'px',
                    top: 0
                })
                .appendTo($("#table_container"))
                .css({
                    visibility: 'hidden'
                })
                .find("thead").css({
                    visibility: 'visible'
                });
        }
    }
    else {
        $("#clone").remove();
    }
}

Template.gradeBookChart.onRendered(function() {
    $("#main_table")
    .wrap('<div id="table_container"></div>')
    .after('<div id="bottom_anchor"></div>');
    
    $(window).scroll(moveScroll);
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
    }
});