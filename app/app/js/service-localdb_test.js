describe('service.localdb', function() {

	Parse.initialize('pmhdfg1zpIfB3vWqqSlJEMvWZvFzWgg94tSzgMTp', 'bJuyQTIRlay2ZugTw1G004rakqirSxdJSadKGMQm')

	var $log, $q, $rootScope, LocalDB, digester

	function errorFn(error) {
		console.error(JSON.stringify(error))
		fail(error)
	}

	beforeEach(function(done) {
		module('service.localdb', function($provide) {
			$provide.value('appName', 'test')
			$provide.value('env', 'test')
		})

		inject(function(_$log_, _$q_, _$rootScope_, _LocalDB_) {
			$log = _$log_
			$q = _$q_
			$rootScope = _$rootScope_
			LocalDB = _LocalDB_
		})

		LocalDB.init()
			.then(() => LocalDB.deleteDb())
			.then(() => $q.when(), errorFn)
			.finally(done)

		jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000 * 20 // allow 20 seconds for the test to run

		// Need to keep cranking the digest loop for the LocalDB service mock promises to resolve
		digester = setInterval(() => $rootScope.$digest(), 100)
	})

	afterEach(function() {
		clearInterval(digester)
	})

	it('Save and load match', done => {

		var profile = {className:'Profile'}
		profile.objectId = 'PID'
		profile.age = 30
		profile.name = 'name'
		profile.about = 'aboutme'
		profile.location = {latitude: 2, longitude: 3}
		var photos = []
		var photo1Url = 'http://domain.com/1'
		var photo2Url = 'http://domain.com/2'
		photos.push({_url: photo1Url, url:()=>photo1Url})
		photos.push({_url: photo2Url, url:()=>photo2Url})
		profile.photos = photos
		profile = Parse.Object.fromJSON(profile)

		var matchJson = {className: 'Match'}
		var matchId = 'MID'
		matchJson.objectId = matchId
		//match.objectId = matchId
		matchJson.uid1 = 'uid1'
		matchJson.uid2 = 'uid2'
		matchJson.lastMessage = 'hello'
		matchJson.updatedAt = {__type:'Date',iso:new Date(2015, 1, 1).toISOString()}
		//matchJson.updatedAt = new Date(2015, 1, 1)
		matchJson.otherProfile = profile.toJSON()
		var match = Parse.Object.fromJSON(matchJson)

		// id, chat_id, created_at, sender, message
		var msg1Json = {className:'ChatMessage'}
		msg1Json.objectId = 'M1'
		msg1Json.match = {id:matchId}
		msg1Json.createdAt = {__type:'Date',iso:new Date(2015, 1, 1).toISOString()}
		msg1Json.sender = 'uid1'
		msg1Json.text = 'm1'
		var msg1 = Parse.Object.fromJSON(msg1Json)

		var msg2Json = {className:'ChatMessage'}
		msg2Json.id = 'M2'
		msg2Json.match = {id:matchId}
		msg2Json.createdAt = {__type:'Date',iso:new Date(2015, 2, 1).toISOString()}
		msg2Json.sender = 'uid2'
		msg2Json.text = 'm2'
		var msg2 = Parse.Object.fromJSON(msg2Json)

		// image message
		var msg3Json = {className:'ChatMessage'}
		msg3Json.objectId = 'M3'
		msg3Json.match = {id:matchId}
		msg3Json.createdAt = {__type:'Date',iso:new Date(2015, 3, 1).toISOString()}
		msg3Json.sender = 'uid1'
		msg3Json.image = {_url: photo1Url, url:()=>photo1Url} // A bit hacky
		var msg3 = Parse.Object.fromJSON(msg3Json)

		LocalDB.saveMatch(match, profile)
			.then(result => LocalDB.saveMatch(match, profile)) // should be able to re-save the same the match/profile and update the data
			.then(result => LocalDB.getUnreadChats())
			.then(unreadChats => {
				var expected = {}
				expected[matchId] = true
				expect(unreadChats).toEqual(expected)
				return $q.all([LocalDB.getMatches(), LocalDB.getProfiles()])
			})
			.then(result => {
				var matches = result[0], profiles = result[1]
				expect(matches.length).toBe(1)
				expect(profiles.length).toBe(1)

				var resultMatch = matches[0], resultProfile = profiles[0]
				expect(resultMatch.id).toBe(match.id)
				expect(resultMatch.uid1).toBe(match.uid1)
				expect(resultMatch.uid2).toBe(match.uid2)
				expect(resultMatch.lastMessage).toBe(null)
				expect(resultMatch.read).toBe(false)
				//console.log('resultMatch.profile ' + resultMatch.profile) // doesnt work here

				expect(resultProfile.age).toBe(profile.age)
				expect(resultProfile.name).toBe(profile.name)
				expect(resultProfile.about).toBe(profile.about)
				expect(resultProfile.location.latitude).toEqual(profile.location.latitude)
				expect(resultProfile.location.longitude).toEqual(profile.location.longitude)
				expect(resultProfile.photos[0]._url).toBe(photo1Url)
				expect(resultProfile.photos[1]._url).toBe(photo2Url)

				// test setting the read flag
				console.log('LocalDB.setChatRead()')
				return LocalDB.setChatRead(matchId, true)
			})
			.then(result => LocalDB.getUnreadChats())
			.then(unreadChats => {
				// we've read the one match/chat so should return empty
				expect(unreadChats).toEqual({})
				return LocalDB.getMatches()
			})
			.then(result => LocalDB.getMatches())
			.then(matches => {
				expect(matches.length).toBe(1)
				expect(matches[0].read).toBe(true)

				// test saving and loading a chat message
				return LocalDB.saveChatMessage(msg1)
			})
			.then(result => LocalDB.saveChatMessage(msg2))
			.then(result => LocalDB.saveChatMessage(msg3))
			.then(result => $q.all([LocalDB.getChatMessages(matchId), LocalDB.getMatches()]))
			.then(result => {
				var msgs = result[0], matches = result[1]
				expect(msgs.length).toBe(3)
				var result1 = msgs[0]
				var result2 = msgs[1]
				var result3 = msgs[2]

				expect(result1.createdAt).toEqual(msg1.createdAt)
				expect(result2.createdAt).toEqual(msg2.createdAt)

				expect(result1.sender).toEqual(msg1.sender)
				expect(result2.sender).toEqual(msg2.sender)

				expect(result1.text).toEqual(msg1.text)
				expect(result2.text).toEqual(msg2.text)
				expect(result3.image._url).toEqual(photo1Url)

				// as the last chat message is an image, this should be set on the match.lastMessage
				expect(matches[0].lastMessage).toBe(':rice_scene:')

				// test cleaning the database
				return LocalDB.deleteDb()
			})
			.then(result => LocalDB.getMatches())
			.then(matches => {
				expect(matches.length).toBe(0)
				return $q.when()
			}, errorFn)
			.finally(done)
	})

	//deleteMatch: deleteMatch,
	//	getChatMessages: getChatMessages,
	//	saveChatMessage: saveChatMessage,
	//	setChatRead: setChatRead,


	/*
	it('Save and load match', done => {
		//LocalDB.init().then(result => {
		//
		//}).finally(done)


	})
	*/

})