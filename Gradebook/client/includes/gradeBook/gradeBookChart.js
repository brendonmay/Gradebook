import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Courses } from '../../../lib/collections.js';
import { Accounts } from 'meteor/accounts-base';
import { CourseWeighting } from '../../../lib/collections.js';
import { Assessments } from '../../../lib/collections.js';
import { Students } from '../../../lib/collections.js';

import '../../main.html';

function arrayOfStudentIds() {
    var arrayofStudentIds = [];
    var ownerId = Meteor.userId();
    var courseId = Session.get("courseId");
    var students = Students.findOne({ ownerId, courseId }).students;
    for (i = 0; i < students.length; i++) {
        arrayofStudentIds[arrayofStudentIds.length] = students[i].studentId
    }
    return arrayofStudentIds
};

function findOldStudentGradeValue(studentId, assessmentId, category, ownerId, courseId) {
    var students = Students.findOne({ ownerId: ownerId, courseId: courseId }).students;
    var oldValue = 0;
    for (j = 0; j < students.length; j++) {
        if (students[j].studentId == studentId) {
            var grades = students[j].grades;
            for (k = 0; k < grades.length; k++) {
                if (grades[k].assessmentId == assessmentId) {
                    oldValue = grades[k][category];
                    k = grades.length;
                    j = students.length;
                }
            }
        }
    }
    return oldValue
}

function updateGradebookColors() {
    var categoryCells = document.getElementsByClassName("categoryCell");
    var arrayofStudentIds = arrayOfStudentIds();
    var courseId = Session.get('courseId');

    for (i = 0; i < categoryCells.length; i++) {
        var id = categoryCells[i].id;
        var category = id[0];
        var assessmentId = id.slice(id.indexOf("#") + 1, id.indexOf("%"));
        var categoryValue = id.slice(id.indexOf("%") + 1, id.length);

        if (categoryValue == "-") { //turns disabled ones grey
            categoryCells[i].style = "background-color: #9e9e9e";

            for (z = 0; z < arrayofStudentIds.length; z++) {
                if (category == "C") {
                    var studentId = arrayofStudentIds[z];
                    document.getElementById(category + "?" + studentId + "#" + assessmentId).parentElement.style = "background-color: #9e9e9e; border-right: 2px solid black";
                    document.getElementById(category + "?" + studentId + "#" + assessmentId).disabled = "true";
                    document.getElementById(category + "?" + studentId + "#" + assessmentId).value = "N/A";
                }
                else {
                    var studentId = arrayofStudentIds[z];
                    document.getElementById(category + "?" + studentId + "#" + assessmentId).parentElement.style = "background-color: #9e9e9e";
                    document.getElementById(category + "?" + studentId + "#" + assessmentId).disabled = "true";
                    document.getElementById(category + "?" + studentId + "#" + assessmentId).value = "N/A";
                }
            }
        }
        if (categoryValue != "-") { //adds color to enabled ones; work here
            categoryCells[i].style = "";

            for (z = 0; z < arrayofStudentIds.length; z++) {
                var studentId = arrayofStudentIds[z];
                document.getElementById(category + "?" + studentId + "#" + assessmentId).parentElement.style = "";
                document.getElementById(category + "?" + studentId + "#" + assessmentId).removeAttribute("disabled");
                var oldValue = findOldStudentGradeValue(studentId, assessmentId, category, Meteor.userId(), courseId);
                document.getElementById(category + "?" + studentId + "#" + assessmentId).value = oldValue;
                if (category == "C") {
                    document.getElementById(category + "?" + studentId + "#" + assessmentId).parentElement.style = "border-right: 2px solid black";
                }
            }
        }
    }
};

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

Template.gradeBookChart.onRendered(function () {
    // $("#main_table").tableHeadFixer({ "left": 1, 'head': true });
});

Template.gradeBookChart.events({
    'click .assignFinalEvalButtonGradeBook': function () {
        //check if you have no more evaluations to assign
        if (canAssignFinalEvaluation() == true) {
            $('#assignFinalModal').modal({
                dismissible: true,
                complete: function () {
                    document.getElementById('assignFinalFormId').reset();

                    document.getElementById("finalCheckboxK").removeAttribute("checked");
                    document.getElementById("finalCheckboxK").value = "N/A";
                    document.getElementById("inputFinalMarkK").disabled = "true";
                    if (document.getElementById("inputFinalMarkK-error")) {
                        document.getElementById("inputFinalMarkK-error").remove();
                    }

                    document.getElementById("finalCheckboxA").removeAttribute("checked");
                    document.getElementById("finalCheckboxA").value = "N/A";
                    document.getElementById("inputFinalMarkA").disabled = "true";
                    if (document.getElementById("inputFinalMarkA-error")) {
                        document.getElementById("inputFinalMarkA-error").remove();
                    }

                    document.getElementById("finalCheckboxT").removeAttribute("checked");
                    document.getElementById("finalCheckboxT").value = "N/A";
                    document.getElementById("inputFinalMarkT").disabled = "true";
                    if (document.getElementById("inputFinalMarkT-error")) {
                        document.getElementById("inputFinalMarkT-error").remove();
                    }

                    document.getElementById("finalCheckboxC").removeAttribute("checked");
                    document.getElementById("finalCheckboxC").value = "N/A";
                    document.getElementById("inputFinalMarkC").disabled = "true";
                    if (document.getElementById("inputFinalMarkC-error")) {
                        document.getElementById("inputFinalMarkC-error").remove();
                    }
                    updateGradebookColors();
                }
            });
            $('#assignFinalModal').modal('open');
            $('select').material_select();
        }
        else {
            Materialize.toast("All of your final evaluations have already been assigned", 5000, 'amber darken-3');
        }
    },
    'click .createAssessmentButtonGradeBook': function () {
        $('#createAssessmentModal').modal({
            dismissible: true,
            complete: function () {
                document.getElementById('createAssessmentFormId').reset();

                document.getElementById("checkboxK").removeAttribute("checked");
                document.getElementById("checkboxK").value = "N/A";
                document.getElementById("inputMarkK").disabled = "true";
                if (document.getElementById("inputMarkK-error")) {
                    document.getElementById("inputMarkK-error").remove();
                }

                document.getElementById("checkboxA").removeAttribute("checked");
                document.getElementById("checkboxA").value = "N/A";
                document.getElementById("inputMarkA").disabled = "true";
                if (document.getElementById("inputMarkA-error")) {
                    document.getElementById("inputMarkA-error").remove();
                }

                document.getElementById("checkboxT").removeAttribute("checked");
                document.getElementById("checkboxT").value = "N/A";
                document.getElementById("inputMarkT").disabled = "true";
                if (document.getElementById("inputMarkT-error")) {
                    document.getElementById("inputMarkT-error").remove();
                }

                document.getElementById("checkboxC").removeAttribute("checked");
                document.getElementById("checkboxC").value = "N/A";
                document.getElementById("inputMarkC").disabled = "true";
                if (document.getElementById("inputMarkC-error")) {
                    document.getElementById("inputMarkC-error").remove();
                }

                if (document.getElementById('createNewAssessment-error')) {
                    document.getElementById('createNewAssessment-error').remove();
                }
                updateGradebookColors();
            }
        });
        $('#createAssessmentModal').modal('open');
        $('select').material_select();
    },
    'click .addStudentsButtonGradebook': function () {
        $('#addStudentsModal').modal({
            dismissible: true,
            complete: function () {
                document.getElementById('addStudentsModalForm').reset();
                updateGradebookColors();
            }

        });
        $('#addStudentsModal').modal('open');
    }
});
