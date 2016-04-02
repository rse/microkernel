
export default class Mod4 {
    constructor ()   { this.module = { name: "mod4", group: "SERVICE" } }
    boot        (mk) { console.log(`boot:     ${this.module.name}`) }
    start       (mk) { console.log(`start:    ${this.module.name}`) }
    stop        (mk) { console.log(`stop:     ${this.module.name}`) }
    shutdown    (mk) { console.log(`shutdown: ${this.module.name}`) }
}

