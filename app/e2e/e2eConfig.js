
var e2e = {
    parseServerUrl: 'http://localhost:1337/parse',
	// Hard code your Parse integration testing application keys so you don't accidentally run this on your production app!
	app: {
		id: '',
		jsKey: '',
		restKey: '',
		masterKey: ''
	},
	// Add your Facebook application id and secret
	fb: {
    		appId: '',
    		appSecret: ''
    },
	user1: {
		email: '',
		password: ''
	},
	user2: {
		email: '',
		password: ''
	},

	// For the following you will need to created test users in your Facebook developer account for the app
	// (Roles -> Test Users) with the appropriate permissions and profile values to test the conditions
	// See https://developers.facebook.com/docs/apps/test-users

	// Don't worry about the access_token field, the test script will populate it on each run

	// Don't add the user_birthdate permissions
	userNoBirthdayPermission: {
		id: '',
		email: '',
		access_token: ''
	},
	// Include user_birthdate permission. This user should be able to register successfully
	hasBirthday: {
		id: '',
		email: '',
		birthday: '',
		access_token: ''
	},
	// Include user_birthdate permission. Make sure the test user age is less than the MINIMUM_AGE variable in your cloud code
	minimumAge: {
		id: '',
		email: '',
		access_token: ''
	}
}
