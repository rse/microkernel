/*
**  Microkernel -- Microkernel for Server Applications
**  Copyright (c) 2015-2019 Dr. Ralf S. Engelschall <rse@engelschall.com>
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

const glob = require("glob")

/*  the mixin class  */
module.exports = class MicrokernelLoader {
    /*  load source files as a procedure
        (and hence execute them with the microkernel as context)  */
    exec (...args) {
        return new Promise((resolve, reject) => {
            let seq = Promise.resolve()
            args.forEach((arg) => {
                const procs = arg.match(/[*?]/) !== null ? glob.sync(arg) : [ arg ]
                if (procs.length === 0)
                    throw new Error("no procedures found")
                procs.forEach((proc) => {
                    if (typeof proc === "string") {
                        proc = require(proc)
                        if (typeof proc !== "function" && typeof proc.default === "function")
                            proc = proc.default
                    }
                    if (typeof proc !== "function")
                        throw new Error("procedure file has not exported a function")
                    seq = seq.then(() => proc(this))
                })
            })
            seq.then(() => resolve(), (err) => reject(err))
        })
    }

    /*  load source files as module definition
        (and hence instanciate and add them to microkernel)  */
    load (...args) {
        args.forEach((arg) => {
            let opts
            if (   typeof arg === "object"
                && arg instanceof Array
                && arg.length === 2
                && typeof arg[0] === "string"
                && typeof arg[1] === "object") {
                opts = arg[1]
                arg  = arg[0]
            }
            if (typeof arg !== "string")
                throw new Error("invalid argument")
            var mods = arg.match(/[*?]/) !== null ? glob.sync(arg) : [ arg ]
            if (mods.length === 0)
                throw new Error("no modules found")
            mods.forEach((mod) => {
                if (typeof mod === "string") {
                    mod = require(mod)
                    if (typeof mod !== "function" && typeof mod.default === "function")
                        mod = mod.default
                }
                if (typeof mod === "function")
                    mod = opts ? new mod(opts) : new mod()
                this.add(mod)
            })
        })
        return this
    }
}

