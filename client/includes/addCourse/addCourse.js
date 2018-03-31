import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Courses } from '../../../lib/collections.js';
import { CourseWeighting } from '../../../lib/collections.js';
import { Accounts } from 'meteor/accounts-base';
import { Assessments } from '../../../lib/collections.js';
import jqueryValidation from 'jquery-validation';

import '../../main.html';

function closeAddCourseModal() {
    document.getElementById("addCourseModalForm").reset();
}

Template.addCourse.events({
    'submit .add-form': function () {
        event.preventDefault();

        const target = event.target;
        const course = target.courseName.value;
        const year = document.getElementById("courseYear").value;

        if (course.length <= 15) 

            if (Courses.findOne({ ownerId: Meteor.userId() }) == null) {
                Meteor.call('courses.createFirstCourse', course, year);
            }
            else {
                var teacherInfo = Courses.find({ ownerId: Meteor.userId() }, { _id: 0, ownerId: 0 });
                let newCourseId = 0;
                teacherInfo.forEach(
                    function (doc) {
                        const docLength = doc.courses.length;
                        const lastCourseId = doc.courses[docLength - 1].courseId;
                        newCourseId = lastCourseId + 1;
                    });
                let currentCourses = Courses.findOne({ ownerId: Meteor.userId() }, { _id: 0, ownerId: 0 }).courses;  
                const newCourse = { courseId: newCourseId, courseName: course, courseYear: year };

                currentCourses[newCourseId - 1] = newCourse;
                for (var i = 0; i < currentCourses.length; i++) { 
                    if (currentCourses[i] == null) {
                        currentCourses.splice(i, 1);
                        i--;
                    }
                }
                Meteor.call('courses.addNewCourse', currentCourses, newCourseId);
                Meteor.call('courseInformation.defaultSettings', newCourseId);
            }

            target.courseName.value = "";

            $('#addModal').modal('close');
        }
    },
    'click .addCourseButton': function(){
        document.getElementById('submitaddCourseForm').click();
        return false
    },
    'click .addCourseCancel': function() {
        closeAddCourseModal();
        $('#addModal').modal('close');
    }

});

Template.addCourse.helpers({
    getYear: function () {
        //return yearList = [{year: "2017-2018"}, {year:"2018-2019"}];
        currentYear = new Date().getFullYear();
        option1 = (Number(currentYear) - 1) + "-" + currentYear;
        option2 = currentYear + "-" + (Number(currentYear) + 1);
        option3 = (Number(currentYear) + 1) + "-" + (Number(currentYear) + 2);
        yearlist = [{ year: option1 }, { year: option2 }, { year: option3 }];
        return yearlist
    }
});

Template.addCourse.onRendered(function () {
    $(document).ready(function () {
        $('input#addCourseNameModal, textarea#textarea1').characterCounter();
    });
    $('.addCourseModal').modal({
        dismissible: true, 
        complete: function() { 
            closeAddCourseModal();
        } 
      }
    );
    $("#addCourseModalForm").validate({
        errorClass: 'invalid',
        validClass: 'jquery-validation-valid',
        rules: {
            courseName: {
                required: true,
                maxlength: 15
            },
            courseYearSelect: {
                required: true,
            }
        },
        messages: {
            courseName: {
                maxlength: "Course Names cannot exceed 15 characters."
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
});
