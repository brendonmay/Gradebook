import { Template } from 'meteor/templating';
import { Courses } from '../../../lib/collections.js';
import { Students } from '../../../lib/collections.js';
import { Accounts } from 'meteor/accounts-base';

import '../../main.html';

function arrayOfStudentIds() {
  var arrayofStudentIds = [];
  var ownerId = Meteor.userId();
  var courseId = Session.get("courseId");
  var students = Students.findOne({ ownerId, courseId }).students;
  for (i = 0; i < students.length; i++) {
    arrayofStudentIds[arrayofStudentIds.length] = students[i].studentId
  }
  return arrayofStudentIds
};

function updateColorsInGradebook() {
  return new Promise(function (resolve, reject) {
    updateGradebookColors();
    resolve();
  })
}

function gradebookCourseTabClickEvent() {
  var updateCheck = Session.get("gradebookUpdated");

  if (updateCheck) {
    document.getElementById("preloader").style = "";
    setTimeout(function () {
      updateColorsInGradebook().then(function () {
        $("#main_table").tableHeadFixer({ "left": 1, 'head': true });
      });
      document.getElementById("preloader").style = "display: none";
      Session.set("gradebookUpdated", false);
    }, 1000);
  }
}

function findOldStudentGradeValue(studentId, assessmentId, category, ownerId, courseId) {
  var students = Students.findOne({ ownerId: ownerId, courseId: courseId }).students;
  var oldValue = 0;
  for (j = 0; j < students.length; j++) {
    if (students[j].studentId == studentId) {
      var grades = students[j].grades;
      for (k = 0; k < grades.length; k++) {
        if (grades[k].assessmentId == assessmentId) {
          oldValue = grades[k][category];
          k = grades.length;
          j = students.length;
        }
      }
    }
  }
  return oldValue
}

function updateGradebookColors() {
  var categoryCells = document.getElementsByClassName("categoryCell");
  var arrayofStudentIds = arrayOfStudentIds();
  var courseId = Session.get('courseId');

  for (i = 0; i < categoryCells.length; i++) {
    var id = categoryCells[i].id;
    var category = id[0];
    var assessmentId = id.slice(id.indexOf("#") + 1, id.indexOf("%"));
    var categoryValue = id.slice(id.indexOf("%") + 1, id.length);

    if (categoryValue == "-") { //turns disabled ones grey
      categoryCells[i].style = "background-color: #9e9e9e";

      for (z = 0; z < arrayofStudentIds.length; z++) {
        if (category == "C") {
          var studentId = arrayofStudentIds[z];
          if (studentId != "s-0") {
            document.getElementById(category + "?" + studentId + "#" + assessmentId).parentElement.style = "background-color: #9e9e9e; border-right: 1px solid black";
            document.getElementById(category + "?" + studentId + "#" + assessmentId).disabled = "true";
            document.getElementById(category + "?" + studentId + "#" + assessmentId).value = "N/A";
          }
        }
        else {
          var studentId = arrayofStudentIds[z];
          if (studentId != "s-0") {
            document.getElementById(category + "?" + studentId + "#" + assessmentId).parentElement.style = "background-color: #9e9e9e";
            document.getElementById(category + "?" + studentId + "#" + assessmentId).disabled = "true";
            document.getElementById(category + "?" + studentId + "#" + assessmentId).value = "N/A";
          }
        }
      }
    }
    if (categoryValue != "-") { //adds color to enabled ones; work here
      categoryCells[i].style = "";

      for (z = 0; z < arrayofStudentIds.length; z++) {
        var studentId = arrayofStudentIds[z];
        if (studentId != "s-0") {
          document.getElementById(category + "?" + studentId + "#" + assessmentId).parentElement.style = "";
          document.getElementById(category + "?" + studentId + "#" + assessmentId).removeAttribute("disabled");
          var oldValue = findOldStudentGradeValue(studentId, assessmentId, category, Meteor.userId(), courseId);
          document.getElementById(category + "?" + studentId + "#" + assessmentId).value = oldValue;
          if (category == "C") {
            document.getElementById(category + "?" + studentId + "#" + assessmentId).parentElement.style = "border-right: 1px solid black";
          }
        }
      }
    }
  }
};

Template.courseTabsTitles.onRendered(function () {
  this.$('.tabs').tabs();
});

Template.courseTabsTitles.events({
  'click #gradeBookCourseTab': function () {
    //check if a change has been made first by referring to Session Variable
    gradebookCourseTabClickEvent();
    document.getElementById("modalsWithDatePicker").style = "display: none";
  },
  'click #courseSettingsTabId': function () {
    var settingsScreen = Session.get('settingScreenText');
    if (settingsScreen == "General Settings") {
      document.getElementById('generalSettings-CancelButton').click();
    } else if (settingsScreen == "Category Weightings") {
      document.getElementById("categoryWeighting-cancelButton").click();
    } else if (settingsScreen == "Assessments") {
      document.getElementById('assignmentSettings-cancelButton').click();
    }
  },
  'click #studentReportsTabId': function () {
    $('#studentReportsDropdown').material_select();
    if (Session.get("currentSelectedStudentID") == "0") {
      let listedStudents = document.getElementById("slide-out-studentReport").children;
      if (listedStudents.length != 0) {
        document.getElementById("slide-out-studentReport").children[0].children[0].click();
      }
    }
    else {
      let listedStudents = document.getElementById("slide-out-studentReport").children;
      for (var i = 0; i < listedStudents.length; i++) {
        if (document.getElementById("slide-out-studentReport").children[i].children[0].classList.contains("active")) {
          document.getElementById("slide-out-studentReport").children[i].children[0].click();
          i = listedStudents.length;
        }
      }
    }
  },
  'click #assessmentsTabId': function () {
    document.getElementById("modalsWithDatePicker").style = "";
  }
});