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

/*  internal hook processing  */
var hookProc = {
    /* jscs: disable */
    "none":   { init: undefined,   step: (    ) => {}                        },
    "pass":   { init: (a) => a[0], step: (o, n) => n                         },
    "or":     { init: false,       step: (o, n) => o || n                    },
    "and":    { init: true,        step: (o, n) => o && n                    },
    "mult":   { init: 1,           step: (o, n) => o * n                     },
    "add":    { init: 0,           step: (o, n) => o + n                     },
    "append": { init: "",          step: (o, n) => o + n                     },
    "push":   { init: [],          step: (o, n) => { o.push(n); return o }   },
    "concat": { init: [],          step: (o, n) => o.concat(n)               },
    "set":    { init: {},          step: (o, n) => { o[n] = true; return o } },
    "insert": { init: new Set(),   step: (o, n) => o.add(n)                  },
    "assign": { init: {},          step: (o, n) => Object.assign(o, n)       }
    /* jscs: enable */
}

/*  internal registration counter  */
var cnt = 0

/*  the mixin class  */
export default class MicrokernelHook {
    /*  initialize the mixin  */
    initializer () {
        this._hooks = {}
    }

    /*  convenience method  */
    at () {
        return this.latch.apply(this, arguments)
    }

    /*  latch into hook  */
    latch (name, cb, ctx) {
        /*  sanity check arguments  */
        if (arguments.length < 2)
            throw new Error("latch: missing arguments")

        /*  on-the-fly create hook callback registry  */
        if (typeof this._hooks[name] === "undefined")
            this._hooks[name] = []

        /*  store callback in hook callback registry  */
        let id = cnt++
        this._hooks[name].push({ id: id, cb: cb, ctx: ctx })
        return id
    }

    /*  unlatch from hook  */
    unlatch (name, id) {
        /*  sanity check arguments  */
        if (arguments.length !== 2)
            throw new Error("unlatch: invalid number of arguments")
        if (typeof this._hooks[name] === "undefined")
            throw new Error(`unlatch: no such hook: ${name}`)

        /*  search for callback in hook callback registry  */
        let k = -1
        for (let i = 0; i < this._hooks[name].length; i++) {
            if (this._hooks[name][i].id === id) {
                k = i
                break
            }
        }
        if (k === -1)
            throw new Error("unlatch: no such latched callback")

        /*  remove callback from hook callback registry  */
        this._hooks[name].splice(k, 1)

        return this
    }

    /*  provide hook  */
    hook (name, proc, ...params) {
        /*  sanity check arguments  */
        if (arguments.length < 2)
            throw new Error("hook: missing argument")
        if (typeof hookProc[proc] === "undefined")
            throw new Error("hook: no such result processing defined")

        /*  start result with the initial value  */
        let result = hookProc[proc].init
        if (typeof result === "function")
            result = result.call(null, params)

        /*  give all registered callbacks a chance to
            execute and modify the current result  */
        if (typeof this._hooks[name] !== "undefined") {
            this._hooks[name].forEach((l) => {
                /*  call latched callback  */
                let r = l.cb.apply(l.ctx, params.concat([ result ]))

                /*  process/merge results  */
                result = hookProc[proc].step.call(null, result, r)
            })
        }

        /*  return the final result  */
        return result
    }
}

