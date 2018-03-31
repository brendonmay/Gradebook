import { CalculatedGrades } from "../collections.js";
import { CourseWeighting } from "../collections.js";
import { Assessments } from "../collections.js";
import { Students } from "../collections.js";
import { Meteor } from "meteor/meteor";

function determineOverallCategoryGrade(ownerId, courseId, studentId, category, readFromThis, index) {
    if (readFromThis) {
        var studentsArray = readFromThis;
    }
    else {
        var studentsArray = CalculatedGrades.findOne({ ownerId, courseId }).students;
    }
    var assessmentTypeGradesAndWeight = [];
    var totalWeight = 0;

    for (var i = 0; i < studentsArray.length; i++) {
        if (index) {
            i = index;
        }
        if (studentsArray[i].studentId == studentId) {
            var currentGrades = studentsArray[i].currentGrades;
            for (var z = 0; z < currentGrades.length; z++) {
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

    for (var i = 0; i < assessmentTypeGradesAndWeight.length; i++) {
        var grade = assessmentTypeGradesAndWeight[i].grade;
        var weight = assessmentTypeGradesAndWeight[i].weight;
        overallCategoryGrade = overallCategoryGrade + (grade * (weight / totalWeight));

    }

    overallCategoryGrade = Number(overallCategoryGrade.toFixed(2));
    return overallCategoryGrade
}

function determineAssessmentTypeGrade(ownerId, courseId, studentId, assessmentTypeId, category) {
    var courseAssessmentTypes = Assessments.findOne({ ownerId, courseId }).courseAssessmentTypes;
    var studentsArray = Students.findOne({ ownerId, courseId }).students;

    assessmentGrades = [];

    // var outOf = 0;
    // var totalStudentMarks = 0;
    // var exclusions = [];

    for (var i = 0; i < studentsArray.length; i++) {
        if (studentsArray[i].studentId == studentId) {
            var grades = studentsArray[i].grades;
            for (var z = 0; z < grades.length; z++) {
                var assessmentId = grades[z].assessmentId;
                var checkAssessmentTypeId = assessmentId.slice(0, assessmentId.indexOf("-"));
                if (checkAssessmentTypeId == assessmentTypeId) {
                    var studentMark = grades[z][category];
                    if (studentMark != "N/A") {
                        studentMark = Number(studentMark);
                        //totalStudentMarks = totalStudentMarks + studentMark;
                        assessmentGradeObj = {};
                        assessmentGradeObj.assessmentId = assessmentId;
                        assessmentGradeObj.grade = Number(studentMark);
                        assessmentGrades[assessmentGrades.length] = assessmentGradeObj;
                    }
                    // else {
                    //     exclusions[exclusions.length] = assessmentId;
                    // }
                }
            }
            i = studentsArray.length;
        }
    }
    for (var r = 0; r < assessmentGrades.length; r++) {
        var assessmentId = assessmentGrades[r].assessmentId;
        for (var i = 0; i < courseAssessmentTypes.length; i++) {
            if (courseAssessmentTypes[i].assessmentTypeId == assessmentTypeId) {
                var assessments = courseAssessmentTypes[i].assessments;
                for (var z = 0; z < assessments.length; z++) {
                    // if (assessments[z][category] != "N/A") {
                    //     if (!(exclusions.includes(assessments[z].assessmentId))) {
                    //         outOf = outOf + assessments[z][category];
                    //     }
                    // }
                    if (assessments[z].assessmentId == assessmentId) {
                        var outOf = assessments[z][category]
                        assessmentGrades[r].outOf = Number(outOf);
                        z = assessments.length;
                    }
                }
                i = courseAssessmentTypes.length;
            }
        }
    }
    var calculatedAssessmentGrades = 0;
    var totalAssessments = assessmentGrades.length;

    for (var i = 0; i < assessmentGrades.length; i++) {
        var grade = assessmentGrades[i].grade;
        var outOf = assessmentGrades[i].outOf;
        var calculatedGrade = Number(((grade / outOf) * 100).toFixed(2));
        calculatedAssessmentGrades = calculatedAssessmentGrades + calculatedGrade;
    }


    // var calculatedAssessmentTypeGrade = Number(((totalStudentMarks / outOf) * 100).toFixed(2));
    var calculatedAssessmentTypeGrade = Number((calculatedAssessmentGrades / totalAssessments).toFixed(2));
    return calculatedAssessmentTypeGrade

}

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
            for (var i = 0; i < courseworkAssessmentTypes.length; i++) {
                assessmentTypes[assessmentTypes.length] = courseworkAssessmentTypes[i].assessmentTypeId;
            }
            for (var i = 0; i < finalAssessmentTypes.length; i++) {
                assessmentTypes[assessmentTypes.length] = finalAssessmentTypes[i].assessmentTypeId;
            }
            var currentGrades = [];

            for (var i = 0; i < assessmentTypes.length; i++) {
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
                categoryGrades: {},
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
            for (var i = 0; i < studentsArray.length; i++) {
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
            for (var i = 0; i < studentsArray.length; i++) {
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
            for (var i = 0; i < studentsArray.length; i++) {
                var currentGrades = studentsArray[i].currentGrades;
                for (var z = 0; z < currentGrades.length; z++) {
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
            for (var i = 0; i < studentsArray.length; i++) {
                var studentId = studentsArray[i].studentId;
                var currentGrades = studentsArray[i].currentGrades;
                for (var z = 0; z < currentGrades.length; z++) {
                    if (currentGrades[z].assessmentTypeId == assessmentTypeId) {
                        var assessments = currentGrades[z].assessments;
                        for (var w = 0; w < assessments.length; w++) {
                            if (assessments[w].assessmentId == assessmentId) {
                                //check which categories they have marks for
                                var K;
                                var A;
                                var T;
                                var C;

                                if (assessments[w].KGrade) {
                                    K = true;
                                }
                                if (assessments[w].AGrade) {
                                    A = true;
                                }
                                if (assessments[w].TGrade) {
                                    T = true;
                                }
                                if (assessments[w].CGrade) {
                                    C = true;
                                }
                                //delete the assessment
                                studentsArray[i].currentGrades[z].assessments.splice(w, 1);

                                //determine new category grades
                                if (K) {
                                    var KGrade = determineAssessmentTypeGrade(ownerId, courseId, studentId, assessmentTypeId, "K");
                                    if (!isNaN(KGrade)) {
                                        studentsArray[i].currentGrades[z].assessmentTypeGrade.KGrade = KGrade;
                                    }
                                    else {
                                        if (studentsArray[i].currentGrades[z].assessmentTypeGrade.KGrade) {
                                            delete studentsArray[i].currentGrades[z].assessmentTypeGrade.KGrade;
                                        }
                                    }
                                    var newOverallCategoryGradeK = determineOverallCategoryGrade(Meteor.userId(), courseId, studentId, "K", studentsArray, i);
                                    console.log(newOverallCategoryGradeK);
                                    if (!isNaN(newOverallCategoryGradeK)) {
                                        if (studentsArray[i].categoryGrades) {
                                            studentsArray[i].categoryGrades.KGrade = newOverallCategoryGradeK;
                                        }
                                        else {
                                            studentsArray[i].categoryGrades = { KGrade: newOverallCategoryGradeK };
                                        }
                                    }
                                    else {
                                        if (studentsArray[i].categoryGrades.KGrade) {
                                            delete studentsArray[i].categoryGrades.KGrade;
                                        }
                                    }
                                }
                                if (A) {
                                    var AGrade = determineAssessmentTypeGrade(ownerId, courseId, studentId, assessmentTypeId, "A");
                                    if (!isNaN(AGrade)) {
                                        studentsArray[i].currentGrades[z].assessmentTypeGrade.AGrade = AGrade;
                                    }
                                    else {
                                        if (studentsArray[i].currentGrades[z].assessmentTypeGrade.AGrade) {
                                            delete studentsArray[i].currentGrades[z].assessmentTypeGrade.AGrade;
                                        }
                                    }
                                    var newOverallCategoryGradeA = determineOverallCategoryGrade(Meteor.userId(), courseId, studentId, "A", studentsArray, i);
                                    if (!isNaN(newOverallCategoryGradeA)) {
                                        if (studentsArray[i].categoryGrades) {
                                            studentsArray[i].categoryGrades.AGrade = newOverallCategoryGradeA;
                                        }
                                        else {
                                            studentsArray[i].categoryGrades = { AGrade: newOverallCategoryGradeA };
                                        }
                                    }
                                    else {
                                        if (studentsArray[i].categoryGrades.AGrade) {
                                            delete studentsArray[i].categoryGrades.AGrade;
                                        }
                                    }
                                }
                                if (T) {
                                    var TGrade = determineAssessmentTypeGrade(ownerId, courseId, studentId, assessmentTypeId, "T");
                                    if (!isNaN(TGrade)) {
                                        studentsArray[i].currentGrades[z].assessmentTypeGrade.TGrade = TGrade;
                                    }
                                    else {
                                        if (studentsArray[i].currentGrades[z].assessmentTypeGrade.TGrade) {
                                            delete studentsArray[i].currentGrades[z].assessmentTypeGrade.TGrade;
                                        }
                                    }
                                    var newOverallCategoryGradeT = determineOverallCategoryGrade(Meteor.userId(), courseId, studentId, "T", studentsArray, i);
                                    if (!isNaN(newOverallCategoryGradeT)) {
                                        if (studentsArray[i].categoryGrades) {
                                            studentsArray[i].categoryGrades.TGrade = newOverallCategoryGradeT;
                                        }
                                        else {
                                            studentsArray[i].categoryGrades = { TGrade: newOverallCategoryGradeT };
                                        }
                                    }
                                    else {
                                        if (studentsArray[i].categoryGrades.TGrade) {
                                            delete studentsArray[i].categoryGrades.TGrade;
                                        }
                                    }
                                }
                                if (C) {
                                    var CGrade = determineAssessmentTypeGrade(ownerId, courseId, studentId, assessmentTypeId, "C");
                                    if (!isNaN(CGrade)) {
                                        studentsArray[i].currentGrades[z].assessmentTypeGrade.CGrade = CGrade;
                                    }
                                    else {
                                        if (studentsArray[i].currentGrades[z].assessmentTypeGrade.CGrade) {
                                            delete studentsArray[i].currentGrades[z].assessmentTypeGrade.CGrade;
                                        }
                                    }
                                    var newOverallCategoryGradeC = determineOverallCategoryGrade(Meteor.userId(), courseId, studentId, "C", studentsArray, i);
                                    if (!isNaN(newOverallCategoryGradeC)) {
                                        if (studentsArray[i].categoryGrades) {
                                            studentsArray[i].categoryGrades.CGrade = newOverallCategoryGradeC;
                                        }
                                        else {
                                            studentsArray[i].categoryGrades = { CGrade: newOverallCategoryGradeC };
                                        }
                                    }
                                    else {
                                        if (studentsArray[i].categoryGrades.CGrade) {
                                            delete studentsArray[i].categoryGrades.CGrade;
                                        }
                                    }
                                }
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

            for (var i = 0; i < studentsArray.length; i++) {
                if (studentsArray[i].studentId == studentId) {
                    var currentGrades = studentsArray[i].currentGrades;
                    for (var z = 0; z < currentGrades.length; z++) {
                        if (currentGrades[z].assessmentTypeId == assessmentTypeId) {
                            var assessments = currentGrades[z].assessments;
                            var assessmentDoesntExist = true;
                            for (var w = 0; w < assessments.length; w++) {
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
            for (var i = 0; i < studentsArray.length; i++) {
                if (studentsArray[i].studentId == studentId) {
                    var currentGrades = studentsArray[i].currentGrades;
                    for (var z = 0; z < currentGrades.length; z++) {
                        if (currentGrades[z].assessmentTypeId == assessmentTypeId) {
                            if (grade != "N/A") {
                                studentsArray[i].currentGrades[z].assessmentTypeGrade[gradeKey] = grade;
                            }
                            else {
                                var gradeKeys = Object.keys(studentsArray[i].currentGrades[z].assessmentTypeGrade);
                                if (gradeKeys.length == 1) {
                                    studentsArray[i].currentGrades[z].assessmentTypeGrade = {};
                                }
                                else {
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

            for (var i = 0; i < studentsArray.length; i++) {
                if (studentsArray[i].studentId == studentId) {
                    var currentGrades = studentsArray[i].currentGrades;
                    for (var z = 0; z < currentGrades.length; z++) {
                        if (currentGrades[z].assessmentTypeId == assessmentTypeId) {
                            var assessmentTypeGrade = currentGrades[z].assessmentTypeGrade;
                            if (assessmentTypeGrade == {}) { //check assessmentTypeGrade isnt empty
                                studentsArray[i].currentGrades[z].assessmentTypeGrade[gradeKey] = grade;
                            }
                            else { //check to see if the category is there already
                                var categories = Object.keys(assessmentTypeGrade);
                                if (categories.includes(gradeKey)) {
                                    if (isNaN(newGrade) == false) {
                                        studentsArray[i].currentGrades[z].assessmentTypeGrade[gradeKey] = newGrade;
                                    }
                                    else {
                                        if (categories.length == 1) {
                                            studentsArray[i].currentGrades[z].assessmentTypeGrade = {};
                                        }
                                        else {
                                            delete studentsArray[i].currentGrades[z].assessmentTypeGrade[gradeKey];
                                        }
                                    }
                                }
                                else {
                                    if (isNaN(newGrade) == false) {
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

            for (var i = 0; i < studentsArray.length; i++) {
                if (studentsArray[i].studentId == studentId) {
                    var currentGrades = studentsArray[i].currentGrades;
                    for (var z = 0; z < currentGrades.length; z++) {
                        if (currentGrades[z].assessmentTypeId == assessmentTypeId) {
                            var assessments = currentGrades[z].assessments;
                            for (var y = 0; y < assessments.length; y++) {
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
        },
        'calculatedgrades.updateOverallCategoryGrade'(ownerId, courseId, studentId, category, overallCategoryGrade) {
            var studentsArray = CalculatedGrades.findOne({ ownerId, courseId }).students;
            for (var i = 0; i < studentsArray.length; i++) {
                if (studentsArray[i].studentId == studentId) {
                    var categoryKey = category + "Grade";
                    var categoryGrades = studentsArray[i].categoryGrades;
                    var currentCategories = Object.keys(categoryGrades);

                    if (overallCategoryGrade == "N/A") {
                        if (currentCategories.includes(categoryKey)) {
                            delete studentsArray[i].categoryGrades[categoryKey];
                        }
                    }
                    else {
                        studentsArray[i].categoryGrades[categoryKey] = overallCategoryGrade;
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