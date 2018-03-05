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
        }
    });
}
