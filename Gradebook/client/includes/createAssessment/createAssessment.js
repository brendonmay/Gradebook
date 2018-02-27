import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Courses } from '../../../lib/collections.js';
import { Accounts } from 'meteor/accounts-base';
import { CourseWeighting } from '../../../lib/collections.js';
import { Assessments } from '../../../lib/collections.js';

import '../../main.html';

function closeCreateAssessmentModal() {
    //clear the input fields
    document.getElementById("createAssessmentFormId").reset();

    //uncheck the checkboxes
    let checkboxK = document.getElementById("checkboxK");
    let checkboxA = document.getElementById("checkboxA");
    let checkboxT = document.getElementById("checkboxT");
    let checkboxC = document.getElementById("checkboxC");

    if (checkboxK.hasAttribute("checked")) {
        checkboxK.removeAttribute("checked");
    }
    if (checkboxA.hasAttribute("checked")) {
        checkboxA.removeAttribute("checked");
    }
    if (checkboxT.hasAttribute("checked")) {
        checkboxT.removeAttribute("checked");
    }
    if (checkboxC.hasAttribute("checked")) {
        checkboxC.removeAttribute("checked");
    }

    //disable inputs
    let inputMarkK = document.getElementById("inputMarkK");
    let inputMarkA = document.getElementById("inputMarkA");
    let inputMarkT = document.getElementById("inputMarkT");
    let inputMarkC = document.getElementById("inputMarkC");

    inputMarkK.setAttribute('disabled', "disabled")
    inputMarkA.setAttribute('disabled', "disabled")
    inputMarkT.setAttribute('disabled', "disabled")
    inputMarkC.setAttribute('disabled', "disabled")

    //close the modal
    $('#createAssessmentModal').modal('close');
}

Template.createAssessment.helpers({
    getAssessmentTypes: function () {
        let currentCourseId = Session.get('courseId');
        let courseworkAssessmentTypes = CourseWeighting.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).courseworkAssessmentTypes;
        return courseworkAssessmentTypes
    }
});

Template.createAssessment.events({
    'click .check-box': function () {
        let target = event.target;
        let elementId = target.id;
        if (elementId != "dontTarget") {
            let element = document.getElementById(elementId);
            let inputId = "inputMark" + elementId[elementId.length - 1];
            let inputField = document.getElementById(inputId);

            if (element.hasAttribute("checked") == true) {
                element.removeAttribute("checked");
                inputField.disabled = true;
                inputField.value = "N/A"
            }

            else if (element.hasAttribute("checked") == false) {
                element.setAttribute("checked", "checked");
                inputField.disabled = false;
                inputField.value = ""
            }
        }
    },

    'submit .createAssessmentForm': function () {
        let currentCourseId = Session.get('courseId');
        let assessmentType = document.getElementById("assessmentType").value;
        let assessmentDate = document.getElementById("createNewAssessmentDate").value;
        let assessmentName = document.getElementById("createNewAssessment").value;

        var markK = document.getElementById("inputMarkK").value;
        var markA = document.getElementById("inputMarkA").value;
        var markT = document.getElementById("inputMarkT").value;
        var markC = document.getElementById("inputMarkC").value;


        if (markK == "N/A" && markA == "N/A" && markT == "N/A" && markC == "N/A"){
            Materialize.toast('You must assess the students in at least one category.', 5000, 'amber darken-3');
            return false
        }

        if (markK <= 0 || markA <= 0 || markT <= 0 || markC <= 0){
            Materialize.toast("A selected category's mark must be an integer greater than 0.", 5000, 'amber darken-3');
            return false
        }

        if (!( (markK ==  "N/A" || Math.floor(markK) == markK) && (markA ==  "N/A" || Math.floor(markA) == markA) && (markT ==  "N/A" || Math.floor(markT) == markT) && (markC ==  "N/A" || Math.floor(markC) == markC) )){
            Materialize.toast("A selected category's mark must be an integer greater than 0.", 5000, 'amber darken-3');
            return false
        }


        if (markK != "N/A") {
            markK = Number(markK)
        }
        if (markA != "N/A") {
            markA = Number(markA)
        }
        if (markT != "N/A") {
            markT = Number(markT)
        }
        if (markC != "N/A") {
            markC = Number(markC)
        }

        let courseworkAssessmentTypes = CourseWeighting.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).courseworkAssessmentTypes;
        let assessmentObjects = Assessments.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).courseAssessmentTypes;

        var assessmentTypeId = 0;
        for (i = 0; i < courseworkAssessmentTypes.length; i++) {
            if (courseworkAssessmentTypes[i].assessmentType == assessmentType) {
                assessmentTypeId = courseworkAssessmentTypes[i].assessmentTypeId;
                break
            }
        }

        //if not first assessment of this type
        var newAssessmentId = 0;
        var assessmentObject = {};
        var index = 0;
        let newAssessmentObjects = [];
        for (i = 0; i < assessmentObjects.length; i++) {
            if (assessmentObjects[i].assessmentTypeId != assessmentTypeId) {
                newAssessmentObjects[newAssessmentObjects.length] = assessmentObjects[i];
                //console.log("We are on index # " + i + " which is NOT assessment Type: " + assessmentType + ". Here is the updated newAssessmentObjects: " + newAssessmentObjects);
            }
            else {
                let assessments = assessmentObjects[i].assessments;
                index = i;
                //if creating first assessment of this type
                if (assessments.length == 0) {
                    assessmentObject = {
                        assessmentId: assessmentTypeId + "-" + 1,
                        assessmentName: assessmentName,
                        K: markK,
                        A: markA,
                        T: markT,
                        C: markC,
                        Date: assessmentDate
                    }
                    let courseAssessmentTypesObject = {
                        assessmentTypeId: assessmentTypeId,
                        assessments: [assessmentObject]
                    }
                    newAssessmentObjects[newAssessmentObjects.length] = courseAssessmentTypesObject;
                    //console.log("We are on index # " + i + " which is assessment Type: " + assessmentType + ". You are making the first assessment of this type. Here is the updated newAssessmentObjects: " + newAssessmentObjects);
                }

                //otherwise
                else {
                    let mostCurrentAssessmentId = assessments[assessments.length - 1].assessmentId;
                    let newAssessmentIdNumber = Number(mostCurrentAssessmentId.slice(3, mostCurrentAssessmentId.length)) + 1;
                    newAssessmentId = assessmentTypeId + "-" + newAssessmentIdNumber;
                    assessmentObject = {
                        assessmentId: newAssessmentId,
                        assessmentName: assessmentName,
                        K: markK,
                        A: markA,
                        T: markT,
                        C: markC,
                        Date: assessmentDate
                    }
                    //work from here
                    let newAssessmentsArray = []
                    for (z = 0; z < assessments.length; z++) {
                        newAssessmentsArray[newAssessmentsArray.length] = assessments[z];
                    }
                    newAssessmentsArray[newAssessmentsArray.length] = assessmentObject;
                    let courseAssessmentTypesObject = {
                        assessmentTypeId: assessmentTypeId,
                        assessments: newAssessmentsArray
                    }
                    newAssessmentObjects[newAssessmentObjects.length] = courseAssessmentTypesObject;
                    //console.log("We are on index # " + i + " which is assessment Type: " + assessmentType + ". You are NOT making the first assessment of this type. Here is the updated newAssessmentObjects: " + newAssessmentObjects);
                }
            }
        }
        Meteor.call('assessments.updateAssessments', currentCourseId, newAssessmentObjects);
        closeCreateAssessmentModal();
    },

    'click #createAssessmentCancel': function () {
        $('.createAssessmentModal').modal('close');
    }
});

Template.createAssessment.onRendered(function () {
    $('.createAssessmentModal').modal({
        dismissible: true, // Modal can be dismissed by clicking outside of the modal
        complete: function () {
            closeCreateAssessmentModal();
        }
    }
    );
});