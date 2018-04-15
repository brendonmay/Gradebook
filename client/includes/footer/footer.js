import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';

Template.footer.events({
    'click #feedbackLink': function(){
        $('#feedbackModal').modal({
            complete: function () {
                document.getElementById("email_form").reset();
            }
        });
        $('#feedbackModal').modal('open');
    }
})