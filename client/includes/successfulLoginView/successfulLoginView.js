import { Template } from 'meteor/templating';

Template.successfulLoginView.onRendered(function(){
    //document.getElementById("preloader-main").style = "display: none";
    document.getElementById("preloader-full").style = "display: none";
    $('.slider').slider();
});

Template.successfulLoginView.events({
    'click #subscription-link': function(){
        $('#paymentModalId').modal('open');
    }
})