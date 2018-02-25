import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base'


Meteor.startup(() => {
  // code to run on server at startup
});

Meteor.publish("users", function () {
  console.log("users");
  return Meteor.users.find();
});





