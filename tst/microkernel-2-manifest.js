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

var path = require("path")
var Microkernel = require("../lib/microkernel.js")

describe("Microkernel Library: Manifest", function () {
    it("add()/del()/get() functionality", function () {
        var mk = new Microkernel()
        expect(mk).to.respondTo("add")
        var mod1 = require(path.join(__dirname, "sample-load1.js"))
        var mod2 = require(path.join(__dirname, "sample-load2.js"))
        mk.add(mod1)
        mk.add(mod2)
        expect(mk.get("load1") instanceof mod1).to.be.equal(true)
        expect(mk.get("load2") instanceof mod2).to.be.equal(true)
        mk.del(mod1)
        mk.del(mod2)
        var obj1 = new mod1()
        var obj2 = new mod2()
        mk.add(obj1)
        mk.add(obj2)
        expect(mk.get("load1")).to.be.equal(obj1)
        expect(mk.get("load2")).to.be.equal(obj2)
    })
})

