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

var Microkernel = require("../lib/microkernel.js")

describe("Microkernel Library: Hook", function () {
    it("at()/latch()/unlatch()/hook() functionality", function () {
        var mk = new Microkernel()
        expect(mk).to.respondTo("at")
        expect(mk).to.respondTo("latch")
        expect(mk).to.respondTo("unlatch")
        expect(mk).to.respondTo("hook")

        /*  simple "none" processing  */
        var ok = 0
        mk.at("foo", function (a1, a2) {
            if (a1 === 7 && a2 === false && this[0] === 42)
                ok++
        }, [ 42 ])
        mk.at("foo", function (a1, a2) {
            if (a1 === 7 && a2 === false && this[0] === 13)
                ok++
        }, [ 13 ])
        mk.hook("foo", "none", 7, false)
        expect(ok).to.be.equal(2)

        /*  simple "pass" processing  */
        mk.at("bar", function (a, v) {
            return v + "2"
        })
        mk.at("bar", function (a, v) {
            return v + "3"
        })
        expect(mk.hook("bar", "pass", "1")).to.be.equal("123")

        /*  simple "or" processing  */
        mk.at("accessGranted", function (/* a, v */) {
            return false
        })
        mk.at("accessGranted", function (/* a, v */) {
            return true
        })
        expect(mk.hook("accessGranted", "and", true)).to.be.equal(false)

        /*  simple "assign" processing  */
        mk.at("config", function (/* a, v */) {
            return { foo: 1, bar: 2 }
        })
        mk.at("config", function (/* a, v */) {
            return { baz: 3, quux: 4 }
        })
        expect(mk.hook("config", "assign", {})).to.be.deep.equal({
            foo: 1, bar: 2, baz: 3, quux: 4
        })
    })
})

