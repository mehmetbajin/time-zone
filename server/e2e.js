'use strict';

require('dotenv').config();

const _ = require('lodash');
const q = require('q');
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert(require('./firebase-key.json')),
  databaseURL: `https://${process.env.FIREBASE_ENV}.firebaseio.com`
});

/**
 * Deletes users that were registered as part of E2E testing.
 * @private
 */
function deleteUsers() {
  var deferred = q.defer();

  const email = 'e2e-test-register@nowhere.null';
  let id;

  admin
    .database()
    .ref('users')
    .orderByChild('email')
    .equalTo(email)
    .once('value')
    .then(snapshot => {
      id = _.keys(snapshot.val())[0];
      return admin.database().ref('users').child(id).remove();
    })
    .then(() => admin.auth().deleteUser(id))
    .then(deferred.resolve)
    .catch(deferred.reject);

  return deferred.promise;
}

console.log('Working...');

q.all([
    deleteUsers()
  ])
  .finally(() => {
    console.log('Done.');
    process.exit();
  });
