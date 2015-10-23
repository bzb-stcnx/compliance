'use strict'
/* (c) Copyright 2015, bzb-stcnx
 * all rights reserved
 * SEE LICENSE IN ./LICENSE
 */

/* eslint-env jasmine */

var fs, path, format
var createSpy
var mockery
var ERROR

beforeEach(function () {
  fs = require('fs')
  path = require('path')
  format = require('util').format
  createSpy = require('./support/create-spy.js')
  mockery = require('mockery')
  ERROR = require('../lib/errors.js')
})

describe('compliance shell command:', function () {
  var isNodeExecutable

  beforeEach(function () {
    isNodeExecutable = function () {
      var bin = fs.readFileSync(path.join(__dirname, '../bin/cmd.js'), 'utf8')
      return /^#\!\/usr\/bin\/env[ \t]+node/.test(bin)
    }
  })

  it('is a node executable', function () {
    expect(isNodeExecutable()).toBe(true)
  })

  describe('regardless of any command line arguments,', function () {
    var cmd
    var mock
    var PACKAGE_FILE_PATH, PACKAGE_FILE, CWD
    var INTERFACE_PACKAGE_FILE_PATH, INTERFACE_PACKAGE_FILE

    beforeEach(function () {
      mockery.enable({ useCleanCache: true })
      // do not mock the following
      mockery.registerAllowables([
        'fs', 'process', 'path', 'util',
        '../lib/cmd.js',
        './errors.js',
        'krash', './lib/errors.js' // krash dependency
      ])
      // the following will be unhooked when deregistered
      // forcing fresh import instead of caching between tests
      mockery.registerAllowable('./support/fixtures/mock-implementation-package.json', true)
      mockery.registerAllowable('./support/fixtures/mock-interface-package.json', true)
      // create mocks
      mock = createSpy({
        lookup: 'lookup',
        resolve: [ 'sync' ],
        process: {
          cwd: 'cwd',
          stdout: [ 'write' ],
          stderr: [ 'write' ]
        },
        childProcess: [ 'execSync' ]
      })
      // configure mocks
      CWD = '/path/to/implementation/cwd'
      PACKAGE_FILE_PATH = path.join(CWD, 'package.json')
      PACKAGE_FILE = require('./support/fixtures/mock-implementation-package.json')
      INTERFACE_PACKAGE_FILE_PATH = path.join(CWD, 'path/to/node_modules/interface/package.json')
      INTERFACE_PACKAGE_FILE = require('./support/fixtures/mock-interface-package.json')
      mock.lookup.and.returnValue(PACKAGE_FILE_PATH)
      mock.process.cwd.and.returnValue(CWD)
      mock.process.env = {}
      mock.resolve.sync.and.callFake(function (name, options) {
        // name resolves as follows
        options.packageFilter(INTERFACE_PACKAGE_FILE, INTERFACE_PACKAGE_FILE_PATH)
      })
      // register mocks
      mockery.registerMock('yalookup', mock.lookup)
      mockery.registerMock('resolve', mock.resolve)
      mockery.registerMock('process', mock.process)
      mockery.registerMock('child_process', mock.childProcess)
      mockery.registerMock(PACKAGE_FILE_PATH, PACKAGE_FILE)
      mockery.registerMock(INTERFACE_PACKAGE_FILE_PATH, INTERFACE_PACKAGE_FILE)
      // finally import cmd with mocked dependencies
      cmd = require('../lib/cmd.js')
    })

    afterEach(function () {
      mockery.deregisterAll()
      mockery.disable()
    })

    it('calls "lookup" to search for "package.json" from cwd up', function () {
      expect(cmd).not.toThrow()
      expect(mock.lookup).toHaveBeenCalledWith('package.json', { cwd: CWD })
    })

    describe('if an entry of the implementation module\'s package.json "compliance" ' +
    'entry is not listed as "dependency"', function () {
      var THROW

      beforeEach(function () {
        var name = PACKAGE_FILE.compliance[0]
        THROW = format(ERROR.NOT_FOUND_IN, name, 'dependencies')
        delete PACKAGE_FILE.dependencies[PACKAGE_FILE.compliance[0]]
      })

      it('throws and complains about the missing entry ' +
      'before running any local shells', function () {
        expect(cmd).toThrowError(THROW)
        expect(mock.childProcess.execSync.calls.count()).toBe(0)
      })
    })

    describe('if all entries of the implementation module\'s package.json "compliance" ' +
    'entry are also listed as "dependencies",', function () {
      var INTERFACE_PACKAGE_CWD, SCRIPT, ENV, COUNT

      beforeEach(function () {
        var PACKAGE_FILE_MAIN_PATH =
          path.join(CWD, PACKAGE_FILE.browser || PACKAGE_FILE.main)
        SCRIPT = INTERFACE_PACKAGE_FILE.scripts.test
        ENV = { 'COMPLIANCE_APPLICANT': PACKAGE_FILE_MAIN_PATH }
        COUNT = PACKAGE_FILE.compliance.length
        INTERFACE_PACKAGE_CWD = path.dirname(INTERFACE_PACKAGE_FILE_PATH)
        cmd()
      })

      it('runs a local shell for each of these', function () {
        expect(mock.childProcess.execSync.calls.count()).toBe(COUNT)
      })

      it('sets a local "COMPLIANCE_APPLICANT" environment variable ' +
        'to the absolute path of the implementation module', function () {
          var options = mock.childProcess.execSync.calls.argsFor(0)[1]
          expect(options.env).toEqual(jasmine.objectContaining(ENV))
        })

      it('sets the local work dir to the absolute path of the interface module',
        function () {
          var options = mock.childProcess.execSync.calls.argsFor(0)[1]
          expect(options.cwd).toBe(INTERFACE_PACKAGE_CWD)
        })

      it('executes the test scripts of interface modules', function () {
        var isExpectedScript = mock.childProcess.execSync.calls.allArgs()
        .every(function (args) {
          return args[0] === SCRIPT
        })
        expect(isExpectedScript).toBe(true)
      })
    })
  })
})
