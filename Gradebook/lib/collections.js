import { Mongo } from "meteor/mongo";
import { Meteor } from "meteor/meteor";
import { check } from 'meteor/check';

export const Courses = new Mongo.Collection("courses")

//define our methods

Meteor.methods({
    'courses.create'(){

    }
});
