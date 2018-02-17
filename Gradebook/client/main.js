import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Courses } from '../lib/collections.js';
import { Accounts } from 'meteor/accounts-base';
import { Assessments } from '../lib/collections.js';

import './main.html';

Accounts.onLogout(resetViewOnLogout);

function resetViewOnLogout(){
    Session.set('courseId', 0);
}