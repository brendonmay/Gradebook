import { CalculatedGrades } from "../collections.js";
import { Meteor } from "meteor/meteor";

if (Meteor.isServer) {
    Meteor.methods({
        'calculatedgrades.defaultSetup'(ownerId, courseId){
            CalculatedGrades.insert({
                ownerId,
                courseId,
                students: []
            })
        },
        'calculatedgrades.deleteCourse'(){

        },
        'calculatedgrades.addFirstStudent'(){

        },
        'calculatedgrades.addStudent'(){

        },
        'calculatedgrades.deleteStudent'(){

        },
        'calculatedgrades.addNewAssessmentType'(){

        },
        'calculatedgrades.deleteAssessmentType'(){

        },
        'calculatedgrades.addNewAssessment'(){

        },
        'calculatedgrades.deleteAssessment'(){

        },
        'calculatedgrades.updateAssessmentGrade'(assessmentId, KGrade, AGrade, TGrade, CGrade){

        },
        'calculatedgrades.updateAssessmentTypeGrade'(assessmentTypeId, KGrade, AGrade, TGrade, CGrade){

        }
    });
}