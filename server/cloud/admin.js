
// Cloud code functions which are only run by admin users
var _ = require('underscore')
var parseConfig = require('../parse-config.js')

function checkAdmin(request, response) {
	if(!request.user.get('admin')) {
		response.error('You do not have admin permission')
		return false
	}
	Parse.Cloud.useMasterKey()
	return true
}


Parse.Cloud.define('GetProfilesWithPhotosToReview', function(request, response) {
    if(!checkAdmin(request, response))
        return

    new Parse.Query('Profile')
        .ascending('updatedAt')
		.exists('photosInReview')
        .limit(50)
        .find()
        .then(function(result) {
            response.success(_.map(result, profile => profile.toJSON()))
        }, function(error) {
            response.error(error)
        })
})

Parse.Cloud.define('ReviewPhoto', function(request, response) {
    if(!checkAdmin(request, response))
        return

	var profileId = request.params.profileId
	var fileUrl = request.params.fileUrl
	var approved = request.params.approved

    new Parse.Query('Profile').get(profileId)
        .then(function(profile) {
			var photosInReview = profile.get('photosInReview')
            var file = _.find(photosInReview, file => file.url() === fileUrl)

			if(!file)
				return Promise.reject('Could not find photo file')

			profile.remove('photosInReview', file)
			if(approved) {
                profile.add('photos', file)
			} else {
				var filename = fileUrl.substring(fileUrl.lastIndexOf('/') + 1)
                parseConfig.filesAdapter.deleteFile(filename).then(
                	success => console.log('Rejected photo deleted'),
					error => console.error('Error deleting file', filename, error))
			}
			return profile.save()
        }).then(result => response.success(null),
				error => response.error(error)
        )
})



Parse.Cloud.define('GetReportedUsers', function(request, response) {
	if(!checkAdmin(request, response))
		return

	// report types
	// 'Profile' profile (about text)
	// 'Photo'
	// 'Msg' Chat message
	// type (spam, offensive)

	new Parse.Query('Report')
			.doesNotExist('actionTaken')
			.descending('createdAt')
			.find()
			.then(function(result) {
				response.success(_.map(result, report => report.toJSON()))
			}, function(error) {
				response.error(error)
			})
})

Parse.Cloud.define('GetReportedUserDetails', function(request, response) {
	if(!checkAdmin(request, response))
		return

	var reportedBy = new Parse.User()
	reportedBy.id = request.params.reportedBy
	var reportedUser = request.params.reportedUser

	var details = {}

	// Load up all the reports (open and actioned) against the reported user
	var reportsQuery = new Parse.Query('Report')
			.descending('updatedAt')
			.limit(1000)
			.equalTo('reportedBy', reportedBy.id)
			.find()

	// Load the recent messages the reported user has sent
	var messagesQuery = new Parse.Query('ChatMessage')
			.equalTo('sender', reportedUser)
			.limit(50)
			.descending('createdAt')
			.find()

	Parse.Promise.when(reportsQuery, messagesQuery).then(function(reports, messages) {
		details.allReports = reports
		details.recentMessages = messages

		response.success(details)
	}, function(error) {
		response.error(error)
	})

})


/**
 * Delete a photo from a profile that has been reported
 */
Parse.Cloud.define('DeletePhoto', function(request, response) {
	if(!checkAdmin(request, response))
		return

	var reportId = request.params.reportId
	var photoUrl = request.params.photoUrl
	var reportedUserId

	new Parse.Query('Report').include('profile').get(reportId).then(function(report) {

		//console.log('report ' + JSON.stringify(report))
		//console.log('reportedBy ' + JSON.stringify(report.get('reportedBy')))
		reportedUserId = report.get('reportedUser').id

		var profile = report.get('profile')
		var photos = profile.get('photos')
		var i
		for(i = 0; i < photos.length; i++) {
			console.log(photos[i].url())
			if(photos[i].url() === photoUrl) {
				console.log('found it!')
				photos.splice(i, 1)
			}
		}
		profile.set('photos', photos)
		return profile.save()

	}).then(function(result) {
		return Parse.Push.send({
			channels: ['user_' + reportedUserId],
			data: {
				type: 'reloadProfile'
			}
		})
	}).then(function(result) {
		response.success()
	}, function(error) {
		response.error(error)
	})
})


/**
 * Function to ban a user and perform the other necessary database updates
 */
Parse.Cloud.define('BanUser', function(request, response) {
	if(!checkAdmin(request, response))
		return

	var bannedUserId = request.params.userId
	if(!bannedUserId)
		response.error('Invalid params')

	var bannedUser = new Parse.User()
	bannedUser.id = bannedUserId

	var bannedUserQuery = new Parse.Query(Parse.User)
			.include('profile')
			.get(bannedUserId)

	// Close out all reports against this user
	var reportsQuery = new Parse.Query('Report')
			.equalTo('reportedUser', bannedUser)
			.limit(1000)
			.find()

	// Load the banned users mutual matches so we can remove the match from the other mutual match party and set the state to deleted
	var matches1Query = new Parse.Query('Match')
			.equalTo('uid1', bannedUserId)
			.equalTo('state', 'M')
			.limit(1000)
			.find()
	var matches2Query = new Parse.Query('Match')
			.equalTo('uid2', bannedUserId)
			.equalTo('state', 'M')
			.limit(1000)
			.find()


	Parse.Promise.when(bannedUserQuery, reportsQuery, matches1Query, matches2Query).then(function(bannedUser, reports, matches1, matches2) {

		// An array of all the Promises of database updates for this action
		var actions = []

		// Set the banned flag on the user and disable the profile
		bannedUser.set('status', 'banned')
		bannedUser.set('matches', [])
		var profile = bannedUser.get('profile')
		profile.set('enabled', false)
		actions.push(profile.save(), bannedUser.save())

		// Set all un-actioned reports for the banned user to have the banned action
		_.each(reports, function(report) {
			if(!report.get('actionTaken')) {
				report.set('actionTaken', 'banned')
				report.set('actionUser', request.user)
				actions.push(report.save())
			}
		})

		// Send push notifications to the banned users matches so their match is removed
		// Update the matches state to be deleted ('D')
		// and update the other users to remove the match from their User.matches array
		var channels = []
		_.each(matches1, function(match) {
			updateMatchAndUser(match, match.get('uid2'))
		})
		_.each(matches2, function(match) {
			updateMatchAndUser(match, match.get('uid1'))
		})
		function updateMatchAndUser(match, otherUserId) {

			channels.push('user_' + otherUserId)

			match.set('state', 'D')
			actions.push(match.save())

			var otherUser = new Parse.User()
			otherUser.id = otherUserId
			otherUser.remove('matches', bannedUserId)
			actions.push(otherUser.save())
		}

		actions.push(Parse.Push.send({
			channels: channels,
			data: {
				type: 'removeMatch',
				data: {
					userId: bannedUserId
				}
			}
		}))

		actions.push(Parse.Push.send({
			channels: ['user_' + bannedUserId],
			data: {
				type: 'accountBanned'
			}
		}))

		return Parse.Promise.when(actions)

	}).then(function() {
		response.success()
	}, function(error) {
		response.error(error)
	})

})

Parse.Cloud.define('CloseReport', function(request, response) {
	if(!checkAdmin(request, response))
		return

	var reportId = request.params.reportId
	var action = request.params.action

	if(!reportId || (!action && action !== ''))
		response.error('Invalid parameters ' + JSON.stringify(request.params))

	new Parse.Query('Report').get(reportId).then(function(report) {

		report.set('actionTaken', action)
		report.set('actionUser', request.user)

		return report.save()
	}).then(function() {
		response.success(null)
	}, function(error) {
		response.error(error)
	})

})


Parse.Cloud.define('SearchUsersByEmail', function(request, response) {
	if(!checkAdmin(request, response))
		return

	var email = request.params.email

	if(!email)
		response.error('Invalid parameters email is required. ' + JSON.stringify(request.params))

	new Parse.Query(Parse.User)
		.startsWith('email', email)
		.limit(50)
		.include('profile')
		.find()
		.then(function(users) {
			response.success(users)
		}, function(error) {
			response.error(error)
		})
})

Parse.Cloud.define('SearchUsersByName', function(request, response) {
	if(!checkAdmin(request, response))
		return

	var name = request.params.name

	if(!name)
		response.error('Invalid parameters name is required. ' + JSON.stringify(request.params))

	new Parse.Query('Profile')
		.startsWith('name', name)
		.limit(50)
		.find()
		.then(function(profiles) {
			response.success(profiles)
		}, function(error) {
			response.error(error)
		})
})


Parse.Cloud.define('LoadUser', function(request, response) {
	if(!checkAdmin(request, response))
		return

	var userId = request.params.userId
	if(!userId)
		return response.error('userId parameter must be provided')

	new Parse.Query(Parse.User).include('profile').get(userId).then(function(user) {
		response.success(user)
	}, function(error) {
		response.error(error)
	})
})