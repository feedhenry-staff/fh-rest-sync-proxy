# fh-sync-mbaas-proxy

Minimalist FH.Sync integrations, from a Cloud Application, that retrieve data
from a RESTful API running on a Red Hat Mobile MBaaS Service.

You can read more about the FH.Sync API [here](http://docs.feedhenry.com/v3/api/api_sync.html).
Essentially this module automatically implements the *sync.handleList*,
*sync.handleRead*, etc. for you.

## Install
To use this module you must have fh-mbaas-api version 5.0.0 or higher installed
in your package.json. Install example is below.

```
npm install fh-mbaas-api@5.X --save
```

This module is not yet published to npm, but you can install from GitHub as
shown below. (Only tested using npm CLI version 3)

```
npm install feedhenry-staff/fh-rest-sync-proxy
```

## Usage

### Barebones Example
This example initialises your Cloud Application so that it can serve FH.Sync
calls for a Client Application requesting the dataset "orders".

```js
var mbaasSync = require('fh-rest-sync-proxy');

// Create a sync object that communicates with a service
var serviceSync = sync({
  guid: 'jsgduuQ50ZtF6iR3xuaacGvn',
  timeout: 15000
});

var syncOpts = {
  // Place the usual sync options here
  sync_frequency: 10,
  logLevel: 'error'
};

// Intialise a tickets dataset. Any sync calls for "tickets" will be
// routed to the MBaaS Service with guid "jsgduuQ50ZtF6iR3xuaacGvn"
serviceSync.initDataset('orders', syncOpts, function (err) {
  if (err) throw err; // Throw error, or retry init of sync
});
```

### Full Example
This is the same as the previous example, but shows a full Cloud Application entry point.

```js
'use strict';

var express = require('express')
  , mbaasApi = require('fh-mbaas-api')
  , mbaasExpress = mbaasApi.mbaasExpress()
  , app = module.exports = express()
  , mbaasSync = require('fh-rest-sync-proxy')
  , log = require('fh-bunyan').getLogger(__filename);

log.info('starting application');

// Note: the order which we add middleware to Express here is important!
app.use('/sys', mbaasExpress.sys([]));
app.use('/mbaas', mbaasExpress.mbaas);

// Note: important that this is added just before your own Routes
app.use(mbaasExpress.fhmiddleware());

//
app.use('/my-route', require('./routes/my-route'));

// Important that this is last!
app.use(mbaasExpress.errorHandler());


// Create a sync object that communicates with a service
var serviceSync = mbaasSync({
  guid: 'jsgduuQ50ZtF6iR3xuaacGvn',
  timeout: 15000
});

var syncOpts = {
  // Place the usual sync options here
  sync_frequency: 10,
  logLevel: 'error'
};

// Intialise a orders dataset. Any sync calls for "orders" will be
// routed to the MBaaS Service with guid "jsgduuQ50ZtF6iR3xuaacGvn"
// and the result sent back to the client automatically, e.g
// sync read will go to GET /orders/:id on the service
serviceSync.initDataset('orders', syncOpts, function (err) {
  if (err) throw err; // Throw error, or retry init of sync

  var port = process.env.FH_PORT || process.env.VCAP_APP_PORT || 8001;

  app.listen(port, function() {
    log.info('app started on port: %s', port);
  });
});
```


## Prerequisites
Before adding this module to your Cloud Application you must have created an
MBaaS Service that exposes a RESTful API that can be used to query data from
a backend store.

If this sounds daunting, fear not; we are working on adapters
that can expose common backend stores in the correct format. We'll add a list
here soon!

### API Definition
In the below examples *dataset-name* can be anything you like, e.g "orders",
"jobs", or "users".

#### GET /dataset-name
Generic list endpoint that returns an Object containing key value pairs based
on a querystring. Keys must be unique IDs and values must be Objects.

Sample URL: GET /users?group=admin

Sample response:

```json
{
  "02833": {
    "group": "admin",
    "firstname": "shadow",
    "lastname": "man"
  },
  "02834": {
    "group": "admin",
    "firstname": "red",
    "lastname": "hat"
  }
}
```

#### GET /dataset-name/:id
Returns an Object from the store based on the passed _id_.

Sample URL: GET /users/02834

Sample response:

```json
{
  "group": "admin",
  "firstname": "red",
  "lastname": "hat"
}
```

#### POST /dataset-name/
Accepts an Object that contains data to create a new entry in the backend store.
Returns the created Object data and unique ID (uid).

Sample URL: POST /users

Sample response:

```json
{
  "uid": "02834",
  "data": {
    "group": "admin",
    "firstname": "red",
    "lastname": "hat"
  }
}
```

#### PUT /dataset-name/:id
Accepts an Object that contains data to update an entry in the backend store.
Returns the updated Object.

Sample URL: PUT /users/02834

Sample response:

```json
{
  "firstname": "red",
  "lastname": "hatter"
}
```

#### DELETE - /dataset-name/:id
Deletes the data associated with the given _id_ from the backend store. Returns
the deleted data.

Sample URL: DELETE /users/02834

Sample response:

```json
{
  "group": "admin",
  "firstname": "red",
  "lastname": "hat"
}
```
