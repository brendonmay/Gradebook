import { Courses } from "../collections.js";
import { CourseWeighting } from "../collections.js";
import { Assessments } from "../collections.js";
import { Students } from "../collections.js";

import { Meteor } from "meteor/meteor";

if (Meteor.isServer) {
    Meteor.methods({
        'courses.createFirstCourse'(course, year) {
            Courses.insert({
                ownerId: Meteor.userId(),
                courses: [
                    { courseId: 1, courseName: course, courseYear: year }
                ]
            });
            CourseWeighting.insert({
                ownerId: Meteor.userId(),
                courseId: 1,
                categoryWeighting: { K: 25, A: 25, T: 25, C: 25 },
                courseworkWeight: 70,
                finalWeight: 30,
                courseworkAssessmentTypes: [
                    { assessmentType: "Quiz", assessmentWeight: 10, assessmentTypeId: "c1" },
                    { assessmentType: "Assignment", assessmentWeight: 25, assessmentTypeId: "c2" },
                    { assessmentType: "Test", assessmentWeight: 35, assessmentTypeId: "c3" }
                ],
                finalAssessmentTypes: [
                    { assessmentType: "Culminating Task", assessmentWeight: 15, assessmentTypeId: "f1" },
                    { assessmentType: "Final Exam", assessmentWeight: 15, assessmentTypeId: "f2" }
                ]
            });
            Meteor.call('assessments.setUpCourseAssessments', 1);
            Meteor.call('students.defaultStudentsDocument', Meteor.userId(), 1);
        },
        'courses.addNewCourse'(currentCourses, newCourseId) {
            Courses.update(
                { "ownerId": Meteor.userId() },
                {
                    $set:
                        { "courses": currentCourses }
                }
            );
            Meteor.call('assessments.addNewCourse', currentCourses);
            Meteor.call('students.defaultStudentsDocument', Meteor.userId(), newCourseId);
        },
        'courses.updateCourseNameAndYear'(currentCourseId, courseObj) {
            Courses.update(
                { "ownerId": Meteor.userId() },
                {
                    $set:
                        { "courses": courseObj }
                }
            );
        },
        'courses.deleteCourse'(currentCourseId, courseObj) { //remove students document for the course
            Courses.update(
                { "ownerId": Meteor.userId() },
                {
                    $set:
                        { "courses": courseObj }
                }
            );
            //remove from courseWeightings DB
            var courses = Courses.findOne({ "ownerId": Meteor.userId() }).courses;
            if (courses.length == 0) {
                Courses.remove({ "ownerId": Meteor.userId() });
            }
            CourseWeighting.remove({ "ownerId": Meteor.userId(), "courseId": currentCourseId });
            Meteor.call('assessments.deleteCourse', currentCourseId, courseObj);
            Students.remove({ownerId: Meteor.userId(), courseId: currentCourseId});
        },
    });
}
