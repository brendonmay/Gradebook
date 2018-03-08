import { Courses } from "../collections.js";
import { CourseWeighting } from "../collections.js";
import { Assessments } from "../collections.js";
import { Students } from "../collections.js";
import { Meteor } from "meteor/meteor";

if (Meteor.isServer) {
    Meteor.methods({
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
        },
        'assessments.updateFinalAssessments'(currentCourseId, newAssessmentTypeObj) {
            Assessments.update(
                { "ownerId": Meteor.userId(), courseId: currentCourseId },
                {
                    $set:
                        { "finalAssessmentTypes": newAssessmentTypeObj }
                }
            );
        },
    });
}
