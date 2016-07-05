'use strict';

var urlJoin = require('url-join');

module.exports = function buildRoute(opts, dataset) {
  if(opts && opts.pathToPrepend) {
    return urlJoin(opts.pathToPrepend, dataset);
  }
  else {
    return dataset;
  }
};
