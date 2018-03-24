import { CalculatedGrades } from "../collections.js";
import { CourseWeighting } from "../collections.js";
import { Assessments } from "../collections.js";
import { Students } from "../collections.js";
import { Meteor } from "meteor/meteor";

function getWeightedAverage(K, A, T, C, WeightK, WeightA, WeightT, WeightC) {
    if (K != "N/A" && A != "N/A" && T != "N/A" && C != "N/A") {
        var weightedAverage = K * WeightK + A * WeightA + T * WeightT + C * WeightC;
        return Number(weightedAverage.toFixed(2))
    }
    else if (K == "N/A" && A != "N/A" && T != "N/A" && C != "N/A") {
        var newWeightC = (100 * WeightC) / (WeightA + WeightT + WeightC);
        var newWeightA = (WeightA / WeightC) * newWeightC;
        var newWeightT = (WeightT / WeightC) * newWeightC;

        var weightedAverage = A * newWeightA + T * newWeightT + C * newWeightC;

        return Number(weightedAverage.toFixed(2))
    }
    else if (K != "N/A" && A == "N/A" && T != "N/A" && C != "N/A") {
        var newWeightC = (100 * WeightC) / (WeightK + WeightT + WeightC);
        var newWeightK = (WeightK / WeightC) * newWeightC;
        var newWeightT = (WeightT / WeightC) * newWeightC;

        var weightedAverage = K * newWeightK + T * newWeightT + C * newWeightC;

        return Number(weightedAverage.toFixed(2))
    }
    else if (K != "N/A" && A != "N/A" && T == "N/A" && C != "N/A") {
        var newWeightC = (100 * WeightC) / (WeightA + WeightK + WeightC);
        var newWeightK = (WeightK / WeightC) * newWeightC;
        var newWeightA = (WeightA / WeightC) * newWeightC;

        var weightedAverage = K * newWeightK + A * newWeightA + C * newWeightC;

        return Number(weightedAverage.toFixed(2))
    }
    else if (K != "N/A" && A != "N/A" && T != "N/A" && C == "N/A") {
        var newWeightT = (100 * WeightT) / (WeightK + WeightT + WeightA);
        var newWeightK = (WeightK / WeightT) * newWeightT;
        var newWeightA = (WeightA / WeightT) * newWeightT;

        var weightedAverage = K * newWeightK + A * newWeightA + T * newWeightT;

        return Number(weightedAverage.toFixed(2))
    }
    else if (K == "N/A" && A == "N/A" && T != "N/A" && C != "N/A") {
        var newWeightT = (100 * WeightT) / (WeightT + WeightC);
        var newWeightC = (WeightC / WeightT) * newWeightT;

        var weightedAverage = T * newWeightT + C * newWeightC;

        return Number(weightedAverage.toFixed(2))
    }
    else if (K == "N/A" && A != "N/A" && T == "N/A" && C != "N/A") {
        var newWeightA = (100 * WeightA) / (WeightA + WeightC);
        var newWeightC = (WeightC / WeightA) * newWeightA;

        var weightedAverage = A * newWeightA + C * newWeightC;

        return Number(weightedAverage.toFixed(2))
    }
    else if (K == "N/A" && A != "N/A" && T != "N/A" && C == "N/A") {
        var newWeightA = (100 * WeightA) / (WeightA + WeightT);
        var newWeightT = (WeightT / WeightA) * newWeightA;

        var weightedAverage = A * newWeightA + T * newWeightT;

        return Number(weightedAverage.toFixed(2))
    }
    else if (K != "N/A" && A == "N/A" && T == "N/A" && C != "N/A") {
        var newWeightK = (100 * WeightK) / (WeightK + WeightC);
        var newWeightC = (WeightC / WeightK) * newWeightK;

        var weightedAverage = C * newWeightC + K * newWeightK;

        return Number(weightedAverage.toFixed(2))
    }
    else if (K != "N/A" && A == "N/A" && T != "N/A" && C == "N/A") {
        var newWeightK = (100 * WeightK) / (WeightK + WeightT);
        var newWeightT = (WeightT / WeightK) * newWeightK;

        var weightedAverage = T * newWeightT + K * newWeightK;

        return Number(weightedAverage.toFixed(2))
    }
    else if (K != "N/A" && A != "N/A" && T == "N/A" && C == "N/A") {
        var newWeightA = (100 * WeightA) / (WeightK + WeightA);
        var newWeightK = (WeightK / WeightA) * newWeightA;

        var weightedAverage = A * newWeightA + K * newWeightK;

        return Number(weightedAverage.toFixed(2))
    }
    else if (K != "N/A" && A == "N/A" && T == "N/A" && C == "N/A") {
        var weightedAverage = 100 * K;

        return Number(weightedAverage.toFixed(2))
    }
    else if (K == "N/A" && A != "N/A" && T == "N/A" && C == "N/A") {
        var weightedAverage = 100 * A;

        return Number(weightedAverage.toFixed(2))
    }
    else if (K == "N/A" && A == "N/A" && T != "N/A" && C == "N/A") {
        var weightedAverage = 100 * T;

        return Number(weightedAverage.toFixed(2))
    }
    else if (K == "N/A" && A == "N/A" && T == "N/A" && C != "N/A") {
        var weightedAverage = 100 * C;

        return Number(weightedAverage.toFixed(2))
    }
    else if (K == "N/A" && A == "N/A" && T == "N/A" && C == "N/A") {
        var weightedAverage = "N/A";

        return weightedAverage
    }
}

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
        'calculatedgrades.deleteAssessment'(ownerId, courseId, assessmentId) {
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
        'calculatedgrades.updateCourseAssessmentGrade'(ownerId, courseId, assessmentId, grade, category, studentId) {
            var assessmentTypeId = assessmentId.slice(0, assessmentId.indexOf("-"));
            var gradeKey = "";

            if (category == 'K') {
                gradeKey = 'KGrade';
            }
            if (category == 'A') {
                gradeKey = 'AGrade';
            }
            if (category == 'T') {
                gradeKey = "TGrade";
            }
            if (category == 'C') {
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
        'calculatedgrades.updateFinalAssessmentGrade'(ownerId, courseId, assessmentTypeId, category, grade, studentId) {
            var studentsArray = CalculatedGrades.findOne({ ownerId, courseId }).students;
            var gradeKey = "";

            if (category == 'K') {
                gradeKey = 'KGrade';
            }
            if (category == 'A') {
                gradeKey = 'AGrade';
            }
            if (category == 'T') {
                gradeKey = "TGrade";
            }
            if (category == 'C') {
                gradeKey = 'CGrade';
            }
            for (i = 0; i < studentsArray.length; i++) {
                if (studentsArray[i].studentId == studentId) {
                    var currentGrades = studentsArray[i].currentGrades;
                    for (z = 0; z < currentGrades.length; z++) {
                        if (currentGrades[z].assessmentTypeId == assessmentTypeId) {
                            if( grade != "N/A"){
                                studentsArray[i].currentGrades[z].assessmentTypeGrade[gradeKey] = grade;
                            }
                            else{
                                var gradeKeys = Object.keys(studentsArray[i].currentGrades[z].assessmentTypeGrade);
                                if (gradeKeys.length == 1){
                                    studentsArray[i].currentGrades[z].assessmentTypeGrade = {};
                                }
                                else{
                                    delete studentsArray[i].currentGrades[z].assessmentTypeGrade[gradeKey];
                                }
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
        'calculatedgrades.updateAssessmentTypeGrade'(ownerId, courseId, studentId, grade, category, assessmentTypeId, newGrade) {
            var studentsArray = CalculatedGrades.findOne({ ownerId, courseId }).students;

            if (category == 'K') {
                gradeKey = 'KGrade';
            }
            if (category == 'A') {
                gradeKey = 'AGrade';
            }
            if (category == 'T') {
                gradeKey = "TGrade";
            }
            if (category == 'C') {
                gradeKey = 'CGrade';
            }

            for (i = 0; i < studentsArray.length; i++) {
                if (studentsArray[i].studentId == studentId) {
                    var currentGrades = studentsArray[i].currentGrades;
                    for (z = 0; z < currentGrades.length; z++) {
                        if (currentGrades[z].assessmentTypeId == assessmentTypeId) {
                            var assessmentTypeGrade = currentGrades[z].assessmentTypeGrade;
                            if (assessmentTypeGrade == {}) { //check assessmentTypeGrade isnt empty
                                studentsArray[i].currentGrades[z].assessmentTypeGrade[gradeKey] = grade;
                            }
                            else { //check to see if the category is there already
                                var categories = Object.keys(assessmentTypeGrade);
                                if (categories.includes(gradeKey)) {
                                    if (isNaN(newGrade) == false){
                                        studentsArray[i].currentGrades[z].assessmentTypeGrade[gradeKey] = newGrade;
                                    }
                                    else{
                                        if (categories.length == 1){
                                            studentsArray[i].currentGrades[z].assessmentTypeGrade = {};
                                        }
                                        else{
                                            delete studentsArray[i].currentGrades[z].assessmentTypeGrade[gradeKey];
                                        }
                                    }
                                }
                                else {
                                    if (isNaN(newGrade) == false){
                                        studentsArray[i].currentGrades[z].assessmentTypeGrade[gradeKey] = grade;
                                    }
                                }

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
        'calculatedgrades.removeCourseAssessmentCategory'(ownerId, courseId, studentId, assessmentTypeId, assessmentId, category) {
            var studentsArray = CalculatedGrades.findOne({ ownerId, courseId }).students;

            if (category == 'K') {
                gradeKey = 'KGrade';
            }
            if (category == 'A') {
                gradeKey = 'AGrade';
            }
            if (category == 'T') {
                gradeKey = "TGrade";
            }
            if (category == 'C') {
                gradeKey = 'CGrade';
            }

            for (i = 0; i < studentsArray.length; i++) {
                if (studentsArray[i].studentId == studentId) {
                    var currentGrades = studentsArray[i].currentGrades;
                    for (z = 0; z < currentGrades.length; z++) {
                        if (currentGrades[z].assessmentTypeId == assessmentTypeId) {
                            var assessments = currentGrades[z].assessments;
                            for (y = 0; y < assessments.length; y++) {
                                if (assessments[y].assessmentId == assessmentId) {
                                    var gradeKeys = Object.keys(assessments[y]);
                                    if (gradeKeys.includes(gradeKey)) {
                                        if (gradeKeys.length != 2) {
                                            delete studentsArray[i].currentGrades[z].assessments[y][gradeKey];
                                        }
                                        else {
                                            studentsArray[i].currentGrades[z].assessments = [];
                                        }
                                    }
                                    y = assessments.length;
                                }
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
        }
    });
}