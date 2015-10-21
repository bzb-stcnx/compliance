/* (c) Copyright 2015, bzb-stcnx
 * all rights reserved
 * SEE LICENSE IN ../LICENSE
 */

var exec = require('child_process').execSync
var resolve = require('resolve').sync
var lookup = require('../lib/lookup.js')
// var lookup = require('look-up')
var exit = require('../lib/exit.js')
var failfast = exit.failfast
var ERROR = require('../lib/errors.js')
var path = require('path')
var process = require('process')

module.exports = function () {
  var cwd = process.cwd()
  var packageFilePath = lookup('package.json', { cwd: cwd })
}
