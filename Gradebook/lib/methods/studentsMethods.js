import { Courses } from "../collections.js";
import { CourseWeighting } from "../collections.js";
import { Assessments } from "../collections.js";
import { Students } from "../collections.js";
import { Meteor } from "meteor/meteor";

if (Meteor.isServer) {
    Meteor.methods({
        'students.addFirstStudent'(ownerId, courseId, firstName, lastName, grades) {
            Students.update(
                {ownerId: ownerId, courseId: courseId},
                {
                    $set:
                        {"students": [
                            {
                                studentLastName: lastName,
                                studentFirstName: firstName,
                                studentId: "s-1",
                                grades: grades
                            }
                        ]}
            })
        },
        'students.defaultStudentsDocument'(ownerId, courseId){
            Students.insert({
                ownerId: ownerId,
                courseId: courseId,
                students: []
            })
        },
        'students.addNewStudent'(ownerId, courseId, newStudentsDocument) {
            Students.update(
                { ownerId: ownerId, courseId: courseId },
                { $set: {"students": newStudentsDocument} }
            )
        },
        'students.addNewAssessment'(ownerId, courseId, assessmentId){
            var currentStudentsDocument = Students.findOne({ownerId: ownerId, courseId: courseId}).students;
            for (i = 0; i < currentStudentsDocument.length; i++){
                currentStudentsDocument[i].grades[currentStudentsDocument[i].grades.length] = {
                    assessmentId: assessmentId,
                    K: "N/A",
                    A: "N/A",
                    T: "N/A",
                    C: "N/A"
                }
            }
            Meteor.call('students.addNewStudent', ownerId, courseId, currentStudentsDocument)
        },
        'students.deleteAssessment'(ownerId, courseId, assessmentId){
            var currentStudentsDocument = Students.findOne({ownerId: ownerId, courseId: courseId}).students;
            for (i = 0; i < currentStudentsDocument.length; i++){
                for(z = 0; z < currentStudentsDocument[i].grades.length; z++){
                    if (currentStudentsDocument[i].grades[z].assessmentId == assessmentId){
                        currentStudentsDocument[i].grades.splice(z, 1);
                        z = currentStudentsDocument[i].grades.length;
                    }
                }
            }
            Meteor.call('students.addNewStudent', ownerId, courseId, currentStudentsDocument)
        },
        'students.deleteCourseAssessmentType'(ownerId, courseId, assessmentTypeId){
            var currentStudentsDocument = Students.findOne({ownerId: ownerId, courseId: courseId}).students;
            for (i = 0; i < currentStudentsDocument.length; i++){
                for(z = 0; z < currentStudentsDocument[i].grades.length; z++){
                    if (currentStudentsDocument[i].grades[z].assessmentId.slice(0, 2) == assessmentTypeId){
                        currentStudentsDocument[i].grades.splice(z, 1);
                        z--;
                    }
                }
            }
            Meteor.call('students.addNewStudent', ownerId, courseId, currentStudentsDocument)
        },
        'students.insertGrade'(ownerId, courseId, category, studentId, assessmentId, grade){
            var newStudentsArray = Students.findOne({ownerId, courseId}).students;
            for (i = 0; i < newStudentsArray.length; i++){
                if(newStudentsArray[i].studentId == studentId){
                    var grades = newStudentsArray[i].grades;
                    for (z = 0; z < grades.length; z++){
                        if (grades[z].assessmentId == assessmentId){
                            newStudentsArray[i].grades[z][category] = grade;
                            z = grades.length;
                            i = newStudentsArray.length;
                        }
                    }
                }
            }
            Meteor.call('students.addNewStudent', ownerId, courseId, newStudentsArray)
        }
    });
}
