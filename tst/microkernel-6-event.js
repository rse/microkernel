/*
**  Microkernel -- Microkernel for Server Applications
**  Copyright (c) 2015-2017 Ralf S. Engelschall <rse@engelschall.com>
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

describe("Microkernel Library: Event", function () {
    it("on()/subscribe()/unsubscribe()/publish() functionality", function (done) {
        var mk = new Microkernel()
        expect(mk).to.respondTo("on")
        expect(mk).to.respondTo("subscribe")
        expect(mk).to.respondTo("unsubscribe")
        expect(mk).to.respondTo("publish")

        /*  simple "none" processing  */
        var ok = 0
        mk.on("foo", function (a1, a2) {
            if (a1 === 7 && a2 === false && this[0] === 42)
                ok++
        }, [ 42 ])
        mk.on("foo", function (a1, a2) {
            if (a1 === 7 && a2 === false && this[0] === 13)
                ok++
        }, [ 13 ])
        mk.publish("foo", 7, false).then(function () {
            expect(ok).to.be.equal(2)
            done()
        })
    })
})

