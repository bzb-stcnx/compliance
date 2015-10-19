/* (c) Copyright 2015, bzb-stcnx
 * all rights reserved
 * SEE LICENSE IN ./LICENSE
 */

/* eslint-env jasmine */

describe('compliance shell command:', function () {
  'use strict'

  var cmd
  var fs

  beforeEach(function () {
    fs = require('fs')
    cmd = fs.readFileSync(__dirname + '/../bin/cmd.js', 'utf8')
  })

  it('is a node executable', function () {
    expect(/^#\!\/usr\/bin\/env/.test(cmd)).toBe(true)
  })

  it('runs test scripts from dependency modules listed as "compliance" in "package.json"')

  describe('(tentative) defines an environment variable local to the test script shell', function () {
    it('available to the compliance transform as process.env.COMPLIANCE_APPLICANT')

    it('set to the absolute path of the implementation module')
  })
})
