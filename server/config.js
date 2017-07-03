'use strict';

const _ = require('lodash');
const api = require('./app/api/api');
const cors = require('cors');
const bodyParser = require('body-parser');
const express = require('express');
const morgan = require('morgan');
const p = require('parameters-middleware');

const app = express();

// BODY-PARSER

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

// CORS

const corsWhiteList = ['http://localhost:3000'];
const corsOptions = {
  origin: (origin, cb) => {
    cb(null, _.includes(corsWhiteList, origin));
  }
};

app.use(cors(corsOptions));

// LOGGING

/* istanbul ignore if */
if (!process.env.TESTING) {
  app.use(morgan('combined'));
}

// APIs

_.chain(api).values().flatten().value().forEach(a => {
  if (a.parameters) {
    app[a.method](`/api/v1${a.path}`, p(a.parameters), a.callback);
  } else {
    app[a.method](`/api/v1${a.path}`, a.callback);
  }
});

module.exports = app;
