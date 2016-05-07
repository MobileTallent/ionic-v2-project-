describe('service.app', function() {

	var $log, $q, $rootScope, $state, AppService, LocalDB, ParseService, userProfile

	function errorFn(error) {
		console.error(JSON.stringify(error))
		fail(error)
	}

	beforeEach(function() {
		module('service.app', function($provide) {
			ParseService = mockParseService($provide)

			LocalDB = mockLocalDB($provide)

			$state = mock$state($provide)
			mock$ionicHistory($provide)
			mock$localStorage($provide)
			mock$analytics($provide)
			mock$translate($provide)
			userProfile = {id:'uid'}
		})


		inject(function(_$log_, _$q_, _$rootScope_, _AppService_) {
			$log = _$log_
			$q = _$q_
			$rootScope = _$rootScope_
			LocalDB.inject($q)
			ParseService.inject($q)
			ParseService.getProfile = () => $q.when(userProfile)
			AppService = _AppService_
		})
	})

	function init() {
		return AppService.init().then(() => {
			return AppService.loadProfile()
		})
	}


	it('New sent chats should be sorted by createdAt ascending', done => {

		var matchId = 'mid'
		var msg1 = {id: 1, createdAt: new Date(1)}
		var msg2 = {id: 2, createdAt: new Date(2)}
		var msg3 = {id: 3, createdAt: new Date(3)}
		var msg4 = {id: 4, createdAt: new Date(4)}

		LocalDB.getMatches = () => $q.when([{id: matchId, profile: {id:'pid'}, createdAt: new Date(), updatedAt: new Date()}])
		LocalDB.getChatMessages = () => $q.when([msg1, msg2, msg4])

		ParseService.sendChatMessage = (text, match) => $q.when(msg3)

		var activeMessages
		init().then(profile => {
			return AppService.getActiveChat(matchId)
		}).then(msgs => {
			expect(msgs).toBeDefined()
			activeMessages = msgs
			return AppService.sendChatMessage(matchId, '3rd') // The main method under test
		}).then(msg => {
			// this new message should be in the activeMessages in the correct sorted position
			expect(activeMessages[0].createdAt.getTime()).toBe(1)
			expect(activeMessages[1].createdAt.getTime()).toBe(2)
			expect(activeMessages[2].createdAt.getTime()).toBe(3)
			expect(activeMessages[3].createdAt.getTime()).toBe(4)
		}).finally(done)

		$rootScope.$digest()
	})

	it('New synced chats should be sorted by createdAt ascending', done => {

		var matchId = 'mid'
		var match = {id: matchId}
		var msg1 = {id: 1, createdAt: new Date(1), match: match}
		var msg2 = {id: 2, createdAt: new Date(2), match: match}
		var msg3 = {id: 3, createdAt: new Date(3), match: match}
		var msg4 = {id: 4, createdAt: new Date(4), match: match}

		LocalDB.getMatches = () => $q.when([{id: matchId, profile: {id:'pid'}, createdAt: new Date(), updatedAt: new Date()}])
		LocalDB.getChatMessages = () => $q.when([msg2])

		ParseService.sendChatMessage = (text, match) => $q.when(msg2) // the msgs initially loaded for the match
		ParseService.loadChatMessages = () => $q.when([msg1, msg3, msg4]) // the msgs which are synced for the current match

		var activeMessages
		init().then(profile => {
			return AppService.getActiveChat(matchId) // set the active chat messages
		}).then(msgs => {
			activeMessages = msgs
			return AppService.synchronizeChatMessages() // the method under test
		}).then(msg => {
			// this new message should be in the activeMessages in the correct sorted position
			expect(activeMessages.length).toBe(4)
			expect(activeMessages[0].createdAt.getTime()).toBe(1)
			expect(activeMessages[1].createdAt.getTime()).toBe(2)
			expect(activeMessages[2].createdAt.getTime()).toBe(3)
			expect(activeMessages[3].createdAt.getTime()).toBe(4)
		}).finally(done)

		$rootScope.$digest()
	})

	it('New matches should have Matched on [date] message, unread, and sorted to the top', done => {

		// The existing match that should show up after the new match in the matches list
		LocalDB.getMatches = () => $q.when([{id: 'mid1', profile: {id:'pid'}, createdAt: new Date(10), updatedAt: new Date()}])

		// Stub out the server methods which are called from AppService.synchronizeMutualMatches()
		// Return the user with the existing match and the new match
		ParseService.reloadUser = () => $q.when({matches: ['mid1', 'mid2']})
		// Should be called with the arg ['mid2']
		ParseService.getMatches = (arg) => {
			expect(arg).toEqual(['mid2'])
			return $q.when([{id:'mid2', createdAt: new Date(20), updatedAt: new Date(20), profile:{id:'pid2'}}])
		}
		LocalDB.saveMatch = (match) => {}


		init().then(profile => {
			return AppService.getMutualMatches()
		}).then(matches => {
			expect(matches[0].id).toBe('mid1')
			return AppService.synchronizeMutualMatches()
		}).then(() => {
			return AppService.getMutualMatches()
		}).then(matches => {
			// should be sorted first in the matches array
			var newMatch = matches[0]
			expect(newMatch.id).toBe('mid2')
			expect(newMatch.read).toBe(false)
			expect(newMatch.lastMessage).toBe('Matched on 1 Jan')

			expect(matches[1].id).toBe('mid1')
		}).finally(done)

		$rootScope.$digest()
	})

	it('SynchronizeMutualMatches should handle duplicate matches', done => {

		// The existing match that should show up after the new match in the matches list
		LocalDB.getMatches = () => $q.when([{id: 'mid1', profile: {id:'pid'}, createdAt: new Date(10), updatedAt: new Date()}])

		// Stub out the server methods which are called from AppService.synchronizeMutualMatches()
		// Return the user with the existing match and the new match
		ParseService.reloadUser = () => $q.when({matches: ['mid1', 'mid2']})
		// Should be called with the arg ['mid2']
		ParseService.getMatches = (arg) => {
			return $q.when([{id:'mid2', createdAt: new Date(20), updatedAt: new Date(20), profile:{id:'pid2'}}])
		}
		LocalDB.saveMatch = (match) => {}


		init().then(profile => {
			return AppService.synchronizeMutualMatches()
		}).then(matches => {
			return AppService.synchronizeMutualMatches() // call it twice
		}).then(() => {
			var matches = AppService.getMutualMatches()
			var grouping = _.groupBy(matches, 'id')
			var groupByCounts = _.map(grouping, 'length')
			var max = _.max(groupByCounts)
			expect(max).toBe(1) // should only have one match with the same id in the matches array

		}).finally(done)

		$rootScope.$digest()
	})



})