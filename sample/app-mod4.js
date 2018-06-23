
module.exports = class Mod4 {
    get module  ()  { return { name: "mod4", group: "SERVICE" } }
    boot        (k) { console.log(`boot:     ${this.module.name}`) }
    start       (k) { console.log(`start:    ${this.module.name}`) }
    stop        (k) { console.log(`stop:     ${this.module.name}`) }
    shutdown    (k) { console.log(`shutdown: ${this.module.name}`) }
}

