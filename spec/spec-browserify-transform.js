/* (c) Copyright 2015, bzb-stcnx
 * all rights reserved
 * SEE LICENSE IN ./LICENSE
 */

/* eslint-env jasmine */

var ERROR = require('../lib/errors.js') // need these defs for spec descriptions

describe('compliance browserify transform:', function () {
  'use strict'
  var compliance

  beforeEach(function () {
    compliance = require('../')
  })

  it('is a function', function () {
    expect(typeof compliance).toBe('function')
  })

  describe('when given (file: string, opts: object) arguments', function () {
    var path, fs
    var COMPLIANCE_APPLICANT
    var fixtures, mockInterfaceSpecFile, expectedInterfaceSpecFile
    var opts

    beforeEach(function () {
      COMPLIANCE_APPLICANT = '__COMPLIANCE_APPLICANT__'
      delete process.env.COMPLIANCE_APPLICANT
      path = require('path')
      fs = require('fs')
      fixtures = __dirname + '/support/fixtures/'
      mockInterfaceSpecFile = path.normalize(fixtures + 'mock-interface-spec.js')
      expectedInterfaceSpecFile = path.normalize(fixtures + 'expected-interface-spec.js')
      opts = {
        'map': { 'compliance/applicant': COMPLIANCE_APPLICANT }
      }
    })

    afterEach(function () {
      delete process.env.COMPLIANCE_APPLICANT
    })

    describe('defaults', function () {
      var concat
      var result, expected

      beforeEach(function (done) {
        concat = require('concat-stream')
        process.env.COMPLIANCE_APPLICANT = COMPLIANCE_APPLICANT

        // ignore 'error' event which results in failure anyway
        fs.createReadStream(mockInterfaceSpecFile, 'utf8')
        .pipe(compliance(mockInterfaceSpecFile))
        .pipe(concat(function (out) {
          result = out.toString()
          done()
        }))
        expected = fs.readFileSync(expectedInterfaceSpecFile, 'utf8')
      })

      it('opts.map to { "compliance/applicant": process.env.COMPLIANCE_APPLICANT }', function () {
        expect(result).toBe(expected)
      })
    })

    describe('throws', function () {
      var undefinedFile, unreadableFile, undefinedOpts

      beforeEach(function () {
        undefinedFile = function () { compliance(undefined, opts) }
        unreadableFile = function () { compliance(__dirname + './---', opts) }
        undefinedOpts = function () { compliance(mockInterfaceSpecFile) }
      })

      it('a "' + ERROR.FILE + '" if file is undefined or cannot be read', function () {
        expect(undefinedFile).toThrow(ERROR.FILE)
        expect(unreadableFile).toThrow(ERROR.FILE)
      })

      it('a "' + ERROR.UNDEFINED_APPLICANT + '" if neither opts.map nor process.env.COMPLIANCE_APPLICANT are defined', function () {
        expect(undefinedOpts).toThrow(ERROR.UNDEFINED_APPLICANT)
      })
    })

    describe('returns', function () {
      var concat
      var result, expected

      beforeEach(function (done) {
        concat = require('concat-stream')

        // ignore 'error' event which results in failure anyway
        fs.createReadStream(mockInterfaceSpecFile, 'utf8')
        .pipe(compliance(mockInterfaceSpecFile, opts))
        .pipe(concat(function (out) {
          result = out.toString()
          done()
        }))
        expected = fs.readFileSync(expectedInterfaceSpecFile, 'utf8')
      })

      it('a transform stream that maps static strings from file ' +
         'matching a key of opts.map to the corresponding string value',
         function () {
           expect(result).toBe(expected)
         })
    })
  })
})
