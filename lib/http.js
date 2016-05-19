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
      callback(
        new VError(
          'service call to guid "%s" returned non 200 response: %j',
          res.statusCode,
          body
        ),
        null
      );
    } else {
      callback(null, body);
    }
  }

  fh.service(opts, onServiceCallComplete);
};
