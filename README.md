
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
[Node.js](http://nodejs.org/) environments,
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
states the microkernel calls the optional enter (or leave) transition
method, in (reverse) order after a topological sort, on all modules
providing them.

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

### Module Definitions

A module under run-time is just an object with a control field `module`
and zero or more enter/leave transition methods (see "State Transitions"
above). In TypeScript notation, a module has to conform to the following
interface (assuming the default transition configuration):

```ts
interface Module {
    /*  mandatory module descriptor.
        name:   unique name of module, by convention in all lower-case.
        tag:    one or more tags, by convention in all upper-case, to associate the module with.
        before: one or more modules the current module has to come before.
        after:  one or more modules the current module has to come after.  */
    module: {
        name:    string;                  /*  e.g. "foo"  */
        tag?:    string | Array<string>;  /*  e.g. "RESOURCE"  */
        before?: string | Array<string>;  /*  e.g. [ "BOOT", "bar" ]  */
        after?:  string | Array<string>;  /*  e.g. "quux"  */
    };

    /*  optional default enter/leave methods
        kernel: backreference to the microkernel the module runs under  */
    boot?:      (kernel: Kernel) => void;
    latch?:     (kernel: Kernel) => void;
    configure?: (kernel: Kernel) => void;
    prepare?:   (kernel: Kernel) => void;
    start?:     (kernel: Kernel) => void;
    stop?:      (kernel: Kernel) => void;
    release?:   (kernel: Kernel) => void;
    reset?:     (kernel: Kernel) => void;
    unlatch?:   (kernel: Kernel) => void;
    shutdown?:  (kernel: Kernel) => void;
}
```

Application Programming Interface (API)
---------------------------------------

In TypeScript notation, the Application Programming Interface (API) is:

```ts
declare module Microkernel {
    /*  promise instance  */
    interface Promise {
        then(
            onSuccess: (value?: any) => Promise | any | void,
            onError?:  (error: any)  => Promise | any | void
        ): Promise;
    }

    /*  module instance  */
    interface Module {
        /*  module descriptor.
            name:   unique name of module, by convention in all lower-case.
            tag:    one or more tags, by convention in all upper-case, to associate the module with.
            before: one or more modules the current module has to come before.
            after:  one or more modules the current module has to come after.  */
        module: {
            name:    string;                  /*  "foo"  */
            tag?:    string | Array<string>;  /*  "RESOURCE"  */
            before?: string | Array<string>;  /*  [ "BOOT", "bar" ]  */
            after?:  string | Array<string>;  /*  "quux"  */
        };
    }

    /*  module class  */
    interface ModuleClass {
        /*  instanciate the module  */
        new(): Module;
    }

    /*  kernel instance  */
    interface Kernel {
        /*  library version for programatic comparison and/or displaying by applications.
            major: major version number (bumped on revisions,    definitely incompatible)
            minor: minor version number (bumped on improvements, potentially incompatible).
            micro: micro version number (bumped on bugfixes,     fully compatible).
            date:  date of release (in YYYYMMDD format).  */
        version: {
            major: number;  /*  0  */
            minor: number;  /*  9  */
            micro: number;  /*  2  */
            date:  number;  /*  20150412  */
        };

        /*  add a module to the kernel, either by auto-instanciating
            a module class or by a pre-instanciated module object  */
        add(module: ModuleClass | Module): Kernel;

        /*  delete a module from the kernel, either by a module class (effectively
            deleting all instances of it) or by a pre-instanciated module object  */
        del(module: ModuleClass | Module): Kernel;

        /*  get a module from the kernel by its name  */
        get(name: string): Module

        /*  require() and execute one or more procedure files (potentially asynchronously).
            Each file is expected to export a single function of type
            "f(Kernel): Promise | any | void". It is called with the kernel
            as its parameter and can return a promise in case it executes
            asynchronously.  */
        exec(...files: string[]): Promise;

        /*  require() and instanciate one or more module class files (fully synchronously).
            Each file is expected to export a class/fnction of type
            "ModuleClass". It is instanciated and added to the kernel.  */
        load(...files: string[]): Kernel;

        /*  configure the state transitions  */
        transitions(
            transitions: {
                state: string;
                enter: string;
                leave: string;
            }[]
        ): Kernel;

        /*  configure the module groups  */
        groups(
            groups: string[]
        ): Kernel;

        /*  Retrieve the current state or trigger a transition to a new
            state. There are 4+1 states and their corresponding enter (from
            lower to higher) or leave (from higher to lower) method names:

                State      Enter     Leave
                ---------- --------- ---------
                dead       (none)    (none)
                booted     boot      shutdown
                latched    latch     unlatch
                configured configure reset
                prepared   prepare   release
                started    start     stop

            One can trigger the kernel to go to arbitrary states.
            It will transiton through all intermediate states
            automatically. For instance, if there are two modules A and
            B and (B comes after A) and the kernel is in "dead" state,
            then a kernel.state("started") will trigger the following
            method calls (in exactly this order):

                A.boot(kernel)
                B.boot(kernel)
                A.latch(kernel)
                B.latch(kernel)
                A.configure(kernel)
                B.configure(kernel)
                A.prepare(kernel)
                B.prepare(kernel)
                A.start(kernel)
                B.start(kernel)

            A subsequent kernel.state("dead") will trigger the following
            method calls (notice that A and B are now reversed, too):

                B.stop(kernel)
                A.stop(kernel)
                B.release(kernel)
                A.release(kernel)
                B.reset(kernel)
                A.reset(kernel)
                B.unlatch(kernel)
                A.unlatch(kernel)
                B.shutdown(kernel)
                A.shutdown(kernel)
        */
        state(newState?: string): string;

        /*  Latch into a named hook with the help of a callback function.
            The callback function is called as "ctx.callback(...params, result)"
            once "kernel.hook(name, proc, ...params)" is called. The trailing
            appended parameter is the initial or intermediate result and the function
            is expected to return the next intermediate or final result.
            The "latch" function returns a unique id for subsequent unlatching.
            There is a short-hand method "at" which is equivalent to "latch".  */
        at(
            name: string,
            callback: (...params: any[]) => any,
            ctx?: any
        ): number;
        latch(
            name: string,
            callback: (...params: any[]) => any,
            ctx?: any
        ): number;

        /*  Unlatch from a named hook, based on the unique id given by "latch"  */
        unlatch(name: string, id: number): Kernel;

        /*  Enter a named hook with a particular processing step and parameters.
            The processing step can be: "none", "pass", "or", "and", "mult", "add",
            "append", "push", "concat", "set", "insert", "assign" and this controls
            how the intermediate values are processed. The whole process
            is fully synchronous. */
        hook(name: string, proc: string, ...params: any[]): any;

        /*  Subscribe to a named event with the help of a callback function.
            The callback function is called as "ctx.callback(...params, result)"
            once "kernel.hook(name, proc, ...params)" is called. The trailing
            argument is the initial or intermediate result and the function
            is expected to return the next intermediate or final result.
            The "subscribe" function returns a unique id for subsequent unsubscribing.
            There is a short-hand method "on" which is equivalent to "subscribe".  */
        on(
            name: string,
            callback: (...params: any[]) => Promise | any | void,
            ctx?: any
        ): number;
        subscribe(
            name: string,
            callback: (...params: any[]) => Promise | any | void,
            ctx?: any
        ): number;

        /*  Unsubscribe from a named event, based on the unique id given by "subscribe"  */
        unsubscribe(name: string, id: number): Kernel;

        /*  Publish a named event with optional parameters.
            The whole event delivery process is fully asynchronous,
            hence the function returns a promise which resolves once
            all callbacks finished their potentially asynchronous
            (and Promise-controlled) processing. */
        publish(name: string, ...params: any[]): Promise;

        /*  Register a named service with the help of a callback function.
            The callback function is called as "ctx.callback(...params)"
            once "kernel.service(name, ...params)" is called.
            There can only be exactly one registered callback per service.
            There is a short-hand method "sv" which is equivalent to "service".  */
        register(
            name: string,
            callback: (...params: any[]) => any,
            ctx?: any
        ): number;

        /*  Unregister a named event.  */
        unregister(name: string, id: number): Kernel;

        /*  Publish a named event with optional parameters.
            The whole event delivery process is fully asynchronous,
            hence the function returns a promise which resolves once
            all callbacks finished their potentially asynchronous
            (and Promise-controlled) processing. */
        sv(name: string, ...params: any[]): any;
        service(name: string, ...params: any[]): any;

        /*  Get or set a resource value under a key.
            There is a short-hand method "rs" which is equivalent to "resource".  */
        rs(key: string, value?: any): any;
        resource(key: string, value?: any): any;
    }

    /*  kernel class  */
    interface KernelClass {
        /*  instanciate the kernel  */
        new(): Kernel;
    }
}
```

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
    constructor ()  { this.module = { name: "mod1", group: "BOOT" } }
    boot        (k) { console.log(`boot:     ${this.module.name}`) }
    start       (k) { console.log(`start:    ${this.module.name}`) }
    stop        (k) { console.log(`stop:     ${this.module.name}`) }
    shutdown    (k) { console.log(`shutdown: ${this.module.name}`) }
}
```

- `app-mod2.js`:

```js
export default class Mod2 {
    constructor ()  { this.module = { name: "mod2", group: "BASE" } }
    boot        (k) { console.log(`boot:     ${this.module.name}`) }
    start       (k) { console.log(`start:    ${this.module.name}`) }
    stop        (k) { console.log(`stop:     ${this.module.name}`) }
    shutdown    (k) { console.log(`shutdown: ${this.module.name}`) }
}
```

- `app-mod3.js`:

```js
export default class Mod3 {
    constructor ()  { this.module = { name: "mod3", group: "BASE", after: "mod2" } }
    boot        (k) { console.log(`boot:     ${this.module.name}`) }
    start       (k) { console.log(`start:    ${this.module.name}`) }
    stop        (k) { console.log(`stop:     ${this.module.name}`) }
    shutdown    (k) { console.log(`shutdown: ${this.module.name}`) }
}
```

- `app-mod4.js`:

```js
export default class Mod4 {
    constructor ()  { this.module = { name: "mod4", group: "SERVICE" } }
    boot        (k) { console.log(`boot:     ${this.module.name}`) }
    start       (k) { console.log(`start:    ${this.module.name}`) }
    stop        (k) { console.log(`stop:     ${this.module.name}`) }
    shutdown    (k) { console.log(`shutdown: ${this.module.name}`) }
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

