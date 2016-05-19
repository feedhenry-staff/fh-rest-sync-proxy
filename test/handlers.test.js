'use strict';

var sinon = require('sinon')
  , expect = require('chai').expect
  , proxyquire = require('proxyquire');

describe(__filename, function () {

  var mod;
  var stubs;
  var id = 'abc';
  var guid = '12345';
  var dataset = 'dataset';

  beforeEach(function () {
    stubs = {
      './http': sinon.stub()
    };

    mod = proxyquire('../lib/handlers', stubs)(dataset, {
      guid: guid
    });
  });

  describe('#handleList', function () {
    it('should return an error', function (done) {
      var params = {
        type: 'sync'
      };

      stubs['./http'].yields(new Error('oops, list error'), null);

      mod.handleList(dataset, params, function (err, data) {
        expect(err).to.exist;
        expect(err.toString()).to.contain(
          'failed to perform "list" for "dataset": oops, list error'
        );
        expect(data).to.be.null;

        done();
      });
    });

    it('should pass params to http and return data', function (done) {

      var list = [{
        name: 'sync'
      }];

      var params = {
        type: 'sync'
      };

      stubs['./http'].yields(null, list);

      mod.handleList(dataset, params, function (err, data) {
        expect(err).to.not.exist;
        expect(data).to.deep.equal(list);
        expect(stubs['./http'].calledOnce).to.be.true;
        expect(stubs['./http'].getCall(0).args[0]).to.deep.equal({
          guid: guid,
          method: 'GET',
          data: params,
          path: '/' + dataset
        });

        done();
      });
    });
  });

  describe('#handleRead', function () {
    it('should return item with an id', function (done) {
      var item = {
        test: 'data'
      };

      stubs['./http'].yields(null, item);

      mod.handleRead(dataset, id, function (err, data) {
        expect(err).to.not.exist;
        expect(data).to.deep.equal(item);
        expect(stubs['./http'].calledOnce).to.be.true;
        expect(stubs['./http'].getCall(0).args[0]).to.deep.equal({
          guid: guid,
          method: 'GET',
          path: '/' + dataset + '/' + id
        });

        done();
      });
    });
  });

  describe('#handleUpdate', function () {
    it('should send an update for an existing item', function (done) {
      var data = {
        test: 'data'
      };

      stubs['./http'].yields(null);

      mod.handleUpdate(dataset, id, data, function (err) {
        expect(err).to.not.exist;
        expect(stubs['./http'].calledOnce).to.be.true;
        expect(stubs['./http'].getCall(0).args[0]).to.deep.equal({
          guid: guid,
          method: 'PUT',
          data: data,
          path: '/' + dataset + '/' + id
        });

        done();
      });
    });
  });

  describe('#handleDelete', function () {
    it('should', function (done) {
      stubs['./http'].yields(null);

      mod.handleDelete(dataset, id, function (err) {
        expect(err).to.not.exist;
        expect(stubs['./http'].calledOnce).to.be.true;
        expect(stubs['./http'].getCall(0).args[0]).to.deep.equal({
          guid: guid,
          method: 'DELETE',
          path: '/' + dataset + '/' + id
        });

        done();
      });
    });
  });

  describe('#handleCreate', function () {
    it('should', function (done) {
      var data = {
        key: 'value'
      };

      stubs['./http'].yields(null, data);

      mod.handleCreate(dataset, data, function (err, data) {
        expect(err).to.not.exist;
        expect(data).to.deep.equal(data);
        expect(stubs['./http'].calledOnce).to.be.true;
        expect(stubs['./http'].getCall(0).args[0]).to.deep.equal({
          guid: guid,
          method: 'POST',
          path: '/' + dataset,
          data: data
        });

        done();
      });
    });
  });


});
