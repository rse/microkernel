
export default class Mod1 {
    constructor ()  { this.module = { name: "mod1", group: "BOOT" } }
    boot        (k) { console.log(`boot:     ${this.module.name}`) }
    start       (k) { console.log(`start:    ${this.module.name}`) }
    stop        (k) { console.log(`stop:     ${this.module.name}`) }
    shutdown    (k) { console.log(`shutdown: ${this.module.name}`) }
}

