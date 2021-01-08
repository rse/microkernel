/*
**  Microkernel -- Microkernel for Server Applications
**  Copyright (c) 2015-2021 Dr. Ralf S. Engelschall <rse@engelschall.com>
**
**  Permission is hereby granted, free of charge, to any person obtaining
**  a copy of this software and associated documentation files (the
**  "Software"), to deal in the Software without restriction, including
**  without limitation the rights to use, copy, modify, merge, publish,
**  distribute, sublicense, and/or sell copies of the Software, and to
**  permit persons to whom the Software is furnished to do so, subject to
**  the following conditions:
**
**  The above copyright notice and this permission notice shall be included
**  in all copies or substantial portions of the Software.
**
**  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
**  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
**  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
**  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
**  CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
**  TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
**  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

const aggregation = require("aggregation/es6")

const Version     = require("./microkernel-1-version")
const Manifest    = require("./microkernel-2-manifest")
const Loader      = require("./microkernel-3-loader")
const State       = require("./microkernel-4-state")
const Hook        = require("./microkernel-5-hook")
const Event       = require("./microkernel-6-event")
const Service     = require("./microkernel-7-service")
const Resource    = require("./microkernel-8-resource")

/*  the API class  */
class Microkernel extends aggregation(Version, Manifest, Loader, State, Hook, Event, Service, Resource) {
    /*  initialize the microkernel instance  */
    constructor () {
        super()
    }
}

/*  export the traditional way for interoperability reasons
    (as Babel would export an object with a 'default' field)  */
module.exports = Microkernel

