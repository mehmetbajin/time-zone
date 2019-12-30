
# Time Zone

[![Greenkeeper badge](https://badges.greenkeeper.io/mehmetbajin/timezone.svg)](https://greenkeeper.io/)

This app allows users to manage their favorite time zone records.

# Getting Started

## Server

```bash
$ cd server/
$ npm install
$ gulp serve
```

## Client

```bash
$ cd client/
$ npm install
$ bower install
$ gulp serve
```

# Unit Tests

## Server

```bash
$ cd server/
$ gulp test
```

Coverage report is available under the `server/coverage/` directory.

## Client

```bash
$ cd client/
$ gulp test
```

Coverage report is available under the `client/coverage/` directory.

# E2E Tests

## Server

N/A

## Client

```bash
$ cd client/
$ gulp protractor
```

# Rest API

For GET and DELETE operations, the payload must be provided as query parameters. For POST and PUT operations, the payload must be provided in the request body.

On error, an error object is returned with a description of the error:

```
{
  "error": string
}
```

All APIs expect and return JSON.

## Authentication

### POST: /api/v1/auth/login

Request:

```
{
  "email": string,
  "password": string
}
```

Response:

```
{
  "_id": string,
  "_token": string,
  "name": string,
  "email": string,
  "role": number<10|20|99>
}
```

### POST: /api/v1/auth/logout

Request:

```
{
  "token": string
}
```

### POST: /api/v1/auth/password-reset

Request:

```
{
  "email": string
}
```

### POST: /api/v1/auth/password-set

Request:

```
{
  "oobCode": string,
  "password": string
}
```

Response:

```
{
  "email": string
}
```

## Users

### POST: /api/v1/users

Request:

```
{
  "data": {
    "name": string,
    "email": string,
    "role": ?number<10|20|99>
  },
  "password": string,
  "token": ?string
}
```

If `role` is omitted, it defaults to 10 (User).

If request is on behalf of a user manager, that manager's auth token must be provided.

Response:

```
{
  "_id": string,
  "_token": string?,
  "name": string,
  "email": string,
  "role": number<10|20|99>
}
```

If request were on behalf of a user manager, `_token` is omitted from the response.

### GET: /api/v1/users/:id

Request:

```
{
  "token": string
}
```

Response:

```
{
  "_id": string,
  "name": string,
  "email": string,
  "role": number<10|20|99>
}
```

### GET: /api/v1/users

Request:

```
{
  "token": string
}
```

Response:

```
[
  {
    "_id": string,
    "name": string,
    "email": string,
    "role": number<10|20|99>
  },{
    "_id": string,
    "name": string,
    "email": string,
    "role": number<10|20|99>
  },
  ...
]
```

Users are ordered by their creation times.

### PUT: /api/v1/users/:id

Request:

```
{
  "data": {
    "name": string,
    "email": string,
    "role": number<10|20|99>
  },
  "token": string
}
```

Response:

```
{
  "_id": string,
  "name": string,
  "email": string,
  "role": number<10|20|99>
}
```

Responds with the updated user record.

### DELETE: /api/v1/users/:id

Request:

```
{
  "token": string
}
```

## Timezones

### POST: /api/v1/timezones

Request:

```
{
  "data": {
    "code": string,
    "city": string,
    "owner": string
  },
  "token": ?string
}
```

Response:

```
{
  "_id": string,
  "code": string,
  "city": string,
  "owner": string
}
```

### GET: /api/v1/timezones/:id

Request:

```
{
  "token": string
}
```

Response:

```
{
  "_id": string,
  "code": string,
  "city": string,
  "owner": string
}
```

### GET: /api/v1/timezones

Request:

```
{
  "token": string
}
```

Response:

```
[
  {
    "_id": string,
    "code": string,
    "city": string,
    "owner": string
  },{
    "_id": string,
    "code": string,
    "city": string,
    "owner": string
  },
  ...
]
```

Timezone records are ordered by their creation times.

### PUT: /api/v1/timezones/:id

Request:

```
{
  "data": {
    "code": string,
    "city": string,
    "owner": string
  },
  "token": string
}
```

Response:

```
{
  "_id": string,
  "code": string,
  "city": string,
  "owner": string
}
```

Responds with the updated timezone record.

### DELETE: /api/v1/timezones/:id

Request:

```
{
  "token": string
}
```

## Codes

### GET: /api/v1/codes

Response:

```
[
  {
    "name": string,
    "offset": string
  },{
    "name": string,
    "offset": string
  },
  ...
]
```

## Cities

### GET: /api/v1/cities

Response:

```
[
  {
    "name": string,
    "code": string
  },{
    "name": string,
    "code": string
  },
  ...
]
```
