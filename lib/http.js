var VError = require('verror')
  , request = require('request')
  , log = require('fh-bunyan').getLogger(__filename);

module.exports = async function performServiceCall (opts, callback) {

  function onServiceCallComplete (err, res, body) {
    if (!err) {
      log.debug(
        'service call to %s complete with status %s, and data: %j',
        opts.url,
        res.statusCode,
        body
      );
    }

    if (err) {
      callback(
        new VError(
          err,
          'failed to perform call to service "%s"',
          opts.url
        ),
        null
      );
    } else if (res.statusCode !== 200) {
      // TODO: what about a 404 for "read" calls?
      callback(
        new VError(
          'service call to guid "%s" returned %s status. error: %j',
          opts.url,
          res.statusCode,
          body.msg || body
        ),
        body.msg || body,
        null
      );
    } else {
      callback(null, null, body);
    }
  }
  let extraHeaders = {};
  if (opts.injectHeadersFn) {
    try {
      extraHeaders = await opts.injectHeadersFn();

    }
    catch(err) {
      log.error(
        'service call to %s complete with status %s, and data: %j',
        opts.url,
        err
      );
    }
    delete opts.injectHeadersFn;

  }
  if (opts.headers) {
    opts.headers = Object.assign(extraHeaders, opts.headers);
  } else {
    opts.headers = extraHeaders;
  }
  request(opts, onServiceCallComplete);
};
