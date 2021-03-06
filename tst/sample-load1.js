
const mod = function () {}

mod.prototype = {
    module: {
        name: "load1"
    },
    log: function (msg) {
        if (this.logbook === undefined)
            this.logbook = []
        if (arguments.length === 0)
            return this.logbook
        else if (arguments.length === 1 && typeof msg === "string")
            this.logbook.push(msg)
        else
            this.logbook = []
    },
    kernel: function (mk) {
        if (mk !== null)
            mk.load1 = true
    },
    boot:      function () { this.log("boot") },
    latch:     function () { this.log("latch") },
    configure: function () { this.log("configure") },
    prepare:   function () { this.log("prepare") },
    start:     function () { this.log("start") },
    stop:      function () { this.log("stop") },
    release:   function () { this.log("release") },
    reset:     function () { this.log("reset") },
    unlatch:   function () { this.log("unlatch") },
    shutdown:  function () { this.log("shutdown") }
}

module.exports = mod

