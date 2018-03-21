import { Template } from 'meteor/templating';
import { Accounts } from 'meteor/accounts-base';

import '../../main.html';

function drawBarGraph() {
    //clear the contents of the div, in the event this function is called more than once.
    new Morris.Bar({
        // ID of the element in which to draw the chart.
        element: 'myfirstbargraph',
        // Chart data records -- each entry in this array corresponds to a point on
        // the chart.
        data: [
            { y: 'Quiz 1', k: 100, a: 90, t: 80, c:50 },
            { y: 'Quiz 2', k: 75,  a: 65, t: 80, c:50 },
            { y: 'Quiz 3', k: 50,  a: 40, t: 80, c:50 },
            { y: 'Quiz 4', k: 75,  a: 65, t: 80, c:50 },
            { y: 'Quiz 5', k: 50,  a: 40, t: 80, c:50 },
            { y: 'Quiz 6', k: 75,  a: 65, t: 80, c:50 },
            { y: 'Quiz 7', k: 100, a: 90, t: 80, c:50 },
            { y: 'Quiz 8', k: 100, a: 90, t: 80, c:50 },
            { y: 'Quiz 9', k: 100, a: 90, t: 80, c:50 },
            { y: 'Quiz 10', k: 100, a: 90, t: 80, c:50 },
        ],

        xkey: 'y',
        ykeys: ['k', 'a', 't', 'c'],
        labels: ['Knowledge', 'Application', 'Thinking', 'Communication'],
        barColors: ['#b39ddb', '#4fc3f7', '#81c784', '#e57373'],

    });
}


Template.studentReports.onRendered(function () {
});

Template.studentReports.events({
    'click #testclick': function(){
        $('#myfirstbargraph').empty();
        drawBarGraph()
    }
})