import { Meteor } from "meteor/meteor";
import { Tracker } from 'meteor/tracker'
import { Students } from "../lib/collections.js";
import { Assessments } from "../lib/collections.js";
import { Courses } from "../lib/collections.js";
import { CourseWeighting } from "../lib/collections.js";
import { CalculatedGrades } from "../lib/collections.js";
import { Accounts } from 'meteor/accounts-base';

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
    Meteor.publish('calculatedgrades', function () {
        if (!this.userId) {
            return false;
        }
        else {
            return CalculatedGrades.find({ ownerId: Meteor.userId() })
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
    Meteor.publish("allUsers", function () {
        return Meteor.users.find({}, { fields: { emails: 1 } });
    });
};

if (Meteor.isServer) {
    Meteor.methods({
        'sendResetPassword'(email) {
            var user = Accounts.findUserByEmail(email);
            Accounts.sendResetPasswordEmail(user._id, email);
        }
    });
}

if (Meteor.isClient) {
    Accounts.onResetPasswordLink(function (token, done) {
        Session.set('resetPasswordToken', token);
        // var isModalRendered = Session.get('onResetPasswordModalRendered');
        var computation = Tracker.autorun(function () {
            var isModalRendered = Session.get('onResetPasswordModalRendered');
            
            $('#onResetPasswordModal').modal({
                dismissable: false,
                complete: function () {
                    var newPasswordForm = document.getElementById('onResetPasswordModalForm');
                    newPasswordForm.reset();
                    clearValidation(newPasswordForm);
                    Tracker.nonreactive(function () {
                        Session.set('onResetPasswordModalRendered', null);
                    });
                    done();
                }
            });
            setTimeout(function() {$('#onResetPasswordModal').modal('open');}, 0);
            
        });
    });
}



Meteor.startup(startUp);

function startUp() {
    //i had to change restrictions on the gmail account in order for it to work!!
    var login = encodeURIComponent("ontariogradebook@gmail.com");
    var password = encodeURIComponent("J.Cole2477");
    var domain = "smtp.gmail.com";
    var port = 465;

    process.env.MAIL_URL = "smtps://" + login + ":" + password + "@" + domain + ":" + port;

    // process.env.MAIL_URL = "smtps://ontariogradebook@gmail.com:J.Cole2477@smtp.gmail.com:465";
    Accounts.config({
        sendVerificationEmail: true
    });
}

