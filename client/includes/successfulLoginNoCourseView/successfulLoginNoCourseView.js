import { Template } from 'meteor/templating';

Template.successfulLoginNoCourseView.onRendered(function(){
    //document.getElementById("preloader-main").style = "display: none";
    document.getElementById("preloader-full").style = "display: none";
    $('.slider').slider();
});