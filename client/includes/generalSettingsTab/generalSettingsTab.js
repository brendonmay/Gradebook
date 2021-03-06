import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Courses } from '../../../lib/collections.js';
import { Accounts } from 'meteor/accounts-base';
import jqueryValidation from 'jquery-validation';

import '../../main.html';

function highlightCorrectCourse(removePreloader) {
    Tracker.afterFlush(function () {
        var newCourseYear = Session.get('courseYear');
        var currentCourseId = Session.get('courseId');
        removeAllActiveAndGreen();
        if (currentCourseId != 0 && document.getElementById("sideNav" + currentCourseId)) {
            var currentSideNavCourse = document.getElementById("sideNav" + currentCourseId);
            currentSideNavCourse.classList.add("active");
            currentSideNavCourse.classList.add("green");
        }
        var courseYear = document.getElementById("" + newCourseYear);
        if (courseYear && !courseYear.classList.contains("active")) {
            courseYear.click();
        }
        if(removePreloader){
            document.getElementById("preloaderSideNav").style = "display:none";
        }
    });
}

function removeAllActiveAndGreen() {
    var allCoursesInDropdown = document.getElementsByClassName('course-dropdown');
    if (allCoursesInDropdown) {
        for (var i = 0; i < allCoursesInDropdown.length; i++) {
            var course = allCoursesInDropdown[i];
            if (course.classList.contains("active")) {
                course.classList.remove("active");
            }
            if (course.classList.contains("green")) {
                course.classList.remove("green");
            }
        }
    }
}

function getYearsArray() {
    let currentYearRange = Session.get('courseYear');
    let largeYear = currentYearRange.slice(5, 9);
    let smallYear = largeYear - 1;

    let yearOptions = [];
    var startingYear = smallYear - 2;
    for (i = 0; i < 5; i++) {
        var lowYear = startingYear;
        var highYear = lowYear + 1;
        var yearRange = lowYear.toString() + "-" + highYear.toString();
        yearOptions[yearOptions.length] = yearRange;
        startingYear++;
    }
    return yearOptions
}

function ifNewCourseYear(activeElements) {
    return new Promise(function (resolve, reject) {
        for (i = 0; i < activeElements.length; i++) {
            var activeElement = activeElements[i];
            if (activeElement.classList.contains('course-dropdown')) {
                //console.log("found the element thats highlighted: " + activeElements[i]);
                activeElements[i].classList.remove("active");
                activeElements[i].classList.remove("green");
                i = activeElements.length;
            }
        }
        resolve();
    })
}

function clickNewCourseYear(newCourseYear) {
    return new Promise(function (resolve, reject) {
        // document.getElementById(newCourseYear).click();
        // console.log("clicked newCourseDropdownYear")
        resolve();
    })
}

function clearPageValidation() {
    var pageForm = document.getElementById('generalSettingsFormID');
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

Template.generalSettingsTab.helpers({
    currentCourse: function () {
        return Session.get('courseName');
    },

    currentYear: function () {
        return Session.get('courseYear');
    },

    getYearsBefore: function (currentYearRange) {
        //let currentYearRange = Session.get('courseYear');
        let largeYear = currentYearRange.slice(5, 9);
        let smallYear = largeYear - 1;

        let yearOptions = [];
        var startingYear = smallYear - 2;
        for (i = 0; i < 2; i++) {
            var lowYear = startingYear;
            var highYear = lowYear + 1;
            var yearRange = lowYear.toString() + "-" + highYear.toString();
            yearOptions[yearOptions.length] = { year: yearRange };
            startingYear++;
        }
        return yearOptions

    },

    getYearsAfter: function (currentYearRange) {
        //let currentYearRange = Session.get('courseYear');
        let largeYear = currentYearRange.slice(5, 9);
        let smallYear = largeYear - 1;

        let yearOptions = [];
        var startingYear = smallYear + 1;
        for (i = 0; i < 2; i++) {
            var lowYear = startingYear;
            var highYear = lowYear + 1;
            var yearRange = lowYear.toString() + "-" + highYear.toString();
            yearOptions[yearOptions.length] = { year: yearRange };
            startingYear++;
        }
        return yearOptions

    }
});

Template.generalSettingsTab.events({
    'click .edit-general-settings': function () {
        $('#generalSettings-courseYear').material_select();

        $('input#input_text, textarea#textarea1').characterCounter();

        let editButtonElement = document.getElementById("generalSettings-EditButton");
        let saveButtonElement = document.getElementById("generalSettings-SaveButton");
        let cancelButtonElement = document.getElementById("generalSettings-CancelButton");
        let courseName = document.getElementById("generalSettingsCourseName");
        let courseYearText = document.getElementById("yearTextId");
        let courseYearDropdown = document.getElementById("yearDropdownId");

        editButtonElement.classList.add("hide");
        saveButtonElement.classList.remove("hide");
        cancelButtonElement.classList.remove("hide");
        courseName.removeAttribute('disabled');
        courseYearText.classList.add('hide');
        courseYearDropdown.classList.remove('hide');
        clearPageValidation();

    },
    'submit .generalSettingsForm': function () {
        let newCourseYear = document.getElementById("generalSettings-courseYear").value;
        let oldCourseYear = Session.get('courseYear');

        let promiseToDoGeneralSettingsWork = new Promise(function (resolve, reject) {
            let saveButtonElement = document.getElementById("generalSettings-SaveButton");
            let editButtonElement = document.getElementById("generalSettings-EditButton");
            let cancelButtonElement = document.getElementById("generalSettings-CancelButton");

            let newCourseName = document.getElementById("generalSettingsCourseName").value;

            let courseName = document.getElementById("generalSettingsCourseName");
            let courseYearText = document.getElementById("yearTextId");
            let courseYearDropdown = document.getElementById("yearDropdownId");

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

            clearPageValidation();

            resolve();
        });

        //highlight correct course after changing year
        promiseToDoGeneralSettingsWork.then(function () {
            var activeElements = document.getElementsByClassName("active");
            var activeElement
            for (i = 0; i < activeElements.length; i++) {
                var activeElement = activeElements[i];
                if (activeElement.classList.contains('course-dropdown')) {
                    //console.log("found the element thats highlighted: " + activeElements[i].id);
                    // activeElements[i].classList.remove("active");
                    // activeElements[i].classList.remove("green");
                    i = activeElements.length;
                }
            }

            if (oldCourseYear != newCourseYear) {
                document.getElementById("preloaderSideNav").style = "";
                activeElement.classList.remove("active");
                activeElement.classList.remove("green");

                setTimeout(function () {
                    // ifNewCourseYear(activeElements).then(function () {
                    clickNewCourseYear(newCourseYear).then(function () {
                        highlightCorrectCourse(true);
                        // setTimeout(function () {
                        //     var courseId = Session.get('courseId');
                        //     document.getElementById(courseId).parentElement.classList.add("active");
                        //     document.getElementById(courseId).parentElement.classList.add("green");
                        //     document.getElementById("preloaderSideNav").style = "display:none";
                        // }, 1000);
                    });
                    // });
                }, 1000);
            }
        });
        return false;
    },
    'click .cancel-general-settings': function () {
        let editButtonElement = document.getElementById("generalSettings-EditButton");
        let saveButtonElement = document.getElementById("generalSettings-SaveButton");
        let cancelButtonElement = document.getElementById("generalSettings-CancelButton");
        let courseName = document.getElementById("generalSettingsCourseName");
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
        for (i = 0; i < yearsArray.length; i++) {
            let potentialId = "GS-Id" + yearsArray[i];
            let potentialSelectedOption = document.getElementById(potentialId);
            if (potentialSelectedOption != null) {
                if (potentialSelectedOption.hasAttribute("active")) {
                    potentialSelectedOption.removeAttribute("active");
                    break
                }
            }
        }

        //make currentyear get selected
        let currentYearSelectItem = document.getElementById("selectCurrentYear");
        currentYearSelectItem.selected = true;
        clearPageValidation();
    },

    'click .save-general-settings': function () {
        document.getElementById('submitGeneralSettings').click();
        return false;
    }
});

Template.generalSettingsTab.onRendered(function () {

    $('#generalSettingsFormID').validate({
        errorClass: 'invalid',
        validClass: 'jquery-validation-valid',
        rules: {
            GScourseName: {
                required: true,
                maxlength: 15
            },
            GScourseYear: {
                required: true
            }
        },
        messages: {
            GScourseName: {
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