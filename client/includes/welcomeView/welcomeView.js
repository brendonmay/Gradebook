import { Template } from 'meteor/templating';

Template.welcomeView.onRendered(function(){
    //document.getElementById("preloader-main").style = "display: none";
    document.getElementById("preloader-full").style = "display: none";
    $('ul.tabs').tabs();
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