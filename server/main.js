import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Mongo } from "meteor/mongo";

Meteor.startup(() => {
  // code to run on server at startup
  var braintree = require("braintree");

  var gateway = braintree.connect({
    environment: braintree.Environment.Sandbox,
    merchantId: "4swbx6vm2kn64w2p",
    publicKey: "r37t95f7qdbvn4ws",
    privateKey: "12f6b57a5a035805835212056a210ee1"
  });

  var checkout = require('../lib/routes/checkout');
});