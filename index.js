'use strict'
/* (c) Copyright 2015, bzb-stcnx
 * all rights reserved
 * SEE LICENSE IN ./LICENSE
 */

var fs = require('fs')
var map = require('through2-map')
var abort = require('krash')
var ERROR = require('./lib/errors.js')
var COMPLIANCE_APPLICANT_KEY = 'compliance/applicant'
// shim fs.accessSync for node < 0.12
var accessSync = isDefined(fs.F_OK)
  ? fs.accessSync.bind(fs) : accessSyncShim

/**
 * @description browserify transform that injects
 * the implementation module when generating the test bundle:
 * all occurrences of single- or double-quoted `compliance/applicant`
 * are replaced with respectively the single- or double-quoted
 * file path of the implementation module.
 * @param {string} file
 * @param {object} opts
 * @return {Stream} that maps occurrences of single- or double-quoted
 * 'compliance/applicant' strings respectively to single- or double-
 * quoted file path of the implementation module.
 * @throws ERROR.CANNOT_READ if file cannot be accessed
 * @throws ERROR.UNDEFINED_APPLICANT
 * if neither the COMPLIANCE_APPLICANT environment variable
 * nor if a map option is missing from the browserify transform
 * configuration
 */
module.exports = function (file, opts) {
  var tokenMap = {}

  tokenMap[COMPLIANCE_APPLICANT_KEY] =
    abort.unless(opts && opts.map && opts.map[COMPLIANCE_APPLICANT_KEY] ||
      process.env.COMPLIANCE_APPLICANT,
      isDefined,
      ERROR.UNDEFINED_APPLICANT, COMPLIANCE_APPLICANT_KEY)

  // checking read access might not be of any use after all,
  // since it provides no guarantee that file will still be available
  // during tokenMap processing,
  // but it is currently required by unit tests.
  try {
    accessSync(file, fs.R_OK)
  } catch (err) {
    abort.now(ERROR.CANNOT_READ, file)
  }

  return map({ wantStrings: true }, function (str) {
    return mapper(tokenMap)(str)
  })
}

/**
 * create a mapper function for a given key-value map that maps all occurrences
 * in a given string of the map keys to their corresponding map values
 * @param {object} map key-value map
 * @return {function} map all occurrences of the map keys in a given string
 * to their corresponding map value
 */
function mapper (map) {
  /**
   * @param {string} str
   * @return {string} in which all occurrences of the map keys are replaced
   * with their corresponding map value
   */
  return function (str) {
    return Object.keys(map)
    .reduce(function (str, key) {
      var val = map[key]
      return str
      .replace(new RegExp(quote(key, '\''), 'g'), quote(val, '\''))
      .replace(new RegExp(quote(key, '\"'), 'g'), quote(val, '\"'))
    }, str)
  }
}

/**
 * @description quote a given string within the same given character
 * @param {string} str
 * @param {string} char
 * @return {string} str quoted within the same given char
 */
function quote (str, char) {
  return '' + char + str + char
}

/**
 * @description simple shim of fs.accessSync for node < 0.12.
 * ignores mode argument in fs.accessSync(path, [mode])
 * @param {string} path
 * @throws ERROR.NOT_FOUND if fs.existsSync(path) returns false
 * @see fs#accessSync
 */
function accessSyncShim (path) {
  abort.unless(path, fs.existsSync, ERROR.NOT_FOUND, path)
}

/**
 * @param {any} val
 * @return {boolean} true if val is not undefined or null
 */
function isDefined (val) {
  return (typeof val !== 'undefined') && (val !== null)
}
