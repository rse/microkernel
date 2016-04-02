
Microkernel
===========

Microkernel for Server Applications

<p/>
<img src="https://nodei.co/npm/microkernel.png?downloads=true&stars=true" alt=""/>

<p/>
<img src="https://david-dm.org/rse/microkernel.png" alt=""/>

About
-----

Microkernel is JavaScript library, for use in
[node.js](http://nodejs.org/)/[io.js](http://iojs.org/) environments,
to structure and manage server applications with the help of modules, a
stateful life-cycle, hooks, events, services and resources.

Installation
------------

```shell
$ npm install microkernel
```

Basic Concepts
--------------

The microkernel design follows the following primary concepts.

### State Transitions

There are states the microkernel can be in. For transitioning between
states the microkernel calls the enter (or leave) transition method, in
(reverse) order after a topological sort, on all modules providing them.

By default there are 6 states defined:

```txt
      +---[boot]--+   +-[latch]--+   +[configure]+  +-[prepare]-+  +---[start]--+
      |           |   |          |   |           |  |           |  |            |
      |           V   |          V   |           V  |           V  |            V
+----------+   +----------+   +----------+   +----------+   +----------+   +----------+
|          |   |          |   |          |   |          |   |          |   |          |
| dead     |   | booted   |   | latched  |   |configured|   | prepared |   | started  |
|          |   |          |   |          |   |          |   |          |   |          |
+----------+   +----------+   +----------+   +----------+   +----------+   +----------+
      ^           |   ^          |   ^           |  ^           |  ^            |
      |           |   |          |   |           |  |           |  |            |
      +-[shutdown]+   +-[unlatch]+   +--[reset]--+  +-[release]-+  +---[stop]---+
```

### Module Groups

Modules can be assigned to a group. Belonging to a group "X" is the
same as tagging the module with "X" and having an "after" dependency to
the group preceeding "X" (if there is one) plus a "before" dependency
to the group following "X" (if there is one). So, a group acts like a
chronological phase for modules.

By default there are 6 groups defined:

```txt
+--------+  +--------+  +--------+  +--------+  +--------+  +--------+
|         \ |         \ |         \ |         \ |         \ |         \
| BOOT     \| BASE     \| RESOURCE \| SERVICE  \| IDENT    \| USECASE  \
|          /|          /|          /|          /|          /|          /
|         / |         / |         / |         / |         / |         /
+--------+  +--------+  +--------+  +--------+  +--------+  +--------+
```

### Module Dependencies

Modules can have "after" and/or "before" dependencies to other modules
(or groups or tags).

```txt
     +---[before]--+
     |             |
     |             V
+----------+   +----------+
|          |   |          |
| Module 1 |   | Module 2 |
|          |   |          |
+----------+   +----------+
     ^             |
     |             |
     +---[after]---+
```

Application Programming Interface (API)
---------------------------------------

See the [TypeScript Definition](./src/microkernel.d.ts) for details.

Example
-------

- `app.js`:

```js
/*  import Microkernel library  */
import Microkernel from "microkernel"

/*  instanciate a microkernel  */
const kernel = new Microkernel()

/*  import application modules (order does not matter)  */
import Mod1 from "./app-mod1"
import Mod2 from "./app-mod2"
import Mod3 from "./app-mod3"
import Mod4 from "./app-mod4"

/*  load application modules into microkernel  */
kernel.add(Mod1)
kernel.add(Mod2)

/*  startup microkernel and its modules  */
kernel.state("started").catch((err) => {
    console.log(`ERROR: failed to start: ${err}\n${err.stack}`)
})
```

- `app-mod1.js`:

```js
export default class Mod1 {
    constructor ()   { this.module = { name: "mod1", group: "BOOT" } }
    boot        (mk) { console.log(`boot:     ${this.module.name}`) }
    start       (mk) { console.log(`start:    ${this.module.name}`) }
    stop        (mk) { console.log(`stop:     ${this.module.name}`) }
    shutdown    (mk) { console.log(`shutdown: ${this.module.name}`) }
}
```

- `app-mod2.js`:

```js
export default class Mod2 {
    constructor ()   { this.module = { name: "mod2", group: "BASE" } }
    boot        (mk) { console.log(`boot:     ${this.module.name}`) }
    start       (mk) { console.log(`start:    ${this.module.name}`) }
    stop        (mk) { console.log(`stop:     ${this.module.name}`) }
    shutdown    (mk) { console.log(`shutdown: ${this.module.name}`) }
}
```

- `app-mod3.js`:

```js
export default class Mod3 {
    constructor ()   { this.module = { name: "mod3", group: "BASE", after: "mod2" } }
    boot        (mk) { console.log(`boot:     ${this.module.name}`) }
    start       (mk) { console.log(`start:    ${this.module.name}`) }
    stop        (mk) { console.log(`stop:     ${this.module.name}`) }
    shutdown    (mk) { console.log(`shutdown: ${this.module.name}`) }
}
```

- `app-mod4.js`:

```js
export default class Mod4 {
    constructor ()   { this.module = { name: "mod4", group: "SERVICE" } }
    boot        (mk) { console.log(`boot:     ${this.module.name}`) }
    start       (mk) { console.log(`start:    ${this.module.name}`) }
    stop        (mk) { console.log(`stop:     ${this.module.name}`) }
    shutdown    (mk) { console.log(`shutdown: ${this.module.name}`) }
}
```

When starting this app you can see the life-cycle in action:

```shell
$ node-babel --presets es2015 app.js
boot:     mod1
boot:     mod2
boot:     mod3
boot:     mod4
start:    mod1
start:    mod2
start:    mod3
start:    mod4
stop:     mod4
stop:     mod3
stop:     mod2
stop:     mod1
shutdown: mod4
shutdown: mod3
shutdown: mod2
shutdown: mod1
```

License
-------

Copyright (c) 2015-2016 Ralf S. Engelschall (http://engelschall.com/)

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

