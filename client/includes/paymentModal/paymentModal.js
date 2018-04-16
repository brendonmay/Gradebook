import { Template } from 'meteor/templating';
import { Accounts } from 'meteor/accounts-base';
import { Meteor } from "meteor/meteor";

import '../../main.html';

// Template.paymentModal.events({
//     "click #submit-button": function (createErr, instance) {
//         event.requestPaymentMethod(function (requestPaymentMethodErr, payload) {
//             // When the user clicks on the 'Submit payment' button this code will send the
//             // encrypted payment information in a variable called a payment method nonce
//             Meteor.call('createPayment', payload, function () {
//                 var currentUser = Meteor.users.findOne({ _id: Meteor.userId() });
//                 console.log(currentUser);
//                 if (currentUser.subscribed.type == "paid") {
//                     $('#paymentModalId').modal('close');
//                     $('#successfulPayment').modal('open');
//                 }
//             });
//         });
//     },
// })