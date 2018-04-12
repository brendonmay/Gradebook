import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Mongo } from "meteor/mongo";
import { CurrentDate } from "../lib/collections.js"

Meteor.startup(() => {
  // code to run on server at startup
  var braintree = require("braintree");

  var gateway = braintree.connect({
    environment: braintree.Environment.Sandbox,
    merchantId: "4swbx6vm2kn64w2p",
    publicKey: "r37t95f7qdbvn4ws",
    privateKey: "12f6b57a5a035805835212056a210ee1"
  });

  Meteor.publish('currentdate', function () {
    var today = new Date();
    var currentDate = CurrentDate.findOne();

    if (currentDate != undefined) {
      CurrentDate.update({},
        { $set: { "date": today } }
      );
    }
    else {
      CurrentDate.insert({ date: today });
    }

    return CurrentDate.find({});
  });

  Accounts.emailTemplates.from = "Ontario Gradebook <ontariogradebook@gmail.com>";
  Accounts.emailTemplates.siteName = 'Ontario Gradebook';
  Accounts.emailTemplates.verifyEmail = {
    subject() {
      return "Email Verification";
    },
    text(user, url) {
      return `Hello,\n\nVerify your e-mail by following this link: ${url}\n\nRegards,\nOntario Gradebook Team`;
    }
  };
  Accounts.emailTemplates.resetPassword = {
    subject() {
      return "Reset Your Password";
    },
    text(user, url) {
      return `Hello,\n\nYou can reset your password by following this link: ${url}\n\nRegards,\nOntario Gradebook Team`;
    }
  };
});

var onceEveryDay = new Cron(function () {

  var today = new Date();
  var currentDate = CurrentDate.findOne();

  if (currentDate != undefined) {
    CurrentDate.update({},
      { $set: { "date": today } }
    );
  }
  else {
    CurrentDate.insert({ date: today });
  }

}, {
    minute: 0,
    hour: 0
  });

onceEveryDay;