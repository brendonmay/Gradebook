import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Courses, CalculatedGrades } from '../../../lib/collections.js';
import { Accounts } from 'meteor/accounts-base';
import { CourseWeighting } from '../../../lib/collections.js';

import '../../main.html';

function determineOverallCategoryGrade(ownerId, courseId, studentId, category) {
    var studentsArray = CalculatedGrades.findOne({ ownerId, courseId }).students;
    var assessmentTypeGradesAndWeight = [];
    var totalWeight = 0;

    for (i = 0; i < studentsArray.length; i++) {
        if (studentsArray[i].studentId == studentId) {
            var currentGrades = studentsArray[i].currentGrades;
            for (z = 0; z < currentGrades.length; z++) {
                var assessmentTypeId = currentGrades[z].assessmentTypeId;
                var assessmentTypeGrade = currentGrades[z].assessmentTypeGrade;

                var assessedCategories = Object.keys(assessmentTypeGrade);
                var categoryKey = category + "Grade";
                var weight = 0;

                if (assessedCategories.includes(categoryKey)) {
                    var grade = assessmentTypeGrade[categoryKey];
                    //find weight of assessmentTypeId
                    if (assessmentTypeId[0] != "f") {
                        var courseworkAssessmentTypes = CourseWeighting.findOne({ ownerId, courseId }).courseworkAssessmentTypes;
                        for (w = 0; w < courseworkAssessmentTypes.length; w++) {
                            if (courseworkAssessmentTypes[w].assessmentTypeId == assessmentTypeId) {
                                weight = courseworkAssessmentTypes[w].assessmentWeight;
                                w = courseworkAssessmentTypes.length;
                            }
                        }
                    }
                    else {
                        var finalAssessmentTypes = CourseWeighting.findOne({ ownerId, courseId }).finalAssessmentTypes;
                        for (w = 0; w < finalAssessmentTypes.length; w++) {
                            if (finalAssessmentTypes[w].assessmentTypeId == assessmentTypeId) {
                                weight = finalAssessmentTypes[w].assessmentWeight;
                                w = finalAssessmentTypes.length;
                            }
                        }
                    }
                    var assessmentTypeObject = {
                        assessmentTypeId,
                        grade,
                        weight
                    }
                    totalWeight = totalWeight + weight;
                    assessmentTypeGradesAndWeight[assessmentTypeGradesAndWeight.length] = assessmentTypeObject;
                }
            }
            i = studentsArray.length;
        }
    }

    if (assessmentTypeGradesAndWeight.length == 0 || totalWeight == 0) {
        return "N/A"
    }

    overallCategoryGrade = 0;

    for (i = 0; i < assessmentTypeGradesAndWeight.length; i++) {
        var grade = assessmentTypeGradesAndWeight[i].grade;
        var weight = assessmentTypeGradesAndWeight[i].weight;
        overallCategoryGrade = overallCategoryGrade + (grade * (weight / totalWeight));

    }

    overallCategoryGrade = Number(overallCategoryGrade.toFixed(2));
    return overallCategoryGrade
}

function getSelectedAssessmentType() {
    //run a null check as selectedAssessmentType isn't always available
    return Session.get("selectedAssessmentType")
}

function getAssessmentType() {
    if (getSelectedAssessmentType()) {
        return getSelectedAssessmentType().type
    }
}

function getAssessmentTypeName() {
    if (getSelectedAssessmentType()) {
        return getSelectedAssessmentType().assessmentTypeName
    }
}

function getAssessmentTypeId() {
    if (getSelectedAssessmentType()) {
        return getSelectedAssessmentType().assessmentTypeId
    }
}

Template.deleteCourseworkAssessmentType.helpers({
    assessmentTypeName: function () {
        return getAssessmentTypeName();
    }
});

Template.deleteCourseworkAssessmentType.events({
    'click .yes-delete-modal': function () {
        //create new array of assessmentType objects excluding the selected one
        document.getElementById("preloader").style = "";
        let newcourseworkAssessmentTypes = [];
        let currentCourseId = Session.get('courseId');
        let selectedAssessmentTypeId = getAssessmentTypeId();

        let courseworkAssessmentTypes = CourseWeighting.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).courseworkAssessmentTypes;

        for (i = 0; i < courseworkAssessmentTypes.length; i++) {
            if (courseworkAssessmentTypes[i].assessmentTypeId != selectedAssessmentTypeId) {
                newcourseworkAssessmentTypes[newcourseworkAssessmentTypes.length] = courseworkAssessmentTypes[i];
            }
        }

        //console.log(newcourseworkAssessmentTypes);

        //update the document with new array of assessmentType objects
        Meteor.call('courseInformation.addNewCourseWork', currentCourseId, newcourseworkAssessmentTypes);
        Meteor.call('students.deleteCourseAssessmentType', Meteor.userId(), currentCourseId, selectedAssessmentTypeId);
        Meteor.call('calculatedgrades.deleteAssessmentType', Meteor.userId(), currentCourseId, selectedAssessmentTypeId, function (error, result) {
            if (error) {
                console.log("error deleting assessmentType");
            }
            var studentsArray = CalculatedGrades.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).students;
            for (var q = 0; q < studentsArray.length; q++) {
                var studentId = studentsArray[q].studentId;
                if (studentsArray[q].categoryGrades.KGrade) {
                    var newOverallCategoryGradeK = determineOverallCategoryGrade(Meteor.userId(), currentCourseId, studentId, "K");
                    Meteor.call('calculatedgrades.updateOverallCategoryGrade', Meteor.userId(), currentCourseId, studentId, "K", newOverallCategoryGradeK);
                }

                if (studentsArray[q].categoryGrades.AGrade) {
                    var newOverallCategoryGradeA = determineOverallCategoryGrade(Meteor.userId(), currentCourseId, studentId, "A");
                    Meteor.call('calculatedgrades.updateOverallCategoryGrade', Meteor.userId(), currentCourseId, studentId, "A", newOverallCategoryGradeA);
                }

                if (studentsArray[q].categoryGrades.TGrade) {
                    var newOverallCategoryGradeT = determineOverallCategoryGrade(Meteor.userId(), currentCourseId, studentId, "T");
                    Meteor.call('calculatedgrades.updateOverallCategoryGrade', Meteor.userId(), currentCourseId, studentId, "T", newOverallCategoryGradeT);
                }

                if (studentsArray[q].categoryGrades.CGrade) {
                    var newOverallCategoryGradeC = determineOverallCategoryGrade(Meteor.userId(), currentCourseId, studentId, "C");
                    Meteor.call('calculatedgrades.updateOverallCategoryGrade', Meteor.userId(), currentCourseId, studentId, "C", newOverallCategoryGradeC);
                }
            }
        });
        Session.set('gradebookUpdated', true);

        //close modal
        $('#deleteCourseworkAssessmentTypeModal').modal('close');
    }
});



Template.deleteFinalAssessmentType.helpers({
    assessmentTypeName: function () {
        return getAssessmentTypeName();
    }
});

Template.deleteFinalAssessmentType.events({
    'click .yes-delete-modal': function () {
        //create new array of assessmentType objects excluding the selected one
        document.getElementById("preloader").style = "";
        let newfinalAssessmentTypes = [];
        let currentCourseId = Session.get('courseId');
        let selectedAssessmentTypeId = getAssessmentTypeId();

        let finalAssessmentTypes = CourseWeighting.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).finalAssessmentTypes;

        for (i = 0; i < finalAssessmentTypes.length; i++) {
            if (finalAssessmentTypes[i].assessmentTypeId != selectedAssessmentTypeId) {
                newfinalAssessmentTypes[newfinalAssessmentTypes.length] = finalAssessmentTypes[i];
            }
        }

        //console.log(newfinalAssessmentTypes);

        //update the document with new array of assessmentType objects
        Meteor.call('courseInformation.addNewFinalWork', currentCourseId, newfinalAssessmentTypes);
        Meteor.call('students.deleteAssessment', Meteor.userId(), currentCourseId, selectedAssessmentTypeId);
        Meteor.call('calculatedgrades.deleteAssessmentType', Meteor.userId(), currentCourseId, selectedAssessmentTypeId, function (error, result) {
            if (error) {
                console.log("error deleting Final assessmentType");
            }
            var studentsArray = CalculatedGrades.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).students;
            for (var q = 0; q < studentsArray.length; q++) {
                var studentId = studentsArray[q].studentId;
                if (studentsArray[q].categoryGrades.KGrade) {
                    var newOverallCategoryGradeK = determineOverallCategoryGrade(Meteor.userId(), currentCourseId, studentId, "K");
                    Meteor.call('calculatedgrades.updateOverallCategoryGrade', Meteor.userId(), currentCourseId, studentId, "K", newOverallCategoryGradeK);
                }

                if (studentsArray[q].categoryGrades.AGrade) {
                    var newOverallCategoryGradeA = determineOverallCategoryGrade(Meteor.userId(), currentCourseId, studentId, "A");
                    Meteor.call('calculatedgrades.updateOverallCategoryGrade', Meteor.userId(), currentCourseId, studentId, "A", newOverallCategoryGradeA);
                }

                if (studentsArray[q].categoryGrades.TGrade) {
                    var newOverallCategoryGradeT = determineOverallCategoryGrade(Meteor.userId(), currentCourseId, studentId, "T");
                    Meteor.call('calculatedgrades.updateOverallCategoryGrade', Meteor.userId(), currentCourseId, studentId, "T", newOverallCategoryGradeT);
                }

                if (studentsArray[q].categoryGrades.CGrade) {
                    var newOverallCategoryGradeC = determineOverallCategoryGrade(Meteor.userId(), currentCourseId, studentId, "C");
                    Meteor.call('calculatedgrades.updateOverallCategoryGrade', Meteor.userId(), currentCourseId, studentId, "C", newOverallCategoryGradeC);
                }
            }
        });
        Session.set('gradebookUpdated', true);

        //close modal
        $('#deleteFinalAssessmentTypeModal').modal('close');
    }
});