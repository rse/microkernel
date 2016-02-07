/*
**  Microkernel -- Microkernel for Server Applications
**  Copyright (c) 2015-2016 Ralf S. Engelschall <rse@engelschall.com>
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

import Promise from "core-js/library/es6/promise"

/*  internal registration counter  */
var cnt = 0

/*  the mixin class  */
export default class MicrokernelEvent {
    /*  initialize the mixin  */
    initializer () {
        this._subscription = {}
    }

    /*  convenience method  */
    on () {
        return this.subscribe.apply(this, arguments)
    }

    /*  subscribe for event  */
    subscribe (name, cb, ctx) {
        /*  sanity check arguments  */
        if (arguments.length < 2)
            throw new Error("subscribe: missing arguments")

        /*  store subscription  */
        let id = cnt++
        if (this._subscription[name] === undefined)
            this._subscription[name] = []
        this._subscription[name].push({ id: id, cb: cb, ctx: ctx })
        return id
    }

    /*  unsubscribe from event  */
    unsubscribe (name, id) {
        /*  sanity check arguments  */
        if (arguments.length !== 2)
            throw new Error("unsubscribe: invalid number of arguments")

        /*  search for subscription  */
        let k = -1
        for (let i = 0; i < this._subscription[name].length; i++) {
            if (this._subscription[name][i].id === id) {
                k = i
                break
            }
        }
        if (k === -1)
            throw new Error("unsubscribe: no such subscription")

        /*  remove subscription  */
        this._subscription[name].splice(k, 1)
    }

    /*  publish event  */
    publish (name, ...params) {
        /*  sanity check arguments  */
        if (arguments.length < 1)
            throw new Error("publish: missing argument")

        /*  special case: no subscriber at all  */
        if (this._subscription[name] === undefined)
            return Promise.resolve()

        /*  return outer promise  */
        let promises = []
        this._subscription[name].forEach((s) => {
            promises.push(new Promise((resolve /*, reject */) => {
                /* global setTimeout: true */
                setTimeout(() => {
                    resolve(s.cb.apply(s.ctx, params))
                }, 0)
            }))
        })
        return Promise.all(promises)
    }
}

