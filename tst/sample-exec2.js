
module.exports = function (mk) {
	return new Promise(function (resolve /*, reject */) {
		/* global setTimeout: true */
		setTimeout(function () {
	        mk.exec2 = true
	        resolve()
		}, 100)
	})
}

