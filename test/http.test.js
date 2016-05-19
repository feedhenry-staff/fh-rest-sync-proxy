'use strict';

var sinon = require('sinon')
  , expect = require('chai').expect
  , proxyquire = require('proxyquire');

describe(__filename, function () {

  var mod, stubs, opts, resData;

  beforeEach(function () {
    resData = {
      a: 'b'
    };

    opts = {
      guid: '12345'
    };

    stubs = {
      'fh-mbaas-api': {
        service: sinon.stub()
      }
    };

    mod = proxyquire('../lib/http', stubs);
  });

  it('should return a non 200 status error', function (done) {
    stubs['fh-mbaas-api'].service.yields(null, resData, {statusCode: 500});

    mod(opts, function (err, data) {
      expect(err).to.exist;
      expect(err.toString()).to.contain(
        'service call to guid "500" returned non 200 response: { a: \'b\' }'
      );
      expect(data).to.not.exist;
      expect(stubs['fh-mbaas-api'].service.getCall(0).args[0]).to.deep.equal(opts);
      done();
    });
  });

  it('should return an error', function (done) {
    stubs['fh-mbaas-api'].service.yields(new Error('ECONNRESET'), null, null);

    mod(opts, function (err, data) {
      expect(err).to.exist;
      expect(err.toString()).to.contain(
        'failed to perform call to service "12345": ECONNRESET'
      );
      expect(data).to.not.exist;
      expect(stubs['fh-mbaas-api'].service.getCall(0).args[0]).to.deep.equal(opts);
      done();
    });
  });

  it('should return data', function (done) {
    stubs['fh-mbaas-api'].service.yields(null, resData, {statusCode: 200});

    mod(opts, function (err, data) {
      expect(err).to.not.exist;
      expect(data).to.deep.equal(resData);
      expect(stubs['fh-mbaas-api'].service.getCall(0).args[0]).to.deep.equal(opts);
      done();
    });
  });

});
