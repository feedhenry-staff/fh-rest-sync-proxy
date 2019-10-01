var VError = require('verror')
  , request = require('request')
  , log = require('fh-bunyan').getLogger(__filename);

module.exports = function getHttpAdapter (opts) {
  const injectHeadersFn = opts.injectHeadersFn;

  return async function performServiceCall (opts, callback) {
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

    if (injectHeadersFn) {
      // If an inject headers function is defined call it
      try {
        opts.headers = await injectHeadersFn(opts);
      } catch (e) {
        // Don't make the request since we failed to get necessary headers
        return onServiceCallComplete(new VError(e, 'injectHeaders error'));
      }
    }
    request(opts, onServiceCallComplete);
  };
};
