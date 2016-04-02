
/*  import Microkernel library  */
import Microkernel from "../lib/microkernel"

/*  instanciate a microkernel  */
const kernel = new Microkernel()

/*  import application modules  */
import Mod1 from "./app-mod1"
import Mod2 from "./app-mod2"
import Mod3 from "./app-mod3"
import Mod4 from "./app-mod4"

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

