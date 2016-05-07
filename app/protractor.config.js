// https://angular.github.io/protractor/

exports.config = {
	seleniumAddress: 'http://localhost:4444/wd/hub',
	capabilities: {
		// You can use other browsers
		// like firefox, phantoms, safari, IE (-_-)
		'browserName': 'chrome'
	},
	specs: [
		'e2e/e2eConfig.js',
		'e2e/profile.spec.js'
	]
};