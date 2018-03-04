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
    });
}
