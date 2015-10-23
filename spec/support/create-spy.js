'use strict'
/* (c) Copyright 2015, bzb-stcnx
 * all rights reserved
 * SEE LICENSE IN ../LICENSE
 */

/* eslint-env jasmine */

/**
 * @description recursively create a hierarchically defined spy object
 * @example
 * var mock = createSpy({
 *   fs: [ 'readFile', 'readFileSync' ],
 *   stream: { 'Readable': [ 'read', 'pipe' ] }
 * })
 * var mockedFunction = createSpy('mockedFunction')
 * @param {string} name
 * @param {Array|object} props optional
 * @return {function|object}
 * * a spy function named as defined if props is not defined,
 * * otherwise an object built from the props object as follows:
 *   * non-object-value entries map to their key,
 *     the resulting value being a spy function named after the key
 *   * object-value entries are recursively mapped to their key
 */
var createSpy = module.exports = function createSpy (name) {
  if (typeof name === 'string') return createSpyFunction(name)
  if (Array.isArray(name)) return name.reduce(reducer(createSpyFunction), {})
  if (typeof name !== 'object') throw new Error('incorrect spy definition')
  return Object.keys(name).reduce(reducer(spyObjectCreator(name)), {})
}

function createSpyFunction (name) {
  return jasmine.createSpy(name)
}

function spyObjectCreator (obj) {
  return function createSpyObject (key) {
    return createSpy(obj[key])
  }
}

function reducer (fn) {
  return function (map, key) {
    map[key] = fn(key)
    return map
  }
}
