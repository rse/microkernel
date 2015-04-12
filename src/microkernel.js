/*
**  Microkernel -- Microkernel for Server Applications
**  Copyright (c) 2015 Ralf S. Engelschall <rse@engelschall.com>
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

import aggregation from "aggregation/es6"

import Version     from "./microkernel-1-version"
import Manifest    from "./microkernel-2-manifest"
import Loader      from "./microkernel-3-loader"
import State       from "./microkernel-4-state"
import Hook        from "./microkernel-5-hook"
import Event       from "./microkernel-6-event"
import Resource    from "./microkernel-7-resource"
import Service     from "./microkernel-8-service"

/*  the API class  */
export default class Microkernel extends
    aggregation(Version, Manifest, Loader, State,
                Hook, Event, Resource, Service) {
    /*  initialize the microkernel instance  */
    constructor () {
        super()
    }
}

