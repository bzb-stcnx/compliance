'use strict'
/* (c) Copyright 2015, bzb-stcnx
 * all rights reserved
 * SEE LICENSE IN ../LICENSE
 */

/* eslint-env jasmine */

/**
 * @description create a function that runs a given cmd,
 * then processes the arguments received by a given spy
 * and pushes each processed arguments into a given result array.
 * @param {function} cmd the cmd to run
 * @param {function} spy a jasmine spy function
 * @param {function} processArgs called once for each call on 'spy'
 *   @description process the arguments received by 'spy' in a single call
 *   @param {Array} args
 *   @return {any} processed args
 * @param {Array} result return value from 'processArgs' is pushed into this
 * @return {Array} the resulting 'result' array
 */
module.exports = function cmdRunner (cmd, spy, processArgs, result) {
  return function runCmd () {
    cmd()
    spy.calls.allArgs()
    .reduce(function (result, args) {
      result.push(processArgs(args))
      return result
    }, result)
  }
}
