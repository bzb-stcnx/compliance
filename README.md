# compliance
[![NPM](https://nodei.co/npm/compliance.png?compact=true)](https://nodei.co/npm/compliance/)

[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)

validate compliance of a javascript module against a test suite module.

primarily intended for **validating that a module implements given interfaces**.
interfaces are implemented as modules which contain compliance test suites,
eventually together with additional interface-related files,
such as typescript type declaration files `.d.ts`.

compliance is validated by running the implementation module against the test suites
from the declared interface modules.

compliance has zero impact on production runtime:
it is intended for the development phase of a project.

# motivation
"program to an interface, not an implementation" - GoF

see [dependency injection](#dependency-injection) below.

# usage
## configuration
### interface modules
* test suites in interface modules `require('compliance/applicant')`
to access the implementation module
that `compliance` will inject before running the suites.
* additionally, `browserify` is configured with `compliance` as a
[transform](https://github.com/substack/browserify-handbook#browserifytransform-field),
allowing it to inject the implementation module when generating the test bundle:
all occurrences of single- or double-quoted `compliance/applicant` are replaced
with respectively single- or double-quoted file path of the implementation module.

### implementation module
* the implementation module naturally lists all interface modules it implements
as `dependencies` in its `package.json` file.
as for any other entry in `dependencies`,
this clearly defines the desired version of each interface module.
* additionally, each interface module against which the implementation module
should be tested is listed in a dedicated `compliance` entry of `package.json`,
e.g.:
```json
"compliance": [ "an-interface-module", "another-interface-module", ... ]
```

## compliance validation
to validate compliance of an implementation module against declared interface modules,
run the `compliance` command from the shell or a `test` script of the implementation module.
* interface modules listed as `compliance` in the implementation module's `package.json`
but not listed in its `dependencies` are ignored
and will trigger a corresponding warning during compliance validation
* compliance will only be validated against the test suites from interface modules
listed as `compliance` in the implementation module's `package.json`
* the version of the interface module against which an implementation module
is validated is that listed in its `dependencies`

# test runners
`compliance` currently relies on browserify during compliance testing.
`compliance` supports test runners that play well with `browserify`
to build the test bundle for the browser.
this includes [karma](http://karma-runner.github.io/) with [karma-browserify](https://www.npmjs.com/package/karma-browserify).

# dependency injection
`compliance` allows to define dependencies as interfaces rather than implementations.
* library modules (i.e. modules meant to be called upon by client code) can list
interface module dependencies without specifying corresponding implementations.
* library modules can either expect the implementation dependencies to be
supplied by client code as arguments to its factory function,
or simply `require` the interface modules and
expect the corresponding implementation modules to be injected by client code.
* client code directly or indirectly depending on such library modules
can themselves define corresponding implementation module dependencies,
and either provide these as arguments to library module factories
or inject these appropriately into the library modules.
* `browserify` provides means of statically injecting an implementation module
in place of a `require` for a corresponding interface module during bundling.
* client code relies on the fact that the compliance
of the injected implementation module has been validated
against the required interface module by the implementations module test suite.
* however, it is also conceivable to add additional validation in the client's test suites
  * for example, to compare declared versions during bundling for additional security,
  * or to run the interface's test suites on the injected module.

# status
this project is currently in concept phase - not appropriate for production.

# license
(C) Copyright 2015, bzb-stcnx,
all rights reserved.
[MIT](./LICENSE)
