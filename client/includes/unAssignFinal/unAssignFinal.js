import { Template } from 'meteor/templating';
import { Courses } from '../../../lib/collections.js';
import { Accounts } from 'meteor/accounts-base';
import { Students } from '../../../lib/collections.js';
import { Assessments } from '../../../lib/collections.js';
import { CourseWeighting } from '../../../lib/collections.js';
import { CalculatedGrades } from '../../../lib/collections.js';

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

Template.unAssignFinal.helpers({
    assessmentTypeName: function () {
        var ownerId = Meteor.userId();
        var courseId = Session.get('courseId');
        const removeAssessmentObj = Session.get("removeAssessmentObj");
        let currentCourseId = Session.get('courseId');
        if (removeAssessmentObj) {
            const assessmentTypeId = removeAssessmentObj.assessmentTypeId;
            let finalAssessmentTypes = CourseWeighting.findOne({ ownerId, courseId }).finalAssessmentTypes;
            for (var i = 0; i < finalAssessmentTypes.length; i++) {
                if (finalAssessmentTypes[i].assessmentTypeId == assessmentTypeId) {
                    var assessmentTypeName = finalAssessmentTypes[i].assessmentType;
                    return assessmentTypeName

                }
            }
        }
    }
});

Template.unAssignFinal.events({
    'click #unAssignFinal-no': function () {
        let removeAssessmentObj = Session.get("removeAssessmentObj");
        removeAssessmentObj.removeCourse = "no";
        Session.set("removeAssessmentObj", removeAssessmentObj);
    },
    'click #unAssignFinal-yes': function () {

        var removeAssessmentObj = Session.get("removeAssessmentObj");
        let assessmentTypeId = removeAssessmentObj.assessmentTypeId;
        var ownerId = Meteor.userId();
        var courseId = Session.get('courseId');
        var currentCourseId = courseId;

        if (removeAssessmentObj.inAssessments != true){
            document.getElementById("preloader").style = "";
        }


        //removed from student grades in Students Collection
        Meteor.call('students.deleteAssessment', ownerId, courseId, assessmentTypeId);

        //in Assessments Collection, all marks out of for the assessment set to N/A
        Meteor.call('assessments.unAssignFinal', currentCourseId, assessmentTypeId);

        //assessmentType Grade set to {} in Calculated grades then update Category Grades
        Meteor.call('calculatedgrades.deleteAssessmentType', ownerId, courseId, assessmentTypeId, function (error, result) {
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

        removeAssessmentObj.removeCourse = "";
        removeAssessmentObj.inAssessments = false;
        Session.set("removeAssessmentObj", removeAssessmentObj);

        $('#unAssignFinalModal').modal('close');
    }
});