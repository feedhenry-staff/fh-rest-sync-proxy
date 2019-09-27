'use strict';

var initializedKeycloak = require('./initialize');
var keycloakRequest = {};
var grant = {};

// set our request-promise instance to make requests to a Keycloak protected route
exports.setKeycloakRequestObject = function setKeycloakRequestObject(keycloakRequestObject) {
  keycloakRequest = keycloakRequestObject;
  return keycloakRequest;
};

// get our request-promise instance to make requests to a Keycloak protected route
exports.getKeycloakRequestObject = function getKeycloakRequestObject() {
  return keycloakRequest;
};

// set the grant used to refresh bearer tokens
exports.setGrant = function setGrant(newGrant) {
  grant = newGrant;
  return grant;
};

// get the grant used to refresh bearer tokens
exports.getGrant = function getGrant() {
  return grant;
};

// Get our keycloakRequest object which is used for making requests
// to a Keycloak protected route
exports.getKeycloak = function getKeycloak() {
  return initializedKeycloak.keycloakRefresh()
  .catch(function() {
    return initializedKeycloak.keycloakAuthenticate();
  })
  .catch(function(e) {
    console.error(e, 'Error Getting Keycloak aka getKeycloak.');
  });
};
