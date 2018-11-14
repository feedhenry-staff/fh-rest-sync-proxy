# fh-rest-sync-proxy

[![Travis CI](https://travis-ci.org/feedhenry-staff/fh-rest-sync-proxy.svg)](https://travis-ci.org/feedhenry-staff/fh-rest-sync-proxy)

Minimalist FH.Sync integrations, from a Cloud Application, that retrieve data
from a RESTful API running on a Red Hat Mobile MBaaS Service.

You can read more about the FH.Sync API [here](http://docs.feedhenry.com/v3/api/api_sync.html).
Essentially this module automatically implements the *sync.handleList*,
*sync.handleRead*, etc. for you.

## Install

_NOTE: If you are using fh-mbaas-api v6 or lower you must use the 0.x version of
this module. fh-mbaas-api v7 and v8 are not supported._

To use this module you must have fh-mbaas-api version 9.0.0 or higher installed
in your package.json. Install example is below.

```
npm install fh-mbaas-api@9 --save

npm install fh-rest-sync-proxy --save
```


## Usage

### Barebones Example
This example initialises your Cloud Application so that it can serve FH.Sync
calls for a Client Application requesting the dataset "orders".

```js
var sync = require('fh-rest-sync-proxy');

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

// Intialise an orders dataset. Any sync calls for "orders" will be
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
  timeout: 15000,

  // remove property for a non nested API, e.g /path-to-nested-data-set/orders, vs. /orders
  pathToPrepend: 'path-to-nested-data-set'
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

## API

#### module(opts)
Create a sync proxy instance. Supported options are:

[REQUIRED] guid - appId/guid of the MBaaS Service you are making calls to
[OPTIONAL] timeout - time to wait before considering a call to opts.guid as
timed out
[OPTIONAL] pathToPrepend - By default the _dataset_ passed to _initDataset_ is
used as the URL to get data, e.g /orders, but you might need a nested path
such as /branches/orders. If this is required place "/branches" or your
equivalent in _opts.pathToPrepend_

Module calls return an instance.

#### instance.initDataset(dataset, syncOptions, callback)
Function used to enable sync passthrough/proxy to the MBaaS identified by
_opts.guid_ passed to _module(opts)_. Arguments:

(String) dataset - The name of the dataset being exposed for sync
(Object) syncOptions - Options for the underlying _fhMbaasApi.sync_ call.
Detailed info [here](http://docs.feedhenry.com/v3/api/api_sync.html#api_sync-node_js_api-_fh_sync_init)
(Function) callback - Called once initialisation is complete

### Required MBaaS HTTP API Definition
For sync calls to succeed, your HTTP API must match the structure that sync
expects. To easily create APIs like the one below you can use
_fh-rest-express-router_.

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

## Contributors

* Evan Shortiss
* Jim Dillon


## Contributing Guide
Open an Issue to discuss ideas/bugs or get in touch via other means if desired.
Alternatively open a PR if you feel you have a feature/fix that does not need
significant discussion.

Be sure that running `npm test` passes for any PR opened!
