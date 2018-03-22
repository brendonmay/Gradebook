import { CalculatedGrades } from "../collections.js";
import { CourseWeighting } from "../collections.js";
import { Meteor } from "meteor/meteor";

if (Meteor.isServer) {
    Meteor.methods({
        'calculatedgrades.defaultSetup'(ownerId, courseId) {
            CalculatedGrades.insert({
                ownerId,
                courseId,
                students: []
            })
        },
        'calculatedgrades.deleteCourse'(ownerId, courseId) {
            CalculatedGrades.remove({ ownerId, courseId })
        },
        'calculatedgrades.addStudent'(ownerId, courseId, studentId) {
            var studentsArray = CalculatedGrades.findOne({ ownerId, courseId }).students;
            var assessmentTypes = [];
            var courseworkAssessmentTypes = CourseWeighting.findOne({ ownerId, courseId }).courseworkAssessmentTypes;
            var finalAssessmentTypes = CourseWeighting.findOne({ ownerId, courseId }).finalAssessmentTypes;
            for (i = 0; i < courseworkAssessmentTypes.length; i++) {
                assessmentTypes[assessmentTypes.length] = courseworkAssessmentTypes[i].assessmentTypeId;
            }
            for (i = 0; i < finalAssessmentTypes.length; i++) {
                assessmentTypes[assessmentTypes.length] = finalAssessmentTypes[i].assessmentTypeId;
            }
            var currentGrades = [];

            for (i = 0; i < assessmentTypes.length; i++) {
                if (assessmentTypes[i][0] != "f") {
                    var currentGradesObject = {
                        assessmentTypeId: assessmentTypes[i],
                        assessmentTypeGrade: {},
                        assessments: []
                    };
                }
                else {
                    var currentGradesObject = {
                        assessmentTypeId: assessmentTypes[i],
                        assessmentTypeGrade: {}
                    };
                }
                currentGrades[currentGrades.length] = currentGradesObject;
            }

            var newStudentObject = {
                studentId: studentId,
                currentGrades: currentGrades
            }

            studentsArray[studentsArray.length] = newStudentObject;

            CalculatedGrades.update(
                { ownerId, courseId },
                {
                    $set:
                        { 'students': studentsArray }
                }
            )
        },
        'calculatedgrades.deleteStudent'(ownerId, courseId, studentId) {
            var studentsArray = CalculatedGrades.findOne({ ownerId, courseId }).students;
            for (i = 0; i < studentsArray.length; i++) {
                if (studentId == studentsArray[i].studentId) {
                    studentsArray.splice(i, 1);
                    i = studentsArray.length;
                }
            }
            CalculatedGrades.update(
                { ownerId, courseId },
                {
                    $set:
                        { 'students': studentsArray }
                }
            );

        },
        'calculatedgrades.addNewAssessmentType'(ownerId, courseId, assessmentTypeId) {
            var studentsArray = CalculatedGrades.findOne({ ownerId, courseId }).students;

            if (assessmentTypeId[0] != 'f') {
                var newCurrentGradesObject = {
                    assessmentTypeId: assessmentTypeId,
                    assessmentTypeGrade: {},
                    assessments: []
                };
            }
            else {
                var newCurrentGradesObject = {
                    assessmentTypeId: assessmentTypeId,
                    assessmentTypeGrade: {}
                };
            }
            for (i = 0; i < studentsArray.length; i++) {
                studentsArray[i].currentGrades[studentsArray[i].currentGrades.length] = newCurrentGradesObject;
            }
            CalculatedGrades.update(
                { ownerId, courseId },
                {
                    $set:
                        { 'students': studentsArray }
                }
            );
        },
        'calculatedgrades.deleteAssessmentType'(ownerId, courseId, assessmentTypeId) {
            var studentsArray = CalculatedGrades.findOne({ ownerId, courseId }).students;
            for (i = 0; i < studentsArray.length; i++) {
                var currentGrades = studentsArray[i].currentGrades;
                for (z = 0; z < currentGrades.length; z++) {
                    if (currentGrades[z].assessmentTypeId == assessmentTypeId) {
                        studentsArray[i].currentGrades.splice(z, 1);
                        z = currentGrades.length;
                    }
                }
            }
            CalculatedGrades.update(
                { ownerId, courseId },
                {
                    $set:
                        { 'students': studentsArray }
                }
            );
        },
        'calculatedgrades.deleteAssessment'(ownerId, courseId, assessmentId) { //still need to test and implement
            var studentsArray = CalculatedGrades.findOne({ ownerId, courseId }).students;
            var assessmentTypeId = assessmentId.slice(0, assessmentId.indexOf("-"));
            for (i = 0; i < studentsArray.length; i++) {
                var currentGrades = studentsArray[i].currentGrades;
                for (z = 0; z < currentGrades.length; z++) {
                    if (currentGrades[z].assessmentTypeId == assessmentTypeId) {
                        var assessments = currentGrades[z].assessments;
                        for (w = 0; w < assessments.length; w++) {
                            if (assessments[w].assessmentId == assessmentId) {
                                studentsArray[i].currentGrades[z].assessments.splice(w, 1);
                                w = assessments.length;
                            }
                        }
                        z = currentGrades.length;
                    }
                }
            }
            CalculatedGrades.update(
                { ownerId, courseId },
                {
                    $set:
                        { 'students': studentsArray }
                }
            );
        },
        'calculatedgrades.updateCourseAssessmentGrade'(ownerId, courseId, assessmentId, grade, category, studentId) { //have yet to test and implement
            var assessmentTypeId = assessmentId.slice(0, assessmentId.indexOf("-"));
            var gradeKey = "";

            if (category == 'K'){
                gradeKey = 'KGrade';
            }
            if (category == 'A'){
                gradeKey = 'AGrade';
            }
            if (category == 'T'){
                gradeKey = "TGrade";
            }
            if (category == 'C'){
                gradeKey = 'CGrade';
            }

            var studentsArray = CalculatedGrades.findOne({ ownerId, courseId }).students;

            for (i = 0; i < studentsArray.length; i++) {
                if (studentsArray[i].studentId == studentId) {
                    var currentGrades = studentsArray[i].currentGrades;
                    for (z = 0; z < currentGrades.length; z++) {
                        if (currentGrades[z].assessmentTypeId == assessmentTypeId) {
                            var assessments = currentGrades[z].assessments;
                            var assessmentDoesntExist = true;
                            for (w = 0; w < assessments.length; w++) {
                                if (assessments[w].assessmentId == assessmentId) {
                                    studentsArray[i].currentGrades[z].assessments[w][gradeKey] = grade;
                                    assessmentDoesntExist = false;
                                    w = assessments.length;
                                }
                            }
                            if (assessmentDoesntExist == true) {
                                studentsArray[i].currentGrades[z].assessments[assessments.length] = {};
                                studentsArray[i].currentGrades[z].assessments[assessments.length - 1].assessmentId = assessmentId;
                                studentsArray[i].currentGrades[z].assessments[assessments.length - 1][gradeKey] = grade;                    
                            }
                            z = currentGrades.length;
                        }
                    }
                    i = studentsArray.length;
                }
            }
            CalculatedGrades.update(
                { ownerId, courseId },
                {
                    $set:
                        { 'students': studentsArray }
                }
            );
        },
        'calculatedgrades.updateFinalAssessmentGrade'(ownerId, courseId, assessmentTypeId, category, grade, studentId) { //need to test and implement
            var studentsArray = CalculatedGrades.findOne({ ownerId, courseId }).students;
            var gradeKey = "";

            if (category == 'K'){
                gradeKey = 'KGrade';
            }
            if (category == 'A'){
                gradeKey = 'AGrade';
            }
            if (category == 'T'){
                gradeKey = "TGrade";
            }
            if (category == 'C'){
                gradeKey = 'CGrade';
            }
            for (i = 0; i < studentsArray.length; i++) {
                if (studentsArray[i].studentId == studentId) {
                    var currentGrades = studentsArray[i].currentGrades;
                    for (z = 0; z < currentGrades.length; z++) {
                        if (currentGrades[z].assessmentTypeId == assessmentTypeId) {
                            studentsArray[i].currentGrades[z].assessmentTypeGrade[gradeKey] = grade;
                            z = currentGrades.length;
                        }
                    }
                    i = studentsArray.length;
                }
            }
            CalculatedGrades.update(
                { ownerId, courseId },
                {
                    $set:
                        { 'students': studentsArray }
                }
            );
        }
    });
}