import { Template } from 'meteor/templating';
import { Accounts } from 'meteor/accounts-base';

import '../../main.html';

function grabGrades(assessmentsArray) {
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

function getGradesArrrayElement(grade) {
	const assessmentName = getAssessmentName(grade.assessmentId);
	var gradeElement = {
		assessmentName: assessmentName,
		K: grade.KGrade,
		A: grade.AGrade,
		T: grade.TGrade,
		C: grade.CGrade
	}
	if (grade.KGrade == "N/A") {
		delete gradeElement.K;
	}
	if (grade.AGrade == "N/A") {
		delete gradeElement.A;
	}
	if (grade.TGrade == "N/A") {
		delete gradeElement.T;
	}
	if (grade.CGrade == "N/A") {
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

function getFinalEvalName(assessmentTypeId) {
    var finalEvaluations = CourseWeighting.findOne({ ownerId: Meteor.userId(), courseId: courseID }).finalAssessmentTypes;
    for (var i = 0; i < finalEvaluations.length; i++) {
        if (finalEvaluations[i].assessmentTypeId == assessmentTypeId) {
            return finalEvaluations[i].assessmentType;
        }
    }
}

function getCourseEvalName(assessmentId) {
	let courseID = Session.get('courseId');
    var courseEvaluations = CourseWeighting.findOne({ ownerId: Meteor.userId(), courseId: courseID }).courseworkAssessmentTypes;
    for (var i = 0; i < courseEvaluations.length; i++) {
    	var splitAssessment = courseEvaluations[i].assessmentTypeId.split("-");
        if (splitAssessment[0] == assessmentId) {
            return courseEvaluations[i].assessmentType;
        }
    }
}


function drawAssessmentBreakdownBarGraph() {
    //clear the contents of the div, in the event this function is called more than once.
    new Morris.Bar({
        // ID of the element in which to draw the chart.
        element: 'assessmentBreakdownBarGraph',
        // Chart data records -- each entry in this array corresponds to a point on
        // the chart.
        data: [
            { assessmentName: 'Quiz 1', K: 100, A: 90, T: 80, C:50 },
            { assessmentName: 'Quiz 2', K: 75,  A: 65, T: 80, C:50 },
            { assessmentName: 'Quiz 3', K: 50,  A: 40, T: 80, C:50 },
            { assessmentName: 'Quiz 4', K: 75,  A: 65, T: 80, C:50 },
            { assessmentName: 'Quiz 5', K: 50,  A: 40, T: 80, C:50 },
            { assessmentName: 'Quiz 6', K: 75,  A: 65, T: 80, C:50 },
            { assessmentName: 'Quiz 7', K: 100, A: 90, T: 80, C:50 },
            { assessmentName: 'Quiz 8', K: 100, A: 90, T: 80, C:50 },
            { assessmentName: 'Quiz 9', K: 100, A: 90, T: 80, C:50 },
            { assessmentName: 'Quiz 10', K: 100, A: 90, T: 80, C:50 },
        ],

        xkey: 'assessmentName',
        ykeys: ['K', 'A', 'T', 'C'],
        labels: ['Knowledge', 'Application', 'Thinking', 'Communication'],
        barColors: ['#b39ddb', '#4fc3f7', '#81c784', '#e57373'],
        resize: true,
        hideHover: 'auto'

    });
}

function drawAssessmentTypeBarGraph() {
    //clear the contents of the div, in the event this function is called more than once.
    new Morris.Bar({
        // ID of the element in which to draw the chart.
        element: 'assessmentTypeBarGraph',
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
    'click .studentSideNavElements': function(){
        $('#assessmentTypeBarGraph').empty();
        drawAssessmentTypeBarGraph();

        $('#assessmentTypeClassBarGraph').empty();
        drawAssessmentTypeClassBarGraph();

        $('#assessmentBreakdownBarGraph').empty();
        drawAssessmentBreakdownBarGraph();
    }
})