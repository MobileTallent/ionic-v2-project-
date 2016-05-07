console.log('Make sure you have deployed the latest CloudCode to your QA/integration testing app!')
// Provide a custom implementation of constants to ensure we only use the Parse app we have designated for integration tests
angular.module('constants',[])
	.constant('parseAppId', e2e.app.id)
	.constant('parseJavascriptKey', e2e.app.jsKey)
	.constant('parseClientKey', '')
	.constant('parseServerUrl', e2e.parseServerUrl)

// Required to bootstrap our own angular app
var rootElement = angular.element(document)
var app = angular.module('app', ['ng', 'service.parse'])
	.provider({
		$rootElement:function() {
			this.$get = function() {
				return rootElement
			}
		}
	})

describe('Parse Service', function() {

	var ParseService, $http, $q

	function log(o) {
		console.log(JSON.stringify(o))
	}

	function errorFn(error) {
		console.error(JSON.stringify(error))
		fail(error)
		return $q.reject(error)
	}

	beforeEach(function(done) {
		var injector = angular.injector(['app'])
		ParseService = injector.get('ParseService')
		jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000 * 60 * 10 // allow 10 minutes for the test to run

		localStorage.clear()

		$http = injector.get('$http')
		$q = injector.get('$q')
		console.log('Deleting all data...')
		var postConfig = {
			headers: {
				'X-Parse-Application-Id': e2e.app.id,
				'Content-Type': 'application/json'
			}
		}
		$http.post(e2e.parseServerUrl + '/functions/DeleteAllData', {}, postConfig)
			.success(result => {
				console.log('Delete all data result:' + JSON.stringify(result))

				// This gets the details for your test facebook users and sets the access tokens in the e2e config object
				var url = 'https://graph.facebook.com/v2.3/' + e2e.fb.appId +'/accounts/test-users?access_token=' + e2e.fb.appId +'|' + e2e.fb.appSecret
				$http.get(url).success(result => {
					// iterate over every property in e2e which has an id property
					_.forEach(_.filter(e2e, o => o.id), prop => {
						// see if we have a result for the user with that id
						var testUser = _.find(result.data, 'id', prop.id)
						if(testUser) {
							//console.log('Setting access token for user ' + prop.id)
							prop.access_token = testUser.access_token
						}

					})
					done()
				}).error(e => {console.error('error getting facebook test users tokens');errorFn(e); done()})

			}).error(e => {console.error('error calling DeleteAllData');errorFn(e); done()})
	})

	// Note that if you try and run all the test at once many of them will fail. Something with the session handling
	// needs to be fixed. If you run them one by one then they pass

	//*
	it('it should complete a smoke test of all the service functions', (done) => {
		console.log('IntegrationTest')
		var location = {latitude:10, longitude: 10}
		var profile
		var searchParams = {location:location, distance:25, 'ageFrom':18, 'ageTo':55, guys:true, girls:true }
		var birthdate = new Date(new Date().getFullYear() - 25, 0, 1) // 25 years old

		var match, msg1, msg2

		ParseService.signUp(e2e.user1.email, e2e.user1.password)
			.then(result => ParseService.getProfile())
			.then(result => {
				profile = result
				expect(profile.distance).toBe(25) // check the cloud-code initialised default values are returned with all the funky afterSave and fetching
				return profile
			})
			.then(profile => ParseService.saveProfile(profile, {enabled:true, gender:'M', guys:true, birthdate:birthdate, location:location, name:'user1', about:'about1'}))
			.then(profile => ParseService.logout())

			.then(() => ParseService.signUp(e2e.user2.email, e2e.user2.password))
			.then(result => ParseService.getProfile())
			.then(result => profile = result)
			.then(result => ParseService.saveProfile(profile, {enabled:true, gender:'M', guys:true, birthdate:birthdate, location:location, name:'user2', about:'about2'}))

			.then(profile => {console.log('searching...');return ParseService.searchProfiles(searchParams)})
			.then(profiles => {
				console.log('searched profiles')
				expect(profiles.length).toBe(1)
				var profile = profiles[0]
				// test the _processProfile(profile) function in the Cloud Code
				expect(profile.birthdate).toBeUndefined()
				expect(profile.age).toBe(25)

				// swipe!
				return ParseService.processProfile(profiles[0], true)
			}).then(match => {
				console.log('processed profile')
				expect(match).toBeNull() // not a mutual match
				return ParseService.logout()

				// log back as user1 in then match with user2
			}).then(() => ParseService.logIn(e2e.user1.email, e2e.user1.password))

			.then(() => ParseService.getProfilesWhoLikeMe())
			.then(profiles => {
				console.log('retrieved profiles who like me')
				expect(profiles.length).toEqual(1)
				return ParseService.searchProfiles(searchParams)
			})
			.then(profiles => {
				console.log('searched profiles')
				expect(profiles.length).toEqual(1)
				return ParseService.processProfile(profiles[0], true)
			}).then(result => {
				console.log('processed profile. result:' + JSON.stringify(result) + ' fetching...')
				Parse.User.current().fetch().then(user => expect(user.matches.length).toBe(1), errorFn)

				match = result
				expect(match.state).toEqual('M')

				console.log('loading mutual match ' + match.id)
				return ParseService.getMatches([match.id])
			}).then(matches => {
				expect(matches.length).toBe(1)
			console.log('mutual match ', matches[0])
				// logged in as user1, so the matches profile should be user2
				expect(matches[0].otherProfile.name).toBe('user2')
				// if the match was notified from a push notification, then we would need to load the profie
				console.log('loading mutual match profile id:' + matches[0].objectId)
				return ParseService.getProfileForMatch(matches[0].objectId)
			}).then(profile => {
				expect(profile.name).toBe('user2')

				var message = new ChatMessage()
				message.match = match
				message.text = 'hello'
				message.senderName = 'user1'

				console.log('sending messages')
				return ParseService.sendChatMessage(message)
			}).then(msg => {
				msg1 = msg

				var message = new ChatMessage()
				message.match = match
				message.text = 'world'
				message.senderName = 'user1'
				return ParseService.sendChatMessage(message)
			}).then(msg => {
				msg2 = msg
				console.log('getChatMessages match.id ' + match.id)
				return ParseService.getChatMessages(match.id)
			}).then(msgs => {
				expect(msgs.length).toBe(2)
				console.log('loadChatMessages null')
				return ParseService.loadChatMessages(null)
			}).then(msgs => {
				expect(msgs.length).toBe(2)
				console.log('loadChatMessages ' + msg2.createdAt)
				return ParseService.loadChatMessages(msg2.createdAt)
			}).then(msgs => {
				expect(msgs.length).toBe(0)
				return ParseService.logout()

				// log back in as user 2, make sure they can read the messages
			}).then(() => ParseService.logIn(e2e.user2.email, e2e.user2.password))
			.then((() => ParseService.loadChatMessages(null)))
			.then(msgs => {
				expect(msgs.length).toBe(2)
				console.log('reporting and removing match')
				return ParseService.reportProfile('test', match.profile, match)
			}).then(report => ParseService.removeMatch(match.id))
			.then(success => {console.log('fetching user');return Parse.User.current().fetch()} )
			.then(user => {
				console.log(JSON.stringify(user.matches))
				expect(user.matches.length).toBe(0)
				return ParseService.getMatches([match.id])
			})
			.then(matches => {
				expect(matches.length).toBe(0)
				return ParseService.getChatMessages(match.id)
			}).then(msgs => {
				expect(msgs.length).toBe(2) // messages still exist in the db when the match is unmatched
				return ParseService.logout()
				// Make sure logout can be called twice in a row
			}).then(() => ParseService.logout())
			.then(() => ParseService.logIn(e2e.user1.email, e2e.user1.password))
			.then(() => {
				console.log('deleting account')
				return ParseService.deleteAccount()
			})
			.then(() => ParseService.logout(), errorFn)
			.finally(done)
	})
	//*/


	/*
	it('FB login under minimum age', (done) => {
		var auth = {authResponse: {}}
		auth.authResponse.accessToken = e2e.minimumAge.access_token
		auth.authResponse.userID = e2e.minimumAge.id
		auth.authResponse.expiresIn = 120

		ParseService.facebookLogin(auth)
			.then(() => ParseService.copyFacebookProfile())
			.then(
				result => {
					fail('Should have failed with error code MINIMUM_AGE_ERROR. Returned ' + JSON.stringify(result))
					return $q.resolve()
				},
				error => {
					expect(error.code).toBe('MINIMUM_AGE_ERROR')
					return $q.reject(error)
				}
			).finally(done)
	})
	//*/



	/*
	it('FbLogin should fail if no birthday', (done) => {
		var auth = {authResponse: {}}
		auth.authResponse.accessToken = e2e.userNoBirthdayPermission.access_token
		auth.authResponse.userID = e2e.userNoBirthdayPermission.id
		auth.authResponse.expiresIn = 120
		ParseService.facebookLogin(auth).then(
			() => ParseService.copyFacebookProfile())
			.then(result => log(result),
			errorFn)
			.finally(done)
	})
	//*/

	/*
	it('getProfile should handle a broken user-profile link', done => {
		ParseService.signUp(e2e.user1.email, e2e.user1.password)
			// Load the Profile link by refreshing the newly created user
			.then(user => user.fetch())
			.then(user => {
				console.log('user.profile ' + user.profile)
				expect(user.profile).not.toBeUndefined()
				// Delete the profile
				user.unset('profile')
				return user.save()
			})
			// The afterSave hook will create a new profile and link it, but it won't be set on this user object yet
			// as the afterSave hook is asynchronous
			.then(user => {
				expect(user.profile).toBeUndefined()
				return ParseService.getProfile()
			})
			.then(profile => {
				expect(profile).not.toBeNull()
				expect(user.profile).toBeUndefined()
			}).finally(done)
	})
	//*/


})
