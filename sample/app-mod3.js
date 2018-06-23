
module.exports = class Mod3 {
    get module  ()  { return { name: "mod3", group: "BASE", after: "mod2" } }
    boot        (k) { console.log(`boot:     ${this.module.name}`) }
    start       (k) { console.log(`start:    ${this.module.name}`) }
    stop        (k) { console.log(`stop:     ${this.module.name}`) }
    shutdown    (k) { console.log(`shutdown: ${this.module.name}`) }
}

