'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const Promise = require('bluebird');
let requires;
let modProxy;

describe(__filename, function() {
  const util = './util';
  const authUtils = 'keycloak-auth-utils';
  const rp = 'request-promise';
  let grantMgrInstanceStub;

  beforeEach(function() {
    grantMgrInstanceStub = {
      createGrant: sinon.stub(),
      ensureFreshness: sinon.stub()
    };
    requires = {
      [rp]: {
        post: sinon.stub(),
        defaults: sinon.stub()
      },
       [authUtils]: {
         GrantManager: sinon.spy(function () {
           return grantMgrInstanceStub;
         })
       },
       [util]: {
         setKeycloakRequestObject: sinon.stub(),
         getKeycloakRequestObject: sinon.stub(),
         setGrant: sinon.stub(),
         getGrant: sinon.stub()
       }
    };

    delete require.cache[require.resolve('../lib/keycloak/initialize.js')];
    modProxy = proxyquire('../lib/keycloak/initialize.js', requires);
  });

  describe('#keycloakRefresh', function() {

    it('should renew and return an object when token is refreshed', function() {
      var tokenData = {
        'access_token': {
          token: '123'
        }
      },
      newTokenData = {
        'access_token': {
          token: '1234'
        }
      };
      requires[util].getGrant.returns(tokenData);
      grantMgrInstanceStub.ensureFreshness.returns(Promise.resolve(newTokenData));
      requires[util].getKeycloakRequestObject.returns({});
      return modProxy.keycloakRefresh()
      .then(function(result) {
        expect(result).to.be.an('object');
      });
    });

    it('should not renew and return an object when token is still valid', function() {
      var tokenData = {
        'access_token': {
          token: '123'
        }
      };
      requires[util].getGrant.returns(tokenData);
      grantMgrInstanceStub.ensureFreshness.returns(Promise.resolve(tokenData));
      requires[util].getKeycloakRequestObject.returns({});
      return modProxy.keycloakRefresh()
      .then(function(result) {
        expect(result).to.be.an('object');
      });
    });

    it('should return an error if there has been no Authentication i.e. there is no grant.', function() {
      var error = new Error('No grant, must Authenticate');
      requires[util].getGrant.returns('');
      return modProxy.keycloakRefresh()
      .then(function() {
        throw new Error('We should not go here.');
      })
      .catch(function(e) {
        expect(e).to.eql(error);
      });
    });

    it('should throw an error if ensureFreshness throws an error', function() {
      var tokenData = {
        'access_token': {
          token: '123'
        }
      },
      error = new Error('Something Bad Happened.');

      requires[util].getGrant.returns(tokenData);
      grantMgrInstanceStub.ensureFreshness.returns(Promise.reject(error));
      return modProxy.keycloakRefresh()
      .then(function() {
        throw new Error('Should NOT be here.');
      })
      .catch(function(e) {
        expect(e).to.eql(error);
      });
    });

  });

  describe('#keycloakAuthenticate', function() {
    var tokenData = {
      'access_token': '123'
    },
    returnObject = {};

    it('should return an object upon success.', function() {
      requires[rp].post.returns(Promise.resolve(JSON.stringify(tokenData)));
      grantMgrInstanceStub.createGrant.returns(JSON.stringify(tokenData));
      requires[util].getKeycloakRequestObject.returns(returnObject);
      return modProxy.keycloakAuthenticate()
      .then(function(result) {
        expect(result).to.equal(returnObject);
      });
    });

    it('should return an error if API call results in an error.', function() {
      var err = new Error('Something bad happened.');
      requires[rp].post.returns(Promise.reject(err));
      requires[util].getKeycloakRequestObject.returns({});
      return modProxy.keycloakAuthenticate()
      .then(function() {
        throw new Error('We should not go here.');
      })
      .catch(function(e) {
          expect(e).to.equal(err);
      });
    });

  });

});
