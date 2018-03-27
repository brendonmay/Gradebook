import { Mongo } from "meteor/mongo";
import { Meteor } from "meteor/meteor";
import { check } from 'meteor/check';
import { Accounts } from 'meteor/accounts-base';

export const Courses = new Mongo.Collection("courses");
export const CourseWeighting = new Mongo.Collection("courseWeighting");
export const Assessments = new Mongo.Collection("assessments");
export const Students = new Mongo.Collection("students");
export const CalculatedGrades = new Mongo.Collection('calculatedgrades');
