import { Template } from 'meteor/templating';
import { Accounts } from 'meteor/accounts-base';
import { CalculatedGrades, Assessments, Students } from '../../../lib/collections.js';
import { CourseWeighting } from '../../../lib/collections.js';
import { ReactiveVar } from 'meteor/reactive-var';
import { Meteor } from 'meteor/meteor';

import '../../main.html';

function getStudentNameLastFirst(studentId, ownerId, courseId) {
    var studentsArray = Students.findOne({ ownerId, courseId }).students;
    for (i = 0; i < studentsArray.length; i++) {
        if (studentsArray[i].studentId == studentId) {
            var firstName = studentsArray[i].studentFirstName;
            var lastName = studentsArray[i].studentLastName;
            var studentName = lastName + ", " + firstName;
            return studentName
        }
    }
}

function getStudentNameFirstLast(studentId, ownerId, courseId) {
    var studentsArray = Students.findOne({ ownerId, courseId }).students;
    for (i = 0; i < studentsArray.length; i++) {
        if (studentsArray[i].studentId == studentId) {
            var firstName = studentsArray[i].studentFirstName;
            var lastName = studentsArray[i].studentLastName;
            var studentName = firstName + " " + lastName;
            return studentName
        }
    }
}

function getStudentAssessmentTypeInfo(currentAssessmentTypeId) {
    var studentId = Session.get("currentSelectedStudentID");
    const studentGrades = CalculatedGrades.findOne({ ownerId: Meteor.userId(), courseId: Session.get('courseId') }).students;
    var currentGradesArray;
    var currentGradeObj;

    for (var i = 0; i < studentGrades.length; i++) {
        var student = studentGrades[i];
        if (student.studentId == studentId) {
            currentGradesArray = student.currentGrades;
            break;
        }
    }

    for (var i = 0; i < currentGradesArray.length; i++) {
        if (currentGradesArray[i].assessmentTypeId == currentAssessmentTypeId) {
            if (currentAssessmentTypeId[0] == "f") {
                currentGradeObj = currentGradesArray[i].assessmentTypeGrade;
                var KGrade = -1;
                var AGrade = -1;
                var TGrade = -1;
                var CGrade = -1;
                if (currentGradeObj.KGrade && !isNaN(currentGradeObj.KGrade)) KGrade = currentGradeObj.KGrade;
                if (currentGradeObj.AGrade && !isNaN(currentGradeObj.AGrade)) AGrade = currentGradeObj.AGrade;
                if (currentGradeObj.TGrade && !isNaN(currentGradeObj.TGrade)) TGrade = currentGradeObj.TGrade;
                if (currentGradeObj.CGrade && !isNaN(currentGradeObj.CGrade)) CGrade = currentGradeObj.CGrade;

                var finalGrade = {
                    assessmentName: getFinalEvalName(currentAssessmentTypeId),
                    K: getGradeString(KGrade.toFixed(2)),
                    A: getGradeString(AGrade.toFixed(2)),
                    T: getGradeString(TGrade.toFixed(2)),
                    C: getGradeString(CGrade.toFixed(2)),
                    Grade: getGradeString(getGradeForAssessment(currentGradeObj))
                };
                return [finalGrade];
            } else {
                currentGradeObj = currentGradesArray[i].assessments;
                break;
            }
        }
    }
    var assessmentGrades = [];
    var KGrade = -1;
    var AGrade = -1;
    var TGrade = -1;
    var CGrade = -1;
    for (var i = 0; i < currentGradeObj.length; i++) {
        var currGrade = currentGradeObj[i];
        if (currGrade.KGrade && !isNaN(currGrade.KGrade)) KGrade = currGrade.KGrade;
        if (currGrade.AGrade && !isNaN(currGrade.AGrade)) AGrade = currGrade.AGrade;
        if (currGrade.TGrade && !isNaN(currGrade.TGrade)) TGrade = currGrade.TGrade;
        if (currGrade.CGrade && !isNaN(currGrade.CGrade)) CGrade = currGrade.CGrade;

        assessmentGrades.push({
            assessmentName: getCourseEvalName(currentGradeObj[i].assessmentId),
            K: getGradeString(KGrade.toFixed(2)),
            A: getGradeString(AGrade.toFixed(2)),
            T: getGradeString(TGrade.toFixed(2)),
            C: getGradeString(CGrade.toFixed(2)),
            Grade: getGradeString(getGradeForAssessment(currentGradeObj[i]).toFixed(2))
        });
    }
    return assessmentGrades;
}

function getAssessmentTypeName(assessmentTypeId) {
    var ownerId = Meteor.userId();
    var courseId = Session.get('courseId');

    if (assessmentTypeId[0] != "f") {
        var assessmentTypes = CourseWeighting.findOne({ ownerId, courseId }).courseworkAssessmentTypes
    }
    else {
        var assessmentTypes = CourseWeighting.findOne({ ownerId, courseId }).finalAssessmentTypes
    }

    for (i = 0; i < assessmentTypes.length; i++) {
        if (assessmentTypes[i].assessmentTypeId == assessmentTypeId) {
            assessmentTypeName = assessmentTypes[i].assessmentType
            return assessmentTypeName
        }
    }

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

function calculateCategoryFinalGrades(ownerId, courseId, organizedStudentGrades) {
    var assessmentTypes = Object.keys(organizedStudentGrades);
    var categoryFinalGrades = [];
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

        var KassessmentTypeGrade = (KSumOfStudentMarks / (KTotalMarks - KSumOfExcludedMarks)) * 100;
        var AassessmentTypeGrade = (ASumOfStudentMarks / (ATotalMarks - ASumOfExcludedMarks)) * 100;
        var TassessmentTypeGrade = (TSumOfStudentMarks / (TTotalMarks - TSumOfExcludedMarks)) * 100;
        var CassessmentTypeGrade = (CSumOfStudentMarks / (CTotalMarks - CSumOfExcludedMarks)) * 100;

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

        categoryFinalGrades[categoryFinalGrades.length] = {
            assessmentTypeId: assessmentType,
            assessmentTypeWeight: assessmentTypeWeighting,
            K: KassessmentTypeGrade,
            A: AassessmentTypeGrade,
            T: TassessmentTypeGrade,
            C: CassessmentTypeGrade
        };
    }
    return categoryFinalGrades //[{assessmentTypeId: "c1", assessmentTypeWeight: "25", K: 88, A: 22, T: 75, C: 90},...] 
}

function getFinalGrade(studentId) {
    let ownerId = Meteor.userId();
    let courseId = Session.get('courseId');

    var organizedStudentGrades = organizeStudentGrades(ownerId, courseId, studentId);

    var assessmentTypeGrades = calculateAsessmentTypeGrades(ownerId, courseId, organizedStudentGrades);

    var finalGrade = calculateFinalGrade(ownerId, courseId, assessmentTypeGrades);

    if (finalGrade != "N/A") {
        return finalGrade + "%"
    }
    else {
        return "N/A"
    }
}

function pullAssessmentTypeGradeFromCollection(assessmentTypeId, forClass) {
    if (forClass) {
        var KTotal = 0;
        var ATotal = 0
        var TTotal = 0;
        var CTotal = 0;

        var KTotalStudents = 0;
        var ATotalStudents = 0;
        var TTotalStudents = 0;
        var CTotalStudents = 0;

        var studentsArray = CalculatedGrades.findOne({ ownerId: Meteor.userId(), courseId: Session.get('courseId') }).students;
        for (i = 0; i < studentsArray.length; i++) {
            var currentGrades = studentsArray[i].currentGrades;
            for (z = 0; z < currentGrades.length; z++) {
                if (currentGrades[z].assessmentTypeId == assessmentTypeId) {
                    var assessmentTypeGrade = currentGrades[z].assessmentTypeGrade;
                    var gradeKeys = Object.keys(assessmentTypeGrade);
                    if (gradeKeys.includes("KGrade")) {
                        KTotalStudents++;
                        KTotal = KTotal + assessmentTypeGrade.KGrade;
                    }
                    if (gradeKeys.includes("AGrade")) {
                        ATotalStudents++;
                        ATotal = ATotal + assessmentTypeGrade.AGrade;
                    }
                    if (gradeKeys.includes("TGrade")) {
                        TTotalStudents++;
                        TTotal = TTotal + assessmentTypeGrade.TGrade;
                    }
                    if (gradeKeys.includes("CGrade")) {
                        CTotalStudents++;
                        CTotal = CTotal + assessmentTypeGrade.CGrade;
                    }
                    z = currentGrades.length;
                }
            }
        }
        var K = KTotal / KTotalStudents;
        var A = ATotal / ATotalStudents;
        var T = TTotal / TTotalStudents;
        var C = CTotal / CTotalStudents;

        if (KTotalStudents == 0) {
            K = "N/A"
        }
        if (ATotalStudents == 0) {
            A = "N/A"
        }
        if (TTotalStudents == 0) {
            T = "N/A"
        }
        if (CTotalStudents == 0) {
            C = "N/A"
        }
        var assessmentType = getAssessmentTypeName(assessmentTypeId);

        var assessmentTypeGradeObject = { assessmentType }

        if (K != "N/A") {
            assessmentTypeGradeObject.K = K
        }
        if (A != "N/A") {
            assessmentTypeGradeObject.A = A
        }
        if (T != "N/A") {
            assessmentTypeGradeObject.T = T
        }
        if (C != "N/A") {
            assessmentTypeGradeObject.C = C
        }

        return assessmentTypeGradeObject
    }
    else {
        var studentId = Session.get('currentSelectedStudentID');
        var studentsArray = CalculatedGrades.findOne({ ownerId: Meteor.userId(), courseId: Session.get('courseId') }).students;
        for (i = 0; i < studentsArray.length; i++) {
            if (studentsArray[i].studentId == studentId) {
                var currentGrades = studentsArray[i].currentGrades;
                for (z = 0; z < currentGrades.length; z++) {
                    if (currentGrades[z].assessmentTypeId == assessmentTypeId) {
                        var assessmentTypeGrade = currentGrades[z].assessmentTypeGrade;
                        if (assessmentTypeGrade != {}) {
                            assessmentTypeGrade.assessmentId = assessmentTypeId;
                            return assessmentTypeGrade
                        }
                        else {
                            //put here what you want if empty
                        }
                    }
                }
                i = studentsArray.length;
            }
        }
    }
}

function getGradesArrrayElement(grade, needAssessmentTypeName) {
    var assessmentName;
    if (needAssessmentTypeName) {
        assessmentName = getAssessmentTypeName(grade.assessmentId);
    } else {
        assessmentName = getAssessmentName(grade.assessmentId);
    }
    var gradeElement = {
        assessmentName: assessmentName,
        K: grade.KGrade,
        A: grade.AGrade,
        T: grade.TGrade,
        C: grade.CGrade
    }
    if (grade.KGrade == "N/A" || grade.KGrade == null) {
        delete gradeElement.K;
    }
    if (grade.AGrade == "N/A" || grade.AGrade == null) {
        delete gradeElement.A;
    }
    if (grade.TGrade == "N/A" || grade.TGrade == null) {
        delete gradeElement.T;
    }
    if (grade.CGrade == "N/A" || grade.CGrade == null) {
        delete gradeElement.C;
    }
    return gradeElement;
}

function getAssessmentName(assessmentId) {
    if (assessmentId.charAt(0) == "f") {
        return getFinalEvalName(assessmentId);
    } else {
        return getCourseEvalName(assessmentId);
    }
}

function getAssessmentTypeName(assessmentId) {
    let courseID = Session.get('courseId');
    var courseEvaluations = CourseWeighting.findOne({ ownerId: Meteor.userId(), courseId: courseID }).courseworkAssessmentTypes;
    var assessmentTypeId = assessmentId.split('-')[0];
    for (var i = 0; i < courseEvaluations.length; i++) {
        if (courseEvaluations[i].assessmentTypeId == assessmentTypeId) {
            return courseEvaluations[i].assessmentType;
        }
    }
}

function getFinalEvalName(assessmentTypeId) {
    let courseID = Session.get('courseId');
    var finalEvaluations = CourseWeighting.findOne({ ownerId: Meteor.userId(), courseId: courseID }).finalAssessmentTypes;
    for (var i = 0; i < finalEvaluations.length; i++) {
        if (finalEvaluations[i].assessmentTypeId == assessmentTypeId) {
            return finalEvaluations[i].assessmentType;
        }
    }
}

function getCourseEvalName(assessmentId) {
    let courseID = Session.get('courseId');
    var courseEvaluations = Assessments.findOne({ ownerId: Meteor.userId(), courseId: courseID }).courseAssessmentTypes;
    var splitAssessmentId = assessmentId.split('-');
    var assessments;
    for (var i = 0; i < courseEvaluations.length; i++) {
        if (splitAssessmentId[0] == courseEvaluations[i].assessmentTypeId) {
            assessments = courseEvaluations[i].assessments;
            break;
        }
    }
    for (var i = 0; i < assessments.length; i++) {
        if (assessments[i].assessmentId == assessmentId) {
            return assessments[i].assessmentName;
        }
    }
}

function drawAssessmentBreakdownBarGraph() {
    //clear the contents of the div, in the event this function is called more than once.
    var assessmentTypeId = document.getElementById('studentReportsDropdown').value;
    var data = getStudentAssessmentTypeInfo(assessmentTypeId);
    var assessmentName; 
    if (assessmentTypeId[0] == "f") {
        assessmentName = data[0].assessmentName
    }
    for (var i = 0; i < data.length; i++) {
        if (data[i].K == "N/A") delete data[i].K
        if (data[i].A == "N/A") delete data[i].A
        if (data[i].T == "N/A") delete data[i].T
        if (data[i].C == "N/A") delete data[i].C
        if (data[i].Grade == "N/A") {
            data.splice(i, 1);
            i--;
        } else {
            delete data[i].Grade;
        }
    }
    if (data.length == 0 && assessmentTypeId[0] == "f") {
        data = [{
            assessmentName: assessmentName
        }];
    }
    new Morris.Bar({
        // ID of the element in which to draw the chart.
        element: 'assessmentBreakdownBarGraph',
        // Chart data records -- each entry in this array corresponds to a point on
        // the chart.
        // data: [
        //     { assessmentName: 'Quiz 1', K: 100, A: 90, T: 80, C:50 },
        //     { assessmentName: 'Quiz 2', K: 75,  A: 65, T: 80, C:50 },
        //     { assessmentName: 'Quiz 3', K: 50,  A: 40, T: 80, C:50 },
        //     { assessmentName: 'Quiz 4', K: 75,  A: 65, T: 80, C:50 },
        //     { assessmentName: 'Quiz 5', K: 50,  A: 40, T: 80, C:50 },
        //     { assessmentName: 'Quiz 6', K: 75,  A: 65, T: 80, C:50 },
        //     { assessmentName: 'Quiz 7', K: 100, A: 90, T: 80, C:50 },
        //     { assessmentName: 'Quiz 8', K: 100, A: 90, T: 80, C:50 },
        //     { assessmentName: 'Quiz 9', K: 100, A: 90, T: 80, C:50 },
        //     { assessmentName: 'Quiz 10', K: 100, A: 90, T: 80, C:50 },
        // ],
        data: data,
        ymin: 100,
        xkey: 'assessmentName',
        ykeys: ['K', 'A', 'T', 'C'],
        labels: ['Knowledge', 'Application', 'Thinking', 'Communication'],
        barColors: ['#b39ddb', '#4fc3f7', '#81c784', '#e57373'],
        resize: true,
        hideHover: 'auto'

    });
}

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

    if (assessmentTypeGradesAndWeight.length == 0) {
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

function drawCourseOverviewBreakdownBarGraph() {
    //clear the contents of the div, in the event this function is called more than once.

    var data = getCourseOverviewInformation(); //should be the assessmentTypeId
    for (var i = 0; i < data.length; i++) {
        if (data[i].K == "N/A") delete data[i].K
        if (data[i].A == "N/A") delete data[i].A
        if (data[i].T == "N/A") delete data[i].T
        if (data[i].C == "N/A") delete data[i].C
        if (data[i].Grade == "N/A") {
            data.splice(i, 1);
            i--;
        } else {
            delete data[i].Grade;
        }
    }

    new Morris.Bar({
        // ID of the element in which to draw the chart.
        element: 'assessmentBreakdownBarGraph',
        // Chart data records -- each entry in this array corresponds to a point on
        // the chart.
        // data: [
        //     { assessmentName: 'Quiz 1', K: 100, A: 90, T: 80, C:50 },
        //     { assessmentName: 'Quiz 2', K: 75,  A: 65, T: 80, C:50 },
        //     { assessmentName: 'Quiz 3', K: 50,  A: 40, T: 80, C:50 },
        //     { assessmentName: 'Quiz 4', K: 75,  A: 65, T: 80, C:50 },
        //     { assessmentName: 'Quiz 5', K: 50,  A: 40, T: 80, C:50 },
        //     { assessmentName: 'Quiz 6', K: 75,  A: 65, T: 80, C:50 },
        //     { assessmentName: 'Quiz 7', K: 100, A: 90, T: 80, C:50 },
        //     { assessmentName: 'Quiz 8', K: 100, A: 90, T: 80, C:50 },
        //     { assessmentName: 'Quiz 9', K: 100, A: 90, T: 80, C:50 },
        //     { assessmentName: 'Quiz 10', K: 100, A: 90, T: 80, C:50 },
        // ],
        data: data,
        ymin: 100,
        xkey: 'assessmentTypeName',
        ykeys: ['K', 'A', 'T', 'C'],
        labels: ['Knowledge', 'Application', 'Thinking', 'Communication'],
        barColors: ['#b39ddb', '#4fc3f7', '#81c784', '#e57373'],
        resize: true,
        hideHover: 'auto'

    });
}

function pullAssessmentTypeKnowledgeGrade(assessmentTypeId) {
    var assessmentTypeGrade = pullAssessmentTypeGradeFromCollection(assessmentTypeId);
    var data = getGradesArrrayElement(assessmentTypeGrade, true);
    var knowledge = data.K;
    return knowledge
}

function pullAssessmentTypeApplicationGrade(assessmentTypeId) {
    var assessmentTypeGrade = pullAssessmentTypeGradeFromCollection(assessmentTypeId);
    var data = getGradesArrrayElement(assessmentTypeGrade, true);
    var application = data.A;
    return application
}

function pullAssessmentTypeThinkingGrade(assessmentTypeId) {
    var assessmentTypeGrade = pullAssessmentTypeGradeFromCollection(assessmentTypeId);
    var data = getGradesArrrayElement(assessmentTypeGrade, true);
    var thinking = data.T;
    return thinking
}

function pullAssessmentTypeCommunicationGrade(assessmentTypeId) {
    var assessmentTypeGrade = pullAssessmentTypeGradeFromCollection(assessmentTypeId);
    var data = getGradesArrrayElement(assessmentTypeGrade, true);
    var communication = data.C;
    return communication
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

function drawAssessmentTypeBarGraph() {
    //clear the contents of the div, in the event this function is called more than once.
    var assessmentTypeId = document.getElementById("studentReportsDropdown").value;
    var assessmentTypeGrade = pullAssessmentTypeGradeFromCollection(assessmentTypeId);
    var data = getGradesArrrayElement(assessmentTypeGrade, true);
    if (data.assessmentName == null) {
        data.assessmentName = getAssessmentName(assessmentTypeId);
    }
    new Morris.Bar({
        // ID of the element in which to draw the chart.
        element: 'assessmentTypeBarGraph',
        // Chart data records -- each entry in this array corresponds to a point on
        // the chart.
        data: [data],
        ymin: 100,
        xkey: 'assessmentName',
        ykeys: ['K', 'A', 'T', 'C'],
        labels: ['Knowledge', 'Application', 'Thinking', 'Communication'],
        barColors: ['#b39ddb', '#4fc3f7', '#81c784', '#e57373'],
        resize: true,
        hideHover: 'auto'
    });
}

function drawFinalGradeBarGraph() {
    //clear the contents of the div, in the event this function is called more than once.
    var studentsArray = CalculatedGrades.findOne({ ownerId: Meteor.userId(), courseId: Session.get('courseId') }).students;
    var studentId = Session.get("currentSelectedStudentID");
    var categoryGrades = {};
    for (i = 0; i < studentsArray.length; i++) {
        if (studentsArray[i].studentId == studentId) {
            categoryGrades = studentsArray[i].categoryGrades;
            i = studentsArray.length;
        }
    }
    var categories = Object.keys(categoryGrades);

    var data = {
        assessmentName: "Final Grade",
    }

    for (i = 0; i < categories.length; i++) {
        var category = categories[i][0];
        data[category] = categoryGrades[categories[i]]

    }

    new Morris.Bar({
        // ID of the element in which to draw the chart.
        element: 'assessmentTypeBarGraph',
        // Chart data records -- each entry in this array corresponds to a point on
        // the chart.
        data: [data],
        ymin: 100,
        xkey: 'assessmentName',
        ykeys: ['K', 'A', 'T', 'C'],
        labels: ['Knowledge', 'Application', 'Thinking', 'Communication'],
        barColors: ['#b39ddb', '#4fc3f7', '#81c784', '#e57373'],
        resize: true,
        hideHover: 'auto'
    });
}

function drawAssessmentTypeClassBarGraph() {
    //clear the contents of the div, in the event this function is called more than once.
    var assessmentTypeId = document.getElementById("studentReportsDropdown").value;
    var data = pullAssessmentTypeGradeFromCollection(assessmentTypeId, true);
    if (data.assessmentName == null) {
        data.assessmentType = getAssessmentName(assessmentTypeId);
    }
    new Morris.Bar({
        // ID of the element in which to draw the chart.
        element: 'assessmentTypeClassBarGraph',
        // Chart data records -- each entry in this array corresponds to a point on
        // the chart.
        data: [data],
        ymin: 100,
        xkey: 'assessmentType',
        ykeys: ['K', 'A', 'T', 'C'],
        labels: ['Knowledge', 'Application', 'Thinking', 'Communication'],
        barColors: ['#b39ddb', '#4fc3f7', '#81c784', '#e57373'],
        resize: true,
        hideHover: 'auto'

    });
}

function refreshAssessmentTypeGraphs() {
    $('#assessmentTypeBarGraph').empty();
    drawAssessmentTypeBarGraph();

    $('#assessmentTypeClassBarGraph').empty();
    drawAssessmentTypeClassBarGraph();

    $('#assessmentBreakdownBarGraph').empty();
    drawAssessmentBreakdownBarGraph();
}

function refreshCourseOverviewGraphs() {
    $('#assessmentTypeBarGraph').empty();
    $('#assessmentTypeClassBarGraph').empty();
    $('#assessmentBreakdownBarGraph').empty();

    drawCourseOverviewBreakdownBarGraph();
    drawFinalGradeBarGraph();

}

function getGradeForAssessment(gradeObj) {
    var k = gradeObj.KGrade;
    var a = gradeObj.AGrade;
    var t = gradeObj.TGrade;
    var c = gradeObj.CGrade;
    var WeightK = Session.get('knowledgeWeight');
    var WeightA = Session.get('applicationWeight');
    var WeightT = Session.get('thinkingWeight');
    var WeightC = Session.get('communicationWeight');
    if (isNaN(k)) k = "N/A"
    if (isNaN(a)) a = "N/A"
    if (isNaN(t)) t = "N/A"
    if (isNaN(c)) c = "N/A"
    return Number(getWeightedAverage(k, a, t, c, WeightK, WeightA, WeightT, WeightC)) / 100;

}

function getGradeString(grade) {
    if (isNaN(grade) || grade == null || grade == (-1).toFixed(2)) {
        return "N/A"
    } else {
        return grade + "%";
    }
}

function getAssessmentTypeArray() {
    var assessmentTypeName = Template.instance().getDropdownValue.get();
    const courseWeighting = CourseWeighting.findOne({ ownerId: Meteor.userId(), courseId: Session.get('courseId') });
    const courseWork = courseWeighting.courseworkAssessmentTypes;
    const finalWork = courseWeighting.finalAssessmentTypes;

    var allAssessments = [];
    for (var i = 0; i < courseWork.length; i++) {
        allAssessments.push({
            assessmentTypeId: courseWork[i].assessmentTypeId,
            assessmentType: courseWork[i].assessmentType
        });
    }
    for (var i = 0; i < finalWork.length; i++) {
        allAssessments.push({
            assessmentTypeId: finalWork[i].assessmentTypeId,
            assessmentType: finalWork[i].assessmentType
        });
    }
    return allAssessments;
}

function getCourseOverviewInformation() {
    var studentId = Session.get("currentSelectedStudentID");
    const studentGrades = CalculatedGrades.findOne({ ownerId: Meteor.userId(), courseId: Session.get('courseId') }).students;
    var courseOverViewTableInfo = [];
    var numOfStudents = studentGrades.length;
    var assessmentTypeIds = getAssessmentTypeArray();
    for (var i = 0; i < assessmentTypeIds.length; i++) {
        var KGrade = -1;
        var AGrade = -1;
        var TGrade = -1;
        var CGrade = -1;
        var currentATID = assessmentTypeIds[i].assessmentTypeId;
        for (var j = 0; j < studentGrades.length; j++) {
            if (studentGrades[j].studentId == studentId) {
                currentStudentGrades = studentGrades[j].currentGrades;
                for (var x = 0; x < currentStudentGrades.length; x++) {
                    if (currentATID == currentStudentGrades[x].assessmentTypeId) {
                        var assessmentTypeGrade = currentStudentGrades[x].assessmentTypeGrade;
                        if (assessmentTypeGrade.KGrade && !isNaN(assessmentTypeGrade.KGrade)) KGrade += assessmentTypeGrade.KGrade + 1;
                        if (assessmentTypeGrade.AGrade && !isNaN(assessmentTypeGrade.AGrade)) AGrade += assessmentTypeGrade.AGrade + 1;
                        if (assessmentTypeGrade.TGrade && !isNaN(assessmentTypeGrade.TGrade)) TGrade += assessmentTypeGrade.TGrade + 1;
                        if (assessmentTypeGrade.CGrade && !isNaN(assessmentTypeGrade.CGrade)) CGrade += assessmentTypeGrade.CGrade + 1;
                        break;
                    }
                }
                break;
            }
        }
        KGrade = KGrade.toFixed(2);
        AGrade = AGrade.toFixed(2);
        TGrade = TGrade.toFixed(2);
        CGrade = CGrade.toFixed(2);
        grade = {
            KGrade: KGrade,
            AGrade: AGrade,
            TGrade: TGrade,
            CGrade: CGrade
        };

        courseOverViewTableInfo.push({
            assessmentTypeName: assessmentTypeIds[i].assessmentType,
            K: getGradeString(KGrade),
            A: getGradeString(AGrade),
            T: getGradeString(TGrade),
            C: getGradeString(CGrade),
            Grade: getGradeString(getGradeForAssessment(grade))
        });
    }
    return courseOverViewTableInfo;
}

Template.studentReports.onCreated(function () {
    this.isCourseOverView = new ReactiveVar(true);
    this.getDropdownValue = new ReactiveVar("courseOverview");
});

Template.studentReports.onRendered(function () {
});

Template.studentReports.events({
    'click .studentSideNavElements': function (event, template) {
        if (template.isCourseOverView.get()) {
            refreshCourseOverviewGraphs();
        } else {
            refreshAssessmentTypeGraphs();
        }
    },
    'change #studentReportsDropdown': function (event, template) {
        if (document.getElementById('studentReportsDropdown').value == "courseOverview") {
            template.isCourseOverView.set(true);
            template.getDropdownValue.set("courseOverview");
            refreshCourseOverviewGraphs();
        } else {
            template.isCourseOverView.set(false);
            template.getDropdownValue.set(document.getElementById('studentReportsDropdown').value);
            refreshAssessmentTypeGraphs();
        }

    },
    'click #studentReportsTabId': function () {
        if (Session.get('currentSelectedStudentId') != '0') {
            if (Template.instance().isCourseOverView.get()) {
                refreshCourseOverviewGraphs();
            } else {
                refreshAssessmentTypeGraphs();
            }
        }
    }
});

Template.studentReports.helpers({
    getFinalGrade: function () {
        var studentId = Session.get('currentSelectedStudentID');
        let ownerId = Meteor.userId();
        let courseId = Session.get('courseId');

        // var organizedStudentGrades = organizeStudentGrades(ownerId, courseId, studentId);

        // var assessmentTypeGrades = calculateAsessmentTypeGrades(ownerId, courseId, organizedStudentGrades);

        // var finalGrade = calculateFinalGrade(ownerId, courseId, assessmentTypeGrades)

        var K = determineOverallCategoryGrade(Meteor.userId(), courseId, studentId, 'K');
        var A = determineOverallCategoryGrade(Meteor.userId(), courseId, studentId, 'A');
        var T = determineOverallCategoryGrade(Meteor.userId(), courseId, studentId, 'T');
        var C = determineOverallCategoryGrade(Meteor.userId(), courseId, studentId, 'C');

        var WeightK = Session.get('knowledgeWeight');
        var WeightA = Session.get('applicationWeight');
        var WeightT = Session.get('thinkingWeight');
        var WeightC = Session.get('communicationWeight');

        var finalGrade = getWeightedAverage(K, A, T, C, WeightK, WeightA, WeightT, WeightC)

        if (finalGrade != "N/A") {
            return (finalGrade / 100).toFixed(2) + "%";
        }
        else {
            return "N/A"
        }
    },
    getStudentNameLastFirst: function () {
        var ownerId = Meteor.userId();
        var courseId = Session.get("courseId");
        var studentId = Session.get('currentSelectedStudentID');
        var studentName = getStudentNameLastFirst(studentId, ownerId, courseId);

        return studentName
    },
    getStudentNameFirstLast: function () {
        var ownerId = Meteor.userId();
        var courseId = Session.get("courseId");
        var studentId = Session.get('currentSelectedStudentID');
        var studentName = getStudentNameFirstLast(studentId, ownerId, courseId);

        return studentName
    },
    getAssessmentTypeKnowledge: function () {
        assessmentTypeId = Template.instance().getDropdownValue.get();
        var knowledgeGrade = pullAssessmentTypeKnowledgeGrade(assessmentTypeId);
        if (knowledgeGrade == undefined) {
            return "N/A"
        }
        return knowledgeGrade + "%"
    },
    getAssessmentTypeApplication: function () {
        assessmentTypeId = Template.instance().getDropdownValue.get();
        var applicationGrade = pullAssessmentTypeApplicationGrade(assessmentTypeId);
        if (applicationGrade == undefined) {
            return "N/A"
        }
        return applicationGrade + "%"
    },
    getAssessmentTypeThinking: function () {
        assessmentTypeId = Template.instance().getDropdownValue.get();
        var thinkingGrade = pullAssessmentTypeThinkingGrade(assessmentTypeId);
        if (thinkingGrade == undefined) {
            return "N/A"
        }
        return thinkingGrade + "%"
    },
    getAssessmentTypeCommunication: function () {
        assessmentTypeId = Template.instance().getDropdownValue.get();
        var communicationGrade = pullAssessmentTypeCommunicationGrade(assessmentTypeId);
        if (communicationGrade == undefined) {
            return "N/A"
        }
        return communicationGrade + "%"
    },
    getClassAssessmentTypeKnowledge: function () {
        assessmentTypeId = Template.instance().getDropdownValue.get();
        var knowledgeGrade = pullAssessmentTypeGradeFromCollection(assessmentTypeId, true).K;
        if (knowledgeGrade == undefined) {
            return "N/A"
        }
        return knowledgeGrade.toFixed(2) + "%"
    },
    getClassAssessmentTypeApplication: function () {
        assessmentTypeId = Template.instance().getDropdownValue.get();
        var applicationGrade = pullAssessmentTypeGradeFromCollection(assessmentTypeId, true).A;
        if (applicationGrade == undefined) {
            return "N/A"
        }
        return applicationGrade.toFixed(2) + "%"
    },
    getClassAssessmentTypeThinking: function () {
        assessmentTypeId = Template.instance().getDropdownValue.get();
        var thinkingGrade = pullAssessmentTypeGradeFromCollection(assessmentTypeId, true).T;
        if (thinkingGrade == undefined) {
            return "N/A"
        }
        return thinkingGrade.toFixed(2) + "%"
    },
    getClassAssessmentTypeCommunication: function () {
        assessmentTypeId = Template.instance().getDropdownValue.get();
        var communicationGrade = pullAssessmentTypeGradeFromCollection(assessmentTypeId, true).C;
        if (communicationGrade == undefined) {
            return "N/A"
        }
        return communicationGrade.toFixed(2) + "%"
    },
    getAssessmentTypeWeightedGrade: function () {
        assessmentTypeId = Template.instance().getDropdownValue.get();
        var WeightK = Session.get('knowledgeWeight');
        var WeightA = Session.get('applicationWeight');
        var WeightT = Session.get('thinkingWeight');
        var WeightC = Session.get('communicationWeight');

        var K = pullAssessmentTypeKnowledgeGrade(assessmentTypeId);
        if (K == undefined) {
            K = "N/A"
        }

        var A = pullAssessmentTypeApplicationGrade(assessmentTypeId);
        if (A == undefined) {
            A = "N/A"
        }

        var T = pullAssessmentTypeThinkingGrade(assessmentTypeId);
        if (T == undefined) {
            T = "N/A"
        }

        var C = pullAssessmentTypeCommunicationGrade(assessmentTypeId);
        if (C == undefined) {
            C = "N/A"
        }

        var weightedGrade = getWeightedAverage(K, A, T, C, WeightK, WeightA, WeightT, WeightC)
        if (weightedGrade == "N/A") {
            return "N/A"
        }
        return Number((weightedGrade / 100).toFixed(2)) + "%"
    },
    getClassAssessmentTypeWeightedGrade: function () {
        assessmentTypeId = Template.instance().getDropdownValue.get();
        var WeightK = Session.get('knowledgeWeight');
        var WeightA = Session.get('applicationWeight');
        var WeightT = Session.get('thinkingWeight');
        var WeightC = Session.get('communicationWeight');

        var K = pullAssessmentTypeGradeFromCollection(assessmentTypeId, true).K;
        if (K == undefined) {
            K = "N/A"
        }

        var A = pullAssessmentTypeGradeFromCollection(assessmentTypeId, true).A;
        if (A == undefined) {
            A = "N/A"
        }

        var T = pullAssessmentTypeGradeFromCollection(assessmentTypeId, true).T;
        if (T == undefined) {
            T = "N/A"
        }

        var C = pullAssessmentTypeGradeFromCollection(assessmentTypeId, true).C;
        if (C == undefined) {
            C = "N/A"
        }

        var weightedGrade = getWeightedAverage(K, A, T, C, WeightK, WeightA, WeightT, WeightC)
        if (weightedGrade == "N/A") {
            return "N/A"
        }
        return Number((weightedGrade / 100).toFixed(2)) + "%"
    },
    isCourseOverView: function () {
        return Template.instance().isCourseOverView.get();
    },
    getAllAssessments: function () {
        return getAssessmentTypeArray();
    },
    getAllAssignmentInformation: function () {
        return getStudentAssessmentTypeInfo(Template.instance().getDropdownValue.get());;
    },
    getCourseOverviewTableInfo: function () {
        var courseOverviewInfo = getCourseOverviewInformation();

        refreshCourseOverviewGraphs();
        return courseOverviewInfo;
    },
    getFinalCategoryGrade: function (category) {
        let ownerId = Meteor.userId();
        let courseId = Session.get('courseId');
        let studentId = Session.get('currentSelectedStudentID');

        var grade = determineOverallCategoryGrade(ownerId, courseId, studentId, category);

        return grade
    }
});
