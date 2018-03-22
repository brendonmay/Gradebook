import { CalculatedGrades } from "../collections.js";
import { Meteor } from "meteor/meteor";

if (Meteor.isServer) {
    Meteor.methods({
        'calculatedgrades.defaultSetup'(){

        },
    });
}