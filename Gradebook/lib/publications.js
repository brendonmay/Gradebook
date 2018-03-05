import { Meteor } from "meteor/meteor";
import { Students } from "../lib/collections.js";
import { Assessments } from "../lib/collections.js";
import { Courses } from "../lib/collections.js";
import { CourseWeighting } from "../lib/collections.js";

if (Meteor.isServer) {
    Meteor.publish('students', function () {
        if (!this.userId) {
            return false;
        }
        else {
            return Students.find({ ownerId: Meteor.userId() })
        }
    });
    Meteor.publish('assessments', function () {
        if (!this.userId) {
            return false;
        }
        else {
            return Assessments.find({ ownerId: Meteor.userId() })
        }
    });
    Meteor.publish('courseWeighting', function () {
        if (!this.userId) {
            return false;
        }
        else {
            return CourseWeighting.find({ ownerId: Meteor.userId() })
        }
    });
    Meteor.publish('courses', function () {
        if (!this.userId) {
            return false;
        }
        else {
            return Courses.find({ ownerId: Meteor.userId() })
        }
    });
    Meteor.publish("users", function () {
        if (Meteor.user() != null) {
            return Meteor.users.find({ ownerId: Meteor.userId() });
        }
        else {
            return false
        }
    });
};