'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const Promise = require('bluebird');
let requires;
let modProxy;

describe(__filename, function() {
  let grantMgrInstanceStub;
  const init = './initialize';
  const authUtils = 'keycloak-auth-utils';

  beforeEach(function() {


    grantMgrInstanceStub = {
      createGrant: sinon.stub(),
      ensureFreshness: sinon.stub()
    };
    requires = {
       [authUtils]: {
         GrantManager: sinon.spy(function () {
           return grantMgrInstanceStub;
         })
       },
       [init]: {
         keycloakAuthenticate: sinon.stub(),
         keycloakRefresh: sinon.stub()
       }
    };

    delete require.cache[require.resolve('../lib/keycloak/util.js')];
    modProxy = proxyquire('../lib/keycloak/util.js', requires);
  });

  describe('#setKeycloakRequestObject', function() {
    it('should return the object passed in.', function(done) {
      var reqObj = {
        a: '1234'
      };
      var result = modProxy.setKeycloakRequestObject(reqObj);
      expect(result).to.eql(reqObj);
      done();
    });
  });

  describe('#getKeycloakRequestObject', function() {
    it('should return an object.', function(done) {
      var result = modProxy.getKeycloakRequestObject();
      expect(result).to.eql({});
      done();
    });
  });

  describe('#setGrant', function() {
    it('should return the object passed in.', function(done) {
      var grantObj = {
        a: 'grant'
      };
      var result = modProxy.setGrant(grantObj);
      expect(result).to.eql(grantObj);
      done();
    });
  });

  describe('#getGrant', function() {
    it('should return an object.', function(done) {
      var result = modProxy.getGrant();
      expect(result).to.eql({});
      done();
    });
  });

  describe('#getKeycloak', function() {

    it('should return an object when token can be refreshed', function() {
      var tokenData = {
        'access_token': {
          token: '123'
        }
      };

      requires[init].keycloakRefresh.returns(Promise.resolve(tokenData));
      return modProxy.getKeycloak()
      .then(function(result) {
        expect(result).to.be.an('object');
      });
    });

    it('should renew and return an object when token is refreshed', function() {
      var tokenData = {
        'access_token': '123'
      },
      error  = new Error('Could Not Refresh');

      requires[init].keycloakRefresh.returns(Promise.reject(error));
      requires[init].keycloakAuthenticate.returns(Promise.resolve(tokenData));
      return modProxy.getKeycloak()
      .then(function(result) {
        expect(result).to.be.an('object');
      });
    });

    it('should throw an error if keycloakRefresh and keycloakAuthenticate throw errors', function() {
      var error  = new Error('Could Not Refresh');

      requires[init].keycloakRefresh.returns(Promise.reject(error));
      requires[init].keycloakAuthenticate.returns(Promise.reject(error));
      return modProxy.getKeycloak()
      .then(function() {
        throw new Error('We should not go here.');
      })
      .catch(function(e) {
        expect(e).to.eql(error);
      });
    });
  });
});
