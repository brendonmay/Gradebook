import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Students } from '../../../../lib/collections.js';
import { Assessments } from '../../../../lib/collections.js';
import { Accounts } from 'meteor/accounts-base';
import { CourseWeighting } from '../../../../lib/collections.js';
import { CalculatedGrades } from '../../../../lib/collections.js';

function generateSortedStudentArray() {
    let courseId = Session.get('courseId');
    var studentsDocument = Students.findOne({ ownerId: Meteor.userId(), courseId: courseId }).students;

    var unsortedStudentArray = [];

    for (i = 0; i < studentsDocument.length; i++) {
        let lastName = studentsDocument[i].studentLastName;
        let firstName = studentsDocument[i].studentFirstName;
        let studentId = studentsDocument[i].studentId;

        if (studentId != "s-0") {
            unsortedStudentArray[unsortedStudentArray.length] = lastName + ", " + firstName + "?" + studentId;
        }
    }

    let sortedStudentArray = unsortedStudentArray.sort();
    return sortedStudentArray

}

function insertGrade() {
    const courseId = Session.get('courseId');
    const inputId = event.target.id;
    const category = inputId[0];
    const studentId = inputId.slice(inputId.indexOf("?") + 1, inputId.indexOf("#"));
    const assessmentId = inputId.slice(inputId.indexOf("#") + 1, inputId.length);
    var grade = event.target.value;
    var outOf = 0;
    //determine what category is out of
    if (assessmentId[0] != "f") {
        var courseAssessmentTypes = Assessments.findOne({ ownerId: Meteor.userId(), courseId }).courseAssessmentTypes;
        var assessmentTypeId = assessmentId.slice(0, assessmentId.indexOf("-"));
        for (i = 0; i < courseAssessmentTypes.length; i++) {
            if (courseAssessmentTypes[i].assessmentTypeId == assessmentTypeId) {
                var assessments = courseAssessmentTypes[i].assessments;
                for (r = 0; r < assessments.length; r++) {
                    if (assessments[r].assessmentId == assessmentId) {
                        outOf = assessments[r][category];
                        r = assessments.length;
                    }
                }
                i = courseAssessmentTypes.length;
            }
        }
    }
    else {
        var finalAssessmentTypes = Assessments.findOne({ ownerId: Meteor.userId(), courseId }).finalAssessmentTypes;
        for (i = 0; i < finalAssessmentTypes.length; i++) {
            if (finalAssessmentTypes[i].assessmentTypeId == assessmentId) {
                outOf = finalAssessmentTypes[i][category];
                i = finalAssessmentTypes.length;
            }
        }
    }
    if (checkValidationOfInput(inputId)) {
        if (grade.replace(/\s/g, '') == "") {
            grade = "N/A";
            document.getElementById(inputId).value = "N/A";
        }
        let updateStudentsCollectionPromise = new Promise(function (resolve, reject) {
            Meteor.call('students.insertGrade', Meteor.userId(), courseId, category, studentId, assessmentId, grade);

            let updated = true;

            if (updated) {
                resolve();
            }
            else {
                reject();
            }
        });
        setTimeout(function () {
            updateStudentsCollectionPromise.then(function () {
                if (assessmentId[0] != "f") {
                    var assessmentTypeId = assessmentId.slice(0, assessmentId.indexOf("-"));
                    if (grade != "N/A") {
                        var percGrade = (grade / outOf) * 100;
                        percGrade = Number(percGrade.toFixed(2));
                        var newGrade = determineAssessmentTypeGrade(Meteor.userId(), courseId, studentId, assessmentTypeId, category); 
                        Meteor.call('calculatedgrades.updateCourseAssessmentGrade', Meteor.userId(), courseId, assessmentId, percGrade, category, studentId);
                        Meteor.call('calculatedgrades.updateAssessmentTypeGrade', Meteor.userId(), courseId, studentId, percGrade, category, assessmentTypeId, newGrade);
                    }
                    else {
                        var percGrade = "N/A";
                        var newGrade = determineAssessmentTypeGrade(Meteor.userId(), courseId, studentId, assessmentTypeId, category); 
                        Meteor.call('calculatedgrades.removeCourseAssessmentCategory', Meteor.userId(), courseId, studentId, assessmentTypeId, assessmentId, category);
                        Meteor.call('calculatedgrades.updateAssessmentTypeGrade', Meteor.userId(), courseId, studentId, percGrade, category, assessmentTypeId, newGrade);
                    }
                }
                else {
                    if (grade != "N/A") {
                        var percGrade = (grade / outOf) * 100;
                        percGrade = Number(percGrade.toFixed(2));
                        Meteor.call('calculatedgrades.updateFinalAssessmentGrade', Meteor.userId(), courseId, assessmentId, category, percGrade, studentId);
                    }
                    else{
                        Meteor.call('calculatedgrades.updateFinalAssessmentGrade', Meteor.userId(), courseId, assessmentId, category, grade, studentId);
                    }
                }
            }).catch(function () {
                console.log("Promise not fulfilled")
            })
        }, 100)
    }

}

function generateArrayOfStudentObjects(sortedStudentArray) {
    var arrayOfStudentObjects = [];

    for (i = 0; i < sortedStudentArray.length; i++) {
        var studentName = sortedStudentArray[i].substr(0, sortedStudentArray[i].indexOf('?'));
        var lastName = studentName.substr(0, studentName.indexOf(',')) + ",";
        var firstName = studentName.substr(studentName.indexOf(',') + 2, studentName.length);
        var studentId = sortedStudentArray[i].substr(sortedStudentArray[i].indexOf('?') + 1, sortedStudentArray[i].length);
        var studentObject = {
            fullName: studentName,
            firstName: firstName,
            lastName: lastName,
            studentId: studentId,
            listNumber: i + 1
        }
        arrayOfStudentObjects[arrayOfStudentObjects.length] = studentObject;
    }

    return arrayOfStudentObjects
}

function organizeStudentGrades(ownerId, courseId, studentId) {
    var studentsArray = Students.findOne({ ownerId, courseId }).students;
    var studentGrades = [];
    var organizedStudentGrades = [];
    for (i = 0; i < studentsArray.length; i++) {
        if (studentId == studentsArray[i].studentId) {
            studentGrades = studentsArray[i].grades;
            i = studentsArray.length;
        }
    }
    for (i = 0; i < studentGrades.length; i++) {
        var assessmentId = studentGrades[i].assessmentId;
        var K = studentGrades[i].K;
        var A = studentGrades[i].A;
        var T = studentGrades[i].T;
        var C = studentGrades[i].C;

        var assessmentType = '';
        if (assessmentId[0] != "f") {
            assessmentType = assessmentId.slice(0, assessmentId.indexOf("-"));
        }
        else {
            assessmentType = assessmentId;
        }

        var studentGradeObject = {
            assessmentId,
            K,
            A,
            T,
            C
        }

        if (organizedStudentGrades[assessmentType] == null) {
            organizedStudentGrades[assessmentType] = [studentGradeObject]
        }
        else {
            var numberOfAssessments = organizedStudentGrades[assessmentType].length
            organizedStudentGrades[assessmentType][numberOfAssessments] = studentGradeObject
        }
    }
    return organizedStudentGrades
}

function add(a, b) {
    return a + b;
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

function determineAssessmentTypeGrade(ownerId, courseId, studentId, assessmentTypeId, category) {
    var courseAssessmentTypes = Assessments.findOne({ ownerId, courseId }).courseAssessmentTypes;
    var studentsArray = Students.findOne({ ownerId, courseId }).students;
    var outOf = 0;
    var totalStudentMarks = 0;
    var exclusions = [];

    for (i = 0; i < studentsArray.length; i++) {
        if (studentsArray[i].studentId == studentId) {
            var grades = studentsArray[i].grades;
            for (z = 0; z < grades.length; z++) {
                var assessmentId = grades[z].assessmentId;
                var checkAssessmentTypeId = assessmentId.slice(0, assessmentId.indexOf("-"));
                if (checkAssessmentTypeId == assessmentTypeId) {
                    var studentMark = grades[z][category];
                    if (studentMark != "N/A") {
                        studentMark = Number(studentMark);
                        totalStudentMarks = totalStudentMarks + studentMark;
                    }
                    else {
                        exclusions[exclusions.length] = assessmentId;
                    }
                }
            }
            i = studentsArray.length;
        }
    }

    for (i = 0; i < courseAssessmentTypes.length; i++) {
        if (courseAssessmentTypes[i].assessmentTypeId == assessmentTypeId) {
            var assessments = courseAssessmentTypes[i].assessments;
            for (z = 0; z < assessments.length; z++) {
                if (assessments[z][category] != "N/A") {
                    if (!(exclusions.includes(assessments[z].assessmentId))) {
                        outOf = outOf + assessments[z][category];
                    }
                }
            }
            i = courseAssessmentTypes.length;
        }
    }
    var calculatedAssessmentTypeGrade = Number(((totalStudentMarks / outOf) * 100).toFixed(2));
    return calculatedAssessmentTypeGrade

}

function calculateAsessmentTypeGrades(ownerId, courseId, organizedStudentGrades) {
    var assessmentTypes = Object.keys(organizedStudentGrades);
    var assessmentTypeGrades = {};
    for (i = 0; i < assessmentTypes.length; i++) {
        var assessmentType = assessmentTypes[i];
        var KGrades = [];
        var AGrades = [];
        var TGrades = [];
        var CGrades = [];

        var exclusions = {};

        for (z = 0; z < organizedStudentGrades[assessmentType].length; z++) {
            var assessmentId = organizedStudentGrades[assessmentType][z].assessmentId;
            exclusions[assessmentId] = []

            if (organizedStudentGrades[assessmentType][z].K != "N/A") {
                KGrades[KGrades.length] = Number(organizedStudentGrades[assessmentType][z].K);
            }
            if (organizedStudentGrades[assessmentType][z].A != "N/A") {
                AGrades[AGrades.length] = Number(organizedStudentGrades[assessmentType][z].A);
            }
            if (organizedStudentGrades[assessmentType][z].T != "N/A") {
                TGrades[TGrades.length] = Number(organizedStudentGrades[assessmentType][z].T);
            }
            if (organizedStudentGrades[assessmentType][z].C != "N/A") {
                CGrades[CGrades.length] = Number(organizedStudentGrades[assessmentType][z].C);
            }

            if (organizedStudentGrades[assessmentType][z].K == "N/A") {
                var length = exclusions[assessmentId].length;
                exclusions[assessmentId][length] = "K";
            }
            if (organizedStudentGrades[assessmentType][z].A == "N/A") {
                var length = exclusions[assessmentId].length;
                exclusions[assessmentId][length] = "A";
            }
            if (organizedStudentGrades[assessmentType][z].T == "N/A") {
                var length = exclusions[assessmentId].length;
                exclusions[assessmentId][length] = "T";
            }
            if (organizedStudentGrades[assessmentType][z].C == "N/A") {
                var length = exclusions[assessmentId].length;
                exclusions[assessmentId][length] = "C";
            }
        }
        var KSumOfStudentMarks = Number(KGrades.reduce(add, 0));
        var ASumOfStudentMarks = Number(AGrades.reduce(add, 0));
        var TSumOfStudentMarks = Number(TGrades.reduce(add, 0));
        var CSumOfStudentMarks = Number(CGrades.reduce(add, 0));

        var KSumOfExcludedMarks = 0;
        var ASumOfExcludedMarks = 0;
        var TSumOfExcludedMarks = 0;
        var CSumOfExcludedMarks = 0;

        var KTotalMarks = 0;
        var ATotalMarks = 0;
        var TTotalMarks = 0;
        var CTotalMarks = 0;

        var excludedAssessments = Object.keys(exclusions);

        for (z = 0; z < excludedAssessments.length; z++) {
            var assessmentId = excludedAssessments[z];
            for (j = 0; j < exclusions[assessmentId].length; j++) {
                var excludedCategory = exclusions[assessmentId][j];
                //look up how many marks the category is worth
                if (assessmentId[0] != "f") {
                    var courseAssessmentTypes = Assessments.findOne({ ownerId, courseId }).courseAssessmentTypes;
                    for (k = 0; k < courseAssessmentTypes.length; k++) {
                        if (courseAssessmentTypes[k].assessmentTypeId == assessmentType) {
                            var assessments = courseAssessmentTypes[k].assessments;
                            for (y = 0; y < assessments.length; y++) {
                                if (assessments[y].assessmentId == assessmentId) {
                                    if (excludedCategory == "K") {
                                        if (assessments[y].K != "N/A") {
                                            KSumOfExcludedMarks = KSumOfExcludedMarks + Number(assessments[y].K);
                                        }
                                    }
                                    if (excludedCategory == "A") {
                                        if (assessments[y].A != "N/A") {
                                            ASumOfExcludedMarks = ASumOfExcludedMarks + Number(assessments[y].A);
                                        }
                                    }
                                    if (excludedCategory == "T") {
                                        if (assessments[y].T != "N/A") {
                                            TSumOfExcludedMarks = TSumOfExcludedMarks + Number(assessments[y].T);
                                        }
                                    }
                                    if (excludedCategory == "C") {
                                        if (assessments[y].C != "N/A") {
                                            CSumOfExcludedMarks = CSumOfExcludedMarks + Number(assessments[y].C);
                                        }
                                    }
                                }
                            }
                            k = courseAssessmentTypes.length;
                        }
                    }
                }
                else {
                    var finalAssessmentTypes = Assessments.findOne({ ownerId, courseId }).finalAssessmentTypes;
                    for (k = 0; k < finalAssessmentTypes.length; k++) {
                        if (finalAssessmentTypes[k].assessmentTypeId == assessmentType) {
                            if (excludedCategory == "K") {
                                if (finalAssessmentTypes[k].K != "N/A") {
                                    KSumOfExcludedMarks = KSumOfExcludedMarks + Number(finalAssessmentTypes[k].K);
                                }
                            }
                            if (excludedCategory == "A") {
                                if (finalAssessmentTypes[k].A != "N/A") {
                                    ASumOfExcludedMarks = ASumOfExcludedMarks + Number(finalAssessmentTypes[k].A);
                                }
                            }
                            if (excludedCategory == "T") {
                                if (finalAssessmentTypes[k].T != "N/A") {
                                    TSumOfExcludedMarks = TSumOfExcludedMarks + Number(finalAssessmentTypes[k].T);
                                }
                            }
                            if (excludedCategory == "K") {
                                if (finalAssessmentTypes[k].C != "N/A") {
                                    CSumOfExcludedMarks = CSumOfExcludedMarks + Number(finalAssessmentTypes[k].C);
                                }
                            }
                        }
                    }
                }
            }
        }
        if (assessmentType[0] != "f") {
            var courseAssessmentTypes = Assessments.findOne({ ownerId, courseId }).courseAssessmentTypes;
            for (q = 0; q < courseAssessmentTypes.length; q++) {
                if (courseAssessmentTypes[q].assessmentTypeId == assessmentType) {
                    var assessments = courseAssessmentTypes[q].assessments;
                    for (g = 0; g < assessments.length; g++) {
                        if (assessments[g].K != "N/A") {
                            KTotalMarks = KTotalMarks + Number(assessments[g].K);
                        }
                        if (assessments[g].A != "N/A") {
                            ATotalMarks = ATotalMarks + Number(assessments[g].A);
                        }
                        if (assessments[g].T != "N/A") {
                            TTotalMarks = TTotalMarks + Number(assessments[g].T);
                        }
                        if (assessments[g].C != "N/A") {
                            CTotalMarks = CTotalMarks + Number(assessments[g].C);
                        }
                    }
                    q = courseAssessmentTypes.length;
                }
            }
        }
        else {
            var finalAssessmentTypes = Assessments.findOne({ ownerId, courseId }).finalAssessmentTypes;
            for (g = 0; g < finalAssessmentTypes.length; g++) {
                if (finalAssessmentTypes[g].assessmentTypeId == assessmentType) {
                    if (finalAssessmentTypes[g].K != "N/A") {
                        KTotalMarks = KTotalMarks + Number(finalAssessmentTypes[g].K);
                    }
                    if (finalAssessmentTypes[g].A != "N/A") {
                        ATotalMarks = ATotalMarks + Number(finalAssessmentTypes[g].A);
                    }
                    if (finalAssessmentTypes[g].T != "N/A") {
                        TTotalMarks = TTotalMarks + Number(finalAssessmentTypes[g].T);
                    }
                    if (finalAssessmentTypes[g].C != "N/A") {
                        CTotalMarks = CTotalMarks + Number(finalAssessmentTypes[g].C);
                    }
                    g = finalAssessmentTypes.length;
                }
            }
        }

        var KassessmentTypeGrade = KSumOfStudentMarks / (KTotalMarks - KSumOfExcludedMarks);
        var AassessmentTypeGrade = ASumOfStudentMarks / (ATotalMarks - ASumOfExcludedMarks);
        var TassessmentTypeGrade = TSumOfStudentMarks / (TTotalMarks - TSumOfExcludedMarks);
        var CassessmentTypeGrade = CSumOfStudentMarks / (CTotalMarks - CSumOfExcludedMarks);

        //if totalmarks == 0 we set it to N/A
        if (isNaN(KassessmentTypeGrade)) {
            KassessmentTypeGrade = "N/A"
        }
        if (isNaN(AassessmentTypeGrade)) {
            AassessmentTypeGrade = "N/A"
        }
        if (isNaN(TassessmentTypeGrade)) {
            TassessmentTypeGrade = "N/A"
        }
        if (isNaN(CassessmentTypeGrade)) {
            CassessmentTypeGrade = "N/A"
        }

        var WeightK = Session.get('knowledgeWeight');
        var WeightA = Session.get('applicationWeight');
        var WeightT = Session.get('thinkingWeight');
        var WeightC = Session.get('communicationWeight');

        //Current Overall Grade for AssessmentType
        var weightedAverage = getWeightedAverage(KassessmentTypeGrade, AassessmentTypeGrade, TassessmentTypeGrade, CassessmentTypeGrade, WeightK, WeightA, WeightT, WeightC);
        var assessmentTypeWeighting = 0;

        //AssessmentTypeWeight for Course
        if (assessmentType[0] != "f") {
            var courseworkWeightings = CourseWeighting.findOne({ ownerId, courseId }).courseworkAssessmentTypes;
            for (y = 0; y < courseworkWeightings.length; y++) {
                if (courseworkWeightings[y].assessmentTypeId == assessmentType) {
                    assessmentTypeWeighting = courseworkWeightings[y].assessmentWeight;
                    y = courseworkWeightings.length;
                }
            }
        }
        else {
            var finalWeightings = CourseWeighting.findOne({ ownerId, courseId }).finalAssessmentTypes;
            for (y = 0; y < finalWeightings.length; y++) {
                if (finalWeightings[y].assessmentTypeId == assessmentType) {
                    assessmentTypeWeighting = finalWeightings[y].assessmentWeight;
                    y = finalWeightings.length;
                }
            }

        }

        assessmentTypeGrades[assessmentType] = [weightedAverage, assessmentTypeWeighting / 100];

    }
    return assessmentTypeGrades //{c1: [86, .30], c2: [88, .30], f1: [98, .40]} [grade, weight]
}

function calculateFinalGrade(ownerId, courseId, assessmentTypeGrades) {
    var assessmentTypes = Object.keys(assessmentTypeGrades);
    var currentGrade = 0;
    var totalWeight = 0;
    for (i = 0; i < assessmentTypes.length; i++) {
        var assessmentType = assessmentTypes[i];
        var gradeArray = assessmentTypeGrades[assessmentType];
        if (gradeArray[0] != "N/A") {
            currentGrade = currentGrade + ((Number(gradeArray[0])) * (Number(gradeArray[1])));
            totalWeight = totalWeight + (Number(gradeArray[1]));
        }
    }

    var calculatedWeight = 1 / totalWeight;

    if (totalWeight == 0) {
        return "N/A"
    }

    var finalGrade = currentGrade * calculatedWeight;

    return Number(finalGrade.toFixed(2))
}

function checkValidationOfInput(inputID) {
    var input = document.getElementById(inputID);
    if (input == null) return false;
    var inputVal = input.value;

    if (inputVal.replace(/\s/g, '') == "") {
        inputVal = "N/A";
    }
    //return (input == "N/A" || Math.floor(input) == input); return (input > 0 || input == "N/A");
    if (inputVal == "N/A" || !isNaN(inputVal) || Number(inputVal) >= 0) {
        if (input.classList.contains("invalid")) {
            input.classList.remove("invalid")
        }
        if (input.classList.contains("studMarkInvalid")) {
            input.classList.remove("studMarkInvalid")
        }
        return true;
    } else { //invalid 
        if (!input.classList.contains("invalid")) {
            input.classList.add("invalid")
        }
        if (!input.classList.contains("studMarkInvalid")) {
            input.classList.add("studMarkInvalid")
        }
        input.focus();
        return false;
    }
}

Template.studentName.helpers({
    getStudents: function () {
        let sortedStudentArray = generateSortedStudentArray();
        return generateArrayOfStudentObjects(sortedStudentArray)
    },
    getCurrentGrade: function (studentId) {
        let ownerId = Meteor.userId();
        let courseId = Session.get('courseId');

        var organizedStudentGrades = organizeStudentGrades(ownerId, courseId, studentId);

        var assessmentTypeGrades = calculateAsessmentTypeGrades(ownerId, courseId, organizedStudentGrades);

        var finalGrade = calculateFinalGrade(ownerId, courseId, assessmentTypeGrades)

        if (finalGrade != "N/A") {
            return finalGrade + "%"
        }
        else {
            return "N/A"
        }
    },
    getStudentGradesForAssessments: function (studentId) {
        let courseId = Session.get('courseId');
        var students = Students.findOne({ ownerId: Meteor.userId(), courseId: courseId }).students;
        var grades = []
        for (i = 0; i < students.length; i++) {
            if (students[i].studentId == studentId) {
                grades = students[i].grades;
                i = students.length;
            }
        }
        return grades
    }
});

Template.studentName.events({
    'blur .gradeInput': function () {
        insertGrade()
    },
    'click .gradeInput': function () {
        event.target.setSelectionRange(0, event.target.value.length)
    },
    'click .studentRepName': function() {
        var studentID = event.target.parentElement.id.split('?')[1];
        Session.set('currentSelectedStudentID', studentID);
        var studentReportsTab = document.getElementById('studentReportsTabId');
        var currentStudentDropDown = document.getElementById('studentDropDown-' + studentID);
        studentReportsTab.click();
        currentStudentDropDown.click();
    },
    'keyup .gradeInput': function () {
        if (event.keyCode === 13) { //if enter is hit
            var inputId = event.target.id;
            var category = inputId[0];
            var studentId = inputId.slice(inputId.indexOf("?") + 1, inputId.indexOf("#"));
            var sortedStudentArray = generateSortedStudentArray();
            var sortedStudentObjects = generateArrayOfStudentObjects(sortedStudentArray);
            var assessmentId = inputId.slice(inputId.indexOf("#") + 1, inputId.length);

            if (category == "K") {
                var potentialNewInputId = "A" + inputId.slice(1, inputId.length);
                if (!document.getElementById(potentialNewInputId).hasAttribute("disabled")) {
                    document.getElementById(potentialNewInputId).focus();
                    document.getElementById(potentialNewInputId).setSelectionRange(0, document.getElementById(potentialNewInputId).value.length);
                    //console.log("A is not disabled");
                }
                else {
                    var potentialNewInputId = "T" + inputId.slice(1, inputId.length);
                    if (!document.getElementById(potentialNewInputId).hasAttribute("disabled")) {
                        document.getElementById(potentialNewInputId).focus();
                        document.getElementById(potentialNewInputId).setSelectionRange(0, document.getElementById(potentialNewInputId).value.length);
                        //console.log("T is not disabled");
                    }
                    else {
                        var potentialNewInputId = "C" + inputId.slice(1, inputId.length);
                        if (!document.getElementById(potentialNewInputId).hasAttribute("disabled")) {
                            document.getElementById(potentialNewInputId).focus();
                            document.getElementById(potentialNewInputId).setSelectionRange(0, document.getElementById(potentialNewInputId).value.length);
                            //console.log("C is not disabled");
                        }
                        else {
                            //move to next row
                            for (i = 0; i < sortedStudentObjects.length; i++) {
                                if (sortedStudentObjects[i].studentId == studentId) {
                                    //check it isnt the last student
                                    if (i == (sortedStudentObjects.length - 1)) {
                                        //console.log("last student");
                                        insertGrade();
                                        return false
                                    }
                                    else {
                                        studentId = sortedStudentObjects[i + 1].studentId;
                                        i = sortedStudentObjects.length;
                                    }
                                }
                            }
                            var newInputIdK = "K?" + studentId + "#" + assessmentId;
                            var newInputIdA = "A?" + studentId + "#" + assessmentId;
                            var newInputIdT = "T?" + studentId + "#" + assessmentId;
                            var newInputIdC = "C?" + studentId + "#" + assessmentId;
                            if (!document.getElementById(newInputIdK).hasAttribute("disabled")) {
                                document.getElementById(newInputIdK).focus();
                                document.getElementById(newInputIdK).setSelectionRange(0, document.getElementById(newInputIdK).value.length);
                            }
                            else if (!document.getElementById(newInputIdA).hasAttribute("disabled")) {
                                document.getElementById(newInputIdA).focus();
                                document.getElementById(newInputIdA).setSelectionRange(0, document.getElementById(newInputIdA).value.length);

                            }
                            else if (!document.getElementById(newInputIdT).hasAttribute("disabled")) {
                                document.getElementById(newInputIdT).focus();
                                document.getElementById(newInputIdT).setSelectionRange(0, document.getElementById(newInputIdT).value.length);

                            }
                            else if (!document.getElementById(newInputIdC).hasAttribute("disabled")) {
                                document.getElementById(newInputIdC).focus();
                                document.getElementById(newInputIdC).setSelectionRange(0, document.getElementById(newInputIdC).value.length);

                            }
                        }
                    }
                }
            }
            if (category == "A") {
                var potentialNewInputId = "T" + inputId.slice(1, inputId.length);
                if (!document.getElementById(potentialNewInputId).hasAttribute("disabled")) {
                    document.getElementById(potentialNewInputId).focus();
                    document.getElementById(potentialNewInputId).setSelectionRange(0, document.getElementById(potentialNewInputId).value.length);
                    //console.log("T is not disabled");
                }
                else {
                    var potentialNewInputId = "C" + inputId.slice(1, inputId.length);
                    if (!document.getElementById(potentialNewInputId).hasAttribute("disabled")) {
                        document.getElementById(potentialNewInputId).focus();
                        document.getElementById(potentialNewInputId).setSelectionRange(0, document.getElementById(potentialNewInputId).value.length);
                        //console.log("C is not disabled");
                    }
                    else {
                        //move to next row
                        for (i = 0; i < sortedStudentObjects.length; i++) {
                            if (sortedStudentObjects[i].studentId == studentId) {
                                //check it isnt the last student
                                if (i == (sortedStudentObjects.length - 1)) {
                                    //console.log("last student");
                                    insertGrade();
                                    return false
                                }
                                else {
                                    studentId = sortedStudentObjects[i + 1].studentId;
                                    i = sortedStudentObjects.length;
                                }
                            }
                        }
                        var newInputIdK = "K?" + studentId + "#" + assessmentId;
                        var newInputIdA = "A?" + studentId + "#" + assessmentId;
                        var newInputIdT = "T?" + studentId + "#" + assessmentId;
                        var newInputIdC = "C?" + studentId + "#" + assessmentId;
                        if (!document.getElementById(newInputIdK).hasAttribute("disabled")) {
                            document.getElementById(newInputIdK).focus();
                            document.getElementById(newInputIdK).setSelectionRange(0, document.getElementById(newInputIdK).value.length);
                        }
                        else if (!document.getElementById(newInputIdA).hasAttribute("disabled")) {
                            document.getElementById(newInputIdA).focus();
                            document.getElementById(newInputIdA).setSelectionRange(0, document.getElementById(newInputIdA).value.length);

                        }
                        else if (!document.getElementById(newInputIdT).hasAttribute("disabled")) {
                            document.getElementById(newInputIdT).focus();
                            document.getElementById(newInputIdT).setSelectionRange(0, document.getElementById(newInputIdT).value.length);

                        }
                        else if (!document.getElementById(newInputIdC).hasAttribute("disabled")) {
                            document.getElementById(newInputIdC).focus();
                            document.getElementById(newInputIdC).setSelectionRange(0, document.getElementById(newInputIdC).value.length);

                        }
                    }
                }
            }
            if (category == "T") {
                var potentialNewInputId = "C" + inputId.slice(1, inputId.length);
                if (!document.getElementById(potentialNewInputId).hasAttribute("disabled")) {
                    document.getElementById(potentialNewInputId).focus();
                    document.getElementById(potentialNewInputId).setSelectionRange(0, document.getElementById(potentialNewInputId).value.length);
                    //console.log("C is not disabled");
                }
                else {
                    //move to next row
                    for (i = 0; i < sortedStudentObjects.length; i++) {
                        if (sortedStudentObjects[i].studentId == studentId) {
                            //check it isnt the last student
                            if (i == (sortedStudentObjects.length - 1)) {
                                //console.log("last student");
                                insertGrade();
                                return false
                            }
                            else {
                                studentId = sortedStudentObjects[i + 1].studentId;
                                i = sortedStudentObjects.length;
                            }
                        }
                    }
                    var newInputIdK = "K?" + studentId + "#" + assessmentId;
                    var newInputIdA = "A?" + studentId + "#" + assessmentId;
                    var newInputIdT = "T?" + studentId + "#" + assessmentId;
                    var newInputIdC = "C?" + studentId + "#" + assessmentId;
                    if (!document.getElementById(newInputIdK).hasAttribute("disabled")) {
                        document.getElementById(newInputIdK).focus();
                        document.getElementById(newInputIdK).setSelectionRange(0, document.getElementById(newInputIdK).value.length);
                    }
                    else if (!document.getElementById(newInputIdA).hasAttribute("disabled")) {
                        document.getElementById(newInputIdA).focus();
                        document.getElementById(newInputIdA).setSelectionRange(0, document.getElementById(newInputIdA).value.length);

                    }
                    else if (!document.getElementById(newInputIdT).hasAttribute("disabled")) {
                        document.getElementById(newInputIdT).focus();
                        document.getElementById(newInputIdT).setSelectionRange(0, document.getElementById(newInputIdT).value.length);

                    }
                    else if (!document.getElementById(newInputIdC).hasAttribute("disabled")) {
                        document.getElementById(newInputIdC).focus();
                        document.getElementById(newInputIdC).setSelectionRange(0, document.getElementById(newInputIdC).value.length);

                    }
                }
            }
            if (category == "C") {
                for (i = 0; i < sortedStudentObjects.length; i++) {
                    if (sortedStudentObjects[i].studentId == studentId) {
                        //check it isnt the last student
                        if (i == (sortedStudentObjects.length - 1)) {
                            //console.log("last student");
                            insertGrade();
                            return false
                        }
                        else {
                            studentId = sortedStudentObjects[i + 1].studentId;
                            i = sortedStudentObjects.length;
                        }
                    }
                }
                var newInputIdK = "K?" + studentId + "#" + assessmentId;
                var newInputIdA = "A?" + studentId + "#" + assessmentId;
                var newInputIdT = "T?" + studentId + "#" + assessmentId;
                var newInputIdC = "C?" + studentId + "#" + assessmentId;
                if (!document.getElementById(newInputIdK).hasAttribute("disabled")) {
                    document.getElementById(newInputIdK).focus();
                    document.getElementById(newInputIdK).setSelectionRange(0, document.getElementById(newInputIdK).value.length);
                }
                else if (!document.getElementById(newInputIdA).hasAttribute("disabled")) {
                    document.getElementById(newInputIdA).focus();
                    document.getElementById(newInputIdA).setSelectionRange(0, document.getElementById(newInputIdA).value.length);

                }
                else if (!document.getElementById(newInputIdT).hasAttribute("disabled")) {
                    document.getElementById(newInputIdT).focus();
                    document.getElementById(newInputIdT).setSelectionRange(0, document.getElementById(newInputIdT).value.length);

                }
                else if (!document.getElementById(newInputIdC).hasAttribute("disabled")) {
                    document.getElementById(newInputIdC).focus();
                    document.getElementById(newInputIdC).setSelectionRange(0, document.getElementById(newInputIdC).value.length);
                }
            }
        }
    }
});