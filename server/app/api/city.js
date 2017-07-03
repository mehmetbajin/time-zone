'use strict';

const _ = require('lodash');
const rp = require('request-promise');
const util = require('../util');

/**
 * Loads all cities.
 *
 * @param {!Request} req
 * @param {!Response} res
 */
function get(req, res) {
  const request = {
    uri: util.formatUri('/cities'),
    json: true
  };

  rp.get(request)
    .then(result => res.status(200).json(_.map(result, util.formatRecordOutFromSnapshot)))
    .catch(error => res.status(500).json(util.formatError(error)));
}

module.exports = [{
  method: 'get',
  path: '/cities',
  callback: get
}];
