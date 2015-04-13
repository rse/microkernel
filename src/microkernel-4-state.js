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

import toposort from "toposort"

/*  definition of states  */
var states = {
    num2state: [
        { state: "dead",       enter: null,        leave: null       },
        { state: "booted",     enter: "boot",      leave: "shutdown" },
        { state: "configured", enter: "configure", leave: "reset"    },
        { state: "prepared",   enter: "prepare",   leave: "release"  },
        { state: "running",    enter: "start",     leave: "stop"     }
    ],
    groups: [ "HOOK", "SETUP", "BOOT", "BASE", "RESOURCE", "SERVICE" ],
    state2num: {}
}
var i = 0
states.num2state.forEach((state) => {
    states.state2num[state.state] = i++
})

/*  internal: topolocical sorting of modules  */
var topoSortModules = (mods) => {
    let DAG    = {}
    let TAG    = {}
    let GRP    = {}
    let BEFORE = {}
    let AFTER  = {}

    /*  determine all nodes  */
    let nodes = {}
    mods.forEach((mod) => {
        let name  = mod.module.name
        nodes[name] = true
    })

    /*  helper function for taking zero or more strings out of a field  */
    let takeField = (field) => {
        if (typeof field === "object" && field instanceof Array)
            return field
        else if (typeof field === "string")
            return [ field ]
        else
            return []
    }

    /*  helper function: insert edge into DAG  */
    let insertDAG = (list, order) => {
        list.forEach((mod) => {
            let mods
            if (TAG[mod] !== undefined)
                mods = TAG[mod]
            else if (GRP[mod] !== undefined)
                mods = GRP[mod]
            else
                mods = [ mod ]
            mods.forEach((mod) => {
                let [ before, after ] = order(mod)
                if (nodes[before] === undefined)
                    throw new Error(`unknown module: ${before}`)
                if (nodes[after] === undefined)
                    throw new Error(`unknown module: ${after}`)
                if (DAG[before] === undefined)
                    DAG[before] = {}
                DAG[before][after] = true
            })
        })
    }

    /*  pass 1: iterate over all modules and pre-process information  */
    mods.forEach((mod) => {
        /*  take information of module  */
        let name   = mod.module.name
        let tag    = takeField(mod.module.tag)
        let before = takeField(mod.module.before)
        let after  = takeField(mod.module.after)
        let group  = mod.module.group

        /*  remember (a mutable copy of) after/before information  */
        BEFORE[name] = [].concat(before)
        AFTER[name]  = [].concat(after)

        /*  remember mapping of tag to module  */
        tag.forEach((tag) => {
            let idx = states.groups.indexOf(tag)
            if (idx > -1)
                throw new Error(`invalid tag (cannot be same as pre-defined group): ${tag}`)
            if (TAG[tag] === undefined)
                TAG[tag] = []
            TAG[tag].push(name)
        })

        /*  remember group of module  */
        if (group !== undefined) {
            let idx = states.groups.indexOf(group)
            if (idx === -1)
                throw new Error(`invalid group: ${group}`)
            if (GRP[group] === undefined)
                GRP[group] = []
            GRP[group].push(name)
            if (idx < states.groups.length - 1)
                BEFORE[name].push(states.groups[idx + 1])
            if (idx > 0)
                AFTER[name].push(states.groups[idx - 1])
        }
    })

    /*  pass 2: iterate over all modules and process "after" and "before" information  */
    mods.forEach((mod) => {
        /*  take information of module  */
        let name   = mod.module.name
        let before = BEFORE[name]
        let after  = AFTER[name]

        /*  insert all "after" dependencies into DAG
            (as standard "after" dependencies)  */
        insertDAG(after,  (mod) => [ name, mod ])

        /*  insert all "before" dependencies into DAG
            (as inverse "after" dependencies)  */
        insertDAG(before, (mod) => [ mod, name ])
    })

    /*  determine resulting graph edges  */
    let edges = []
    Object.keys(DAG).forEach((before) => {
        Object.keys(DAG[before]).forEach((after) => {
            edges.push([ before, after ])
        })
    })

    /*  perform a topological sorting  */
    return toposort.array(Object.keys(nodes), edges).reverse()
}

/*  the mixin class  */
export default class MicrokernelState {
    /*  initialize the microkernel instance  */
    initializer () {
        this._state = "dead"
    }

    /*  retrieve current state or request transition to new state  */
    state (stateNew) {
        /*  special case: retrieve state only  */
        let stateOld = this._state
        if (typeof stateNew !== "string")
            return stateOld

        /*  special case: transit to same state  */
        if (stateNew === stateOld)
            return Promise.resolve(stateNew)

        /*  sanity check new state  */
        if (states.state2num[stateNew] === undefined)
            throw new Error(`state: invalid new state: ${stateNew}`)

        /*  perform deferred topological sorting of modules  */
        if (this.modOrder === null) {
            this.modOrder = topoSortModules(this.mod)
            this.publish("microkernel:state:toposort", this.modOrder, this.mod)
        }

        /*  create outer promise chain  */
        let promise = new Promise ((resolve, reject) => {
            /*  determine indexes of states  */
            let stateOldIdx = states.state2num[stateOld]
            let stateNewIdx = states.state2num[stateNew]

            /*  create inner promise chain  */
            let seq = Promise.resolve()

            /*  publish internal event (for use by an application)  */
            let publishEvent = (when, from, to, method) => {
                seq = seq.then(() => {
                    this.publish(
                        `microkernel:state:transit:${when}`,
                        states.num2state[from].state,
                        states.num2state[to].state,
                        method
                    )
                })
            }

            /*  helper function for transitioning  */
            let transit = (stateFrom, stateTo, methodType, reverse, step) => {
                /*  determine modules to call (in expected order)  */
                let names = this.modOrder
                if (reverse)
                   names = names.reverse()

                /*  loop until state is reached  */
                while (stateFrom !== stateTo) {
                    /*  determine method to call  */
                    let methodName = states.num2state[
                        methodType === "enter" ? stateFrom + 1 : stateFrom
                    ][methodType]
                    publishEvent("before", stateFrom, stateFrom + step, methodName)

                    /*  call method on all modules  */
                    names.forEach((name) => {
                        let mod = this.name2mod.get(name)
                        if (typeof mod[methodName] === "function")
                            seq = seq.then(() => mod[methodName].call(mod, this))
                    })

                    /*  go to new state  */
                    stateFrom += step;
                    this._state = states.num2state[stateFrom].state
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
        promise = promise.then((stateNew) => {
            if (stateNew === "dead")
                this.modOrder = null
            return stateNew
        })

        return promise
    }

    /*  provide convenience methods for state transitions  */
    boot ()      { return this.state("booted")     }
    configure () { return this.state("configured") }
    prepare ()   { return this.state("prepared")   }
    start ()     { return this.state("running")    }
    stop ()      { return this.state("prepared")   }
    release ()   { return this.state("configured") }
    reset ()     { return this.state("booted")     }
    shutdown ()  { return this.state("dead")       }
}

