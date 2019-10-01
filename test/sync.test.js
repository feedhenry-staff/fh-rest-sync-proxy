'use strict';

var sinon = require('sinon')
  , expect = require('chai').expect
  , proxyquire = require('proxyquire');

describe(__filename, function () {
  var mod, stubs, dataset, syncOpts, opts;

  beforeEach(function () {
    dataset = '123';

    syncOpts = {
      sync_frequency: 60
    };

    opts = {
      url: 'http://example.url.com'
    };

    stubs = {
      'fh-mbaas-api': {
        sync: {
          init: sinon.stub(),
          handleList: sinon.spy(),
          handleUpdate: sinon.spy(),
          handleRead: sinon.spy(),
          handleDelete: sinon.spy(),
          handleCreate: sinon.spy()
        }
      },
      './handlers': sinon.spy(function () {
        return {
          handleList: sinon.stub(),
          handleUpdate: sinon.stub(),
          handleRead: sinon.stub(),
          handleDelete: sinon.stub(),
          handleCreate: sinon.stub()
        };
      })
    };

    mod = proxyquire('../lib/sync', stubs)(opts);
  });

  describe('#initDataset', function () {

    it('should fail to init', function (done) {
      stubs['fh-mbaas-api'].sync.init.yields(new Error('sync init fail'));

      mod.initDataset(dataset, syncOpts, function (err) {
        expect(err).to.exist;
        expect(err.toString()).to.contain('sync init fail');
        expect(
          stubs['fh-mbaas-api'].sync.init.getCall(0).args[0]
        ).to.equal(dataset);
        expect(
          stubs['fh-mbaas-api'].sync.init.getCall(0).args[1]
        ).to.equal(syncOpts);

        done();
      });
    });

    it('should init successfully', function (done) {
      stubs['fh-mbaas-api'].sync.init.yields(null);

      mod.initDataset(dataset, syncOpts, function (err) {
        expect(err).to.not.exist;

        expect(
          stubs['fh-mbaas-api'].sync.init.getCall(0).args[0]
        ).to.equal(dataset);
        expect(
          stubs['fh-mbaas-api'].sync.init.getCall(0).args[1]
        ).to.equal(syncOpts);

        expect(
          stubs['fh-mbaas-api'].sync.handleList.called
        ).to.be.true;
        expect(
          stubs['fh-mbaas-api'].sync.handleUpdate.called
        ).to.be.true;
        expect(
          stubs['fh-mbaas-api'].sync.handleRead.called
        ).to.be.true;
        expect(
          stubs['fh-mbaas-api'].sync.handleDelete.called
        ).to.be.true;
        expect(
          stubs['fh-mbaas-api'].sync.handleCreate.called
        ).to.be.true;

        done();
      });
    });

  });

});
