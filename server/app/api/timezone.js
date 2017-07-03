'use strict';

const _ = require('lodash');
const admin = require('firebase-admin');
const rp = require('request-promise');
const util = require('../util');

/**
 * Creates a timezone record.
 *
 * @param {!Request} req
 * @param {!Response} res
 */
function create(req, res) {
  const token = req.body.token;
  const data = req.body.data;

  const request = {
    method: 'POST',
    uri: util.formatUri('/timezones', {
      auth: token
    }),
    body: util.formatRecordIn(data),
    json: true
  };

  rp(request)
    .then(result => res.status(200).json(util.formatRecordOut(data, {
      id: result.name
    })))
    .catch(error => res.status(401).json(util.formatError(error)));
}

/**
 * Loads a timezone record.
 *
 * @param {!Request} req
 * @param {!Response} res
 */
function get(req, res) {
  const token = req.query.token;
  const id = req.params.id;

  const request = {
    method: 'GET',
    uri: util.formatUri(`/timezones/${id}`, {
      auth: token
    }),
    json: true
  };

  rp(request)
    .then(result => res.status(200).json(util.formatRecordOut(result, {
      id: id
    })))
    .catch(error => res.status(401).json(util.formatError(error)));
}

/**
 * Updates a timezone record.
 *
 * @param {!Request} req
 * @param {!Response} res
 */
function update(req, res) {
  const token = req.body.token;
  const id = req.params.id;
  const data = req.body.data;

  const request = {
    method: 'PUT',
    uri: util.formatUri(`/timezones/${id}`, {
      auth: token
    }),
    body: util.formatRecordIn(data),
    json: true
  };

  rp(request)
    .then(result => res.status(200).json(util.formatRecordOut(result, {
      id: id
    })))
    .catch(error => res.status(401).json(util.formatError(error)));
}

/**
 * Deletes a timezone record.
 *
 * @param {!Request} req
 * @param {!Response} res
 */
function remove(req, res) {
  const token = req.query.token;
  const id = req.params.id;

  const request = {
    method: 'DELETE',
    uri: util.formatUri(`/timezones/${id}`, {
      auth: token
    }),
    json: true
  };

  rp(request)
    .then(result => res.status(200).json(result))
    .catch(error => res.status(401).json(util.formatError(error)));
}

/**
 * Loads all timezone records, optionally for just one user.
 *
 * @param {!Request} req
 * @param {!Response} res
 */
function getEveryTimezone(req, res) {
  const token = req.query.token;

  let uid;

  admin.auth().verifyIdToken(token)
    .then(decoded => admin.database().ref(`users/${(uid = decoded.uid)}/role`).once('value'))
    .then(snapshot => {
      if (snapshot.val() !== 99) {
        // Non-admin: Load just that user's records.
        return admin.database().ref('timezones').orderByChild('owner').equalTo(uid).once('value');
      } else {
        // Admin: Load all records.
        return rp({
          method: 'GET',
          uri: util.formatUri('/timezones', {
            auth: token
          }),
          json: true
        });
      }
    })
    .then(result => {
      if (result && result.val) {
        result = result.val();
      }
      res.status(200).json(_.map(result, util.formatRecordOutFromSnapshot));
    })
    .catch(error => res.status(401).json(util.formatError(error)));
}

module.exports = [{
  method: 'post',
  path: '/timezones',
  parameters: {
    body: ['token', 'data']
  },
  callback: create
}, {
  method: 'get',
  path: '/timezones/:id',
  parameters: {
    query: ['token']
  },
  callback: get
}, {
  method: 'put',
  path: '/timezones/:id',
  parameters: {
    body: ['token', 'data']
  },
  callback: update
}, {
  method: 'delete',
  path: '/timezones/:id',
  parameters: {
    query: ['token']
  },
  callback: remove
}, {
  method: 'get',
  path: '/timezones',
  parameters: {
    query: ['token']
  },
  callback: getEveryTimezone
}];
