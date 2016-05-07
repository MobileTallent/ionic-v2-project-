// !! Copy this file and remove the .template extension before filling in the values !!

var e2e = {
	parseServerUrl: 'http://localhost:1337/parse',
	// Hard code your Parse integration testing application keys so you don't accidentally run this on your production app!
	app: {
		'id': 'LGTdfRoDx8fhs0ZGfwSu0i0OqCUT5HQOM2HpbeIK',
		'jsKey': 'bJuyQTIRlay2ZugTw1G004rakqirSxdJSadKGMQm',
		'restKey': 'PPI885bFO5hSzgqEok8VHfCcfy0qWpk0QSo85qp1',
		'masterKey': '8h3ft3jSkPyggxxiO4sehXz8gRirnARKsx1RcPZX'
	},
	fb: {
		appId: '340785822781848',
		appSecret: '33627ca7b7f03795a8965f1a47c5c584'
	},
	'user1': {
		'email': 'campers+1@gmail.com',
		'password': 'asdfasdf'
	},
	'user2': {
		'email': 'campers+2@gmail.com',
		'password': 'asdfasdf'
	},
	'user3': {
		'email': 'campers+3@gmail.com',
		'password': 'asdfasdf'
	},
	'userNoBirthdayPermission': {
		'id': '1414705692187958',
		'email': 'no_qxhfvjr_permission@tfbnw.net',
		access_token: ''
	},
	// Include user_birthdate permission. This user should be able to register successfully
	'hasBirthday': {
		'id': '1421303444859656',
		'email': 'has_dptvscs_birthday@tfbnw.net',
		'birthday': '08/08/1980',
		access_token: ''
	},
	// Include user_birthdate permission. Make sure the test user age is less than the MINIMUM_AGE variable in your cloud code
	'minimumAge': {
		'id': '1413090789017964',
		'email': 'too_ytvfyfg_young@tfbnw.net',
		access_token: ''
	}
}
