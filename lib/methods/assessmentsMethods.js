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
            var courseAssessmentTypes = Assessments.findOne({ ownerId: Meteor.userId(), courseId: currentCourseId }).courseAssessmentTypes;
            var newCourseAssessmentTypes = [];
            for (i = 0; i < assessmentTypeObj.length; i++){
                for (z = 0; z < courseAssessmentTypes.length; z++){
                    if(assessmentTypeObj[i].assessmentTypeId == courseAssessmentTypes[z].assessmentTypeId){
                        newCourseAssessmentTypes[newCourseAssessmentTypes.length] = courseAssessmentTypes[z];
                        z = courseAssessmentTypes.length;
                    }
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
                    Meteor.call('calculatedgrades.addNewAssessmentType', Meteor.userId(), currentCourseId, currentFinalID);
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
        'assessments.unAssignFinal'(currentCourseId, assessmentTypeId) {
            var finalAssessmentTypes = Assessments.findOne({ownerId: Meteor.userId(), courseId: currentCourseId}).finalAssessmentTypes;
            for (var i = 0; i < finalAssessmentTypes.length; i++){
                if(finalAssessmentTypes[i].assessmentTypeId == assessmentTypeId){
                    finalAssessmentTypes[i].K = "N/A";
                    finalAssessmentTypes[i].A = "N/A";
                    finalAssessmentTypes[i].T = "N/A";
                    finalAssessmentTypes[i].C = "N/A";
                    finalAssessmentTypes[i].Date = "N/A";
                    i = finalAssessmentTypes.length;
                }
            }

            Assessments.update(
                { "ownerId": Meteor.userId(), courseId: currentCourseId },
                {
                    $set:
                        { "finalAssessmentTypes": finalAssessmentTypes }
                }
            );
        },
    });
}
