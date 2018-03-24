import { Template } from 'meteor/templating';
import { Accounts } from 'meteor/accounts-base';
import { CalculatedGrades, Assessments } from '../../../lib/collections.js';
import { CourseWeighting } from '../../../lib/collections.js';
import { Meteor } from 'meteor/meteor';

import '../../main.html';

function grabGrades(assessmentTypeId) {
    var assessmentsArray = getAssessmentsArray(assessmentTypeId);
    if (assessmentsArray == null) return null;
    var grades = [];
    for (var i = 0; i < assessmentsArray.length; i++) {
        const grade = assessmentsArray[i];
        if ((grade.KGrade == "N/A") &&
            (grade.AGrade == "N/A") &&
            (grade.TGrade == "N/A") &&
            (grade.CGrade == "N/A")) {
            continue;
        }
        grades.push(getGradesArrrayElement(grade));
    }
    return grades;
}

function pullAssessmentTypeGradeFromCollection(assessmentTypeId) {
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

function getAssessmentsArray(assessmentTypeId) {
    var courseId = Session.get("courseId");
    var studentId = Session.get("currentSelectedStudentID");
    var currentGrades;

    var studentGrades = CalculatedGrades.findOne({ ownerId: Meteor.userId(), courseId: courseId }).students;
    for (var i = 0; i < studentGrades.length; i++) {
        var student = studentGrades[i];
        if (student.studentId == studentId) {
            currentGrades = student.currentGrades;
            break;
        }
    }
    for (var i = 0; i < currentGrades.length; i++) {
        var assessmentType = currentGrades[i];
        if (assessmentType.assessmentTypeId == assessmentTypeId) {
            return assessmentType.assessments;
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
    var data = grabGrades(assessmentTypeId); //should be the assessmentTypeId
    console.log(data)
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
        data: grabGrades(assessmentTypeId),

        xkey: 'assessmentName',
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
    new Morris.Bar({
        // ID of the element in which to draw the chart.
        element: 'assessmentTypeBarGraph',
        // Chart data records -- each entry in this array corresponds to a point on
        // the chart.
        data: [data],

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
    new Morris.Bar({
        // ID of the element in which to draw the chart.
        element: 'assessmentTypeClassBarGraph',
        // Chart data records -- each entry in this array corresponds to a point on
        // the chart.
        data: [
            { assessmentType: 'Quiz', K: 83, A: 75, T: 81, C: 71 },
        ],

        xkey: 'assessmentType',
        ykeys: ['K', 'A', 'T', 'C'],
        labels: ['Knowledge', 'Application', 'Thinking', 'Communication'],
        barColors: ['#b39ddb', '#4fc3f7', '#81c784', '#e57373'],
        resize: true,
        hideHover: 'auto'

    });
}

Template.studentReports.onRendered(function () {
});

Template.studentReports.events({
    'click .studentSideNavElements': function () {
        $('#assessmentTypeBarGraph').empty();
        drawAssessmentTypeBarGraph();

        $('#assessmentTypeClassBarGraph').empty();
        drawAssessmentTypeClassBarGraph();

        $('#assessmentBreakdownBarGraph').empty();
        drawAssessmentBreakdownBarGraph();
    }
})

Template.studentReports.helpers({
    getAssessmentTypeKnowledge: function () {
        assessmentTypeId = document.getElementById("studentReportsDropdown").value;
        var knowledgeGrade = pullAssessmentTypeKnowledgeGrade(assessmentTypeId);
        if (knowledgeGrade == undefined) {
            return "N/A"
        }
        return knowledgeGrade + "%"
    },
    getAssessmentTypeApplication: function () {
        assessmentTypeId = document.getElementById("studentReportsDropdown").value;
        var applicationGrade = pullAssessmentTypeApplicationGrade(assessmentTypeId);
        if (applicationGrade == undefined) {
            return "N/A"
        }
        return applicationGrade + "%"
    },
    getAssessmentTypeThinking: function () {
        assessmentTypeId = document.getElementById("studentReportsDropdown").value;
        var thinkingGrade = pullAssessmentTypeThinkingGrade(assessmentTypeId);
        if (thinkingGrade == undefined) {
            return "N/A"
        }
        return thinkingGrade + "%"
    },
    getAssessmentTypeCommunication: function () {
        assessmentTypeId = document.getElementById("studentReportsDropdown").value;
        var communicationGrade = pullAssessmentTypeCommunicationGrade(assessmentTypeId);
        if (communicationGrade == undefined) {
            return "N/A"
        }
        return communicationGrade + "%"
    },
    getAssessmentTypeWeightedGrade: function(){
        assessmentTypeId = document.getElementById("studentReportsDropdown").value;
        var WeightK = Session.get('knowledgeWeight');
        var WeightA = Session.get('applicationWeight');
        var WeightT = Session.get('thinkingWeight');
        var WeightC = Session.get('communicationWeight');

        var K = pullAssessmentTypeKnowledgeGrade(assessmentTypeId);
        if (K == undefined) {
            K =  "N/A"
        }
        
        var A = pullAssessmentTypeApplicationGrade(assessmentTypeId);
        if (A == undefined) {
            A = "N/A"
        }

        var T = pullAssessmentTypeThinkingGrade(assessmentTypeId);
        if (T == undefined) {
            T =  "N/A"
        }

        var C = pullAssessmentTypeCommunicationGrade(assessmentTypeId);
        if (C == undefined) {
            C = "N/A"
        }

        var weightedGrade = getWeightedAverage(K, A, T, C, WeightK, WeightA, WeightT, WeightC)
        if (weightedGrade == "N/A"){
            return "N/A"
        }
        return Number((weightedGrade/100).toFixed(2)) + "%"
    }
})