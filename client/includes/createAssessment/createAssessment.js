import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Courses } from '../../../lib/collections.js';
import { Accounts } from 'meteor/accounts-base';
import { CourseWeighting } from '../../../lib/collections.js';
import { Assessments } from '../../../lib/collections.js';
import jqueryValidation from 'jquery-validation';
import '../../main.html';

function closeCreateAssessmentModal() {
    //clear the input fields
    document.getElementById("mustHaveOneErrorMessage").style.display = "none";
    var form = document.getElementById("createAssessmentFormId");
    form.reset();
    clearValidation(form);

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
        let courseWeighting = CourseWeighting.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId });
        if (courseWeighting && courseWeighting.courseworkAssessmentTypes) {
            let courseworkAssessmentTypes = courseWeighting.courseworkAssessmentTypes;
            return courseworkAssessmentTypes
        }
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
                var errorElement = document.getElementById(inputId + "-error");
                if (errorElement) {
                    errorElement.remove();
                }
                inputField.classList.remove("invalid");
                inputField.value = "N/A";
            }

            else if (element.hasAttribute("checked") == false) {
                element.setAttribute("checked", "checked");
                inputField.disabled = false;
                inputField.value = "";
                inputField.focus();
            }
        }
    },

    'submit .createAssessmentForm': function (event) {
        event.preventDefault();
        let currentCourseId = Session.get('courseId');
        let assessmentType = document.getElementById("assessmentType").value;
        var assessmentDate = document.getElementById("createNewAssessmentDate").value;
        let assessmentName = document.getElementById("createNewAssessment").value;

        var markK = document.getElementById("inputMarkK").value;
        var markA = document.getElementById("inputMarkA").value;
        var markT = document.getElementById("inputMarkT").value;
        var markC = document.getElementById("inputMarkC").value;

        if ((markK == "" || markK == "N/A") &&
            (markA == "" || markA == "N/A") &&
            (markT == "" || markT == "N/A") &&
            (markC == "" || markC == "N/A")) {

            document.getElementById("mustHaveOneErrorMessage").style.display = "";
            return false;
        } else {
            document.getElementById("mustHaveOneErrorMessage").style.display = "none";
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
        if (assessmentDate == "") {
            assessmentDate = "N/A"
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
                    Meteor.call('students.addNewAssessment', Meteor.userId(), currentCourseId, assessmentTypeId + "-" + 1);
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
                    Meteor.call('students.addNewAssessment', Meteor.userId(), currentCourseId, newAssessmentId);
                    //console.log("We are on index # " + i + " which is assessment Type: " + assessmentType + ". You are NOT making the first assessment of this type. Here is the updated newAssessmentObjects: " + newAssessmentObjects);
                }
            }
        }
        Session.set("gradebookUpdated", true);
        Meteor.call('assessments.updateAssessments', currentCourseId, newAssessmentObjects);
        closeCreateAssessmentModal();
    },

    'click #createAssessmentCancel': function () {
        closeCreateAssessmentModal();
        $('.createAssessmentModal').modal('close');
    }
});

Template.createAssessment.onRendered(function () {
    // $('.datepicker').pickadate({
    //     selectMonths: true, // Creates a dropdown to control month
    //     selectYears: 15, // Creates a dropdown of 15 years to control year,
    //     today: 'Today',
    //     clear: 'Clear',
    //     close: 'Ok',
    //     container: '#modalsWithDatePicker',
    //     closeOnSelect: false // Close upon selecting a date,
    // });
    $.validator.addMethod('isInteger', (input) => {
        return (input == "N/A" || Math.floor(input) == input);
    });
    $.validator.addMethod('isPositive', (input) => {
        return (input > 0 && input != "");
    });
    // $('.createAssessmentModal').modal({
    //     dismissible: true, // Modal can be dismissed by clicking outside of the modal
    //     complete: function () {
    //         closeCreateAssessmentModal();
    //     }
    // });
    $("#createAssessmentFormId").validate({
        errorClass: 'invalid',
        validClass: 'jquery-validation-valid',
        rules: {
            marksK: {
                required: true,
                isInteger: true,
                isPositive: true
            },
            marksA: {
                required: true,
                isInteger: true,
                isPositive: true
            },
            marksT: {
                required: true,
                isInteger: true,
                isPositive: true
            },
            marksC: {
                required: true,
                isInteger: true,
                isPositive: true
            },
            assessmentTypeSelect: {
                required: true
            },
            assessmentName: {
                required: true
            }
        },
        messages: {
            marksK: {
                isInteger: "A selected category's mark must be an integer.",
                isPositive: "A selected category's mark must be greater than 0."
            },
            marksA: {
                isInteger: "A selected category's mark must be an integer.",
                isPositive: "A selected category's mark must be greater than 0."
            },
            marksT: {
                isInteger: "A selected category's mark must be an integer.",
                isPositive: "A selected category's mark must be greater than 0."
            },
            marksC: {
                isInteger: "A selected category's mark must be an integer.",
                isPositive: "A selected category's mark must be greater than 0."
            }
        },
        errorElement: 'div',
        errorPlacement: function (error, element) {
            document.getElementById("mustHaveOneErrorMessage").style.display = "none";
            var placement = $(element).data('error');
            if (placement) {
                $(placement).append(error)
            } else {
                error.insertAfter(element);
            }
        }
    });
});