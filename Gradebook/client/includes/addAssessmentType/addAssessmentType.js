import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Courses } from '../../../lib/collections.js';
import { Assessments } from '../../../lib/collections.js';
import { Accounts } from 'meteor/accounts-base';
import { CourseWeighting } from '../../../lib/collections.js';

import '../../main.html';

function clearTemplateValidation() {
    var form = document.getElementById('addAssessmentTypeForm');
    clearValidation(form);
}

function assessmentAlreadyExists(newAssessment) {
    const courseId = Session.get("courseId");
    if (courseId == 0) return;
    const courseworkAssessmentTypes = CourseWeighting.findOne({ ownerId: Meteor.userId(), courseId: courseId }).courseworkAssessmentTypes;
    for (var i = 0; i < courseworkAssessmentTypes.length; i++) {
        if (courseworkAssessmentTypes[i].assessmentType.trim() == newAssessment.trim()) {
            Materialize.toast('You already have a Course Assessment Type named: ' + newAssessment, 5000, 'amber darken-3');
            return true;
        }
    }
    return false;
}

function finalAssessmentAlreadyExists(newAssessment) {
    const courseId = Session.get("courseId");
    if (courseId == 0) return;
    const finalAssessmentTypes = CourseWeighting.findOne({ ownerId: Meteor.userId(), courseId: courseId }).finalAssessmentTypes;
    for (var i = 0; i < finalAssessmentTypes.length; i++) {
        if (finalAssessmentTypes[i].assessmentType.trim() == newAssessment.trim()) {
            Materialize.toast('You already have a Final Assessment Type named: ' + newAssessment, 5000, 'amber darken-3');
            return true;
        }
    }
    return false;
}

Template.addAssessmentType.events({
    //type of event is a submit, the element is a form with class add-form, when its called run a function
    'submit .add-final-form': function () {
        const newAssessment = document.getElementById('add-final-type').value;
        const currentCourseId = Session.get('courseId');
        if (finalAssessmentAlreadyExists(newAssessment)) {
            document.getElementById('addFinalTypeForm').reset();
            return;
        }

        let courseInfo = CourseWeighting.findOne(
            { ownerId: Meteor.userId(), courseId: currentCourseId });
        let finalAssessmentTypes = courseInfo.finalAssessmentTypes;

        const courseWorkLength = finalAssessmentTypes.length;
        var newAssessmentTypeId = 0;
        var newAssessmentWeight = 0;

        if (courseWorkLength > 0) {
            newAssessmentTypeId = finalAssessmentTypes[courseWorkLength - 1].assessmentTypeId;
            var reg = /[0-9]/;
            var found = newAssessmentTypeId.match(reg);
            foundNumber = Number(found[0])
            newAssessmentTypeId = newAssessmentTypeId.replace(foundNumber, foundNumber + 1);
        }
        else {
            courseWorkAssessmentType = [];
            newAssessmentTypeId = "f1";
            newAssessmentWeight = courseInfo.finalWeight;
        }

        const newAssessmentType = {
            assessmentType: newAssessment,
            assessmentWeight: newAssessmentWeight,
            assessmentTypeId: newAssessmentTypeId
        };

        finalAssessmentTypes.push(newAssessmentType);

        Meteor.call('courseInformation.addNewFinalWork', currentCourseId, finalAssessmentTypes);

        document.getElementById("addFinalTypeForm").reset();
        clearTemplateValidation();
        //Close Modal
        $('#addFinalWork').modal('close');
    },
    'submit .add-coursework-form': function () {
        const newAssessment = document.getElementById('add-coursework-type').value;
        if (assessmentAlreadyExists(newAssessment)) {
            document.getElementById('addAssessmentTypeForm').reset();
            return;
        }
        const currentCourseId = Session.get('courseId');

        let courseInfo = CourseWeighting.findOne(
            { ownerId: Meteor.userId(), courseId: currentCourseId });
        let courseWorkAssessmentType = courseInfo.courseworkAssessmentTypes;

        const courseWorkLength = courseWorkAssessmentType.length;
        var newAssessmentType = 0;
        var newAssessmentWeight = 0;
        if (courseWorkLength > 0) {
            newAssessmentTypeId = courseWorkAssessmentType[courseWorkLength - 1].assessmentTypeId;
            var reg = /[0-9]/;
            var found = newAssessmentTypeId.match(reg);
            foundNumber = Number(found[0])
            newAssessmentTypeId = newAssessmentTypeId.replace(foundNumber, foundNumber + 1);
        }
        else {
            courseWorkAssessmentType = [];
            newAssessmentTypeId = "c1";
            newAssessmentWeight = courseInfo.courseworkWeight;
        }

        const newAssessmentType = {
            assessmentType: newAssessment,
            assessmentWeight: newAssessmentWeight,
            assessmentTypeId: newAssessmentTypeId
        };

        courseWorkAssessmentType.push(newAssessmentType);

        Meteor.call('courseInformation.addNewCourseWork', currentCourseId, courseWorkAssessmentType);

        var ownerId = Meteor.userId();
        var courseId = Session.get("courseId");
        var newAssessmentTypeObjects = Assessments.findOne({ownerId, courseId}).courseAssessmentTypes;

        var newAssessmentTypeObject = {
            assessmentTypeId: newAssessmentTypeId,
            assessments: []
        };

        newAssessmentTypeObjects[newAssessmentTypeObjects.length] = newAssessmentTypeObject;

        Meteor.call('assessments.updateAssessments', currentCourseId, newAssessmentTypeObjects)

        document.getElementById("addAssessmentTypeForm").reset();
        clearTemplateValidation();
        //Close Modal
        $('#addCourseWork').modal('close');
    }
});

Template.addAssessmentType.onRendered(function () {
    $("#addAssessmentTypeForm").validate({
        errorClass: 'invalid',
        validClass: 'jquery-validation-valid',
        rules: {
            courseWorkName: {
                required: true
            }
        },
        errorElement: 'div',
        errorPlacement: function (error, element) {
            var placement = $(element).data('error');
            if (placement) {
                $(placement).append(error);
            } else {
                error.insertAfter(element);
            }
        }
    });
    $("#addFinalTypeForm").validate({
        errorClass: 'invalid',
        validClass: 'jquery-validation-valid',
        rules: {
            finalCourseWorkName: {
                required: true
            }
        },
        errorElement: 'div',
        errorPlacement: function (error, element) {
            var placement = $(element).data('error');
            if (placement) {
                $(placement).append(error);
            } else {
                error.insertAfter(element);
            }
        }
    });
});