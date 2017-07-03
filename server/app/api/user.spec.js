'use strict';

const _ = require('lodash');
const chai = require('chai');
const expect = chai.expect;
const firebase = require('firebase');
const admin = require('firebase-admin');
const q = require('q');
const request = require('supertest');
const rp = require('request-promise');
const server = require('../../server');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.use(sinonChai);

describe('user', function () {
  this.timeout(10000);

  let users;
  let testUsers;

  const NAME = 'Test User';
  const PASSWORD = '12341234';
  const ROLE = {
    User: 10,
    Manager: 20,
    Admin: 99
  };
  const OUTCOME = {
    Success: true,
    Failure: false
  };

  before(() => {
    users = {
      a: null, // admin
      m: null, // manager
      u: null // user
    };

    testUsers = {
      u: [{
        _id: 'Ct5pUYZKD5V1F4AZ5Y9eZ3GjnoN2',
        email: 'test-user-2016-11-03t19-32-17z@nowhere.null',
        password: PASSWORD,
        role: ROLE.User
      }, {
        _id: 'Ax16rgxwXBhUFFu5CViKF6W0JD43',
        email: 'test-user-2016-11-03t19-32-16z@nowhere.null',
        password: PASSWORD,
        role: ROLE.User
      }, {
        _id: 'GUPR9HoGV8XSSqWSa7mLHbYAIiC3',
        email: 'test-user-2016-11-03t19-32-18z@nowhere.null',
        password: PASSWORD,
        role: ROLE.User
      }],
      m: [{
        _id: 'D5orNaEJpleKDQsjvYH723TkFtR2',
        email: 'test-user-2016-11-03t19-20-54z@nowhere.null',
        password: PASSWORD,
        role: ROLE.Manager
      }, {
        _id: 'A3pjsG7HZEYOHJPpl7zFodK7JA73',
        email: 'test-user-2016-11-03t19-20-49z@nowhere.null',
        password: PASSWORD,
        role: ROLE.Manager
      }],
      a: [{
        _id: '8uGFAZXWUvXAXOJ6avtWxCPT0Pc2',
        email: 'test-user-2016-11-03t19-20-48z@nowhere.null',
        password: PASSWORD,
        role: ROLE.Admin
      }, {
        _id: 'btEoKg1cU8Uyyf5l0wd4M2SVYpx2',
        email: 'test-user-2016-11-03t19-20-46z@nowhere.null',
        password: PASSWORD,
        role: ROLE.Admin
      }]
    };
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

  // Authenticate test users to get their auth tokens.
  before(done => {
    q.all([
      q.all(_.map(testUsers.u, authenticate)),
      q.all(_.map(testUsers.m, authenticate)),
      q.all(_.map(testUsers.a, authenticate))
    ]).then(() => firebase.auth().signOut()).then(done);

    function authenticate(user, i, list) {
      var deferred = q.defer();

      firebase.auth().signInWithEmailAndPassword(user.email, user.password)
        .then(authUser => authUser.getToken(true))
        .then(token => {
          list[i]._token = token;
          list[i].name = 'Test User';
          deferred.resolve();
        })
        .catch(deferred.reject);

      return deferred.promise;
    }
  });

  // Delete any records remaining from testing.
  after(done => {
    const updates = _.chain(testUsers)
      .values()
      .flatten()
      .map(u => [`users/${u._id}`, null])
      .fromPairs()
      .value();

    q(admin.database().ref().update(updates)).then(done);
  });

  let authUser;

  function createUser(expectedToSucceed, byUser, toCreate) {
    var deferred = q.defer();

    authUser = {
      uid: toCreate._id,
      getToken: () => q.resolve(toCreate._token)
    };

    const token = _.get(byUser, '_token', null);

    if (expectedToSucceed) {
      request(server)
        .post('/api/v1/users')
        .send({
          token: token,
          data: _.pick(toCreate, ['name', 'email', 'role']),
          password: PASSWORD
        })
        .expect(200)
        .expect(res => {
          expect(res.body).to.have.property('_id', toCreate._id);
          expect(res.body).to.have.property('name', toCreate.name);
          expect(res.body).to.have.property('email', toCreate.email);
          expect(res.body).to.have.property('role', toCreate.role);
        })
        .end(deferred.resolve);
    } else {
      request(server)
        .post('/api/v1/users')
        .send({
          token: token,
          data: _.pick(toCreate, ['name', 'email', 'role']),
          password: PASSWORD
        })
        .expect(401)
        .end(deferred.resolve);
    }

    return deferred.promise;
  }

  describe('create', () => {
    beforeEach(() => {
      sinon.stub(firebase, 'auth').returns({
        createUserWithEmailAndPassword: () => q.resolve(authUser)
      });
    });

    afterEach(() => {
      firebase.auth.restore();
    });

    it('requires password in request body', done => {
      request(server)
        .post('/api/v1/users')
        .send({
          data: {
            name: NAME,
            email: 'something@nowhere.null',
            role: ROLE.User
          }
        })
        .expect(400)
        .end(done);
    });

    it('requires data in request body', done => {
      request(server)
        .post('/api/v1/users')
        .send({
          password: PASSWORD
        })
        .expect(400)
        .end(done);
    });

    // USER

    it('allows a user to create his', done => {
      createUser(OUTCOME.Success, null, testUsers.u[2]).then(done);
    });

    it('returns an error on failure', done => {
      firebase.auth().createUserWithEmailAndPassword = () => q.reject();
      createUser(OUTCOME.Failure, null, testUsers.u[2]).then(done);
    });

    it('blocks a user from creating a manager', done => {
      createUser(OUTCOME.Failure, users.u, testUsers.m[0]).then(done);
    });

    it('blocks a user from creating an admin', done => {
      createUser(OUTCOME.Failure, users.u, testUsers.a[0]).then(done);
    });

    // MANAGER

    it('blocks a manager from creating a previously created user', done => {
      firebase.auth().createUserWithEmailAndPassword = () => q.reject();
      createUser(OUTCOME.Failure, users.m, testUsers.u[2]).then(done);
    });

    it('allows a manager to create a user', done => {
      createUser(OUTCOME.Success, users.m, testUsers.u[0]).then(done);
    });

    it('allows a manager to create a manager', done => {
      createUser(OUTCOME.Success, users.m, testUsers.m[0]).then(done);
    });

    it('allows a manager to create an admin', done => {
      createUser(OUTCOME.Success, users.m, testUsers.a[0]).then(done);
    });

    // ADMIN

    it('blocks an admin from creating a previously created user', done => {
      firebase.auth().createUserWithEmailAndPassword = () => q.reject();
      createUser(OUTCOME.Failure, users.a, testUsers.u[2]).then(done);
    });

    it('allows an admin to create a user', done => {
      createUser(OUTCOME.Success, users.a, testUsers.u[1]).then(done);
    });

    it('allows an admin to create a manager', done => {
      createUser(OUTCOME.Success, users.a, testUsers.m[1]).then(done);
    });

    it('allows an admin to create an admin', done => {
      createUser(OUTCOME.Success, users.a, testUsers.a[1]).then(done);
    });
  });

  function getUser(expectedToSucceed, byUser, toGet) {
    var deferred = q.defer();

    if (expectedToSucceed) {
      request(server)
        .get(`/api/v1/users/${toGet._id}?token=${byUser._token}`)
        .expect(200)
        .expect(res => {
          expect(res.body).to.have.property('_id', toGet._id);
          expect(res.body).to.have.property('name', toGet.name);
          expect(res.body).to.have.property('email', toGet.email);
          expect(res.body).to.have.property('role', toGet.role);
        })
        .end(deferred.resolve);
    } else {
      request(server)
        .get(`/api/v1/users/${toGet._id}?token=${byUser._token}`)
        .expect(401)
        .end(deferred.resolve);
    }

    return deferred.promise;
  }

  describe('get', () => {
    it('requires token as a query parameter', done => {
      request(server)
        .get(`/api/v1/users/${users.u._id}`)
        .expect(400)
        .end(done);
    });

    // USER

    it('allows a user to read his', done => {
      getUser(OUTCOME.Success, users.u, users.u).then(done);
    });

    it('blocks a user from reading a manager', done => {
      getUser(OUTCOME.Failure, users.u, users.m).then(done);
    });

    it('blocks a user from reading an admin', done => {
      getUser(OUTCOME.Failure, users.u, users.a).then(done);
    });

    // MANAGER

    it('allows a manager to read a user', done => {
      getUser(OUTCOME.Success, users.m, users.u).then(done);
    });

    it('allows a manager to read a manager', done => {
      getUser(OUTCOME.Success, users.m, users.m).then(done);
    });

    it('allows a manager to read an admin', done => {
      getUser(OUTCOME.Success, users.m, users.a).then(done);
    });

    // ADMIN

    it('allows an admin to read a user', done => {
      getUser(OUTCOME.Success, users.a, users.u).then(done);
    });

    it('allows an admin to read a manager', done => {
      getUser(OUTCOME.Success, users.a, users.m).then(done);
    });

    it('allows an admin to read an admin', done => {
      getUser(OUTCOME.Success, users.a, users.a).then(done);
    });
  });

  function updateUser(expectedToSucceed, byUser, toUpdate, withData) {
    var deferred = q.defer();

    if (expectedToSucceed) {
      request(server)
        .put(`/api/v1/users/${toUpdate._id}`)
        .send({
          token: byUser._token,
          data: {
            name: withData.name,
            email: withData.email,
            role: withData.role
          }
        })
        .expect(200)
        .expect(res => {
          expect(res.body).to.have.property('_id', toUpdate._id);
          expect(res.body).to.have.property('name', toUpdate.name);
          expect(res.body).to.have.property('email', toUpdate.email);
          expect(res.body).to.have.property('role', toUpdate.role);
        })
        .end(deferred.resolve);
    } else {
      request(server)
        .put(`/api/v1/users/${withData._id}`)
        .send({
          token: byUser._token,
          data: {
            name: withData.name,
            email: withData.email,
            role: withData.role
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
        .put(`/api/v1/users/${users.u._id}`)
        .send({
          token: users.u._token
        })
        .expect(400)
        .end(done);
    });

    it('requires token in request body', done => {
      request(server)
        .put(`/api/v1/users/${users.u._id}`)
        .send({
          data: {
            name: users.u.name,
            email: users.u.email,
            role: users.u.role
          }
        })
        .expect(400)
        .end(done);
    });

    // USER

    it('allows a user to update his', done => {
      updateUser(OUTCOME.Success, users.u, users.u, users.u).then(done);
    });

    it('blocks a user from updating a manager', done => {
      updateUser(OUTCOME.Failure, users.u, users.m, users.m).then(done);
    });

    it('blocks a user from updating an admin', done => {
      updateUser(OUTCOME.Failure, users.u, users.a, users.a).then(done);
    });

    it('blocks a user from elevating his role to manager', done => {
      const updates = _.chain(users.u).clone().assign({
        role: ROLE.Manager
      }).value();
      updateUser(OUTCOME.Failure, users.u, users.u, updates).then(done);
    });

    it('blocks a user from elevating his role to admin', done => {
      const updates = _.chain(users.u).clone().assign({
        role: ROLE.Admin
      }).value();
      updateUser(OUTCOME.Failure, users.u, users.u, updates).then(done);
    });

    // MANAGER

    it('allows a manager to update a user', done => {
      updateUser(OUTCOME.Success, users.m, users.u, users.u).then(done);
    });

    it('allows a manager to update his', done => {
      updateUser(OUTCOME.Success, users.m, users.m, users.m).then(done);
    });

    it('allows a manager to update an admin', done => {
      updateUser(OUTCOME.Success, users.m, users.a, users.a).then(done);
    });

    it('blocks a manager from elevating his role to admin', done => {
      const updates = _.chain(users.m).clone().assign({
        role: ROLE.Admin
      }).value();
      updateUser(OUTCOME.Failure, users.m, users.m, updates).then(done);
    });

    // ADMIN

    it('allows an admin to update a user', done => {
      updateUser(OUTCOME.Success, users.a, users.u, users.u).then(done);
    });

    it('allows an admin to update a manager', done => {
      updateUser(OUTCOME.Success, users.a, users.m, users.m).then(done);
    });

    it('allows an admin to update his', done => {
      updateUser(OUTCOME.Success, users.a, users.a, users.a).then(done);
    });
  });

  function deleteUser(expectedToSucceed, byUser, toDelete) {
    var deferred = q.defer();

    if (expectedToSucceed) {
      request(server)
        .delete(`/api/v1/users/${toDelete._id}?token=${byUser._token}`)
        .expect(200)
        .expect(res => {
          expect(res.body).to.be.null;
        })
        .end(deferred.resolve);
    } else {
      request(server)
        .delete(`/api/v1/users/${toDelete._id}?token=${byUser._token}`)
        .expect(401)
        .end(deferred.resolve);
    }

    return deferred.promise;
  }

  describe('delete', () => {
    it('requires token as a query parameter', done => {
      request(server)
        .delete(`/api/v1/users/${users.u._id}`)
        .expect(400)
        .end(done);
    });

    // USER

    it('blocks a user from deleting his', done => {
      deleteUser(OUTCOME.Failure, users.u, users.u).then(done);
    });

    it('blocks a user from deleting a manager', done => {
      deleteUser(OUTCOME.Failure, users.u, users.m).then(done);
    });

    it('blocks a user from deleting an admin', done => {
      deleteUser(OUTCOME.Failure, users.u, users.a).then(done);
    });

    // MANAGER

    it('blocks a manager from deleting his', done => {
      deleteUser(OUTCOME.Failure, users.m, users.m).then(done);
    });

    it('allows a manager to delete an admin', done => {
      deleteUser(OUTCOME.Success, users.m, testUsers.a[0]).then(done);
    });

    it('allows a manager to delete a manager', done => {
      deleteUser(OUTCOME.Success, users.m, testUsers.m[0]).then(done);
    });

    it('allows a manager to delete a user', done => {
      deleteUser(OUTCOME.Success, users.m, testUsers.u[0]).then(done);
    });

    // ADMIN

    it('blocks an admin from deleting his', done => {
      deleteUser(OUTCOME.Failure, users.a, users.a).then(done);
    });

    it('allows an admin to delete an admin', done => {
      deleteUser(OUTCOME.Success, users.a, testUsers.a[1]).then(done);
    });

    it('allows an admin to delete a manager', done => {
      deleteUser(OUTCOME.Success, users.a, testUsers.m[1]).then(done);
    });

    it('allows an admin to delete a user', done => {
      deleteUser(OUTCOME.Success, users.a, testUsers.u[1]).then(done);
    });
  });

  describe('get:all', () => {
    it('fails if token is invalid', done => {
      request(server)
        .get('/api/v1/users?token=junk')
        .expect(401)
        .end(done);
    });

    // USER

    it('fails for a user', done => {
      request(server)
        .get(`/api/v1/users?token=${users.u._token}`)
        .expect(401)
        .end(done);
    });

    // MANAGER

    it('lists all users for a manager', done => {
      request(server)
        .get(`/api/v1/users?token=${users.m._token}`)
        .expect(200)
        .expect(res => {
          expect(res.body.length).to.be.at.least(4);
        })
        .end(done);
    });

    // ADMIN

    it('lists all users for an admin', done => {
      request(server)
        .get(`/api/v1/users?token=${users.a._token}`)
        .expect(200)
        .expect(res => {
          expect(res.body.length).to.be.at.least(4);
        })
        .end(done);
    });
  });
});
