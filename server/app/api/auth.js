'use strict';

const _ = require('lodash');
const firebase = require('firebase');
const admin = require('firebase-admin');
const q = require('q');
const util = require('../util');

/**
 * Authenticates a user.
 *
 * @param {!Request} req
 * @param {!Response} res
 */
function login(req, res) {
  const email = req.body.email;
  const password = req.body.password;

  let user;

  getUserByEmail(email)
    .then(_user_ => q(firebase.auth().signInWithEmailAndPassword((user = _user_).email, password)))
    .then(authUser => q(authUser.getToken(true)))
    .then(token => res.status(200).json(util.formatRecordOut(user, {
      token: token
    })))
    .catch(error => res.status(401).json(util.formatError(error)))
    .finally(firebase.auth().signOut);
}

/**
 * Signs out a user.
 *
 * In the latest release of Firebase Authentication, login sessions don't expire
 * anymore. Instead Firebase uses a combination of long-lived account tokens and
 * short-lived, auto-refreshed access tokens to get best of both worlds.
 *
 * The client is responsibile for destroying the access token upon logout. There
 * is no work to be done on the server since Firebase handles token expiration.
 *
 * @param {!Request} req
 * @param {!Response} res
 */
function logout(req, res) {
  // const token = req.body.token;

  // NO-OP

  res.sendStatus(200);
}

/**
 * Sends a password reset email.
 *
 * @param {!Request} req
 * @param {!Response} res
 */
function passwordReset(req, res) {
  const email = req.body.email;

  getUserByEmail(email)
    .then(() => firebase.auth().sendPasswordResetEmail(email))
    .then(() => res.sendStatus(200))
    .catch(error => res.status(400).json(util.formatError(error)));
}

/**
 * Changes the user password (as part of the reset workflow).
 *
 * @param {!Request} req
 * @param {!Response} res
 */
function passwordSet(req, res) {
  const oobCode = req.body.oobCode;
  const password = req.body.password;

  let email;

  firebase.auth().verifyPasswordResetCode(oobCode)
    .then(_email_ => (email = _email_) && firebase.auth().confirmPasswordReset(oobCode, password))
    .then(() => res.status(200).json(email))
    .catch(error => res.status(400).json(util.formatError(error)));
}

/**
 * Looks up a user record by email.
 *
 * @param {string} email
 * @return {!Promise(!User)}
 * @private
 */
function getUserByEmail(email) {
  var deferred = q.defer();

  const query = admin
    .database()
    .ref('users')
    .orderByChild('email')
    .equalTo(_.toLower(email))
    .once('value');

  query
    .then(snapshot => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        const id = _.keys(val)[0];
        const data = val[id];
        deferred.resolve(util.formatRecordOut(data, {
          id: id
        }));
      } else {
        deferred.reject({
          code: 'auth/user-not-found',
          message: [
            'There is no user record corresponding to this identifier.',
            'The user may have been deleted.'
          ].join(' ')
        });
      }
    })
    .catch(deferred.reject);

  return deferred.promise;
}

module.exports = [{
  method: 'post',
  path: '/auth/login',
  parameters: {
    body: ['email', 'password']
  },
  callback: login
}, {
  method: 'post',
  path: '/auth/logout',
  parameters: {
    body: ['token']
  },
  callback: logout
}, {
  method: 'post',
  path: '/auth/password-reset',
  parameters: {
    body: ['email']
  },
  callback: passwordReset
}, {
  method: 'post',
  path: '/auth/password-set',
  parameters: {
    body: ['oobCode', 'password']
  },
  callback: passwordSet
}];
