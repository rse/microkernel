/*
**  Microkernel -- Microkernel for Server Applications
**  Copyright (c) 2015-2018 Ralf S. Engelschall <rse@engelschall.com>
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

const path = require("path")
const Microkernel = require("..")

describe("Microkernel Library: Manifest", () => {
    it("add()/del()/get() functionality", () => {
        let mk = new Microkernel()
        expect(mk).to.respondTo("add")
        let Mod1 = require(path.join(__dirname, "sample-load1.js"))
        let Mod2 = require(path.join(__dirname, "sample-load2.js"))
        mk.add(Mod1)
        mk.add(Mod2)
        expect(mk.get("load1") instanceof Mod1).to.be.equal(true)
        expect(mk.get("load2") instanceof Mod2).to.be.equal(true)
        mk.del(Mod1)
        mk.del(Mod2)
        let obj1 = new Mod1()
        let obj2 = new Mod2()
        mk.add(obj1)
        mk.add(obj2)
        expect(mk.get("load1")).to.be.equal(obj1)
        expect(mk.get("load2")).to.be.equal(obj2)
    })
})

