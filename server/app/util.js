'use strict';

const _ = require('lodash');

/**
 * Formats a URI.
 *
 * @param {string} uri
 * @param {!Object<string, *>} params
 * @return {string}
 */
function formatUri(uri, params) {
  const base = `https://${process.env.FIREBASE_ENV}.firebaseio.com`;
  return base + uri + '.json?' + _.map(params, (value, key) => `${key}=${value}`).join('&');
}

/**
 * Formats a record for internal storage.
 *
 * @param {?Object} record
 * @return {?Object}
 */
function formatRecordIn(record) {
  if (record) {
    return _.omitBy(record, (value, key) => _.startsWith(key, '_'));
  }
  return null;
}

/**
 * Formats a record for external clients.
 *
 * @param {?Object} record
 * @param {!Object} properties
 * @return {?Object}
 */
function formatRecordOut(record, properties) {
  if (record) {
    return _.assign(record, _.mapKeys(properties, (value, key) => `_${key}`));
  }
  return null;
}

/**
 * Formats a record for external clients from a Firebase snapshot.
 *
 * @param {?Object} record
 * @param {string} id
 * @return {?Object}
 */
function formatRecordOutFromSnapshot(record, id) {
  return formatRecordOut(record, {
    id: id
  });
}

/**
 * Formats an error message.
 *
 * @param {?Error} error
 * @return {!Object}
 */
function formatError(error) {
  const message = _.get(error, ['response', 'body', 'error'], _.get(error, 'message', 'Unknown error.'));
  return {
    error: _.endsWith(message, '.') ? message : `${message}.`
  };
}

module.exports = {
  formatUri: formatUri,
  formatRecordIn: formatRecordIn,
  formatRecordOut: formatRecordOut,
  formatRecordOutFromSnapshot: formatRecordOutFromSnapshot,
  formatError: formatError
};
