'use strict';

const _ = require('lodash');
const chai = require('chai');
const expect = chai.expect;
const firebase = require('firebase');
const admin = require('firebase-admin');
const q = require('q');
const request = require('supertest');
const server = require('../../server');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.use(sinonChai);

describe('auth', () => {
  let user;
  let snapshot;

  let oobCode;
  let authUser;

  beforeEach(() => {
    user = {
      _id: 'oqXJcfe2ySaNgbchk1A73ajTpqz2',
      _token: 'adsfzxcvqwer1234qwerasdfzxcv',
      name: 'User',
      email: 'user@nowhere.null',
      role: 10,
      password: '12341234'
    };

    snapshot = {
      exists: sinon.stub().returns(true),
      val: sinon.stub().returns({
        [user._id]: _.pick(user, ['email', 'name', 'role'])
      })
    };

    oobCode = 'poiulkjhamnb0987oiuy';

    authUser = {
      uid: user._id,
      getToken: sinon.stub().returns(q.resolve(user._token))
    };

    sinon.stub(firebase, 'auth').returns({
      signInWithEmailAndPassword: sinon.stub().returns(q.resolve(authUser)),
      sendPasswordResetEmail: sinon.stub().returns(q.resolve()),
      verifyPasswordResetCode: sinon.stub().returns(q.resolve(user.email)),
      confirmPasswordReset: sinon.stub().returns(q.resolve()),
      signOut: sinon.stub().returns(q.resolve())
    });

    sinon.stub(admin, 'database').returns({
      ref: function () {
        return this;
      },
      orderByChild: function () {
        return this;
      },
      equalTo: function () {
        return this;
      },
      once: sinon.stub().returns(q.resolve(snapshot))
    });
  });

  afterEach(() => {
    firebase.auth.restore();
    admin.database.restore();
  });

  describe('login', () => {
    it('requires email in request body', done => {
      request(server)
        .post('/api/v1/auth/login')
        .send({
          password: user.password
        })
        .expect(400)
        .end(done);
    });

    it('requires password in request body', done => {
      request(server)
        .post('/api/v1/auth/login')
        .send({
          email: user.email
        })
        .expect(400)
        .end(done);
    });

    it('fails when user with email does not exist', done => {
      snapshot.exists = sinon.stub().returns(false);
      request(server)
        .post('/api/v1/auth/login')
        .send({
          email: user.email,
          password: user.password
        })
        .expect(401)
        .expect(() => {
          expect(snapshot.exists).to.have.been.called;
          expect(snapshot.val).not.to.have.been.called;
          expect(firebase.auth().signInWithEmailAndPassword).not.to.have.been.called;
          expect(authUser.getToken).not.to.have.been.called;
          expect(firebase.auth().signOut).to.have.been.called;
        })
        .end(done);
    });

    it('fails when password is not accepted', done => {
      firebase.auth().signInWithEmailAndPassword = sinon.stub().returns(q.reject());
      request(server)
        .post('/api/v1/auth/login')
        .send({
          email: user.email,
          password: user.password
        })
        .expect(401)
        .expect(() => {
          expect(snapshot.exists).to.have.been.called;
          expect(snapshot.val).to.have.been.called;
          expect(firebase.auth().signInWithEmailAndPassword).to.have.been.calledWith(user.email, user.password);
          expect(authUser.getToken).not.to.have.been.called;
          expect(firebase.auth().signOut).to.have.been.called;
        })
        .end(done);
    });

    it('loads user record when successful', done => {
      request(server)
        .post('/api/v1/auth/login')
        .send({
          email: user.email,
          password: user.password
        })
        .expect(200)
        .expect(res => {
          expect(snapshot.exists).to.have.been.called;
          expect(snapshot.val).to.have.been.called;
          expect(firebase.auth().signInWithEmailAndPassword).to.have.been.calledWith(user.email, user.password);
          expect(authUser.getToken).to.have.been.calledWith(true);
          expect(firebase.auth().signOut).to.have.been.called;
          expect(res.body).to.have.property('_id', user._id);
          expect(res.body).to.have.property('_token', user._token);
          expect(res.body).to.have.property('name', user.name);
          expect(res.body).to.have.property('email', user.email);
          expect(res.body).to.have.property('role', user.role);
        })
        .end(done);
    });
  });

  describe('logout', () => {
    it('requires token in request body', done => {
      request(server)
        .post('/api/v1/auth/logout')
        .expect(400)
        .end(done);
    });

    it('responds with HTTP 200 on success', done => {
      request(server)
        .post('/api/v1/auth/logout')
        .send({
          token: user._token
        })
        .expect(200)
        .end(done);
    });
  });

  describe('resetPassword', () => {
    it('requires email in request body', done => {
      request(server)
        .post('/api/v1/auth/password-reset')
        .expect(400)
        .end(done);
    });

    it('fails when user with email does not exist', done => {
      snapshot.exists = sinon.stub().returns(false);
      request(server)
        .post('/api/v1/auth/password-reset')
        .send({
          email: user.email
        })
        .expect(400)
        .expect(() => {
          expect(snapshot.exists).to.have.been.called;
          expect(snapshot.val).not.to.have.been.called;
          expect(firebase.auth().sendPasswordResetEmail).not.to.have.been.called;
        })
        .end(done);
    });

    it('sends password reset email', done => {
      request(server)
        .post('/api/v1/auth/password-reset')
        .send({
          email: user.email
        })
        .expect(200)
        .expect(() => {
          expect(snapshot.exists).to.have.been.called;
          expect(snapshot.val).to.have.been.called;
          expect(firebase.auth().sendPasswordResetEmail).to.have.been.calledWith(user.email);
        })
        .end(done);
    });
  });

  describe('setPassword', () => {
    it('requires oob code in request body', done => {
      request(server)
        .post('/api/v1/auth/password-set')
        .send({
          password: user.password
        })
        .expect(400)
        .end(done);
    });

    it('requires new password in request body', done => {
      request(server)
        .post('/api/v1/auth/password-set')
        .send({
          oobCode: oobCode
        })
        .expect(400)
        .end(done);
    });

    it('handles failure', done => {
      firebase.auth().confirmPasswordReset = sinon.stub().returns(q.reject());
      request(server)
        .post('/api/v1/auth/password-set')
        .send({
          oobCode: oobCode,
          password: user.password
        })
        .expect(400)
        .end(done);
    });

    it('sets the new password', done => {
      request(server)
        .post('/api/v1/auth/password-set')
        .send({
          oobCode: oobCode,
          password: user.password
        })
        .expect(200)
        .expect(res => {
          expect(firebase.auth().verifyPasswordResetCode).to.have.been.calledWith(oobCode);
          expect(firebase.auth().confirmPasswordReset).to.have.been.calledWith(oobCode, user.password);
          expect(res.body).to.equal(user.email);
        })
        .end(done);
    });
  });
});
