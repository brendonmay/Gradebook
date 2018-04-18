import { Template } from 'meteor/templating';

Template.welcomeView.onRendered(function(){
    $('ul.tabs').tabs();
    if (Meteor.loggingIn()) {
        document.getElementById("blurredSideNav").style = "";
        document.getElementById("preloader").style = "";
    }
    if(Session.get('loggedOut') == true){
        document.getElementById("blurredSideNav").style = "display: none";
        document.getElementById("preloader").style = "display: none";
        Session.set('loggedOut', false);
    }
});

Template.welcomeView.events({
    'click #left-arrow': function(){
        var gradebookTab = document.getElementById("gradebookDetailTab");
        var studentReportsTab = document.getElementById("studentReportsDetailTab");
        var populatingGradebookTab = document.getElementById("createAssessmentDetailTab");
        var assessmentSettingsTab = document.getElementById("assessmentSettingsDetailTab");
        var categoryWeightingsTab = document.getElementById("categoryWeightingDetailTab");

        if(categoryWeightingsTab.classList.contains("active")){
            assessmentSettingsTab.click();
            return false
        }
        if(assessmentSettingsTab.classList.contains("active")){
            populatingGradebookTab.click();
            return false
        }
        if(populatingGradebookTab.classList.contains("active")){
            studentReportsTab.click();
            return false
        }
        if(studentReportsTab.classList.contains("active")){
            gradebookTab.click();
            return false
        }

    },
    'click #right-arrow': function(){
        var gradebookTab = document.getElementById("gradebookDetailTab");
        var studentReportsTab = document.getElementById("studentReportsDetailTab");
        var populatingGradebookTab = document.getElementById("createAssessmentDetailTab");
        var assessmentSettingsTab = document.getElementById("assessmentSettingsDetailTab");
        var categoryWeightingsTab = document.getElementById("categoryWeightingDetailTab");

        if (gradebookTab.classList.contains("active")){
            studentReportsTab.click();
            return false
        }
        if (studentReportsTab.classList.contains("active")){
            populatingGradebookTab.click();
            return false
        }
        if (populatingGradebookTab.classList.contains("active")){
            assessmentSettingsTab.click();
            return false
        }
        if (assessmentSettingsTab.classList.contains("active")){
            categoryWeightingsTab.click();
            return false
        }
    },
});