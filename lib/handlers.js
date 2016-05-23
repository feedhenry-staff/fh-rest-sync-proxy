'use strict';

var http = require('./http')
  , log = require('fh-bunyan').getLogger('sync-rest-handlers')
  , VError = require('verror');

var DEFAULT_TIMEOUT = (25 * 1000);

module.exports = function (dataset, opts) {

  log.debug(
    'creating MBaaS sync proxy for dataset "%s" with guid "%s"',
    dataset,
    opts.guid
  );

  var ret = {};


  /**
   * Wraps all callbacks with generic error logging
   * @param  {String}   name      Name of the function we're wrapping
   * @param  {Function} callback
   */
  function handlerCallback (name, callback) {
    return function (err, failureString, data) {
      if (err) {
        var e = new VError(
          err,
          'failed to perform "%s" for "%s"',
          name,
          dataset
        );

        log.warn(e);

        callback({
          // TODO: verify this is the format sync expects
          msg: failureString
        }, null);
      } else {
        log.debug(
          'sync call "%s" for "%s" was successful to "%s"',
          name,
          dataset,
          opts.guid
        );

        callback(null, data);
      }
    };
  }


  /**
   * RESTful list (GET) handler.
   * Uses a HTTP call to an MBaaS to get a list for a generic query
   * @param  {String}   dataset  Name of the dataset (http endpoint to query)
   * @param  {Object}   params   Query params to add to our call
   * @param  {Function} callback
   */
  ret.handleList = function handleList (dataset, params, callback) {
    log.debug(
      'performing "%s" for dataset "%s" with params',
      'handleList',
      dataset,
      params
    );

    http({
      timeout: opts.timeout || DEFAULT_TIMEOUT,
      guid: opts.guid,
      method: 'GET',
      data: params,
      path: '/' + dataset
    }, handlerCallback('list', callback));
  };


  /**
   * RESTful read (GET) handler.
   * Uses a HTTP call to an MBaaS to get a single item from the MBaaS
   * @param  {String}   dataset  Name of the dataset (http endpoint to query)
   * @param  {String}   id       The ID of the resource we are requesting
   * @param  {Function} callback
   */
  ret.handleRead = function handleRead (dataset, id, callback) {
    log.debug(
      'performing "%s" for dataset "%s" for id "%s"',
      'handleRead',
      dataset,
      id
    );

    http({
      timeout: opts.timeout || DEFAULT_TIMEOUT,
      guid: opts.guid,
      method: 'GET',
      path: '/' + dataset + '/' + id.toString()
    }, handlerCallback('read', callback));
  };


  /**
   * RESTful update (PUT) handler.
   * Uses a HTTP call to an MBaaS to update a single item
   * @param  {String}   dataset   Name of the dataset (http endpoint)
   * @param  {String}   id        ID of the resource to update
   * @param  {Object}   data      Data to use to perform the update
   * @param  {Function} callback
   */
  ret.handleUpdate = function handleUpdate (dataset, id, data, callback) {
    log.debug(
      'performing "%s" for dataset "%s" with data %j',
      'handleUpdate',
      dataset,
      data
    );

    http({
      timeout: opts.timeout || DEFAULT_TIMEOUT,
      guid: opts.guid,
      method: 'PUT',
      data: data,
      path: '/' + dataset + '/' + id.toString()
    }, handlerCallback('update', callback));
  };


  /**
   * RESTful delete (DELETE) handler.
   * Uses a HTTP call to an MBaaS to delete a single item
   * @param  {String}   dataset   Name of the dataset (http endpoint)
   * @param  {String}   id        ID of the resource to delete
   * @param  {Function} callback
   */
  ret.handleDelete = function handleDelete (dataset, id, callback) {
    log.debug(
      'performing "%s" for dataset "%s" for id "%s"',
      'handleDelete',
      dataset,
      id
    );

    http({
      timeout: opts.timeout || DEFAULT_TIMEOUT,
      guid: opts.guid,
      method: 'DELETE',
      path: '/' + dataset + '/' + id.toString()
    }, handlerCallback('delete', callback));
  };


  /**
   * RESTful create (POST) handler.
   * Uses a HTTP call to an MBaaS to create a single item
   * @param  {String}   dataset   Name of the dataset (http endpoint)
   * @param  {String}   id        ID of the resource to update
   * @param  {Object}   data      Data to use to perform the create
   * @param  {Function} callback
   */
  ret.handleCreate = function (dataset, data, callback) {
    log.debug(
      'performing "%s" for dataset "%s" with data %j',
      'handleCreate',
      dataset,
      data
    );

    http({
      timeout: opts.timeout || DEFAULT_TIMEOUT,
      guid: opts.guid,
      method: 'POST',
      data: data,
      path: '/' + dataset
    }, handlerCallback('create', callback));
  };

  return ret;
};
