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

/*  the mixin class  */
export default class MicrokernelService {
    /*  initialize the mixin  */
    initializer () {
        this._registration = {}
    }

    /*  convenience method  */
    sv (name, ...params) {
        return this.service(name, ...params)
    }

    /*  register service  */
    register (name, cb, ctx) {
        /*  sanity check arguments  */
        if (arguments.length < 2)
            throw new Error("register: missing arguments")

        /*  sanity check situation  */
        if (this._registration[name] !== undefined)
            throw new Error(`register: service already registered: ${name}`)

        /*  store registration  */
        this._registration[name] = { cb: cb, ctx: ctx }
        return this
    }

    /*  unregister service  */
    unregister (name) {
        /*  sanity check arguments  */
        if (arguments.length !== 2)
            throw new Error("unregister: invalid number of arguments")

        /*  sanity check situation  */
        if (this._registration[name] === undefined)
            throw new Error("unregister: no such registration")

        /*  remove registration  */
        delete this._registration[name]
        return this
    }

    /*  call service  */
    service (name, ...params) {
        /*  sanity check arguments  */
        if (arguments.length < 1)
            throw new Error("call: missing argument")

        /*  sanity check situation  */
        if (this._registration[name] === undefined)
            throw new Error(`call: no such service registered: ${name}`)

        /*  call registered function  */
        let r = this._registration[name]
        return r.cb.apply(r.ctx, params)
    }
}

