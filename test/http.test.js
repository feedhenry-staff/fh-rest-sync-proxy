'use strict';

var sinon = require('sinon')
  , expect = require('chai').expect
  , proxyquire = require('proxyquire');

describe(__filename, function () {

  var mod, stubs, stub, opts, resData;

  beforeEach(function () {
    resData = {
      a: 'b'
    };

    opts = {
      url: 'http://service.to.call.com'
    };
    stubs = {
      'request': sinon.stub(),
      './keycloak/util': {
        getKeycloak: function() {
          return new Promise(resolve => {
            resolve(stubs['request'])
          })
        }
      }

    };
    mod = proxyquire('../lib/http', stubs);
  });

  it('should return a non 200 status error', function (done) {
    stubs['request'].yields(null, {statusCode: 500}, resData );

    mod(opts, function (err, failMsg, data) {
      expect(err).to.exist;
      expect(err.toString()).to.contain(
        'service call to guid "http://service.to.call.com" returned 500 status. error: { a: \'b\' }'
      );
      expect(data).to.not.exist;
      expect(stubs['request'].getCall(0).args[0]).to.deep.equal(opts);
      done();
    });
  });

  it('should return an error', function (done) {
    stubs['request'].yields(new Error('ECONNRESET'), null, null);

    mod(opts, function (err, data) {
      expect(err).to.exist;
      expect(err.toString()).to.contain(
        'failed to perform call to service "http://service.to.call.com": ECONNRESET'
      );
      expect(data).to.not.exist;
      expect(stubs['request'].getCall(0).args[0]).to.deep.equal(opts);
      done();
    });
  });

  it('should return data', function (done) {
    stubs['request'].yields(null,  {statusCode: 200}, resData);

    mod(opts, function (err, failMsg, data) {
      expect(err).to.not.exist;
      expect(data).to.deep.equal(resData);
      expect(stubs['request'].getCall(0).args[0]).to.deep.equal(opts);
      done();
    });
  });

  it('should test adding additional header', function(done) {
    stubs['request'].yields(null,  {statusCode: 200}, resData);
    opts.injectHeadersFn = function() {
      return new Promise((resolve) => {
        resolve({headerKey: 'headerVal'});
      });
    };
    mod(opts, function(err, failMsg, data) {
      sinon.assert.calledWith(stubs['request'], { headers: { headerKey: "headerVal"}, url: "http://service.to.call.com"});
      expect(err).to.not.exist;
      expect(data).to.deep.equal(resData);
      done();
    });
  });

});
