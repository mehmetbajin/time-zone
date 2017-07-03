'use strict';

const expect = require('chai').expect;
const q = require('q');
const request = require('supertest');
const rp = require('request-promise');
const server = require('../../server');
const sinon = require('sinon');

describe('code', () => {
  it('loads all codes', done => {
    request(server)
      .get('/api/v1/codes')
      .expect(200)
      .expect(res => {
        expect(res.body).to.be.an('array');
        expect(res.body.length).to.equal(125);
      })
      .end(done);
  });

  it('returns an error on failure', done => {
    sinon.stub(rp, 'get').returns(q.reject());

    request(server)
      .get('/api/v1/codes')
      .expect(500)
      .end(() => {
        rp.get.restore();
        done();
      });
  });
});
