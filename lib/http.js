'use strict';

var VError = require('verror')
  , fh = require('fh-mbaas-api');

module.exports = function performFhServiceCall (opts, callback) {

  function onServiceCallComplete (err, body, res) {
    if (err) {
      callback(
        new VError(
          err,
          'failed to perform call to service "%s"',
          opts.guid
        ),
        null
      );
    } else if (res.statusCode !== 200) {
      // TODO: what about a 404 for "read" calls?
      callback(
        new VError(
          'service call to guid "%s" returned %s status. error: %j',
          opts.guid,
          res.statusCode,
          body.msg || body
        ),
        body.msg || body,
        null
      );
    } else {
      callback(null, body);
    }
  }

  fh.service(opts, onServiceCallComplete);
};
