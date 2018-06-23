
module.exports = function (mk) {
    /* global Promise: true */
    return new Promise((resolve /*, reject */) => {
        /* global setTimeout: true */
        setTimeout(() => {
            mk.exec2 = true
            resolve()
        }, 100)
    })
}

