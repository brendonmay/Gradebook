import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Courses } from '../../../lib/collections.js';
import { Accounts } from 'meteor/accounts-base';
import jqueryValidation from 'jquery-validation';

import '../../main.html';

function getYearsArray(){
    let currentYearRange = Session.get('courseYear');
    let largeYear = currentYearRange.slice(5,9);
    let smallYear = largeYear - 1;
    
    let yearOptions = [];
    var startingYear = smallYear - 2;
    for (i = 0; i < 5; i++){
        var lowYear =  startingYear;
        var highYear = lowYear + 1;
        var yearRange = lowYear.toString() + "-" + highYear.toString();
        yearOptions[yearOptions.length] = yearRange;
        startingYear++;
    }
    return yearOptions
}

Template.generalSettingsTab.helpers({
    currentCourse: function () {
        return Session.get('courseName');
    },

    currentYear: function () {
        return Session.get('courseYear');
    },

    getYearsBefore: function (currentYearRange) {
        //let currentYearRange = Session.get('courseYear');
        let largeYear = currentYearRange.slice(5,9);
        let smallYear = largeYear - 1;
        
        let yearOptions = [];
        var startingYear = smallYear - 2;
        for (i = 0; i < 2; i++){
            var lowYear =  startingYear;
            var highYear = lowYear + 1;
            var yearRange = lowYear.toString() + "-" + highYear.toString();
            yearOptions[yearOptions.length] = {year: yearRange};
            startingYear++;
        }
        return yearOptions

    },

    getYearsAfter: function (currentYearRange) {
        //let currentYearRange = Session.get('courseYear');
        let largeYear = currentYearRange.slice(5,9);
        let smallYear = largeYear - 1;
        
        let yearOptions = [];
        var startingYear = smallYear + 1;
        for (i = 0; i < 2; i++){
            var lowYear =  startingYear;
            var highYear = lowYear + 1;
            var yearRange = lowYear.toString() + "-" + highYear.toString();
            yearOptions[yearOptions.length] = {year: yearRange};
            startingYear++;
        }
        return yearOptions

    }
});

Template.generalSettingsTab.events({
    'click .edit-general-settings': function () {
        $('select').material_select();
        $('input#input_text, textarea#textarea1').characterCounter();

        let editButtonElement = document.getElementById("generalSettings-EditButton");
        let saveButtonElement = document.getElementById("generalSettings-SaveButton");
        let cancelButtonElement = document.getElementById("generalSettings-CancelButton");
        let courseName = document.getElementById("generalSettings-courseName");
        let courseYearText = document.getElementById("yearTextId");
        let courseYearDropdown = document.getElementById("yearDropdownId");

        editButtonElement.classList.add("hide");
        saveButtonElement.classList.remove("hide");
        cancelButtonElement.classList.remove("hide");
        courseName.removeAttribute('disabled');
        courseYearText.classList.add('hide');
        courseYearDropdown.classList.remove('hide');

    },
    'submit .generalSettingsForm': function () {
        let saveButtonElement = document.getElementById("generalSettings-SaveButton");
        let editButtonElement = document.getElementById("generalSettings-EditButton");
        let cancelButtonElement = document.getElementById("generalSettings-CancelButton");

        let newCourseName = document.getElementById("generalSettings-courseName").value;
        let newCourseYear = document.getElementById("generalSettings-courseYear").value;
        let oldCourseYear = Session.get('courseYear');

        let courseName = document.getElementById("generalSettings-courseName");
        let courseYearText = document.getElementById("yearTextId");
        let courseYearDropdown = document.getElementById("yearDropdownId");

        // if (newCourseName.length > 15){
        //     Materialize.toast('Your course name is too long.', 5000, 'amber darken-3');
        //     return false
        // }
        // else{
            editButtonElement.classList.remove("hide");
            saveButtonElement.classList.add("hide");
            cancelButtonElement.classList.add("hide");
            courseYearText.classList.remove("hide");
            courseYearDropdown.classList.add("hide");
            courseName.disabled = true;

            const currentCourseId = Session.get('courseId');

            var courseInfo = Courses.find({ ownerId: Meteor.userId() }, { _id: 0, ownerId: 0 });
            var courseObj = [];

            courseInfo.forEach(
                function (doc) {
                    const docLength = doc.courses.length;
                    let courses = doc.courses;
                    for (var i = 0; i < docLength; i++) {
                        if (courses[i].courseId == currentCourseId) {
                            const newCourseInfo = {
                                courseId: currentCourseId,
                                courseName: newCourseName,
                                courseYear: newCourseYear
                            };
                            courseObj.push(newCourseInfo);
                        }
                        else {
                            courseObj.push(courses[i]);
                        }
                    }
                }
            );
            Session.set('courseName', newCourseName);
            Session.set('courseYear', newCourseYear);

            Meteor.call('courses.updateCourseNameAndYear', currentCourseId, courseObj);

            //highlight correct course after changing year
            if (document.getElementById(oldCourseYear) != null){
                document.getElementById(oldCourseYear).click();
                document.getElementById(oldCourseYear).click();
            }
        // }
        return false;
    },
    'click .cancel-general-settings': function () {
        let editButtonElement = document.getElementById("generalSettings-EditButton");
        let saveButtonElement = document.getElementById("generalSettings-SaveButton");
        let cancelButtonElement = document.getElementById("generalSettings-CancelButton");
        let courseName = document.getElementById("generalSettings-courseName");
        let courseYearText = document.getElementById("yearTextId");
        let courseYearDropdown = document.getElementById("yearDropdownId");

        courseName.value = Session.get('courseName');
        courseYear.value = Session.get('courseYear');

        editButtonElement.classList.remove("hide");
        saveButtonElement.classList.add("hide");
        cancelButtonElement.classList.add("hide");
        courseYearText.classList.remove("hide");
        courseYearDropdown.classList.add("hide");

        courseName.disabled = true;

        let yearsArray = getYearsArray();

        //find the option that is selected
        for(i = 0; i < yearsArray.length; i++){
            let potentialId = "GS-Id" + yearsArray[i];
            let potentialSelectedOption = document.getElementById(potentialId);
            if(potentialSelectedOption != null){
                if (potentialSelectedOption.hasAttribute("active")){
                    potentialSelectedOption.removeAttribute("active");
                    break
                }
            }
        }

        //make currentyear get selected
        let currentYearSelectItem = document.getElementById("selectCurrentYear");
        currentYearSelectItem.selected = true;
    },
    'click .save-general-settings': function() {
        document.getElementById('submitGeneralSettings').click();
        return false;
    }
});

Template.editStudent.onRendered(function () {

    $("#generalSettingsFormID").validate({
        errorClass: 'invalid',
        validClass: 'jquery-validation-valid',
        rules: {
            courseName: {
                required: true,
                maxlength: 15
            },
            courseYear: {
                required: true
            }
        },
        messages: {
            courseName: {
                maxlength: "Course Names cannot exceed 15 characters"
            }
        },
        errorElement: 'div',
        errorPlacement: function (error, element) {
            var placement = $(element).data('error');
            if (placement) {
                $(placement).append(error)
            } else {
                error.insertAfter(element);
            }
        }
    });
    
    $('input#input_text, textarea#textarea1').characterCounter();
});