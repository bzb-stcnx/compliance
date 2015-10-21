'use strict'
/* (c) Copyright 2015, bzb-stcnx
 * all rights reserved
 * SEE LICENSE IN ./LICENSE
 */

var fs = require('fs')
var format = require('util').format
var map = require('through2-map')
var ERROR = require('./lib/errors.js')
var COMPLIANCE_APPLICANT_KEY = 'compliance/applicant'

module.exports = function (file, opts) {
  var tokenMap = {}

  tokenMap[COMPLIANCE_APPLICANT_KEY] =
    opts && opts.map && opts.map[COMPLIANCE_APPLICANT_KEY] ||
      process.env.COMPLIANCE_APPLICANT

  if (typeof tokenMap[COMPLIANCE_APPLICANT_KEY] === 'undefined') {
    throw format(ERROR.UNDEFINED_APPLICANT, COMPLIANCE_APPLICANT_KEY)
  }

  if (typeof file === 'undefined') {
    throw format(ERROR.NOT_FOUND, 'file')
  }

  // checking read access might not be of any use after all,
  // since it provides no guarantee that file will still be available
  // during tokenMap processing,
  // but it is currently required by unit tests.
  try {
    fs.accessSync(file, fs.R_OK)
  } catch (err) {
    throw format(ERROR.CANNOT_READ, file)
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
