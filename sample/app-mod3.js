
export default class Mod3 {
    constructor ()   { this.module = { name: "mod3", group: "BASE", after: "mod2" } }
    boot        (mk) { console.log(`boot:     ${this.module.name}`) }
    start       (mk) { console.log(`start:    ${this.module.name}`) }
    stop        (mk) { console.log(`stop:     ${this.module.name}`) }
    shutdown    (mk) { console.log(`shutdown: ${this.module.name}`) }
}

