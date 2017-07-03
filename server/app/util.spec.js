'use strict';

const expect = require('chai').expect;
const util = require('./util');

describe('util', () => {
  describe('formatUri', () => {
    let firebaseEnv;
    let uri;
    let params;
    let expected;

    beforeEach(() => {
      firebaseEnv = process.env.FIREBASE_ENV;
    });

    it('formats a uri without query parameters', () => {
      process.env.FIREBASE_ENV = 'mock-env';
      uri = '/somewhere/over/the/rainbow';
      expected = 'https://mock-env.firebaseio.com/somewhere/over/the/rainbow.json?';
      expect(util.formatUri(uri)).to.equal(expected);
    });

    it('formats a uri with query parameters', () => {
      process.env.FIREBASE_ENV = 'mock-env-2';
      uri = '/somewhere/else';
      params = {
        auth: 'a12asdfas1r324=',
        foo: 'bar'
      };
      expected = `https://mock-env-2.firebaseio.com/somewhere/else.json?auth=${params.auth}&foo=bar`;
      expect(util.formatUri(uri, params)).to.equal(expected);
    });

    afterEach(() => {
      process.env.FIREBASE_ENV = firebaseEnv;
    });
  });

  describe('formatRecordIn', () => {
    let record;

    it('returns null if record does not exist', () => {
      expect(util.formatRecordIn()).to.be.null;
    });

    it('removes keys that begin with an underscore', () => {
      record = {
        _id: 'something',
        _token: 'something-else',
        foo: 'bar',
        baz: 'far'
      };

      expect(util.formatRecordIn(record)).to.eql({
        foo: 'bar',
        baz: 'far'
      });
    });
  });

  describe('formatRecordOut', () => {
    let record;
    let properties;

    it('returns null if record does not exist', () => {
      expect(util.formatRecordOut()).to.be.null;
    });

    it('prepends underscore to the properties list', () => {
      record = {
        foo: 'bar',
        baz: 'far'
      };

      properties = {
        id: 'something',
        token: 'something-else'
      };

      expect(util.formatRecordOut(record, properties)).to.eql({
        _id: 'something',
        _token: 'something-else',
        foo: 'bar',
        baz: 'far'
      });
    });
  });

  describe('formatRecordOutFromSnapshot', () => {
    let record;
    let id;

    it('returns null if record does not exist', () => {
      expect(util.formatRecordOutFromSnapshot()).to.be.null;
    });

    it('includes id in result', () => {
      id = 'my-id';
      record = {
        foo: 'bar',
        baz: 'far'
      };

      expect(util.formatRecordOutFromSnapshot(record, id)).to.eql({
        _id: 'my-id',
        foo: 'bar',
        baz: 'far'
      });
    });
  });

  describe('formatError', () => {
    let error;

    it('uses error.response.body.error first', () => {
      error = {
        response: {
          body: {
            error: 'Premier'
          }
        },
        message: 'Deuxime'
      };

      expect(util.formatError(error)).to.eql({
        error: 'Premier.'
      });
    });

    it('uses error.message second', () => {
      error = {
        message: 'Message'
      };

      expect(util.formatError(error)).to.eql({
        error: 'Message.'
      });
    });

    it('defaults to generic message', () => {
      expect(util.formatError()).to.eql({
        error: 'Unknown error.'
      });
    });
  });
});
