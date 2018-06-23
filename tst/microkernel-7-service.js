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

const Microkernel = require("..")

describe("Microkernel Library: Service", () => {
    it("sv()/register()/unregister()/service() functionality", () => {
        let mk = new Microkernel()
        expect(mk).to.respondTo("sv")
        expect(mk).to.respondTo("register")
        expect(mk).to.respondTo("unregister")
        expect(mk).to.respondTo("service")

        mk.register("foo", function (a1, a2) {
            expect(a1).to.be.equal(7)
            expect(a2).to.be.equal(true)
            expect(this).to.be.deep.equal([ 42 ])
            return "foo"
        }, [ 42 ])
        mk.register("bar", function (a1, a2) {
            expect(a1).to.be.equal(7)
            expect(a2).to.be.equal(true)
            expect(this).to.be.deep.equal([ 42 ])
            return "bar"
        }, [ 42 ])
        expect(mk.sv("foo", 7, true)).to.be.equal("foo")
        expect(mk.sv("bar", 7, true)).to.be.equal("bar")
    })
})

