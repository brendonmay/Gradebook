import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';

Template.feedback.onRendered(function () {
    var submitButton = document.getElementById("submit_form");
    var form = document.getElementById("email_form");
    form.addEventListener("submit", function (e) {
        setTimeout(function () {
            submitButton.value = "Sending...";
            submitButton.disabled = true;
        }, 1);
    });
});

Template.feedback.events({
    'submit #email_form': function() {
        $('#feedbackModal').modal('close');
    }
});