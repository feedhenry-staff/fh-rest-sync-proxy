'use strict';

var VError = require('verror')
  , genHandlers = require('./handlers')
  , sync = null;

try {
  sync = require('fh-mbaas-api').sync;
} catch (e) {
  throw new VError(
    e,
    'fh-mbaas-api module not found. please run ' +
    '"npm install fh-mbaas-api@5.X --save" in the project root'
  );
}


/**
 * Create a sync proxy with the given options.
 * @param  {Object} opts Object containing a service "guid"
 * @return {Object}
 */
module.exports = function (opts) {
  var ret = {};

  /**
   * Provides the ability to initialise a dataset in the usual manner,
   * but uses our MBaaS REST sync handlers instead of user defined or defaults
   *
   * @param {String}   dataset  Name of the dataset
   * @param {Object}   syncOpts Options to pass to fh.sync.init
   * @param {Function} done
   */
  ret.initDataset = async function (dataset, syncOpts, callback) {
    var handlers = await  genHandlers(dataset, opts);

    sync.init(dataset, syncOpts, function onSyncInit (err) {
      if (err) {
        callback(new VError(err, 'failed to init dataset %s', dataset));
      } else {
        sync.handleList(dataset, handlers.handleList);
        sync.handleUpdate(dataset, handlers.handleUpdate);
        sync.handleRead(dataset, handlers.handleRead);
        sync.handleDelete(dataset, handlers.handleDelete);
        sync.handleCreate(dataset, handlers.handleCreate);

        process.nextTick(callback);
      }
    });
  };

  return ret;
};
