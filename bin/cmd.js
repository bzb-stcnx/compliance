#!/usr/bin/env node

/* (c) Copyright 2015, bzb-stcnx
 * all rights reserved
 * SEE LICENSE IN ../LICENSE
 */

var process = require('process')
var cmd = require('../lib/cmd.js')
try {
  cmd()
} catch (err) {
  console.error(err.message)
  process.exitCode(1)
}
process.exit()
