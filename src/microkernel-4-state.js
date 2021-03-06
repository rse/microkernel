/*
**  Microkernel -- Microkernel for Server Applications
**  Copyright (c) 2015-2021 Dr. Ralf S. Engelschall <rse@engelschall.com>
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

const GDO = require("gdo")

/*  the mixin class  */
module.exports = class MicrokernelState {
    /*  initialize the microkernel instance  */
    initializer () {
        this._state = "dead"
        this._num2state = []
        this._state2num = {}
        this._groups = []
        this.transitions([
            { state: "dead",       enter: null,        leave: null },
            { state: "booted",     enter: "boot",      leave: "shutdown" },
            { state: "latched",    enter: "latch",     leave: "unlatch" },
            { state: "configured", enter: "configure", leave: "reset" },
            { state: "prepared",   enter: "prepare",   leave: "release" },
            { state: "started",    enter: "start",     leave: "stop" }
        ])
        this.groups([
            "BOOT", "BASE", "RESOURCE", "SERVICE", "USECASE"
        ])
    }

    /*  (re)configure state transitions  */
    transitions (transitions) {
        this._num2state = transitions
        let i = 0
        transitions.forEach((state) => {
            this._state2num[state.state] = i++
        })
        return this
    }

    /*  (re)configure module groups  */
    groups (groups) {
        this._groups = groups
        return this
    }

    /*  retrieve current state or request transition to new state  */
    state (stateNew) {
        /*  special case: retrieve state only  */
        const stateOld = this._state
        if (typeof stateNew !== "string")
            return stateOld

        /*  special case: transit to same state  */
        if (stateNew === stateOld)
            return Promise.resolve(stateNew)

        /*  sanity check new state  */
        if (this._state2num[stateNew] === undefined)
            throw new Error(`state: invalid new state: ${stateNew}`)

        /*  perform deferred topological sorting of modules  */
        if (this.modOrder === null) {
            const gdo = new GDO()
            gdo.groups(this._groups)
            this.mod.forEach((mod) => {
                gdo.element(mod.module)
            })
            this._modOrder = gdo.order()
            this.hook("microkernel:state:toposort", "none", this._modOrder, this.mod)
        }

        /*  create outer promise chain  */
        let promise = new Promise((resolve, reject) => {
            /*  determine indexes of states  */
            const stateOldIdx = this._state2num[stateOld]
            const stateNewIdx = this._state2num[stateNew]

            /*  create inner promise chain  */
            let seq = Promise.resolve()

            /*  publish internal event (for use by an application)  */
            const publishEvent = (when, from, to, method) => {
                seq = seq.then(() => {
                    this.hook(`microkernel:state:transit:${when}`, "none",
                        this._num2state[from].state, this._num2state[to].state, method)
                })
            }

            /*  helper function for transitioning  */
            const transit = (stateFrom, stateTo, methodType, reverse, step) => {
                /*  determine modulesdto call (in expected order)  */
                let names = this._modOrder
                if (reverse)
                    names = names.reverse()

                /*  loop until state is reached  */
                while (stateFrom !== stateTo) {
                    /*  determine method to call  */
                    const methodName = this._num2state[
                        methodType === "enter" ? stateFrom + 1 : stateFrom
                    ][methodType]
                    publishEvent("before", stateFrom, stateFrom + step, methodName)

                    /*  call method on all modules  */
                    names.forEach((name) => {
                        const mod = this.name2mod.get(name)
                        let method = mod[methodName]
                        /* eslint no-console: 0 */
                        if (typeof method === "function") {
                            seq = seq.then(() => {
                                method = this.hook("microkernel:state:call:before", "pass",
                                    method, mod, methodName, name)
                                let result = method.call(mod, this)
                                result = this.hook("microkernel:state:call:after", "pass",
                                    result, methodName, name)
                                return result
                            })
                        }
                    })

                    /*  go to new state  */
                    stateFrom += step
                    this._state = this._num2state[stateFrom].state
                    publishEvent("after", stateFrom - step, stateFrom, methodName)
                }
            }

            /*  determine whether we perform upgrade or downgrade transition  */
            if (stateOldIdx < stateNewIdx)
                transit(stateOldIdx, stateNewIdx, "enter", false,  1) /*  upgrade    */
            else if (stateOldIdx > stateNewIdx)
                transit(stateOldIdx, stateNewIdx, "leave", true,  -1) /*  downgrade  */

            /*  finally let inner promise chain either resolve or reject outer promise chain  */
            seq.then(() => {
                resolve(stateNew)
            }, (err) => {
                reject(err)
            })
        })

        /*  reset module order in case we reached the dead state (again)  */
        promise = promise.then((state) => {
            if (state === "dead")
                this._modOrder = null
            return state
        })

        return promise
    }
}

