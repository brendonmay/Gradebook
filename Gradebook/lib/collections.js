import { Mongo } from "meteor/mongo";
import { Meteor } from "meteor/meteor";
import { check } from 'meteor/check';

//don't forget to remove insecure and then add methods --> meteor remove insecure
export const Courses = new Mongo.Collection("courses")

//define our methods

Meteor.methods({
    'courses.createFirstCourse'(course, year){
        Courses.insert({
            ownerId: Meteor.userId(),
            courses:[
                {courseId: 1, courseName: course, courseYear: year}
            ]
        });
    },
    'courses.updateCourses'(currentCourses){
        Courses.update(
            {"ownerId": Meteor.userId()},
            {$set:
                {"courses": currentCourses}
            }
        );
    },
});
