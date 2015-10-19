/* (c) Copyright 2015, bzb-stcnx
 * all rights reserved
 * SEE LICENSE IN ./LICENSE
 */

/* eslint-env jasmine */

describe('compliance browserify transform:', function () {
  'use strict'

  var compliance
  var FILE_ERROR

  beforeEach(function () {
    compliance = require('../')
    FILE_ERROR = 'file error'
  })

  it('is a function', function () {
    expect(typeof compliance).toBe('function')
  })

  describe('when given (file: string, opts: object) arguments', function () {
    it('opts.map defaults to { "compliance/applicant": process.env.COMPLIANCE_APPLICANT }')

    describe('throws', function () {
      it('a "file error" if file is undefined or cannot be read', function () {
        expect(compliance).toThrow(FILE_ERROR)
        expect(function () { compliance('./---') }).toThrow(FILE_ERROR)
      })

      it('a "undefined applicant" if neither opts.map nor process.env.COMPLIANCE_APPLICANT are defined')
    })

    describe('returns', function () {
      it('a transform stream that maps static strings from file ' +
         'matching a key of opts.map to the corresponding string value')
    })
  })
})
