import { Meteor } from "meteor/meteor";

if (Meteor.isClient){
    Meteor.subscribe("courses");
    Meteor.subscribe("courseWeighting");
    Meteor.subscribe("assessments");
    Meteor.subscribe("students");
    Meteor.subscribe("allUsers");
}