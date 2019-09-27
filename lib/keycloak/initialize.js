'use strict';

var requestPromise = require('request-promise');
var Promise = require('bluebird');
var keycloakUtils = require('keycloak-auth-utils');
var util = require('./util');


var keycloakConfiguration = {
  'realm': 'TKE',
  'realm-public-key': process.env['SSO_REALM_PUBLIC_KEY'] || 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAlK09X3ejlK146Jw55tcfoXM+rmFDomDr3f4AvVI7k1LZraeyChgVEHd90DftPanWf6anzqoROkH/MY2PWOnja3yVgbXIf9Vc1KxEjOePrDmB+XKbRPBiL1/5Lvcy4GGwa5oTsCXuHrVyNxR8BR6czvATI++msaUoeJi9y+XHDxqg9Gb+lQKHTQR4PJ0mFIv+DqdV1bnfeAvhM6+IWHPOieHtGqaKqOWu6vhr/XpUeQlHnR8XHUxwfCxBmDxNPfR017Rfsh3WjBM/oQEqjhS/fFR4dr7Oc7i7rm52lFv8/apERdIL2LLXwdchtU9FcG5lljI2pF+TXcjmwHBcyo/UlwIDAQAB',
  'auth-server-url': process.env['SSO_SERVICE'] || 'https://rencrypt-sso-test.3a7a.tke.openshiftapps.com/auth',
  'ssl-required': process.env['SSO_SSL_REQUIRED'] || 'external',
  'resource': process.env['SSO_RESOURCE'] || 'tech-connect',
  'credentials': {
    'secret': process.env['SSO_CREDENTIALS_SECRET'] || 'bb508fe9-8aa1-48cb-96de-442aefd49b21',
  }
};
var KeycloakConfig = new keycloakUtils.Config(keycloakConfiguration);
var KeycloakGrant = new keycloakUtils.GrantManager(KeycloakConfig);
var keycloakRequestOptions = {
  'timeout': 25000,
  'json': true,
  'headers': {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// Set the bearer token used for making requests to a Keycloak protected route
function setBearerToken(bearerToken) {
  keycloakRequestOptions.headers.Authorization = 'Bearer ' + bearerToken;
  util.setKeycloakRequestObject(requestPromise.defaults(keycloakRequestOptions));
  return 'Bearer ' + bearerToken;
};

// Refresh our bearer token and keycloakRequest Object
exports.keycloakRefresh = function keycloakRefresh() {
  var existingGrant = util.getGrant();
  if (!existingGrant.access_token) {
   return Promise.reject(new Error('No grant, must Authenticate'));
  }
  return KeycloakGrant.ensureFreshness(existingGrant)
  .then(function(result) {
    if (result.access_token && result.access_token.token && result.access_token.token !== existingGrant.access_token.token) {
     setBearerToken(result.access_token.token);
    }
    // Return the request-promise object we use to make requests to a Keycloak protected route
    return util.getKeycloakRequestObject();
  })
  .catch(function(e) {
    console.error(e, 'could not refresh bearer token');
    //Throw the error so we can then run keycloakAuthenticate via util.getKeycloak
    throw e;
  });
};

// Authenticate with Keycloak Server using service account
exports.keycloakAuthenticate = function keycloakAuthenticate() {
  // Use our service account credentials
  console.log(new Buffer(KeycloakConfig.clientId + ':' + KeycloakConfig.secret).toString('base64'))
  var authRequestOptions = {
    url: KeycloakConfig.realmUrl + '/protocol/openid-connect/token',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + new Buffer(KeycloakConfig.clientId + ':' + KeycloakConfig.secret).toString('base64')
    },
    form: {
      'grant_type': 'client_credentials',
      'scope': 'openid'
    }
  };
  // Make Authentication request
  return requestPromise.post(authRequestOptions)
  .then(function(data) {
    // Create our Grant which is then used to
    // refresh our access_token when necessary.
    util.setGrant(KeycloakGrant.createGrant(data));
    var tokenData = JSON.parse(data);
    setBearerToken(tokenData.access_token);
    return util.getKeycloakRequestObject();
  })
  .catch(function(e) {
    console.error(e, 'Error Authenticating with Keycloak.');
    throw e;
  });
};
