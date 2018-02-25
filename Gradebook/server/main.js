import { Meteor } from 'meteor/meteor';


Meteor.startup(() => {
  // code to run on server at startup
});

Meteor.publish("users", function(){
  return Meteor.users.find();
})

//this is where my issue is for password error login
Meteor.methods({
  'checkPassword' : function(email, hashPassword){
    // check(hashPassword, String);
    const user = Meteor.users.find({"emails.address" : email}).fetch();
    console.log("server side: " + user[0]);
      var password = {hashPasword: hashPasword, algorithm: 'sha-256'};
      var result = Accounts._checkPassword(user[0], password);
      return result.error == null;
  }
});