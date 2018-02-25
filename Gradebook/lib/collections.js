import { Mongo } from "meteor/mongo";
import { Meteor } from "meteor/meteor";
import { check } from 'meteor/check';
import { Accounts } from 'meteor/accounts-base';

//don't forget to remove insecure and then add methods --> meteor remove insecure
export const Courses = new Mongo.Collection("courses");
export const CourseWeighting = new Mongo.Collection("courseWeighting");
export const Assessments = new Mongo.Collection("assessments");

//define our methods

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
    },
    'courses.addNewCourse'(currentCourses) { //add new course
        Courses.update(
            { "ownerId": Meteor.userId() },
            {
                $set:
                    { "courses": currentCourses }
            }
        );
        Meteor.call('assessments.addNewCourse', currentCourses);
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
    'courses.deleteCourse'(currentCourseId, courseObj) {
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
    },

    'courseInformation.defaultSettings'(newCourseId) {
        CourseWeighting.insert({
            ownerId: Meteor.userId(),
            courseId: newCourseId,
            categoryWeighting: { K: 25, A: 25, T: 25, C: 25 },
            courseworkWeight: 70,
            finalWeight: 30,
            courseworkAssessmentTypes: [
                { assessmentType: "Quiz", assessmentWeight: 10, assessmentTypeId: "c1" },
                { assessmentType: "Assignment", assessmentWeight: 25, assessmentTypeId: "c2" },
                { assessmentType: "Test", assessmentWeight: 35, assessmentTypeId: "c3" }
            ],
            finalAssessmentTypes: [
                { assessmentType: "Culminating Task", assessmentWeight: 15, assessmentTypeId: 'f1' },
                { assessmentType: "Final Exam", assessmentWeight: 15, assessmentTypeId: 'f2' }
            ]
        });
    },
    'courseInformation.updateCategories'(currentCourseId, newCategoryWeighting) {
        CourseWeighting.update(
            { "ownerId": Meteor.userId(), courseId: currentCourseId },
            {
                $set:
                    { "categoryWeighting": newCategoryWeighting }
            }
        );
    },
    'courseInformation.addNewCourseWork'(currentCourseId, newcourseworkAssessmentTypes) {
        CourseWeighting.update(
            { "ownerId": Meteor.userId(), courseId: currentCourseId },
            {
                $set:
                    { "courseworkAssessmentTypes": newcourseworkAssessmentTypes }
            }
        );
        Meteor.call('assessments.addNewAssessmentType', currentCourseId, newcourseworkAssessmentTypes);
    },
    'courseInformation.updateCourseWork'(currentCourseId, newcourseworkAssessmentTypes) {
        CourseWeighting.update(
            { "ownerId": Meteor.userId(), courseId: currentCourseId },
            {
                $set:
                    { "courseworkAssessmentTypes": newcourseworkAssessmentTypes }
            }
        );
    },
    'courseInformation.addNewFinalWork'(currentCourseId, newfinalAssessmentTypes) {
        CourseWeighting.update(
            { "ownerId": Meteor.userId(), courseId: currentCourseId },
            {
                $set:
                    { "finalAssessmentTypes": newfinalAssessmentTypes }
            }
        );
        Meteor.call('assessments.addNewFinalType', currentCourseId, newfinalAssessmentTypes);
    },
    'courseInformation.updateFinalWork'(currentCourseId, newfinalAssessmentTypes) {
        CourseWeighting.update(
            { "ownerId": Meteor.userId(), courseId: currentCourseId },
            {
                $set:
                    { "finalAssessmentTypes": newfinalAssessmentTypes }
            }
        );
    },
    'courseInformation.updateCourseworkWeight'(currentCourseId, newCourseWorkWeight) {
        CourseWeighting.update(
            { "ownerId": Meteor.userId(), courseId: currentCourseId },
            {
                $set:
                    { "courseworkWeight": newCourseWorkWeight }
            }
        );
    },
    'courseInformation.updateFinalWeight'(currentCourseId, newFinalWeight) {
        CourseWeighting.update(
            { "ownerId": Meteor.userId(), courseId: currentCourseId },
            {
                $set:
                    { "finalWeight": newFinalWeight }
            }
        );
    },

    'assessments.setUpCourseAssessments'(newCourseId) {
        Assessments.insert({
            ownerId: Meteor.userId(),
            courseId: newCourseId,
            courseAssessmentTypes: [
                { assessmentTypeId: "c1", assessments: [] },
                { assessmentTypeId: "c2", assessments: [] },
                { assessmentTypeId: "c3", assessments: [] }
            ],
            finalAssessmentTypes: [
                { assessmentTypeId: "f1", K: "N/A", A: "N/A", T: "N/A", C: "N/A", Date: "N/A" },
                { assessmentTypeId: "f2", K: "N/A", A: "N/A", T: "N/A", C: "N/A", Date: "N/A" }
            ]
        });
    },
    'assessments.addNewCourse'(currentCourses) {
        const assessments = Assessments.find({ "ownerId": Meteor.userId() });
        //find new course that was added 
        for (var i = 0; i < currentCourses.length; i++) {
            var currentCoursesId = currentCourses[i].courseId;
            var doesCourseExist = false;
            assessments.forEach(
                function (doc) {
                    if (currentCoursesId == doc.courseId) {
                        doesCourseExist = true;
                        return false;
                    }
                }
            )
            if (!doesCourseExist) {
                Meteor.call('assessments.setUpCourseAssessments', currentCoursesId);
                break;
            }
        }
    },
    'assessments.addNewAssessmentType'(currentCourseId, assessmentTypeObj) {
        const assessments = Assessments.findOne({ "ownerId": Meteor.userId(), courseId: currentCourseId });
        var newCourseAssessmentTypes = [];
        for (var index = 0; index < assessmentTypeObj.length; index++) {
            const assessmentId = assessmentTypeObj[index].assessmentTypeId;
            var sameAssessmentIndex = -1;
            for (var i = 0; i < assessments.courseAssessmentTypes.length; i++) {
                const assessment = assessments.courseAssessmentTypes[i];
                if (assessment.assessmentId == assessmentId) {
                    sameAssessmentIndex = i;
                    break;
                }
            }
            if (sameAssessmentIndex != -1) {
                const assessment = assessments.courseAssessmentTypes[sameAssessmentIndex].assessments;
                const assessmentType = {
                    assessmentTypeId: assessmentId,
                    assessments: assessment
                };
                newCourseAssessmentTypes.push(assessmentType);
            }
            else {
                const assessmentType = {
                    assessmentTypeId: assessmentId,
                    assessments: []
                };
                newCourseAssessmentTypes.push(assessmentType);
            }

        }
        Assessments.update(
            { "ownerId": Meteor.userId(), courseId: currentCourseId },
            {
                $set:
                    { "courseAssessmentTypes": newCourseAssessmentTypes }
            }
        );

    },
    'assessments.addNewFinalType'(currentCourseId, finalTypeObj) {
        const assessments = Assessments.findOne({ "ownerId": Meteor.userId(), courseId: currentCourseId });
        var newFinalAssessmentTypes = [];
        for (var i = 0; i < finalTypeObj.length; i++) {
            const currentFinalID = finalTypeObj[i].assessmentTypeId;
            var sameAssessmentIndex = -1;
            for (var i = 0; i < assessments.finalAssessmentTypes.length; i++) {
                const assessment = assessments.finalAssessmentTypes[i];
                if (assessment.assessmentTypeId == currentFinalID) {
                    sameAssessmentIndex = i;
                    break;
                }
            }
            if (sameAssessmentIndex != -1) {
                const assessment = assessments.finalAssessmentTypes[sameAssessmentIndex];
                const assessmentType = {
                    assessmentTypeId: currentFinalID,
                    K: assessment.K,
                    A: assessment.A,
                    T: assessment.T,
                    C: assessment.C
                };
                newFinalAssessmentTypes.push(assessmentType);
            }
            else {
                const assessmentType = {
                    assessmentTypeId: currentFinalID,
                    K: "N/A",
                    A: "N/A",
                    T: "N/A",
                    C: "N/A",
                    Date: "N/A"
                };
                newFinalAssessmentTypes.push(assessmentType);
            }
        }

        Assessments.update(
            { "ownerId": Meteor.userId(), courseId: currentCourseId },
            {
                $set:
                    { "finalAssessmentTypes": newFinalAssessmentTypes }
            }
        );
    },
    'assessments.deleteCourse'(currentCourseId, currentCourses) {
        Assessments.remove({ "ownerId": Meteor.userId(), "courseId": currentCourseId })
    },
    'assessments.updateAssessments'(currentCourseId, newAssessmentTypeObj) {
        Assessments.update(
            { "ownerId": Meteor.userId(), courseId: currentCourseId },
            {
                $set:
                    { "courseAssessmentTypes": newAssessmentTypeObj }
            }
        );
    }
});
