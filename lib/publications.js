import { Meteor } from "meteor/meteor";
import { Tracker } from 'meteor/tracker'
import { Students } from "../lib/collections.js";
import { Assessments } from "../lib/collections.js";
import { Courses } from "../lib/collections.js";
import { CourseWeighting } from "../lib/collections.js";
import { CalculatedGrades } from "../lib/collections.js";
import { Accounts } from 'meteor/accounts-base';
import { CurrentDate } from "../lib/collections.js";

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
            return Meteor.users.find({ _id: Meteor.userId() }, {
                fields: {
                    emails: 1,
                    subscribed: 1
                }
            });
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
        },
        'createPayment'(payload) {
            var braintree = require('braintree');
            var gateway = braintree.connect({
                environment: braintree.Environment.Sandbox,
                // Use your own credentials from the sandbox Control Panel here
                merchantId: '4swbx6vm2kn64w2p',
                publicKey: 'r37t95f7qdbvn4ws',
                privateKey: '12f6b57a5a035805835212056a210ee1'
            });

            var currentUser = Meteor.users.findOne({ _id: Meteor.userId() });
            var potentialExpirationDate = getSubscriptionExpiration();
            const userID = Meteor.userId();

            // Use the payment method nonce here
            var nonceFromTheClient = payload.nonce;
            // Create a new transaction for $20
            gateway.customer.create({
                email: currentUser.emails[0].address,
                paymentMethodNonce: nonceFromTheClient
            }, function (err, result) {

                if (result.success) {
                    var brainTreeID = result.customer.id;
                    var newSubscription = gateway.subscription.create({
                        paymentMethodToken: result.customer.paymentMethods[0].token,
                        planId: "yearly-plan"
                    });

                    newSubscription.then(function (result) {
                        if (result && result.success == true) {
                            console.log(result);
                            Meteor.users.update(
                                { _id:  userID},
                                {
                                    $set:
                                        {
                                            subscribed: {
                                                type: "paid",
                                                expirationDate: getSubscriptionExpiration(userID),
                                                braintreeId: brainTreeID
                                            }
                                        }
                                }
                            );
                        }
                    });
                }
            });
        },
        'giveUserFreeTrial'() {
            Meteor.users.update(
                { _id: Meteor.userId() },
                {
                    $set:
                        {
                            subscribed: {
                                type: "free",
                                expirationDate: getFreeTrailExpiration()
                            }
                        }
                }
            );
        },
        'resendVerificationEmail'() {
            Accounts.sendVerificationEmail(Meteor.userId());
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
            setTimeout(function () { $('#onResetPasswordModal').modal('open'); }, 0);

        });
    });
    Accounts.onEmailVerificationLink(function (token, done) {
        Accounts.verifyEmail(token, function (error) {
            if (!error) {
                var computation = Tracker.autorun(function () {
                    var isModalRendered = Session.get('verifyEmailModalRendered');
                    Session.set('verifyEmailSuccess', true);

                    $('#verifyEmailModal').modal({
                        dismissable: true,
                        complete: function () {
                            Tracker.nonreactive(function () {
                                Session.set('verifyEmailModal', null);
                                Session.set('verifyEmailSuccess', null);
                            });
                            done();
                        }
                    });

                    setTimeout(function () { $('#verifyEmailModal').modal('open'); }, 0);
                });
            } else {
                var computation = Tracker.autorun(function () {
                    var isModalRendered = Session.get('verifyEmailModalRendered');
                    Session.set('verifyEmailSuccess', false);

                    $('#verifyEmailModal').modal({
                        dismissable: true,
                        complete: function () {
                            Tracker.nonreactive(function () {
                                Session.set('verifyEmailModal', null);
                                Session.set('verifyEmailSuccess', null);
                            });
                            done();
                        }
                    });

                    setTimeout(function () { $('#verifyEmailModal').modal('open'); }, 0);
                });
            }
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

function getSubscriptionExpiration(userID) {
    var currentUser;
    var currentExpirationDate;
    var currentDate = new Date();

    if (userID) {
        currentUser = Meteor.users.findOne({ _id: userID });
        currentExpirationDate = new Date(currentUser.subscribed.expirationDate);
        if (currentDate - currentExpirationDate >= 0) {
            currentDate.setFullYear(currentDate.getFullYear() + 1);
            return currentDate;
        } else { //currentDate < currentExpirationDate
            currentExpirationDate.setFullYear(currentExpirationDate.getFullYear() + 1);
            return currentExpirationDate;
        }
    }
}

function getFreeTrailExpiration() {
    var currentDate = new Date();
    currentDate.setMonth(currentDate.getMonth() + 1);
    return currentDate;
}
