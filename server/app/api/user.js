'use strict';

const _ = require('lodash');
const firebase = require('firebase');
const q = require('q');
const rp = require('request-promise');
const util = require('../util');

/**
 * User roles.
 *
 * @enum {number}
 */
const roles = {
  User: 10,
  UserManager: 20,
  Administrator: 99
};

/**
 * Creates a user record as part of login or user-manager flow.
 *
 * @param {!Request} req
 * @param {!Response} res
 */
function create(req, res) {
  if (req.body.token) {
    createByManager(req, res);
  } else {
    createByUser(req, res);
  }
}

/**
 * Creates a user on behalf of a user manager.
 *
 * @param {!Request} req
 * @param {!Response} res
 * @private
 */
function createByManager(req, res) {
  const token = req.body.token;
  const password = req.body.password;
  const data = req.body.data;

  let authUser;

  q(firebase.auth().createUserWithEmailAndPassword(data.email, password))
    .then(_authUser_ => rp({
      method: 'PUT',
      uri: util.formatUri(`/users/${(authUser = _authUser_).uid}`, {
        auth: token
      }),
      body: util.formatRecordIn(data),
      json: true
    }))
    .then(result => res.status(200).json(util.formatRecordOut(result, {
      id: authUser.uid
    })))
    .catch(error => res.status(401).json(util.formatError(error)))
    .finally(() => firebase.auth().signOut());
}

/**
 * Creates a user on behalf of the user being created.
 *
 * @param {!Request} req
 * @param {!Response} res
 * @private
 */
function createByUser(req, res) {
  const password = req.body.password;
  const data = _.assign(req.body.data, {
    role: roles.User
  });

  let authUser;
  let token;

  q(firebase.auth().createUserWithEmailAndPassword(data.email, password))
    .then(_authUser_ => (authUser = _authUser_).getToken(true))
    .then(_token_ => rp({
      method: 'PUT',
      uri: util.formatUri(`/users/${authUser.uid}`, {
        auth: (token = _token_)
      }),
      body: util.formatRecordIn(data),
      json: true
    }))
    .then(result => res.status(200).json(util.formatRecordOut(result, {
      id: authUser.uid,
      token: token
    })))
    .catch(error => res.status(401).json(util.formatError(error)))
    .finally(() => firebase.auth().signOut());
}

/**
 * Loads a user record.
 *
 * @param {!Request} req
 * @param {!Response} res
 */
function get(req, res) {
  const token = req.query.token;
  const id = req.params.id;

  const request = {
    method: 'GET',
    uri: util.formatUri(`/users/${id}`, {
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
 * Updates a user record.
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
    uri: util.formatUri(`/users/${id}`, {
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
 * Deletes a user record.
 *
 * @param {!Request} req
 * @param {!Response} res
 */
function remove(req, res) {
  const token = req.query.token;
  const id = req.params.id;

  const request = {
    method: 'DELETE',
    uri: util.formatUri(`/users/${id}`, {
      auth: token
    }),
    json: true
  };

  rp(request)
    .then(result => res.status(200).json(result))
    .catch(error => res.status(401).json(util.formatError(error)));
}

/**
 * Loads all user records.
 *
 * @param {!Request} req
 * @param {!Response} res
 */
function getEveryUser(req, res) {
  const token = req.query.token;

  const request = {
    method: 'GET',
    uri: util.formatUri('/users', {
      auth: token
    }),
    json: true
  };

  rp(request)
    .then(result => res.status(200).json(_.map(result, util.formatRecordOutFromSnapshot)))
    .catch(error => res.status(401).json(util.formatError(error)));
}

module.exports = [{
  method: 'post',
  path: '/users',
  parameters: {
    body: ['data', 'password']
  },
  callback: create
}, {
  method: 'get',
  path: '/users/:id',
  parameters: {
    query: ['token']
  },
  callback: get
}, {
  method: 'put',
  path: '/users/:id',
  parameters: {
    body: ['token', 'data']
  },
  callback: update
}, {
  method: 'delete',
  path: '/users/:id',
  parameters: {
    query: ['token']
  },
  callback: remove
}, {
  method: 'get',
  path: '/users',
  parameters: {
    query: ['token']
  },
  callback: getEveryUser
}];
