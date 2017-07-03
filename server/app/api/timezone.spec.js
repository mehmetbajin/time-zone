'use strict';

const _ = require('lodash');
const expect = require('chai').expect;
const admin = require('firebase-admin');
const q = require('q');
const request = require('supertest');
const rp = require('request-promise');
const server = require('../../server');

describe('timezone', function () {
  this.timeout(10000);

  let users;
  let timezones;

  const CST = '-KVcqgMV67Fsw87PZR48';
  const PST = '-KVcqgMXJF-CAFzXNk-n';

  const MADISON = '-KVcs66O48eeDO5aVDqb';
  const LA = '-KVcs66Lv1kReFVzooTK'; // Los Angeles

  const OUTCOME = {
    Success: true,
    Failure: false
  };

  before(() => {
    users = {
      a: null,
      m: null,
      u: null
    };

    // 0: Owned by user
    // 1: Owned by manager
    // 2: Owned by user
    // 3: Owned by manager
    // 4: Owned by admin
    timezones = [];
  });

  // Authenticate an admin.
  before(done => {
    const request = {
      method: 'POST',
      uri: `http://localhost:${process.env.PORT}/api/v1/auth/login`,
      body: {
        email: 'admin@nowhere.null',
        password: '12341234'
      },
      json: true
    };

    rp(request)
      .then(response => {
        users.a = response;
        done();
      })
      .catch(done);
  });

  // Authenticate a manager.
  before(done => {
    const request = {
      method: 'POST',
      uri: `http://localhost:${process.env.PORT}/api/v1/auth/login`,
      body: {
        email: 'user-manager@nowhere.null',
        password: '12341234'
      },
      json: true
    };

    rp(request)
      .then(response => {
        users.m = response;
        done();
      })
      .catch(done);
  });

  // Authenticate a user.
  before(done => {
    const request = {
      method: 'POST',
      uri: `http://localhost:${process.env.PORT}/api/v1/auth/login`,
      body: {
        email: 'user@nowhere.null',
        password: '12341234'
      },
      json: true
    };

    rp(request)
      .then(response => {
        users.u = response;
        done();
      })
      .catch(done);
  });

  // Delete any records remaining from testing.
  after(done => {
    const updates = _.chain(timezones)
      .map(t => [`timezones/${t._id}`, null])
      .fromPairs()
      .value();

    q(admin.database().ref().update(updates)).then(done);
  });

  function createTimezone(expectedToSucceed, byUser, forUser) {
    var deferred = q.defer();

    if (expectedToSucceed) {
      request(server)
        .post('/api/v1/timezones')
        .send({
          token: byUser._token,
          data: {
            code: CST,
            city: MADISON,
            owner: forUser._id
          }
        })
        .expect(200)
        .expect(res => {
          expect(res.body).to.have.property('_id');
          expect(res.body).to.have.property('code', CST);
          expect(res.body).to.have.property('city', MADISON);
          expect(res.body).to.have.property('owner', forUser._id);
          timezones.push(res.body);
        })
        .end(deferred.resolve);
    } else {
      request(server)
        .post('/api/v1/timezones')
        .send({
          token: byUser._token,
          data: {
            code: CST,
            city: MADISON,
            owner: forUser._id
          }
        })
        .expect(401)
        .end(deferred.resolve);
    }

    return deferred.promise;
  }

  describe('create', () => {
    it('requires token in request body', done => {
      request(server)
        .post('/api/v1/timezones')
        .send({
          data: {
            code: CST,
            city: MADISON,
            owner: users.u._id
          }
        })
        .expect(400)
        .end(done);
    });

    it('requires data in request body', done => {
      request(server)
        .post('/api/v1/timezones')
        .send({
          token: users.u._token
        })
        .expect(400)
        .end(done);
    });

    it('requires a valid code in timezone record', done => {
      request(server)
        .post('/api/v1/timezones')
        .send({
          token: users.u._token,
          data: {
            code: 'junk',
            city: MADISON,
            owner: users.u._id
          }
        })
        .expect(401)
        .end(done);
    });

    it('requires a valid city in timezone record', done => {
      request(server)
        .post('/api/v1/timezones')
        .send({
          token: users.u._token,
          data: {
            code: CST,
            city: 'junk',
            owner: users.u._id
          }
        })
        .expect(401)
        .end(done);
    });

    // USER

    it('allows a user to create for himself', done => {
      createTimezone(OUTCOME.Success, users.u, users.u).then(done);
    });

    it('blocks a user from creating for a manager', done => {
      createTimezone(OUTCOME.Failure, users.u, users.m).then(done);
    });

    it('blocks a user from creating for an admin', done => {
      createTimezone(OUTCOME.Failure, users.u, users.a).then(done);
    });

    // MANAGER

    it('blocks a manager from creating for a user', done => {
      createTimezone(OUTCOME.Failure, users.m, users.u).then(done);
    });

    it('allows a manager to create for himself', done => {
      createTimezone(OUTCOME.Success, users.m, users.m).then(done);
    });

    it('blocks a manager from creating for an admin', done => {
      createTimezone(OUTCOME.Failure, users.m, users.a).then(done);
    });

    // ADMIN

    it('allows an admin to create for a user', done => {
      createTimezone(OUTCOME.Success, users.a, users.u).then(done);
    });

    it('allows an admin to create for a manager', done => {
      createTimezone(OUTCOME.Success, users.a, users.m).then(done);
    });

    it('allows an admin to create for himself', done => {
      createTimezone(OUTCOME.Success, users.a, users.a).then(done);
    });
  });

  function getTimezone(expectedToSucceed, byUser, timezone) {
    var deferred = q.defer();

    if (expectedToSucceed) {
      request(server)
        .get(`/api/v1/timezones/${timezone._id}?token=${byUser._token}`)
        .expect(200)
        .expect(res => {
          expect(res.body).to.eql(timezone);
        })
        .end(deferred.resolve);
    } else {
      request(server)
        .get(`/api/v1/timezones/${timezone._id}?token=${byUser._token}`)
        .expect(401)
        .end(deferred.resolve);
    }

    return deferred.promise;
  }

  describe('get', () => {
    it('requires token as a query parameter', done => {
      request(server)
        .get(`/api/v1/timezones/${timezones[0]._id}`)
        .expect(400)
        .end(done);
    });

    // USER

    it('allows a user to read his', done => {
      getTimezone(OUTCOME.Success, users.u, timezones[2]).then(done);
    });

    it('blocks a user from reading a manager\'s', done => {
      getTimezone(OUTCOME.Failure, users.u, timezones[3]).then(done);
    });

    it('blocks a user from reading an admin\'s', done => {
      getTimezone(OUTCOME.Failure, users.u, timezones[4]).then(done);
    });

    // MANAGER

    it('blocks a manager from reading a user\'s', done => {
      getTimezone(OUTCOME.Failure, users.m, timezones[2]).then(done);
    });

    it('allows a manager to read his', done => {
      getTimezone(OUTCOME.Success, users.m, timezones[3]).then(done);
    });

    it('blocks a manager from reading an admin\'s', done => {
      getTimezone(OUTCOME.Failure, users.m, timezones[4]).then(done);
    });

    // ADMIN

    it('allows an admin to read a user\'s', done => {
      getTimezone(OUTCOME.Success, users.a, timezones[2]).then(done);
    });

    it('allows an admin to read a manager\'s', done => {
      getTimezone(OUTCOME.Success, users.a, timezones[3]).then(done);
    });

    it('allows an admin to read his', done => {
      getTimezone(OUTCOME.Success, users.a, timezones[4]).then(done);
    });
  });

  function updateTimezone(expectedToSucceed, byUser, ofUser, timezone) {
    var deferred = q.defer();

    if (expectedToSucceed) {
      request(server)
        .put(`/api/v1/timezones/${timezone._id}`)
        .send({
          token: byUser._token,
          data: {
            code: PST,
            city: LA,
            owner: ofUser._id
          }
        })
        .expect(200)
        .expect(res => {
          expect(res.body).to.have.property('_id', timezone._id);
          expect(res.body).to.have.property('code', PST);
          expect(res.body).to.have.property('city', LA);
          expect(res.body).to.have.property('owner', ofUser._id);
          _.chain(timezones).find(['_id', timezone._id]).assign(res.body);
        })
        .end(deferred.resolve);
    } else {
      request(server)
        .put(`/api/v1/timezones/${timezone._id}`)
        .send({
          token: byUser._token,
          data: {
            code: PST,
            city: LA,
            owner: ofUser._id
          }
        })
        .expect(401)
        .end(deferred.resolve);
    }

    return deferred.promise;
  }

  describe('update', () => {
    it('requires data in request body', done => {
      request(server)
        .put(`/api/v1/timezones/${timezones[0]._id}`)
        .send({
          token: users.u._token
        })
        .expect(400)
        .end(done);
    });

    it('requires token in request body', done => {
      request(server)
        .put(`/api/v1/timezones/${timezones[0]._id}`)
        .send({
          data: {
            code: PST,
            city: LA,
            owner: users.u._id
          }
        })
        .expect(400)
        .end(done);
    });

    // USER

    it('allows a user to update his', done => {
      updateTimezone(OUTCOME.Success, users.u, users.u, timezones[2]).then(done);
    });

    it('blocks a user from updating a manager\'s', done => {
      updateTimezone(OUTCOME.Failure, users.u, users.m, timezones[3]).then(done);
    });

    it('blocks a user from updating an admin\'s', done => {
      updateTimezone(OUTCOME.Failure, users.u, users.a, timezones[4]).then(done);
    });

    // MANAGER

    it('blocks a manager from updating a user\'s', done => {
      updateTimezone(OUTCOME.Failure, users.m, users.u, timezones[2]).then(done);
    });

    it('allows a manager to update his', done => {
      updateTimezone(OUTCOME.Success, users.m, users.m, timezones[3]).then(done);
    });

    it('blocks a manager from updating an admin\'s', done => {
      updateTimezone(OUTCOME.Failure, users.m, users.a, timezones[4]).then(done);
    });

    // ADMIN

    it('allows an admin to update a user\'s', done => {
      updateTimezone(OUTCOME.Success, users.a, users.u, timezones[2]).then(done);
    });

    it('allows an admin to update a manager\'s', done => {
      updateTimezone(OUTCOME.Success, users.a, users.m, timezones[3]).then(done);
    });

    it('allows an admin to update his', done => {
      updateTimezone(OUTCOME.Success, users.a, users.a, timezones[4]).then(done);
    });
  });

  function deleteTimezone(expectedToSucceed, byUser, timezone) {
    var deferred = q.defer();

    if (expectedToSucceed) {
      request(server)
        .delete(`/api/v1/timezones/${timezone._id}?token=${byUser._token}`)
        .expect(200)
        .expect(res => {
          expect(res.body).to.be.null;
          _.chain(timezones).findIndex(['_id', timezone._id]).pullAt();
        })
        .end(deferred.resolve);
    } else {
      request(server)
        .delete(`/api/v1/timezones/${timezone._id}?token=${byUser._token}`)
        .expect(401)
        .end(deferred.resolve);
    }

    return deferred.promise;
  }

  describe('delete', () => {
    it('requires token as a query parameter', done => {
      request(server)
        .delete(`/api/v1/timezones/${timezones[0]._id}`)
        .expect(400)
        .end(done);
    });

    // USER:DISALLOWED

    it('blocks a user from deleting a manager\'s', done => {
      deleteTimezone(OUTCOME.Failure, users.u, timezones[3]).then(done);
    });

    it('blocks a user from deleting an admin\'s', done => {
      deleteTimezone(OUTCOME.Failure, users.u, timezones[4]).then(done);
    });

    // MANAGER:DISALLOWED

    it('blocks a manager from deleting a user\'s', done => {
      deleteTimezone(OUTCOME.Failure, users.m, timezones[2]).then(done);
    });

    it('blocks a manager from deleting an admin\'s', done => {
      deleteTimezone(OUTCOME.Failure, users.m, timezones[4]).then(done);
    });

    // ADMIN:ALLOWED

    it('allows an admin to delete his', done => {
      deleteTimezone(OUTCOME.Success, users.a, timezones[4]).then(done);
    });

    it('allows an admin to delete a manager\'s', done => {
      deleteTimezone(OUTCOME.Success, users.a, timezones[3]).then(done);
    });

    it('allows an admin to delete a user\'s', done => {
      deleteTimezone(OUTCOME.Success, users.a, timezones[2]).then(done);
    });

    // MANAGER:ALLOWED

    it('allows a manager to delete his', done => {
      deleteTimezone(OUTCOME.Success, users.m, timezones[1]).then(done);
    });

    // USER:ALLOWED

    it('allows a user to delete his', done => {
      deleteTimezone(OUTCOME.Success, users.u, timezones[0]).then(done);
    });
  });

  describe('get:all', () => {
    before(done => {
      q.all([
        createTimezone(OUTCOME.Success, users.m, users.m),
        createTimezone(OUTCOME.Success, users.u, users.u),
        createTimezone(OUTCOME.Success, users.a, users.a),
        createTimezone(OUTCOME.Success, users.u, users.u),
        createTimezone(OUTCOME.Success, users.a, users.a),
        createTimezone(OUTCOME.Success, users.u, users.u),
        createTimezone(OUTCOME.Success, users.a, users.a),
        createTimezone(OUTCOME.Success, users.u, users.u),
        createTimezone(OUTCOME.Success, users.m, users.m)
      ]).finally(done);
    });

    it('fails if token is invalid', done => {
      request(server)
        .get('/api/v1/timezones?token=junk')
        .expect(401)
        .end(done);
    });

    it('lists records owned by a user for a user', done => {
      request(server)
        .get(`/api/v1/timezones?token=${users.u._token}`)
        .expect(200)
        .expect(res => {
          expect(res.body.length).to.be.at.least(3);
          expect(ownersOf(res.body)).to.have.members([users.u._id]);
        })
        .end(done);
    });

    it('lists records owned by a manager for a manager', done => {
      request(server)
        .get(`/api/v1/timezones?token=${users.m._token}`)
        .expect(200)
        .expect(res => {
          expect(res.body.length).to.be.at.least(2);
          expect(ownersOf(res.body)).to.have.members([users.m._id]);
        })
        .end(done);
    });

    it('lists all records for an admin', done => {
      request(server)
        .get(`/api/v1/timezones?token=${users.a._token}`)
        .expect(200)
        .expect(res => {
          expect(res.body.length).to.be.at.least(9);
          expect(ownersOf(res.body)).to.include.members([users.u._id, users.m._id, users.a._id]);
        })
        .end(done);
    });

    function ownersOf(timezones) {
      return _.chain(timezones).map('owner').uniq().value();
    }
  });
});
