import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Accounts } from 'meteor/accounts-base';

import '../../main.html';

if(Meteor.isClient){
    Template.register.events({
        'click .cancel-button': function(){
            //clear the input fields
            document.getElementById("registerForm").reset();

            //if cancel button is clicked, close the modal
            $('#registerModal').modal('close');
        },

        'click .back-button': function(){
            document.getElementById("registerForm").reset();

            $('#registerModal').modal('close');
            $('#loginModal').modal('open');
        },

        'submit .register-form': function(event, template) {
            event.preventDefault();

            var emailVar = event.target.registerEmail.value;
            console.log(emailVar);
            var passwordVar = event.target.registerPassword.value;

            /*I was not able to use a findOne() method. Since we are not logged into the site, we do not have a parameter to use when searching for emails. 
            The find() would be more suitable since it would output all entries, and then we could itterate through that with our email condition.*/
            // const userEmail = Meteor.users.findOne({_id : this._id}); //came up undefined
            // console.log(userEmail);

            // const userList = Meteor.users.find();
            // userList.forEach(
            //      function (doc) {
            //          for(var i = 0; i < doc.users.length; i++){ 
            //                /*runs through the collection within the specified index (emails) - My error appears here. The result is the same 
            //                whether i change email to users. I still think the issue has to do with server publication but i am not certain.*/
                        
            //              const userListEmail = doc.emails[i].address; //pulls the field to be compared
            //              console.log(userListEmail); //outputs it to the console, a check to see that it is pulling the information correctly
            //          }
            //      });
            //const emailCheck = userList.emails[0].address;
            //console.log(emailCheck);

            // if(emailCheck == true){
            //     Materialize.toast('User already exists', 3000, 'amber darken-3')
            //     return false;
            // }
            // else{
                Accounts.createUser({
                    email: emailVar,
                    password: passwordVar
                });
                document.getElementById("registerForm").reset();
                $('#registerModal').modal('close');
            // }

            /*Try looking into the Accounts.findUserByEmail method... i think that is what is needed.*/
        }
    })
}