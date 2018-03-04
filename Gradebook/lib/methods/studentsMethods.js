import { Courses } from "../collections.js";
import { CourseWeighting } from "../collections.js";
import { Assessments } from "../collections.js";
import { Students } from "../collections.js";
import { Meteor } from "meteor/meteor";

if (Meteor.isServer){
    Meteor.methods({
        'students.addFirstStudent'(ownerId, courseId, firstName, lastName) {
            Students.insert({
                ownerId: ownerId,
                courseId: courseId,
                students: [
                    {
                        studentLastName: lastName,
                        studentFirstName: firstName,
                        studentId: "s-1",
                        grades: [] //update this
                    }
                ]
            })
        }
    });
}
