'use strict'
/* (c) Copyright 2015, bzb-stcnx
 * all rights reserved
 * SEE LICENSE IN ./LICENSE
 */

/* eslint-env jasmine */

var fs, path
var mockery

beforeEach(function () {
  fs = require('fs')
  path = require('path')
  mockery = require('mockery')
})

describe('compliance shell command:', function () {
  var bin, cmd
  var mockLookup, mockChildProcess, mockResolve
  var cwd

  beforeEach(function () {
    mockery.enable({ useCleanCache: true })

    mockLookup = jasmine.createSpy('lookup')
    mockery.registerMock('../lib/lookup.js', mockLookup)

    mockResolve = jasmine.createSpyObj('resolve', [ 'sync' ])
    mockery.registerMock('resolve', mockResolve)

    mockChildProcess = jasmine.createSpyObj('mockChildProcess',
                                           [ 'execSync' ])
    mockery.registerMock('child_process', mockChildProcess)

    mockery.registerAllowables([
      'process',
      'path',
      'util',
      '../lib/cmd.js',
      '../lib/errors.js',
      '../lib/crash.js'
    ])

    cwd = process.cwd()
    cmd = require('../lib/cmd.js')
    bin = fs.readFileSync(path.join(__dirname, '../bin/cmd.js'), 'utf8')
    cmd()
  })

  afterEach(function () {
    mockery.deregisterAll()
    mockery.disable()
  })

  it('is a node executable', function () {
    expect(/^#\!\/usr\/bin\/env[ \t]+node/.test(bin)).toBe(true)
  })

// it('runs test scripts from dependency modules listed as "compliance" in "package.json"')
  it('calls "lookup" to search for "package.json" from cwd up', function () {
    expect(mockLookup).toHaveBeenCalledWith('package.json', { cwd: cwd })
  })

  describe('(tentative) defines an environment variable local to the test script shell', function () {
    it('available to the compliance transform as process.env.COMPLIANCE_APPLICANT')

    it('set to the absolute path of the implementation module')
  })
})
