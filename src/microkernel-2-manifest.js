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
export default class MicrokernelManifest {
    /*  initialize the mixin  */
    initializer () {
        this.cls2mod  = new Map()
        this.name2mod = new Map()
        this.mod      = new Set()
        this.modOrder = null
    }

    /*  add module to microkernel  */
    add (arg) {
        /*  sanity check situation  */
        if (this.state() !== "dead")
            throw new Error("microkernel is not in lowest state")

        /*  handle various variants of arguments  */
        let mod
        if (typeof arg === "function") {
            /*  on-the-fly instanciate class  */
            mod = new arg()
            if (!this.cls2mod.has(arg))
                this.cls2mod.set(arg, [])
            this.cls2mod.get(arg).push(mod)
        }
        else if (typeof arg === "object")
            mod = arg
        else
            throw new Error("invalid module (neither function/class nor object)")

        /*  sanity check module  */
        if (typeof mod.module !== "object")
            throw new Error("invalid module (no \"module\" object property)")
        if (typeof mod.module.name !== "string")
            throw new Error("invalid module (no \"module.name\" string property)")
        if (this.name2mod.has(mod.module.name))
            throw new Error(`module of name ${mod.module.name} already added`)

        /*  take module into our management  */
        this.mod.add(mod)
        this.name2mod.set(mod.module.name, mod)

        /*  optionally give module a link back to us  */
        if (typeof mod.kernel === "function")
            mod.kernel(this)
        else if (mod.kernel === null)
            mod.kernel = this

        /*  publish an internal event (for use by an application)  */
        this.publish("microkernel:add", mod)

        return this
    }

    /*  delete module from microkernel  */
    del (arg) {
        /*  sanity check situation  */
        if (this.state() !== "dead")
            throw new Error("microkernel is not in lowest state")

        /*  handle various variants of arguments  */
        let mod
        if (typeof arg === "function") {
            /*  delete all instances of a class  */
            this.cls2mod.get(arg).forEach((mod) => {
                this.del(mod)
            })
            this.cls2mod.delete(arg)
            return this
        }
        else if (typeof arg === "string")
            mod = this.name2mod(arg)
        else if (typeof arg === "object")
            mod = arg
        else
            throw new Error("invalid module (neither function/class nor object nor name)")

        /*  sanity check module  */
        if (!this.mod.has(mod))
            throw new Error("module not found")

        /*  publish an internal event (for use by an application)  */
        this.publish("microkernel:del", mod)

        /*  optionally remove link back to us  */
        if (typeof mod.kernel === "function")
            mod.kernel(null)
        else if (typeof mod.kernel === "object")
            mod.kernel = null

        /*  remove module from our management  */
        this.name2mod.delete(mod.module.name)
        this.mod.delete(mod)

        return this
    }

    /*  lookup module from microkernel  */
    get (name) {
        if (!this.name2mod.has(name))
            throw new Error("module not found")
        return this.name2mod.get(name)
    }
}

