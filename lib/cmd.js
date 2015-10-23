/* (c) Copyright 2015, bzb-stcnx
 * all rights reserved
 * SEE LICENSE IN ../LICENSE
 */

var exec = require('child_process').execSync
var resolve = require('resolve').sync
var format = require('util').format
var lookup = require('yalookup')
var assert = require('krash').unless
var abort = require('krash').now
var ERROR = require('./errors.js')
var path = require('path')
var process = require('process')

module.exports = function () {
  var cwd = process.cwd()
  var packageFilePath = assert(lookup('package.json', { cwd: cwd }), isDefined,
                               ERROR.NOT_FOUND_IN, 'package.json', cwd)
  var packageFile = assert(require(packageFilePath), isDefined,
                           ERROR.CANNOT_READ, 'package.json')
  var packageDir = path.normalize(path.dirname(packageFilePath))
  var packageMain = path.join(packageDir,
                              packageFile.browser || packageFile.main)
  var env = process.env; env['COMPLIANCE_APPLICANT'] = packageMain
  var scripts

  // all compliance entries must be a dependency
  packageFile.compliance.forEach(function (name) {
    if (name in packageFile.dependencies) return
    abort(ERROR.NOT_FOUND_IN, name, 'dependencies')
  })

  // build a map of name to test-script definition for each compliance dependency
  scripts = packageFile.compliance.reduce(addScript, {})

  // run each script in a dedicated shell and flag error when all done
  Object.keys(scripts).map(run).forEach(function (error) {
    if (error) abort(ERROR.COMPLIANCE_TEST_FAILED)
  })

  /**
   * @description resolve a package name to its root directory and package file,
   * extract the test script from the package file,
   * pack the script and the root directory in a script-definition-object
   * and add that to the given map.
   * @param {object} scripts map of package name to script-definition-object
   * @param {string} name of the package to resolve
   * @return {object} the given "scripts" map
   * with the new (name, script-definition-object) if name could be resolved
   * @throws ERROR.NOT_FOUND_IN if the test script is missing from the resolved package
   */
  function addScript (scripts, name) {
    resolve(name, {
      basedir: packageDir,
      // hijack packageFilter to access package.json path and content
      packageFilter: function (packageFile, packageFilePath) {
        if (packageFile && packageFile.scripts && packageFile.scripts.test) {
          scripts[name] = {
            script: packageFile.scripts.test,
            cwd: path.dirname(packageFilePath)
          }
        } else {
          abort(ERROR.NOT_FOUND_IN, 'test script', name)
        }
      }
    })
    if (!(name in scripts)) abort(ERROR.NOT_FOUND, name)
    return scripts
  }

  /**
   * @description synchronously run a name-referenced script in a child process
   * with a corresponding work dir.
   * @param {string} name reference
   * @return {boolean} true on error while running the script, false otherwise
   */
  function run (name) {
    process.stdout.write(format('run test script for %s\n', name))
    try {
      exec(scripts[name].script, {
        cwd: scripts[name].cwd,
        env: env,
        stdio: ['pipe', 'pipe', process.stderr]
      })
    } catch (err) {
      process.stderr.write(format(ERROR.SCRIPT_ERROR + '\n', name, err.message))
      return true
    }
    return false
  }
}

/**
 * @param {any} val
 * @return {boolean} true if val is not undefined or null
 */
function isDefined (val) {
  return (typeof val !== 'undefined') && (val !== null)
}
