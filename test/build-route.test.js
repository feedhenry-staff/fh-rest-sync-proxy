'use strict'

var expect = require('chai').expect

describe(__filename, function() {
  var mod = null

  beforeEach(function() {
    delete require.cache[require.resolve('../lib/build-route.js')]
    mod = require('../lib/build-route.js')
  })

  describe('#buildRoute', function() {
    it('should return route when pathToPrepend is set', function(done) {
      var opts = {
        guid: '12345',
        pathToPrepend: 'my/path'
      }
      var dataset = 'dataset'

      var path = mod(opts, dataset)
      expect(path).to.eql('my/path/dataset')
      done()
    })

    it('should return route when pathToPrepend is not set', function(done) {
      var opts = {
        guid: '12345'
      }
      var dataset = 'dataset'

      var path = mod(opts, dataset)
      expect(path).to.eql('dataset')
      done()
    })
  })
})
