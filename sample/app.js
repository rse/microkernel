
/*  import Microkernel library  */
const Microkernel = require("..")

/*  instanciate a microkernel  */
const kernel = new Microkernel()

/*  import application modules  */
const Mod1 = require("./app-mod1")
const Mod2 = require("./app-mod2")
const Mod3 = require("./app-mod3")
const Mod4 = require("./app-mod4")

/*  load application modules into microkernel  */
kernel.add(Mod1)
kernel.add(Mod2)
kernel.add(Mod3)
kernel.add(Mod4)

/*  startup microkernel and its modules  */
kernel.state("started").then(() => {
    kernel.state("dead")
}).catch((err) => {
    console.log(`ERROR: failed to start: ${err}\n${err.stack}`)
})

