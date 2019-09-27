'use strict';

var sinon = require('sinon')
  , expect = require('chai').expect
  , proxyquire = require('proxyquire');

describe(__filename, function () {

  var mod;
  var simpleMod;
  var stubs;
  var id = 'abc';
  var url = 'https://service.to.call.com';
  var dataset = 'dataset';

  beforeEach(function () {
    stubs = {
      './http': sinon.stub(),
      './build-route': sinon.stub()
    };

    mod = proxyquire('../lib/handlers', stubs)(dataset, {
      url: url
    });
  });

  describe('#handleList', function () {
    it('should return an error', function (done) {
      var params = {
        type: 'sync'
      };

      stubs['./http'].yields(new Error('oops, list error'), null);
      stubs['./build-route'].returns(dataset);

      mod.handleList(dataset, params, function (err, data) {
        expect(err).to.exist;
        expect(err.msg).to.contain(
          'failed to perform "list" for dataset "dataset" using endpoint "dataset": oops, list error'
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

      stubs['./http'].yields(null, null, list);
      stubs['./build-route'].returns(dataset);

      mod.handleList(dataset, params, function (err, data) {
        expect(err).to.not.exist;
        expect(data).to.deep.equal(list);
        expect(stubs['./http'].calledOnce).to.be.true;
        expect(stubs['./http'].getCall(0).args[0]).to.deep.equal({
          url: 'https://service.to.call.com/dataset',
          method: 'GET',
          qs: params,
          timeout: 25000
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

      stubs['./http'].yields(null, null, item);
      stubs['./build-route'].returns(dataset);

      mod.handleRead(dataset, id, function (err, data) {
        expect(err).to.not.exist;
        expect(data).to.deep.equal(item);
        expect(stubs['./http'].calledOnce).to.be.true;
        expect(stubs['./http'].getCall(0).args[0]).to.deep.equal({
          url: 'https://service.to.call.com/dataset/abc',
          method: 'GET',
          timeout: 25000
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
      stubs['./build-route'].returns(dataset);

      mod.handleUpdate(dataset, id, data, function (err) {
        expect(err).to.not.exist;
        expect(stubs['./http'].calledOnce).to.be.true;
        expect(stubs['./http'].getCall(0).args[0]).to.deep.equal({
          url: 'https://service.to.call.com/dataset/abc',
          method: 'PUT',
          json: data,
          timeout: 25000
        });

        done();
      });
    });
  });


  describe('#handleDelete', function () {
    it('should delete a record', function (done) {
      stubs['./http'].yields(null);
      stubs['./build-route'].returns(dataset);

      mod.handleDelete(dataset, id, function (err) {
        expect(err).to.not.exist;
        expect(stubs['./http'].calledOnce).to.be.true;
        expect(stubs['./http'].getCall(0).args[0]).to.deep.equal({
          url: 'https://service.to.call.com/dataset/abc',
          method: 'DELETE',
          timeout: 25000
        });

        done();
      });
    });
  });

  describe('#handleCreate', function () {
    it('should create a record', function (done) {
      var data = {
        key: 'value'
      };

      stubs['./http'].yields(null, null, data);
      stubs['./build-route'].returns(dataset);

      mod.handleCreate(dataset, data, function (err, data) {
        expect(err).to.not.exist;
        expect(data).to.deep.equal(data);
        expect(stubs['./http'].calledOnce).to.be.true;
        expect(stubs['./http'].getCall(0).args[0]).to.deep.equal({
          url: 'https://service.to.call.com/dataset',
          method: 'POST',
          json: data,
          timeout: 25000
        });

        done();
      });
    });
  });

});
