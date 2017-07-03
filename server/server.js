'use strict';

require('dotenv').config();

const app = require('./config');
const admin = require('firebase-admin');
const firebase = require('firebase');

admin.initializeApp({
  credential: admin.credential.cert(require('./firebase-key.json')),
  databaseURL: `https://${process.env.FIREBASE_ENV}.firebaseio.com`
});

firebase.initializeApp({
  apiKey: process.env.FIREBASE_API_KEY,
  databaseURL: `https://${process.env.FIREBASE_ENV}.firebaseio.com`
});

const server = app.listen(process.env.PORT, () => {
  /* istanbul ignore if */
  if (!process.env.TESTING) {
    console.log(`Listening on port ${server.address().port}...`);
  }
});

module.exports = server;
