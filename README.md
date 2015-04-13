
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

There are 5 states the microkernel can be in. For transitioning between
states the microkernel calls the enter (or leave) transition method, in
(reverse) order after a topological sort, on all modules providing them.

```txt
      +---[boot]--+   +[configure]+  +-[prepare]-+  +---[start]--+
      |           |   |           |  |           |  |            |
      |           V   |           V  |           V  |            V
+----------+   +----------+   +----------+   +----------+   +----------+
|          |   |          |   |          |   |          |   |          |
| dead     |   | booted   |   |configured|   | prepared |   | running  |
|          |   |          |   |          |   |          |   |          |
+----------+   +----------+   +----------+   +----------+   +----------+
      ^           |   ^           |  ^           |  ^            |
      |           |   |           |  |           |  |            |
      +-[shutdown]+   +--[reset]--+  +-[release]-+  +---[stop]---+
```

### Module Groups

Modules can be assigned to a group. Belonging to a group "X" is the same
as tagging the module with "X" and having an "after" dependency to the
group preceeding "X" (if there is one) plus a "before" dependency to the
group following "X" (if there is one).

```txt
+--------+  +--------+  +--------+  +--------+  +--------+  +--------+
|         \ |         \ |         \ |         \ |         \ |         \
| HOOK     \| SETUP    \| BOOT     \| BASE     \| RESOURCE \| SERVICE  \
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

License
-------

Copyright (c) 2015 Ralf S. Engelschall (http://engelschall.com/)

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

