import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Courses, Students, CalculatedGrades } from '../../../lib/collections.js';
import { Accounts } from 'meteor/accounts-base';
import { CourseWeighting } from '../../../lib/collections.js';

import '../../main.html';

const stringParam = "$%d$";
const requiredText = "Please fill in the required fields.";
const isIntegerText = "A selected category's mark must be an integer.";
const isPositiveText = "A selected category's mark must be greater than 0.";
const addsTo100Text = "Coursework and Final Evaluations must add to 100%. They currently add up to $%d$%.";
const finalAssessmentsEqualFinalWeightText = "Your Final Evaluation Weights should add up to $%d$%. They currently add to $%d$%.";
const courseWorkEqualCourseWeightText = "Your Coursework Weights should add up to $%d$%. They currently add to $%d$%.";

function getFinalWeight() {
    if (document.getElementById('assessments-finalWeight') == null) return "";
    return document.getElementById('assessments-finalWeight').value;
}

function getCourseWeight() {
    if (document.getElementById('assessments-courseWorkWeight') == null) return "";
    return document.getElementById('assessments-courseWorkWeight').value;
}

function getTotalEvaluationWeight() {
    const finalWeight = Number(getFinalWeight());
    const courseWeight = Number(getCourseWeight());

    return finalWeight + courseWeight;
}

function getCurrentFinalWeight() {
    let currentCourseId = Session.get('courseId');
    const finalAssessmentTypes = CourseWeighting.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).finalAssessmentTypes;
    let finalWeightTotal = 0;

    for (var i = 0; i < finalAssessmentTypes.length; i++) {
        let currentId = "inputf" + finalAssessmentTypes[i].assessmentTypeId;
        let finalAssessmentTypeWeight = Number(document.getElementById(currentId).value);
        finalWeightTotal = finalWeightTotal + finalAssessmentTypeWeight;
    };
    return finalWeightTotal;
}

function getCurrentCourseWeight() {
    let currentCourseId = Session.get('courseId');
    const courseworkAssessmentTypes = CourseWeighting.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).courseworkAssessmentTypes;
    let courseWorkWeightTotal = 0;

    for (var i = 0; i < courseworkAssessmentTypes.length; i++) {
        let currentId = "inputc" + courseworkAssessmentTypes[i].assessmentTypeId;
        let courseAssessmentTypeWeight = Number(document.getElementById(currentId).value);
        courseWorkWeightTotal = courseWorkWeightTotal + courseAssessmentTypeWeight;
    };
    return courseWorkWeightTotal;
}

function clearPageValidation() {
    var pageForm = document.getElementById('assessmentSettingsForm');
    clearValidation(pageForm);

    var formElements = pageForm.elements;
    for (var i = 0, element; element = formElements[i++];) {
        if (element.classList.contains('invalid')) {
            element.classList.remove("invalid");
        }
        if (element.classList.contains('jquery-validation-valid')) {
            element.classList.remove('jquery-validation-valid');
        }
    }
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

function doneEditing() {
    let editButtonElement = document.getElementById("edit-button");
    let saveButtonElement = document.getElementById("assessments-save-button");
    let cancelButtonElement = document.getElementById("assignmentSettings-cancelButton");

    let addFinalAssessmentType = document.getElementById('finalAddAssessment');
    let addCourseAssessmentType = document.getElementById('courseAddAssessment');
    let courseStyler = document.getElementById('courseStyler');
    let courseStyler2 = document.getElementById('courseStyler2');

    editButtonElement.classList.remove("hide");
    saveButtonElement.classList.add("hide");
    cancelButtonElement.classList.add("hide");

    addFinalAssessmentType.classList.remove("hide");
    addCourseAssessmentType.classList.remove('hide');
    courseStyler.classList.remove("hide");
    courseStyler2.classList.remove("hide");

    let currentCourseId = Session.get('courseId');
    const courseworkAssessmentTypes = CourseWeighting.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).courseworkAssessmentTypes;
    const finalAssessmentTypes = CourseWeighting.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).finalAssessmentTypes;

    for (var i = 0; i < courseworkAssessmentTypes.length; i++) {
        //coursework AssessmentType Weights Inputs Disabled
        let id = "inputc" + courseworkAssessmentTypes[i].assessmentTypeId;
        let assessmentTypeWeightCourse = document.getElementById(id);
        assessmentTypeWeightCourse.disabled = true;
        assessmentTypeWeightCourse.value = courseworkAssessmentTypes[i].assessmentWeight;

        //unhide coursework Delete Icons
        let id1 = "deletec" + courseworkAssessmentTypes[i].assessmentTypeId;
        let deleteIcon = document.getElementById(id1);
        deleteIcon.classList.remove('hide');

        //hide coursework Edit Icons
        let editCourseId = "editc" + courseworkAssessmentTypes[i].assessmentTypeId;
        let editCourseIcon = document.getElementById(editCourseId);
        editCourseIcon.classList.add('hide');

        //show display assessment-type
        let courseDisplayId = "displayc" + courseworkAssessmentTypes[i].assessmentTypeId;
        let courseDisplay = document.getElementById(courseDisplayId);
        courseDisplay.classList.remove('hide');

        //hide input assessment-type
        let courseInputId = "changeNamec" + courseworkAssessmentTypes[i].assessmentTypeId;
        let courseInput = document.getElementById(courseInputId);
        courseInput.classList.add('hide');
    };

    for (var i = 0; i < finalAssessmentTypes.length; i++) {
        //final Assessment type weights remove disabled
        let id = "inputf" + finalAssessmentTypes[i].assessmentTypeId;
        let assessmentTypeWeightFinal = document.getElementById(id);
        assessmentTypeWeightFinal.disabled = true;
        assessmentTypeWeightFinal.value = finalAssessmentTypes[i].assessmentWeight;

        //unhide final delete icons
        let id1 = "deletef" + finalAssessmentTypes[i].assessmentTypeId;
        let deleteIcon = document.getElementById(id1);
        deleteIcon.classList.remove('hide');

        //hide final Edit Icons
        let editFinalId = "editf" + finalAssessmentTypes[i].assessmentTypeId;
        let editFinalIcon = document.getElementById(editFinalId);
        editFinalIcon.classList.add('hide');

        //show display assessment-type
        let finalDisplayId = "displayf" + finalAssessmentTypes[i].assessmentTypeId;
        let finalDisplay = document.getElementById(finalDisplayId);
        finalDisplay.classList.remove('hide');

        //hide input assessment-type
        let finalInputId = "changeNamef" + finalAssessmentTypes[i].assessmentTypeId;
        let finalInput = document.getElementById(finalInputId);
        finalInput.classList.add('hide');
    };

    let courseWeight = document.getElementById('assessments-courseWorkWeight');
    let finalWeight = document.getElementById('assessments-finalWeight');

    courseWeight.disabled = true;
    courseWeight.value = CourseWeighting.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).courseworkWeight;
    finalWeight.disabled = true;
    finalWeight.value = CourseWeighting.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).finalWeight;
    clearValidation(document.getElementById('assessmentSettingsForm'));
}


function addError(text, error) {
    //document.getElementById('assessmentSettingsTabRequiredError').children.length;
    var isRequired = false;
    var isInteger = false;
    var isPositive = false;
    var addsTo100 = false;
    var finalAssessmentsAddUp = false;
    var courseAssessmentsAddUp = false;
    const finalAssessmentString = finalAssessmentsEqualFinalWeightText.replace(stringParam, getFinalWeight()).replace(stringParam, getCurrentFinalWeight());
    const courseWeightString = courseWorkEqualCourseWeightText.replace(stringParam, getCourseWeight()).replace(stringParam, getCurrentCourseWeight());
    const addsTo100String = addsTo100Text.replace(stringParam, getTotalEvaluationWeight());
    var ele = document.getElementById('assessmentSettingsTabRequiredError').children;

    for (var i = 0; i < ele.length; i++) {
        if (ele[i].textContent == requiredText) isRequired = true;
        if (ele[i].textContent == isIntegerText) isInteger = true;
        if (ele[i].textContent == isPositiveText) isPositive = true;
        if (ele[i].textContent == addsTo100String) addsTo100 = true;
        if (ele[i].textContent == finalAssessmentString) finalAssessmentsAddUp = true;
        if (ele[i].textContent == courseWeightString) courseAssessmentsAddUp = true;
    }
    if (!isRequired && text == requiredText) {
        $('#assessmentSettingsTabRequiredError').append(error);
    } else if (!isInteger && text == isIntegerText) {
        $('#assessmentSettingsTabRequiredError').append(error);
    } else if (!isPositive && text == isPositiveText) {
        $('#assessmentSettingsTabRequiredError').append(error);
    } else if (!addsTo100 && text == addsTo100String) {
        $('#assessmentSettingsTabRequiredError').append(error);
    } else if (!finalAssessmentsAddUp && text == finalAssessmentString) {
        $('#assessmentSettingsTabRequiredError').append(error);
    } else if (!courseAssessmentsAddUp && text == courseWeightString) {
        $('#assessmentSettingsTabRequiredError').append(error);
    }
}

function determineAssessmentTypeGrade(ownerId, courseId, studentId, assessmentTypeId, category) {
    var courseAssessmentTypes = Assessments.findOne({ ownerId, courseId }).courseAssessmentTypes;
    var studentsArray = Students.findOne({ ownerId, courseId }).students;

    assessmentGrades = [];

    //Making changes to adjust how mark is calculated
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
                        //Making changes to adjust how mark is calculated
                        // totalStudentMarks = totalStudentMarks + studentMark;

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
    //var calculatedAssessmentGrades = 0;
    //var totalAssessments = assessmentGrades.length;

    //new
    var countTrueScore = [];
    //

    for (var i = 0; i < assessmentGrades.length; i++) {
        var grade = assessmentGrades[i].grade;
        var outOf = assessmentGrades[i].outOf;

        //new
        var coupledGrade = [grade, outOf];
        countTrueScore[countTrueScore.length] = coupledGrade;
        //

        //var calculatedGrade = Number(((grade / outOf) * 100).toFixed(2));
        //calculatedAssessmentGrades = calculatedAssessmentGrades + calculatedGrade;
    }

    //new
    var totalStudentScore = "N/A";
    var totalOutOf = "N/A";
    var studentHasScore = false;
    var outOfHasScore = false;

    for (var z = 0; z < countTrueScore.length; z++) {
        if (countTrueScore[z][0] != "N/A") {
            studentHasScore = true;
            if (totalStudentScore != "N/A") {
                totalStudentScore = totalStudentScore + countTrueScore[z][0];
            }
            else {
                totalStudentScore = countTrueScore[z][0];
            }
        }
        if (countTrueScore[z][1] != "N/A") {
            outOfHasScore = true;
            if (totalOutOf != "N/A") {
                totalOutOf = totalOutOf + countTrueScore[z][1];
            }
            else {
                totalOutOf = countTrueScore[z][1];
            }
        }

    }

    if (studentHasScore && outOfHasScore) {
        var calculatedAssessmentTypeGradeNew = Number((totalStudentScore * 100 / totalOutOf).toFixed(2));
    }
    else {
        var calculatedAssessmentTypeGradeNew = "N/A";
    }
    //

    // var calculatedAssessmentTypeGrade = Number(((totalStudentMarks / outOf) * 100).toFixed(2));
    //var calculatedAssessmentTypeGrade = Number((calculatedAssessmentGrades / totalAssessments).toFixed(2));
    return calculatedAssessmentTypeGradeNew

}

function addValidationRulesOnInputs() {
    $.validator.addMethod('isInteger', (input) => {
        return (input == "N/A" || Math.floor(input) == input);
    });
    $.validator.addMethod('isPositive', (input) => {
        return (input >= 0);
    });
    $.validator.addMethod('addsTo100', function (input) {
        var courseWorkWeight = Number(document.getElementById('assessments-courseWorkWeight').value);
        var finalWeight = Number(document.getElementById('assessments-finalWeight').value);

        return finalWeight + courseWorkWeight == 100;
    }, function (input) {
        return addsTo100Text.replace(stringParam, getTotalEvaluationWeight());
    });
    $.validator.addMethod('finalAssessmentsEqualFinalWeight', function (value) {
        let currentCourseId = Session.get('courseId');
        const finalAssessmentTypes = CourseWeighting.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).finalAssessmentTypes;
        let finalWeightTotal = 0;
        let finalWeight = Number(document.getElementById("assessments-finalWeight").value);

        for (var i = 0; i < finalAssessmentTypes.length; i++) {
            let currentId = "inputf" + finalAssessmentTypes[i].assessmentTypeId;
            let finalAssessmentTypeWeight = Number(document.getElementById(currentId).value);
            finalWeightTotal = finalWeightTotal + finalAssessmentTypeWeight;
        };
        return finalWeight == finalWeightTotal;
    }, function (value) {
        return finalAssessmentsEqualFinalWeightText.replace(stringParam, getFinalWeight()).replace(stringParam, getCurrentFinalWeight());
    });
    $.validator.addMethod('courseWorkEqualCourseWeight', function (value) {
        let currentCourseId = Session.get('courseId');
        const courseworkAssessmentTypes = CourseWeighting.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).courseworkAssessmentTypes;
        let courseWorkWeightTotal = 0;
        let courseWorkWeight = Number(document.getElementById("assessments-courseWorkWeight").value);

        for (var i = 0; i < courseworkAssessmentTypes.length; i++) {
            let currentId = "inputc" + courseworkAssessmentTypes[i].assessmentTypeId;
            let courseAssessmentTypeWeight = Number(document.getElementById(currentId).value);
            courseWorkWeightTotal = courseWorkWeightTotal + courseAssessmentTypeWeight;
        };
        return courseWorkWeight == courseWorkWeightTotal;
    }, function (value) {
        return courseWorkEqualCourseWeightText.replace(stringParam, getCourseWeight()).replace(stringParam, getCurrentCourseWeight());
    });
    $("#assessmentSettingsForm").validate({
        errorClass: 'invalid',
        validClass: 'jquery-validation-valid',
        rules: {
            finalWeight: {
                required: true,
                isInteger: true,
                isPositive: true,
                addsTo100: true,
                finalAssessmentsEqualFinalWeight: true
            },
            courseWorkWeight: {
                required: true,
                isInteger: true,
                isPositive: true,
                addsTo100: true,
                courseWorkEqualCourseWeight: true
            }
        },
        messages: {
            finalWeight: {
                required: requiredText,
                isInteger: isIntegerText,
                isPositive: isPositiveText,
            },
            courseWorkWeight: {
                required: requiredText,
                isInteger: isIntegerText,
                isPositive: isPositiveText,
            }
        },
        errorElement: 'div',
        errorPlacement: function (error, element) {
            var text = $(error)[0].textContent;
            addError(text, error);
        }
    });
    let currentCourseId = Session.get('courseId');
    const courseworkAssessmentTypes = CourseWeighting.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).courseworkAssessmentTypes;
    const finalAssessmentTypes = CourseWeighting.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).finalAssessmentTypes;

    addValidationRules(courseworkAssessmentTypes, "c");
    addValidationRules(finalAssessmentTypes, "f");
}

function addValidationRules(assessmentsObj, prefix) {
    for (var i = 0; i < assessmentsObj.length; i++) {

        var assessment = assessmentsObj[i];
        const changeNameID = "#changeName" + prefix + assessment.assessmentTypeId;
        const weightInputID = "#input" + prefix + assessment.assessmentTypeId;
        $(changeNameID).rules("add", {
            required: true,
            messages: {
                required: requiredText
            }
        });
        $(weightInputID).rules("add", {
            required: true,
            isInteger: true,
            isPositive: true,
            messages: {
                required: requiredText,
                isInteger: isIntegerText,
                isPositive: isPositiveText
            }
        });
    }
}

Template.assessmentsTab.helpers({
    courseAssessmentTypes: function () {
        let currentCourseId = Session.get('courseId');
        const courseworkAssessmentTypes = CourseWeighting.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).courseworkAssessmentTypes;
        return courseworkAssessmentTypes
    },
    finalAssessmentTypes: function () {
        let currentCourseId = Session.get('courseId');
        const finalAssessmentTypes = CourseWeighting.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).finalAssessmentTypes;
        return finalAssessmentTypes
    },
    courseWorkWeight: function () {
        let currentCourseId = Session.get('courseId');
        const currentCourseWorkWeight = CourseWeighting.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).courseworkWeight;
        return currentCourseWorkWeight;
    },
    finalWeight: function () {
        let currentCourseId = Session.get('courseId');
        const currentFinalWeight = CourseWeighting.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).finalWeight;
        return currentFinalWeight;
    },
});

Template.assessmentsTab.onRendered(function () {
    $('.collapsible').collapsible();
    addValidationRulesOnInputs();
});

Template.assessmentsTab.events({
    'click .delete-courseworkAssessmentType': function () {
        target = event.target;
        assessmentTypeId = target.parentElement.id;
        assessmentTypeName = target.parentElement.name;

        if (document.getElementById("inputc" + assessmentTypeId) == null) return;

        assessmentTypeWeight = document.getElementById("inputc" + assessmentTypeId).value;

        if (Number(assessmentTypeWeight) == 0) {
            let sessionObject = {
                type: 'courseworkAssessmentTypes',
                assessmentTypeName: assessmentTypeName,
                assessmentTypeId: assessmentTypeId
            };

            Session.set('selectedAssessmentType', sessionObject);
            $('#deleteCourseworkAssessmentTypeModal').modal({
                dismissible: true,
                complete: function () {
                    setTimeout(function () {
                        document.getElementById("preloader").style = "display: none";
                    }, 500);
                }
            });
            $('#deleteCourseworkAssessmentTypeModal').modal('open');
        }
    },
    'click .delete-finalAssessmentType': function () {
        target = event.target;
        assessmentTypeId = target.parentElement.id;
        assessmentTypeName = target.parentElement.name;
        assessmentTypeWeight = document.getElementById("inputf" + assessmentTypeId).value;

        if (Number(assessmentTypeWeight) == 0) {
            let sessionObject = {
                type: 'finalAssessmentTypes',
                assessmentTypeName: assessmentTypeName,
                assessmentTypeId: assessmentTypeId
            };

            Session.set('selectedAssessmentType', sessionObject);
            $('#deleteFinalAssessmentTypeModal').modal({
                dismissible: true,
                complete: function () {
                    setTimeout(function () {
                        document.getElementById("preloader").style = "display: none";
                    }, 500);
                }
            });
            $('#deleteFinalAssessmentTypeModal').modal('open');
        }
    },
    'click .edit-button': function () {
        let editButtonElement = document.getElementById("edit-button");
        let saveButtonElement = document.getElementById("assessments-save-button");
        let cancelButtonElement = document.getElementById("assignmentSettings-cancelButton");

        let addFinalAssessmentType = document.getElementById('finalAddAssessment');
        let addCourseAssessmentType = document.getElementById('courseAddAssessment');
        let courseStyler = document.getElementById('courseStyler');
        let courseStyler2 = document.getElementById('courseStyler2');

        editButtonElement.classList.add("hide");
        saveButtonElement.classList.remove("hide");
        cancelButtonElement.classList.remove("hide");

        addFinalAssessmentType.classList.add('hide');
        addCourseAssessmentType.classList.add('hide');
        courseStyler.classList.add("hide");
        courseStyler2.classList.add("hide");

        let currentCourseId = Session.get('courseId');
        const courseworkAssessmentTypes = CourseWeighting.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).courseworkAssessmentTypes;
        const finalAssessmentTypes = CourseWeighting.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).finalAssessmentTypes;

        for (var i = 0; i < courseworkAssessmentTypes.length; i++) {
            //hide coursework Delete Icons
            let deleteCourseId = "deletec" + courseworkAssessmentTypes[i].assessmentTypeId;
            let deleteCourseIcon = document.getElementById(deleteCourseId);
            deleteCourseIcon.classList.add('hide');

            //show coursework Edit Icons
            let editCourseId = "editc" + courseworkAssessmentTypes[i].assessmentTypeId;
            let editCourseIcon = document.getElementById(editCourseId);
            editCourseIcon.classList.remove('hide');

            //coursework weights remove disabled attribute
            let inputCourseId = "inputc" + courseworkAssessmentTypes[i].assessmentTypeId;
            let assessmentTypeWeightCourse = document.getElementById(inputCourseId);
            assessmentTypeWeightCourse.removeAttribute('disabled');
            assessmentTypeWeightCourse.value = courseworkAssessmentTypes[i].assessmentWeight;

            //hide display assessment-type
            let courseDisplayId = "displayc" + courseworkAssessmentTypes[i].assessmentTypeId;
            let courseDisplay = document.getElementById(courseDisplayId);
            courseDisplay.classList.add('hide');

            //show input assessment-type
            let courseInputId = "changeNamec" + courseworkAssessmentTypes[i].assessmentTypeId;
            let courseInput = document.getElementById(courseInputId);
            courseInput.classList.remove('hide');
            courseInput.value = courseworkAssessmentTypes[i].assessmentType;
        };

        for (var i = 0; i < finalAssessmentTypes.length; i++) {
            //hide final Delete icons
            let deleteFinalId = "deletef" + finalAssessmentTypes[i].assessmentTypeId;
            let deleteFinalIcon = document.getElementById(deleteFinalId);
            deleteFinalIcon.classList.add('hide');

            //show final Edit Icons
            let editFinalId = "editf" + finalAssessmentTypes[i].assessmentTypeId;
            let editFinalIcon = document.getElementById(editFinalId);
            editFinalIcon.classList.remove('hide');

            //final weights remove disabled attribute
            let inputFinalId = "inputf" + finalAssessmentTypes[i].assessmentTypeId;
            let assessmentTypeWeightFinal = document.getElementById(inputFinalId);
            assessmentTypeWeightFinal.removeAttribute('disabled');
            assessmentTypeWeightFinal.value = finalAssessmentTypes[i].assessmentWeight;

            //hide display assessment-type
            let finalDisplayId = "displayf" + finalAssessmentTypes[i].assessmentTypeId;
            let finalDisplay = document.getElementById(finalDisplayId);
            finalDisplay.classList.add('hide');

            //show input assessment-type
            let finalInputId = "changeNamef" + finalAssessmentTypes[i].assessmentTypeId;
            let finalInput = document.getElementById(finalInputId);
            finalInput.classList.remove('hide');
            finalInput.value = finalAssessmentTypes[i].assessmentType;
        };

        let courseWeight = document.getElementById('assessments-courseWorkWeight');
        let finalWeight = document.getElementById('assessments-finalWeight');

        finalWeight.removeAttribute('disabled');
        courseWeight.removeAttribute('disabled');
        addValidationRulesOnInputs();
    },
    'click .cancel-button': function () {
        doneEditing();
        clearPageValidation();
    },
    'submit .assessmentsTabForm': function () {
        document.getElementById("preloader").style = "";
        const currentCourseId = Session.get('courseId');
        const target = event.target;

        const courseworkAssessmentTypes = CourseWeighting.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).courseworkAssessmentTypes;
        const finalAssessmentTypes = CourseWeighting.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).finalAssessmentTypes;

        let newcourseworkAssessmentTypes = [];
        let newCourseWorkWeight = Number(document.getElementById("assessments-courseWorkWeight").value);

        for (var i = 0; i < courseworkAssessmentTypes.length; i++) {
            let currentId = "inputc" + courseworkAssessmentTypes[i].assessmentTypeId;
            let courseAssessmentTypeWeight = Number(document.getElementById(currentId).value);
            let courseNameId = "changeNamec" + courseworkAssessmentTypes[i].assessmentTypeId;
            let courseAssessmentTypeName = document.getElementById(courseNameId).value;
            let courseAssessmentTypeObject = { assessmentType: courseAssessmentTypeName, assessmentWeight: courseAssessmentTypeWeight, assessmentTypeId: courseworkAssessmentTypes[i].assessmentTypeId };
            newcourseworkAssessmentTypes[newcourseworkAssessmentTypes.length] = courseAssessmentTypeObject;
        }

        let newfinalAssessmentTypes = [];
        let newFinalWeight = Number(document.getElementById("assessments-finalWeight").value);

        for (var i = 0; i < finalAssessmentTypes.length; i++) {
            let currentId = "inputf" + finalAssessmentTypes[i].assessmentTypeId;
            let finalAssessmentTypeWeight = Number(document.getElementById(currentId).value);
            let courseNameId = "changeNamef" + finalAssessmentTypes[i].assessmentTypeId;
            let finalAssessmentTypeName = document.getElementById(courseNameId).value;
            let finalAssessmentTypeObject = { assessmentType: finalAssessmentTypeName, assessmentWeight: finalAssessmentTypeWeight, assessmentTypeId: finalAssessmentTypes[i].assessmentTypeId };
            newfinalAssessmentTypes[newfinalAssessmentTypes.length] = finalAssessmentTypeObject;
        }

        //update assessmentTypeWeights
        Meteor.call('courseInformation.updateCourseWork', currentCourseId, newcourseworkAssessmentTypes);
        Meteor.call('courseInformation.updateFinalWork', currentCourseId, newfinalAssessmentTypes);
        //update courseWeight and finalWeight
        Meteor.call('courseInformation.updateCourseworkWeight', currentCourseId, newCourseWorkWeight, function (error, result) {
            if (error) {
                console.log(error);
            }
            else {
                Meteor.call('courseInformation.updateFinalWeight', currentCourseId, newFinalWeight, function (err, res) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        Session.set('courseworkWeight', newCourseWorkWeight);
                        Session.set('finalWeight', newFinalWeight);

                        doneEditing();
                        clearPageValidation();

                        //update calculated grades categoryGrades for each student
                        setTimeout(function () {
                            var studentsArray = CalculatedGrades.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).students;
                            for (var q = 0; q < studentsArray.length; q++) {
                                var studentId = studentsArray[q].studentId;
                                if (studentsArray[q].categoryGrades.KGrade) {
                                    var newOverallCategoryGradeK = determineOverallCategoryGrade(Meteor.userId(), currentCourseId, studentId, "K");
                                    console.log(newOverallCategoryGradeK + " is the new K Grade");
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
                            document.getElementById("preloader").style = "display: none";
                        }, 500);
                    }
                });
            }
        });


        // Session.set('courseworkWeight', newCourseWorkWeight);
        // Session.set('finalWeight', newFinalWeight);

        // doneEditing();
        // clearPageValidation();

        // //update calculated grades categoryGrades for each student
        // setTimeout(function () {
        //     var studentsArray = CalculatedGrades.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).students;
        //     for (var q = 0; q < studentsArray.length; q++) {
        //         var studentId = studentsArray[q].studentId;
        //         if (studentsArray[q].categoryGrades.KGrade) {
        //             var newOverallCategoryGradeK = determineOverallCategoryGrade(Meteor.userId(), currentCourseId, studentId, "K");
        //             console.log(newOverallCategoryGradeK + " is the new K Grade");
        //             Meteor.call('calculatedgrades.updateOverallCategoryGrade', Meteor.userId(), currentCourseId, studentId, "K", newOverallCategoryGradeK);
        //         }

        //         if (studentsArray[q].categoryGrades.AGrade) {
        //             var newOverallCategoryGradeA = determineOverallCategoryGrade(Meteor.userId(), currentCourseId, studentId, "A");
        //             Meteor.call('calculatedgrades.updateOverallCategoryGrade', Meteor.userId(), currentCourseId, studentId, "A", newOverallCategoryGradeA);
        //         }

        //         if (studentsArray[q].categoryGrades.TGrade) {
        //             var newOverallCategoryGradeT = determineOverallCategoryGrade(Meteor.userId(), currentCourseId, studentId, "T");
        //             Meteor.call('calculatedgrades.updateOverallCategoryGrade', Meteor.userId(), currentCourseId, studentId, "T", newOverallCategoryGradeT);
        //         }

        //         if (studentsArray[q].categoryGrades.CGrade) {
        //             var newOverallCategoryGradeC = determineOverallCategoryGrade(Meteor.userId(), currentCourseId, studentId, "C");
        //             Meteor.call('calculatedgrades.updateOverallCategoryGrade', Meteor.userId(), currentCourseId, studentId, "C", newOverallCategoryGradeC);
        //         }
        //     }
        //     document.getElementById("preloader").style = "display: none";
        // }, 500);
    },
    'click #addCourseworkAssessmentType': function () {
        $('#addCourseWork').modal({
            dismissible: true,
            complete: function () {
                clearValidation(document.getElementById('addAssessmentTypeForm'));
            }

        });
        $('#addCourseWork').modal('open');
        clearPageValidation();
    },
    'click #addFinalAssessmentType': function () {
        $('#addFinalWork').modal({
            dismissible: true,
            complete: function () {
                clearValidation(document.getElementById('addFinalTypeForm'));
            }

        });
        $('#addFinalWork').modal('open');
        clearPageValidation();
    },
    'click #assessments-save-button': function () {
        document.getElementById('assessmentSettingsTabSubmit').click();
    }
});
