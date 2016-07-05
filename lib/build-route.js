'use strict';

var urlJoin = require('url-join');

module.exports = function buildRoute(opts, dataset) {
  if(opts && opts.pathToPrepend) {
    console.log('PATH ', urlJoin(opts.pathToPrepend, dataset));
    return urlJoin(opts.pathToPrepend, dataset);
  }
  else {
    console.log('PATH ', dataset);
    return dataset;
  }
};
