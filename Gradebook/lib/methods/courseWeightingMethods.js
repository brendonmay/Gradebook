import { Courses } from "../collections.js";
import { CourseWeighting } from "../collections.js";
import { Assessments } from "../collections.js";
import { Students } from "../collections.js";
import { Meteor } from "meteor/meteor";

if (Meteor.isServer) {
    Meteor.methods({
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
    });
}
