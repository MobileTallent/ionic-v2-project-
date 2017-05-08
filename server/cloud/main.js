// Remember the cloud code doesn't have the angular enhancement, so you will need to use the standard Parse API
// i.e. object.get('property') object.set('property', value)

var Profile = Parse.Object.extend("Profile")
var Match = Parse.Object.extend("Match")
var Report = Parse.Object.extend("Report")
var ChatMessage = Parse.Object.extend("ChatMessage")
var DeletedUser = Parse.Object.extend("DeletedUser")
var ClinicsQuestion = Parse.Object.extend("ClinicsQuestion")
var FindUs = Parse.Object.extend("FindUs")
var FindUsReport = Parse.Object.extend("FindUsReport")
var AboutJab = Parse.Object.extend("AboutJab")
var ServiceProvider = Parse.Object.extend("ServiceProvider")

var _ = require('underscore')

var config = require('../config.js')
require('./linkedin.js')
//require('./migrations.js')
//require('./jobs.js')
require('./admin.js')
require('./service-provider.js')
require('./video.js')

var Email = require('./email.js')

// Configuration

// Set these params to true so users can't update their own birthday - then the only way to update is through
// a cloud function e.g CopyFacebookProfile (which will set the masterKey)
var RESTRICT_BIRTHDATE = false
var RESTRICT_NAME = false
var RESTRICT_GENDER = false

// Minimum age in years, or null if not required
var MINIMUM_AGE = 18

// This should match the ceiling attribute in the maximum age slider in the discovery preferences
// so when the user selects the maximum value, its all ages above that too, i.e. 55+
var MAX_AGE_PLUS = 55

const masterKey = { useMasterKey: true }

Parse.Cloud.beforeSave(Parse.User, function(request, response) {
    var user = request.object

    if (user.id == null) {
        user.set('admin', false)
        user.set('premium', false)
        user.set('credits', 0)
        user.set('matches', [])
    } else if (!request.master) {
        if (user.dirty('admin'))
            return response.error('You cant set the admin flag')
        if (user.dirty('premium'))
            return response.error('You cant set the premium flag')
        if (user.dirty('credits'))
            return response.error('You cant set the credits')
    }

    // Extract the facebook user id to its own column, if it has changed
    var fbId = user.get('fbId')
    var fbAuth = user.get('authData')
    if (fbAuth && fbAuth.facebook && fbId !== fbAuth.facebook.id)
        user.set('fbId', fbAuth.facebook.id)

    response.success()
})


// Note that the saving of the profile to the user happens after the
// user object is returned, so it would need to be refreshed by the client
// to see the profile link when first saved
Parse.Cloud.afterSave(Parse.User, function(request) {
    var user = request.object
    var userId = user.id

    var acl = user.getACL()
    if (acl && acl.getPublicReadAccess()) {
        console.log('Updating ACL on user ' + userId)
        acl.setPublicReadAccess(false)
        acl.setPublicWriteAccess(false)
        acl.setWriteAccess(userId, true)
        acl.setReadAccess(userId, true)
        user.setACL(acl)
        user.save(null, masterKey).then(null, error => console.error('Error updating acl for user ' + user.id + ' ' + error))
    }
})


Parse.Cloud.define('LinkProfileToUser', function(request, response) {
    var user = request.user
    var profile = user.get('profile')
    if (profile) {
        console.log('Profile already exists on user ' + user.id)
        return response.success(profile.toJSON())
    }

    // Profile field init is done in Profile.beforeSave
    new Profile().save({ uid: user.id }, masterKey).then(
        profile => {
            console.log('linking profile to ' + user.id)
            user.save({ profile: profile }, masterKey).then(
                success => response.success(profile.toJSON()),
                error => response.error(error)
            )
        },
        error => response.error(error)
    )
})


Parse.Cloud.beforeSave(Profile, function(request, response) {
    var profile = request.object
    var userId

    // If we have strict controls on certain fields then don't let a custom client update them
    if (!request.master) {
        if (RESTRICT_BIRTHDATE && profile.dirty('birthdate')) {
            response.error('Cannot update birthdate')
            return
        }
        if (RESTRICT_NAME && profile.dirty('name')) {
            response.error('Cannot update name')
            return
        }
        if (RESTRICT_GENDER && profile.dirty('gender')) {
            response.error('Cannot update gender')
            return
        }
        // An example if you wanted to limit the number of times a user can update their birthday
        /*
        var bdayCount = request.user.get('birthdayUpdateCount')
        if(!_.isNumber(bdayCount)) bdayCount = 0
        if(profile.dirty('birthdate') && bdayCount >= 2) {
           response.error('Cannot update birthdate more than 2 times')
           return
        }
        */
    }

    if (!profile.id) { // Creating a new Profile object
        // request.user can be null (either from a brand new user or using master key)
        userId = request.user ? request.user.id : profile.get('uid')
        if (!userId) {
            response.error('Could not determine user Id for new profile')
            return
        }
        console.log('creating new profile for user ', userId)
        var acl = new Parse.ACL(userId)
        acl.setPublicWriteAccess(false)
        acl.setPublicReadAccess(false)
        acl.setWriteAccess(userId, true)
        acl.setReadAccess(userId, true)
        profile.setACL(acl)

        profile.set('uid', userId)
        profile.set('photos', [])
        profile.set('enabled', true)
        profile.set('gps', true)
        profile.set('about', '')
        profile.set('distance', 20000)
        profile.set('ageFrom', 18)
        profile.set('ageTo', 55)
        profile.set('distanceType', 'km')
        profile.set('notifyMatch', true)
        profile.set('notifyMessage', true)

    } else { // Saving an existing Profile

        if (profile.dirty('birthdate')) {
            var birthdate = profile.get('birthdate'),
                ageFrom = profile.get('ageFrom'),
                ageTo = profile.get('ageTo')
            if (birthdate) {
                var age = _calculateAge(birthdate)
                if (!ageFrom) {
                    ageFrom = age - 5
                    if (ageFrom < 18) ageFrom = 18
                    profile.set('ageFrom', ageFrom)
                }
                if (!ageTo) {
                    ageTo = age + 5
                    if (ageTo > 55) ageTo = 55
                    profile.set('ageTo', ageTo)
                }
            }
        }
        if (profile.dirty('gender')) {
            var gender = profile.get('gender')
            if (!profile.has('guys'))
                profile.set('guys', gender !== 'M')
            if (!profile.has('girls'))
                profile.set('girls', gender !== 'F')
        }

        // If the array exists is empty, then unset it
        var photosInReview = profile.get('photosInReview')
        if (photosInReview && photosInReview.length === 0) {
            profile.remove('photosInReview')
        }
    }

    response.success()
})


Parse.Cloud.define('SetPremium', function(request, response) {

    // Use the master key to update the restricted premium property
    var premium = request.params.premium
    var product = request.params.product

    if (_.isUndefined(premium))
        return response.error('Parameter "premium" was not provided')
    if (premium && _.isUndefined(product))
        return response.error('Parameter "product" must be provided if settings premium to true')

    // TODO server-side verification https://github.com/voltrue2/in-app-purchase

    var user = request.user
    user.save({ premium: premium }).then(function() {
        response.success(null)
    }, function(error) {
        response.error(error)
    })
})







Parse.Cloud.define("CopyFacebookProfile", function(request, response) {
    var profileUpdates = { photos: [] }
    var profile

    new Parse.Query(Parse.User).get(request.user.id, masterKey).then(
        user => {
            if (Parse.FacebookUtils.isLinked(user)) {

                var fbAuth = user.get('authData').facebook

                var picUrl = "https://graph.facebook.com/" + fbAuth.id + "/picture?width=500&height=500"
                var imageRequest = Parse.Cloud.httpRequest({
                    url: picUrl,
                    followRedirects: true
                })

                var profile = user.get('profile')
                if (!profile) {
                    response.error('User does not have a profile')
                    return
                }
                var profileRequest = new Parse.Query(Profile).get(profile.id, masterKey)

                var fbLikesRequest = Parse.Cloud.httpRequest({ url: 'https://graph.facebook.com/me/likes?limit=999&access_token=' + fbAuth.access_token })
                var fbMeRequest = Parse.Cloud.httpRequest({ url: 'https://graph.facebook.com/me?fields=birthday,first_name,last_name,name,gender,email,hometown&access_token=' + fbAuth.access_token })
                Parse.Promise.when(fbLikesRequest, fbMeRequest)
                    .then(function(fbLikesResponse, fbMeResponse) {

                        var fbLikesData = fbLikesResponse.data.data
                        var fbMe = fbMeResponse.data
                        var i
                        var fbLikes = []

                        for (i = 0; i < fbLikesData.length; i++)
                            fbLikes.push(fbLikesData[i].id)

                        profileUpdates.fbLikes = fbLikes

                        var errorCode = _copyFacebookProfile(fbMe, profileUpdates)
                        if (errorCode) {
                            return Parse.Promise.error({ code: errorCode })
                        }

                        if (fbMe.email) {
                            // Save this asynchronously
                            // TODO log any errors - should be an error if email exists
                            if (!user.getEmail())
                                user.save({ 'email': fbMe.email })
                            else
                                user.save({ 'fbEmail': fbMe.email })
                        }

                        // Wait for the profile image request to return
                        return imageRequest

                    }).then(function(httpResponse) {
                        var file = new Parse.File("profile.png", { base64: httpResponse.buffer.toString('base64', 0, httpResponse.buffer.length) })
                        return file.save()

                    }).then(function(file) {
                        // See http://stackoverflow.com/questions/25297590/saving-javascript-object-that-has-an-array-of-parse-files-causes-converting-cir
                        profileUpdates.photos.push({ name: file.name, url: file.url(), __type: 'File' })

                        return profileRequest

                    }).then(function(result) {
                        profile = result
                            // Use the master key to update the potentially restricted properties like birthdate, name
                        return profile.save(profileUpdates, masterKey)

                    }).then(function(profile) {
                        response.success(profile)
                    }, function(error) {
                        console.error('Facebook copy error' + JSON.stringify(error))
                        if (profile) {
                            // Try to save the error onto the profile. Ignore success/error
                            var errorMsg = error.code ? error.code : error
                            profile.save({ error: errorMsg })
                        }
                        if (error.code)
                            response.error(error)
                        else
                            response.error({ code: 'FB_PROFILE_COPY_FAILED', message: 'Error getting Facebook profile', source: error })
                    })

            } else {
                response.error('Account is not linked to Facebook')
            }
        }, error => {
            console.log('Error loading user to copy facebook profile', error)
            response.error(error)
        }
    )



})

/**
 *
 * @param fbMe the response from the facebook graph query
 * @param profileUpdates {IProfile} the change set to update the Profile with
 * @return an error code, or null if ok
 * @private
 */
function _copyFacebookProfile(fbMe, profileUpdates) {
    var year, month, day

    // Validate the Facebook profile data
    if (!fbMe.first_name && RESTRICT_NAME) {
        return 'NO_FB_NAME'
    }
    if (!fbMe.gender && RESTRICT_GENDER) {
        return 'NO_FB_GENDER'
    }
    // A full birthday is in the format MM/DD/YYYY
    // Restricted permissions may return only YYYY or MM/DD
    if (RESTRICT_BIRTHDATE && !fbMe.birthday) {
        return 'NO_FB_BIRTHDAY'
    } else if (RESTRICT_BIRTHDATE && fbMe.birthday.length !== 10) {
        return 'NO_FB_FULL_BIRTHDAY'
    }

    profileUpdates.name = fbMe.first_name
    if (fbMe.gender === 'male')
        profileUpdates.gender = 'M'
    else if (fbMe.gender === 'female')
        profileUpdates.gender = 'F'
    else
        profileUpdates.gender = fbMe.gender

    if (fbMe.birthday && fbMe.birthday.length === 10) {
        year = parseInt(fbMe.birthday.substring(6, 10), 10)
        month = parseInt(fbMe.birthday.substring(0, 2), 10) - 1
        day = parseInt(fbMe.birthday.substring(3, 5), 10)
        profileUpdates.birthdate = new Date(year, month, day)
    } else if (fbMe.birthday) {
        // if !REQUIRE_FB_BIRTHDAY then store the partial birthday to pre-fill a birthdate selection
        profileUpdates.fbBirthday = fbMe.birthday
    }

    // The user_hometown permission must be requested in the Facebook application settings, and in the facebook login
    // code in controller-signin for this to be populated
    if (fbMe.hometown) {
        profileUpdates.hometown = fbMe.hometown.name
    }

    // Check for the minimum age requirement
    if (MINIMUM_AGE && profileUpdates.birthdate && _calculateAge(profileUpdates.birthdate) < MINIMUM_AGE)
        return 'MINIMUM_AGE_ERROR'

    return null // success
}

/**
 * A function to reload the profile for a mutual match
 */
Parse.Cloud.define("GetProfileForMatch", function(request, response) {
    var user = request.user
    var matchId = request.params.matchId

    if (!matchId)
        return response.error('matchId param not provided')

    // Check the requested profile is a mutual match before returning it
    if (user.get('matches').indexOf(matchId) < 0)
        return response.error('Match id:' + matchId + ' is not a mutual match for user ' + user.id)

    var matchQuery = new Parse.Query(Match)
    matchQuery.include('profile1')
    matchQuery.include('profile2')

    matchQuery.get(matchId, masterKey).then(function(match) {
        if (!match)
            throw 'Match does not exist with id ' + match

        if (match.get('state') !== 'M')
            throw 'Match ' + matchId + ' is not a mutual match'

        // Get the other profile
        var profile
        if (match.get('uid1') === user.id)
            profile = match.get('profile2')
        else if (match.get('uid2') === user.id)
            profile = match.get('profile1')
        else
            response.error('User does not belong to match ' + match.id)

        response.success(_processProfile(profile))

    }).then(null, function(error) {
        response.error(error)
    })
})

/**
 * Load an array of mutual matches, with their profile, given an array of match ids
 */
Parse.Cloud.define("GetMutualMatches", function(request, response) {
    var user = request.user
    var matchIds = request.params.matchIds
    if (!matchIds) {
        response.error('matchIds param not provided')
        return
    }

    var matchesQuery = new Parse.Query(Match)
    matchesQuery.include('profile1')
    matchesQuery.include('profile2')
    matchesQuery.equalTo('state', 'M')
    matchesQuery.limit(1000)
    matchesQuery.containedIn('objectId', matchIds)

    matchesQuery.find(masterKey).then(function(matches) {
        var result = []
        var profile1, profile2

        _.each(matches, function(match) {
            var matchJSON = match.toJSON()
                // Clear the current users profile, no need to return that over the network, and clean the Profile
            if (match.get('uid1') === user.id) {
                profile2 = match.get('profile2')
                if (!profile2) { console.error('profile2 not set on match ', match.id); return }
                matchJSON.otherProfile = _processProfile(profile2)
            } else if (match.get('uid2') === user.id) {
                profile1 = match.get('profile1')
                if (!profile1) { console.error('profile1 not set on match ', match.id); return }
                matchJSON.otherProfile = _processProfile(profile1)
            } else {
                console.error('Attempted to load match ' + match.id + ' which did not belong to user ' + user.id)
                return
            }
            delete matchJSON.profile1
            delete matchJSON.profile2
            result.push(matchJSON)
        })
        response.success(result)
    }).then(null, function(error) {
        response.error(error)
    })
})


/**
 * Process another users profile for security etc before returning it from a search or mutual match
 */
function _processProfile(profile) {

    profile = profile.toJSON()

    if (profile.birthdate) {
        profile.age = _calculateAge(profile.birthdate)
        delete profile.birthdate
    }
    if (profile.location)
        delete profile.location.__type // &@(& Parse - converts latitude to _latitude otherwise
    delete profile.notifyMatch
    delete profile.notifyMessage
    delete profile.ageFrom
    delete profile.ageTo
    delete profile.guys
    delete profile.girls
    delete profile.distance
    delete profile.photosInReview
    delete profile.distanceType
    delete profile.error

    return profile
        // // http://stackoverflow.com/questions/25297590/saving-javascript-object-that-has-an-array-of-parse-files-causes-converting-cir
        // var photos = profile.get('photos')
        // photos = _.map(photos, function(file) {
        // 	return {name: file.name, url: file.url(), __type: 'File'}
        // })
        // profile.set('photos', photos)
}

/**
 * @param {Date} birthday
 * @returns {number} age in years
 */
function _calculateAge(birthday) {
    if (!birthday) return 0 // avoid exception from dodgy data
    var birthdayTime
    if (birthday.iso)
        birthdayTime = new Date(birthday.iso).getTime()
    else if (_.isDate(birthday))
        birthdayTime = birthday.getTime()
    else {
        console.error('_calculateAge cant get birthday time from ', birthday)
        console.log('_calculateAge cant get birthday time from' + birthday)
    }
    var ageDifMs = Date.now() - birthdayTime
    var ageDate = new Date(ageDifMs) // miliseconds from epoch
    return Math.abs(ageDate.getUTCFullYear() - 1970)
}

/**
 * A function to set all profiles for self-identification to default values.
 */
Parse.Cloud.define("GetProfilesSpecial", function(request, response) {
    console.log("GetProfilesSpecial...")
    var profile = request.params
    var profileQuery = new Parse.Query("Profile")
    profileQuery.doesNotExist("hasSelfId")

    var resultsS
    profileQuery.limit(150).find(masterKey).then(function(results) {
        console.log("Number of profiles: " + results.length)
        resultsS = results
        _.each(results, function(profile) {
            profile.set('personSperm', false)
            profile.set('personEgg', false)
            profile.set('personWomb', false)
            profile.set('personEmbryo', false)
            profile.set('thingsIHave', "X")
            profile.set('hasSelfId', false)
            profile.set('personType', "0")
            profile.set('personHelpLevel', "0")
            profile.set('personCategory', "0")
        })
        return Parse.Object.saveAll(results, masterKey)
    }).then(function(profiles) {
        response.success(resultsS)
    }, function(error) {
        console.log(JSON.stringify(error))
        response.error(error)
    })
})

/**
 * A function to get all profiles with no country set
 */
Parse.Cloud.define("GetProfilesNoCountry", function(request, response) {
    console.log("GetProfilesNoCountry...")
    var profileQuery = new Parse.Query("Profile")
    profileQuery.doesNotExist("country")

    profileQuery.limit(150).find(masterKey).then(function(results) {
        console.log("Number of profiles: " + results.length)
        results = _.map(results, _processProfile)
        response.success(results)
    }, function(error) {
        console.log(JSON.stringify(error))
        response.error(error)
    })
})

/**
 * Search for new potential matches
 * @returns IProfile[] the profiles
 */
Parse.Cloud.define("GetMatches", function(request, response) {
    // We need to use the master key to load the other users profiles
    var userId = request.user.id
    var profile = request.params

    var profileQuery = new Parse.Query("Profile")

    var point = profile.location

    if (profile.distanceType === 'km')
        profileQuery.withinKilometers("location", point, profile.distance)
    else
        profileQuery.withinMiles("location", point, profile.distance)

    //Get profiles near to the current location 9/30/16 - Jojo
    //profileQuery.near("location", point);

    var gender = []
    if (profile.guys)
        gender.push('M')
    if (profile.girls)
        gender.push('F')
    profileQuery.containedIn("gender", gender)

    profileQuery.equalTo("enabled", true)

    // the birthdate from is the oldest of the age range
    var birthdateFrom = new Date()
    birthdateFrom.setFullYear(birthdateFrom.getFullYear() - profile.ageTo)
    var birthdateTo = new Date()
    birthdateTo.setFullYear(birthdateTo.getFullYear() - profile.ageFrom)
    profileQuery.lessThan("birthdate", birthdateTo)
    if (profile.ageTo !== MAX_AGE_PLUS)
        profileQuery.greaterThan("birthdate", birthdateFrom)

    if (profile.LFSelfId) {
        var regExString = "["
        if (profile.LFSperm)
            regExString += "S?"


        if (profile.LFEggs)
            regExString += "E?"


        if (profile.LFWomb)
            regExString += "W?"


        if (profile.LFEmbryo)
            regExString += "Y?"

        if (profile.LFNot)
            regExString += "X?"

        regExString += "]+"

        var regEx = new RegExp(regExString)
        profileQuery.matches("thingsIHave", regEx)
    }

    // TODO this will be have to be re-worked at some point as there is a maximum limit of 1000 with Parse
    // The next two sub queries select the user id's we don't want to match on, which is from
    // the matches the user have already actioned (liked or rejected), or other users have rejected this user
    // This can be determined if the u1action/u2action property has already been set

    var alreadyMatched1Query = new Parse.Query("Match")
    alreadyMatched1Query.equalTo("uid1", userId)
    alreadyMatched1Query.exists("u1action") // where we have an action
    alreadyMatched1Query.select("uid2") // then return the other user id
    alreadyMatched1Query.limit(10000)

    var alreadyMatched2Query = new Parse.Query("Match")
    alreadyMatched2Query.equalTo("uid2", userId)
    alreadyMatched2Query.exists("u2action")
    alreadyMatched2Query.select("uid1")
    alreadyMatched2Query.limit(10000)

    var alreadyMatchedQuery = Parse.Query.or(alreadyMatched1Query, alreadyMatched2Query)
    alreadyMatchedQuery.limit(10000)

    return alreadyMatchedQuery.find(masterKey).then(function(results) {
        var ids = []
        var length = results.length
        var userId = request.user.id
        for (var i = 0; i < length; i++) {
            var row = results[i]
            var uid1 = row.get('uid1')
            if (uid1 != userId)
                ids.push(uid1)
            else
                ids.push(row.get('uid2'))
        }
        return ids
    }).then(function(ids) {
        ids.push(userId)
        profileQuery.notContainedIn('uid', ids)
            //profileQuery.notEqualTo("uid", userId)
        profileQuery.descending("updatedAt")
        profileQuery.limit(150)
        return profileQuery.find(masterKey)
    }).then(function(result) {
        result = _.map(result, _processProfile)
        response.success(result)
    }, function(error) {
        console.log(JSON.stringify(error))
        response.error(error)
    })
});



Parse.Cloud.define("ProcessMatch", function(request, response) {
    var userId = request.user.id
    var otherUserId = request.params.otherUserId
    var liked = request.params.liked
    var forceConnect = request.params.forceConnect


    if (otherUserId == null)
        return response.error('otherUserId was not provided')

    if (liked == null)
        return response.error('liked was not provided')

    console.log('params ', userId, otherUserId, liked, forceConnect)

    var match
    var mutualMatch = false
    var otherUser
        // To have a consistent composite key for the match between the two users
        // we always have the lower key as user1 and the higher key as user2
    var isFirstId
    var uid1, uid2

    if (userId < otherUserId) {
        isFirstId = true
        uid1 = userId
        uid2 = otherUserId
    } else {
        isFirstId = false
        uid1 = otherUserId
        uid2 = userId
    }

    var matchQuery = new Parse.Query(Match)
    matchQuery.equalTo("uid1", uid1)
    matchQuery.equalTo("uid2", uid2)

    return matchQuery.first(function(result) {
        match = result
        if (match == null) {
            // the user is the first to match of the pair
            console.log('first to swipe, creating the match object')
            match = new Match()
            match.set('uid1', uid1)
            match.set('uid2', uid2)

            var acl = new Parse.ACL()
            acl.setPublicReadAccess(true)
            acl.setWriteAccess(uid1, true)
            acl.setWriteAccess(uid2, true)
            match.setACL(acl)

            // If we are the first to reject then put O for the other persons action ('Other reject')
            // This makes the query to get new potential matches easier by having it not empty
            if (!liked)
                match.set(isFirstId ? 'u2action' : 'u1action', 'O')
        }
        // set this users action
        match.set(isFirstId ? 'u1action' : 'u2action', liked ? 'L' : 'R')

        // set the current state of this match
        if (match.get('u1action') == null || match.get('u2action') == null)
            match.set('state', 'P') // P for pending - this user was the first one to swipe
        else if (match.get('u1action') == 'R' || match.get('u2action') == 'R')
            match.set('state', 'R') // R for rejected
        else if (match.get('u1action') == 'L' && match.get('u2action') == 'L' && match.get('state') != 'M') {
            match.set('state', 'M') // M for mutual like
            match.set('matchedDate', new Date())
        }

        if (forceConnect) {
            if (liked && match.get('state') != 'M')
                match.set('state', 'M')
            else if (!liked)
                match.set('state', 'R')
        }

        return match
    }, masterKey).then(function(result) {
        if (match.get('state') != 'M') return null

        mutualMatch = true
            // If it's a mutual match then save the pointer to the profiles on the match object
            //console.log('loading profiles for mutual match')
        var profileQuery = new Parse.Query(Profile)
        profileQuery.containedIn("uid", [uid1, uid2])
        return profileQuery.find(masterKey)
    }).then(function(profiles) {
        if (profiles != null) { // i.e. mutualMatch = true
            if (profiles.length != 2) {
                return Parse.Promise.error('error - loading profiles for uids ' + uid1 + ' and ' + uid2 + ' returned ' + profiles.length + ' results')
            } else {
                if (profiles[0].get('uid') == uid1) {
                    match.set('profile1', profiles[0])
                    match.set('profile2', profiles[1])
                } else {
                    match.set('profile1', profiles[1])
                    match.set('profile2', profiles[0])
                }
            }
        }
        // now we can save the match object
        return match.save(null, masterKey)

    }).then(function(match) {
        console.log('saved match ' + JSON.stringify(match))
        return mutualMatch ? new Parse.Query(Parse.User).get(otherUserId, masterKey) : null

    }).then(function(otherUser) {
        if (!mutualMatch || !otherUser)
            return null
                // Add the match id to both users 'matches' property
        request.user.addUnique('matches', match.id)
        otherUser.addUnique('matches', match.id)
        return Parse.Object.saveAll([request.user, otherUser], masterKey)

    }).then(function(result) {
        if (!mutualMatch) {
            response.success(null)
            return
        }
        response.success(match.toJSON())
            // // Send the push notification to the other user
            // Parse.Push.send({
            // 	channels: ["user_" + otherUserId],
            // 	data: {
            // 		alert: "You have a new match",
            // 		badge: "Increment",
            // 		sound: "cheering.caf",
            // 		title: "New Match!",
            //
            // 		type: "match",
            // 		matchId: match.id
            // 	}
            // }, {
            //  useMasterKey: true,
            // 	success: function() { response.success(match) },
            // 	error: function(error) { response.error(error) }
            // })

    }, function(error) {
        response.error(error)
    })

})

Parse.Cloud.define("ProcessPregnancy", function(request, response) {
    var userId = request.user.id
    var otherUserId = request.params.otherUserId
    var impregnate = request.params.impregnate

    if (otherUserId == null)
        return response.error('otherUserId was not provided')

    if (impregnate == null)
        return response.error('impregnate action was not provided')

    console.log('params ', userId, otherUserId, impregnate)

    var match
    var mutualMatch = false
    var otherUser
        // To have a consistent composite key for the match between the two users
        // we always have the lower key as user1 and the higher key as user2
    var isFirstId
    var uid1, uid2

    if (userId < otherUserId) {
        isFirstId = true
        uid1 = userId
        uid2 = otherUserId
    } else {
        isFirstId = false
        uid1 = otherUserId
        uid2 = userId
    }

    var matchQuery = new Parse.Query(Match)
    matchQuery.equalTo("uid1", uid1)
    matchQuery.equalTo("uid2", uid2)

    return matchQuery.first(function(result) {
        match = result

        // set this users action
        match.set(isFirstId ? 'u1PregAction' : 'u2PregAction', impregnate ? 'L' : 'R')

        // set the current pregnancy state of this match
        if (match.get('u1PregAction') == null || match.get('u2PregAction') == null) {
            match.set('pregState', 'P') // P for pending - this user was the first one to swipe
        } else if (match.get('u1PregAction') === 'R' || match.get('u2PregAction') === 'R') {
            match.set('pregState', 'R') // R for rejected
        } else if (match.get('u1PregAction') === 'L' && match.get('u2PregAction') === 'L') {
            match.set('pregState', 'M') // M for mutual like
        }

        if (match.get('pregState') === 'M')
            mutualMatch = true


        return match.save(null, masterKey)
    }, masterKey).then(function(match) {
        console.log('saved pregnancy action ' + JSON.stringify(match))
        return mutualMatch ? new Parse.Query(Parse.User).get(otherUserId, masterKey) : null

    }).then(function(otherUser) {
        if (!mutualMatch || !otherUser)
            return null
                // Add the match id to both users 'partners' property
        request.user.addUnique('partners', match.id)
        otherUser.addUnique('partners', match.id)
        return Parse.Object.saveAll([request.user, otherUser], masterKey)

    }).then(function(result) {
        if (!mutualMatch) {
            response.success(null)
            return
        }
        response.success(match.toJSON())
            // // Send the push notification to the other user
            // Parse.Push.send({
            // 	channels: ["user_" + otherUserId],
            // 	data: {
            // 		alert: "You have a new match",
            // 		badge: "Increment",
            // 		sound: "cheering.caf",
            // 		title: "New Match!",
            //
            // 		type: "match",
            // 		matchId: match.id
            // 	}
            // }, {
            //  useMasterKey: true,
            // 	success: function() { response.success(match) },
            // 	error: function(error) { response.error(error) }
            // })

    }, function(error) {
        response.error(error)
    })

})



/**
 * Queries the Matches where other users like the current user, but this user hasn't swiped them, and returns the profile.
 * Useful for showing, or counting, which other users have liked this user (upto 1000 matches)
 * @returns IProfile[] the profiles
 */
Parse.Cloud.define('GetProfilesWhoLikeMe', function(request, response) {
    Parse.Cloud.useMasterKey()
    var userId = request.user.id

    var maxResults = 20

    function baseMatchQuery(thisId, otherId) {
        var matchQuery = new Parse.Query("Match")
        matchQuery.equalTo('state', 'P') // pending the current user to swipe
        matchQuery.equalTo('u' + otherId + 'action', 'L') // where the other user has liked us
        matchQuery.limit(maxResults)
        matchQuery.select('uid' + thisId)
        matchQuery.equalTo('uid' + thisId, request.user.id)
        matchQuery.descending('createdAt')
        return matchQuery
    }

    var matchQuery = Parse.Query.or(baseMatchQuery('1', '2'), baseMatchQuery('2', '1'))
    matchQuery.limit(maxResults)
    matchQuery.find().then(function(matches) {
        console.log('found ' + matches.length + ' matches objects who like me')
            // The match objects are not a mutual match so they wont have the profile reference set
            // So load the User objects including the profile
        var userIds = []
        _.each(matches, function(match) {
            var uid1 = match.get('uid1')
            var uid2 = match.get('uid2')

            userIds.push(userId === uid1 ? uid2 : uid1)
        })

        if (userIds.length === 0)
            return []
        var userQuery = new Parse.Query(Parse.User)
        userQuery.include('profile')
        userQuery.containedIn('objectId', userIds)
        userQuery.limit(maxResults)
        return userQuery.find()
    }).then(function(users) {
        var profiles = []
        _.each(users, function(user) {
            profiles.push(_processProfile(user.get('profile')))
        })
        return profiles
    }).then(function(profiles) {
        response.success(profiles)
    }, function(error) {
        response.error(error)
    })
})

/**
 * Queries the Matches where other users wants to have a relationship with the current user, but this user hasn't swiped them, and returns the profile.
 * Useful for showing, or counting, which other users wants to have a relationship with this user (upto 1000 matches)
 * @returns IProfile[] the profiles
 */
Parse.Cloud.define('GetProfilesWhoWantsToHaveARelationshipWithMe', function(request, response) {
    Parse.Cloud.useMasterKey()
    var userId = request.user.id

    var maxResults = 20

    var stringPendingRequest = "pendingUserRequest"
    var stringPendingUserInvite = "pendingUserInvite"
    var stringmutualUsers = "mutualUsers"

    var userIdsPendingRequest = [] //someone's request is pending on u'
    var userIdsPendingInvite = [] // ur request to someone is pending
    var userIdsMutual = [] //both are accepted

    var profilePendingRequest = []
    var profilePendingInvite = []
    var profileMutual = []

    var userContainer = {}


    function baseMatchQuery(thisId, otherId) {
        var pregStates = ['P', 'M']
        var matchQuery = new Parse.Query("Match")
        matchQuery.containedIn('pregState', pregStates) // get all pending and mutual preg states
        matchQuery.limit(maxResults)
        matchQuery.select('uid' + thisId)
        matchQuery.equalTo('uid' + thisId, request.user.id)
        matchQuery.descending('createdAt')
        return matchQuery
    }

    function setUserContainer(userProfile, users) {
        userContainer[userProfile] = users
        console.log(userProfile + " here " + userContainer[userProfile].length)
    }

    function baseUserQuery(userIds) {
        var userQuery = new Parse.Query(Parse.User)
        userQuery.include('profile')
        userQuery.containedIn('objectId', userIds)
        userQuery.limit(maxResults)
        return userQuery.find()
    }

    function getUsersOrReturnEmpty(userIds) {
        if (userIds.length === 0)
            return []
        return baseUserQuery(userIds)
    }

    function iterateUserProfiles(userProfile, userProfilesList) {
        if (userContainer[userProfile] && userContainer[userProfile].length) {
            _.each(userContainer[userProfile], function(user) {
                userProfilesList.push(_processProfile(user.get('profile')))
            })
            console.log(userProfile + " array length " + userProfilesList.length)
        }
    }

    var matchQuery = Parse.Query.or(baseMatchQuery('1', '2'), baseMatchQuery('2', '1'))
    matchQuery.limit(maxResults)
    matchQuery.find().then(function(matches) {
        console.log('found ' + matches.length + ' matches objects who wants to have a relationship with me')
            // The match objects are not a mutual match so they wont have the profile reference set
            // So load the User objects including the profile


        _.each(matches, function(match) {
            var uid1 = match.get('uid1')
            var uid2 = match.get('uid2')

            if (match.get('pregState') === 'M')
                userIdsMutual.push(userId === uid1 ? uid2 : uid1)
            else if (match.get('pregState') === 'P') {
                if (userId === uid1 && match.get('u1PregAction') === 'L') {
                    userIdsPendingInvite.push(uid2)
                } else {
                    userIdsPendingRequest.push(uid1)
                }
            }
        })

        return getUsersOrReturnEmpty(userIdsPendingRequest)
    }).then(function(users) {
        setUserContainer(stringPendingRequest, users)
        return getUsersOrReturnEmpty(userIdsPendingInvite)
    }).then(function(users) {
        setUserContainer(stringPendingUserInvite, users)
        return getUsersOrReturnEmpty(userIdsMutual)
    }).then(function(users) {
        setUserContainer(stringmutualUsers, users)
        console.log("Second stage here" + userContainer[stringPendingRequest])
        console.log("Second stage here" + userContainer[stringPendingUserInvite])
        console.log("Second stage here" + userContainer[stringmutualUsers])

        var profileContainer = {}


        iterateUserProfiles(stringPendingRequest, profilePendingRequest)
        iterateUserProfiles(stringPendingUserInvite, profilePendingInvite)
        iterateUserProfiles(stringmutualUsers, profileMutual)



        profileContainer[stringPendingRequest] = profilePendingRequest
        profileContainer[stringPendingUserInvite] = profilePendingInvite
        profileContainer[stringmutualUsers] = profileMutual

        console.log("profileMutual array length" + profileMutual.length)

        return profileContainer
    }).then(function(profileContainer) {
        console.log("Success returning the profileContainer" + profileContainer)
        response.success(profileContainer)
    }, function(error) {
        console.log("RIP Error" + error)
        response.error(error)
    })
})

Parse.Cloud.define("RemoveMatch", function(request, response) {
    var matchId = request.params.matchId
    var userId = request.user.id
    var otherUserId
    var otherUser

    new Parse.Query(Match).get(matchId, masterKey).then(function(match) {
        match.set('state', 'D') // Deleted

        var uid1 = match.get('uid1')
        otherUser = Parse.User.createWithoutData(uid1 === userId ? match.get('uid2') : uid1)
        otherUser.remove('matches', matchId)
        request.user.remove('matches', matchId)

        return Parse.Promise.when(match.save(null, masterKey), otherUser.save(null, masterKey), request.user.save(null, masterKey), notifyRemoveMatch(match, [otherUserId]))
    }).then(function() {
        response.success(null)
    }, function(error) {
        response.error(error)
    })
});

Parse.Cloud.define("GetProfileOfSelectedUser", function(request, response) {
    var profileId = request.params.profileId

    var profileQuery = new Parse.Query("Profile")

    profileQuery.get(profileId, masterKey).then(function(profile) {
        response.success(_processProfile(profile))
    }, function(error) {
        console.log(JSON.stringify(error))
        response.error(error)
    })
});

Parse.Cloud.define('GetApplyBadgeUsers', function(request, response) {
    var profileQuery = new Parse.Query("Profile")
    profileQuery.equalTo('personCategory', '0')
    profileQuery.descending('createdAt').limit(50).find().then(function(result) {
        result = _.map(result, _processProfile)
        response.success(result)
    }, function(error) {
        console.log(JSON.stringify(error))
        response.error(error)
    })
})

Parse.Cloud.define('SaveProfileForSomeReason', function(request, response) {
    console.log('SaveProfileForSomeReason...')
    var id = request.params.id
    var profileChanges = request.params.profileChanges
    if (!id) return response.error('id parameter is required')

    var profileQuery = new Parse.Query("Profile")
    profileQuery.get(id, masterKey).then(function(profile) {
            return profile.save(profileChanges, masterKey)
        }).then(function() {
            response.success("Successfully saved badge")
        }),
        function(error) {
            console.log(JSON.stringify(error))
            response.error(error)
        }
})

/**
 * Set the sender and members properties, and check the message is allowed to be sent
 */
Parse.Cloud.beforeSave('ChatMessage', function(request, response) {
    var message = request.object
    var userId = request.user.id

    // If re-saved from a migration job then don't resend push notifications
    if (request.master && message.id)
        return response.success(null)


    var match = message.get('match')
    if (!match) return response.error('match must be set on the ChatMessage before saving')

    var matchId = match.id
    if (!matchId) return response.error('message.match.id was null/undefined')

    message.set('sender', request.user.id)

    new Parse.Query(Match).get(matchId, masterKey).then(function(match) {
        if (!match) {
            response.error('Match object does not exist')
            return
        }
        message.set('match', match)

        var uid1 = match.get('uid1')
        var uid2 = match.get('uid2')
        if (uid1 !== userId && uid2 !== userId) {
            response.error('User is not a part of the provided match object')
            return
        }

        if (match.get('state') !== 'M') {
            // Another check to ensure a malicious client can't message non-mutual matches
            response.error('Cant message to a non-mutual match')
            return
        }

        var acl = new Parse.ACL()
        acl.setReadAccess(uid1, true)
        acl.setReadAccess(uid2, true)
        message.setACL(acl)

        message.set('userIds', [uid1, uid2]) // for a group chat you would want to add all the user ids in the chat
        response.success()
    }, function(error) {
        response.error(error)
    })
})

/**
 * This sends a push notification to all the members of the chat/match, except for the sender
 */
Parse.Cloud.afterSave('ChatMessage', function(request) {

    // If re-saved from a migration job then don't resend push notifications
    if (request.master) {
        return
    }

    var message = request.object
    var senderId = request.user.id // which equals message.sender
    var match = message.get('match')
    var userIds = message.get('userIds')

    // create the channel list for all the members of the chat/match, except for the sender
    var channels = []
    for (var i = 0; i < userIds.length; i++) {
        var id = userIds[i]
        if (id != senderId)
            channels.push('user_' + id)
    }

    var senderName = message.get('senderName')
        // for iOS the title will always be the app name
        // var title = 'New message!'
    var alert = senderName
    if (message.get('text'))
        alert = senderName + ': ' + message.get('text')
    else if (message.get('image'))
        alert = senderName + ' sent an image'
    else if (message.get('audio'))
        alert = senderName + ' sent an audio message'

    Parse.Push.send({
        channels: channels,
        data: {
            alert: alert,
            badge: "Increment",
            sound: "cheering.caf",
            // title: title,

            type: "message",
            message: {
                id: message.id,
                match: { id: match.id },
                text: message.get('text'),
                sender: request.user.id,
                createdAt: message.createdAt.getTime(),
            }
        }
    }, masterKey)
})

Parse.Cloud.beforeSave('ContactMessage', function(request, response) {
    request.object.set('user', request.user)
    request.object.setACL(new Parse.ACL())
    response.success()
})

Parse.Cloud.afterSave("ContactMessage", function(request) {
    var user = request.user
    var message = 'New contact message from user ' + user.id + '\n\n' + request.object.get('message')

    Email.sendAdminEmail('Contact Message', message).then(function(result) {}, function(error) {
        console.error('Error sending contact message email: ' + error)
    })
})

Parse.Cloud.beforeSave('Report', function(request, response) {
    request.object.set('reportedByUser', request.user)
    request.object.setACL(new Parse.ACL())
    response.success()
})

Parse.Cloud.afterSave("Report", function(request) {
    var user = request.user
    var report = request.object

    var message = 'New Report Message from user ' + user.id + ' reporting another user ' + report.get('reportedUser') + '. Reason: ' + report.get('reason')
    console.log("Sending report message " + message)

    Email.sendAdminEmail('Reported User', message).then(function(result) {}, function(error) {
        console.error('Error sending report message email: ' + error)
    })
})

/* Add/Edit Clinic Questions */
Parse.Cloud.define('AddClinicsQuestion', function(request, response) {
    console.log('AddClinicsQuestion')
    var clinicQuestionData = request.params.clinicQuestion

    if (!clinicQuestionData)
        return response.error('clinicQuestionData parameter must be provided')

    var cq = new ClinicsQuestion()
    if (clinicQuestionData.id) {
        cq.id = clinicQuestionData.id
        delete clinicQuestionData.id
    }

    cq.save(clinicQuestionData).then(function(result) {
        console.log("Success saving clinic question")
        response.success("Success saving clinic question")
    }, function(error) {
        console.log("Error saving clinic question")
        response.error(error)
    })
})

/* Get Clinic Questions */
Parse.Cloud.define('GetClinicsQuestion', function(request, response) {
    console.log('GetClinicsQuestion')
    new Parse.Query(ClinicsQuestion).limit(1000).ascending('position').find().then(function(result) {
        console.log("Successs " + JSON.stringify(result))
        response.success(result)
    }, function(error) {
        console.log("Erroorrr: " + JSON.stringify(error))
        response.error(error)
    })
})

/* Delete Clinic Questions */
Parse.Cloud.define('DelClinicsQuestion', function(request, response) {
    console.log('DelClinicsQuestion')
    var id = request.params.id
    if (!id) return response.error('id parameter is required')

    var clinicQuery = new Parse.Query(ClinicsQuestion);
    clinicQuery.get(id, masterKey).then(function(clinicQuestion) {
            return clinicQuestion.destroy()
        }).then(function() {
            response.success("Successfully deleted question!")
        }),
        function(error) {
            console.log(JSON.stringify(error))
            response.error(error)
        }
})

/* Add/Edit Find Us */
Parse.Cloud.define('AddFindUs', function(request, response) {
    console.log('AddFindUs')
    var findUsData = request.params.findUs

    if (!findUsData)
        return response.error('findUsData parameter must be provided')

    var fu = new FindUs()
    if (findUsData.id) {
        fu.id = findUsData.id
        delete findUsData.id
    }

    fu.save(findUsData).then(function(result) {
        console.log("Success saving find us data")
        response.success("Success saving find us data")
    }, function(error) {
        console.log("Error saving find us data")
        response.error(error)
    })
})

/* Get Find Us */
Parse.Cloud.define('GetFindUs', function(request, response) {
    console.log('GetFindUs')
    new Parse.Query(FindUs).limit(1000).find().then(function(result) {
        console.log("Successs " + JSON.stringify(result))
        response.success(result)
    }, function(error) {
        console.log("Erroorrr: " + JSON.stringify(error))
        response.error(error)
    })
})

/* Delete Find Us */
Parse.Cloud.define('DelFindUs', function(request, response) {
    console.log('DelFindUs')
    var id = request.params.id
    var savedName = ""
    if (!id) return response.error('id parameter is required')

    var findUsQuery = new Parse.Query(FindUs);
    findUsQuery.get(id, masterKey).then(function(findUs) {
            savedName = findUs.get('name')
            return findUs.destroy()
        }).then(function() {
            var query = new Parse.Query("FindUsReport");
            query.equalTo("name", savedName)
            query.find(masterKey).then(function(items) {
                return Parse.Object.destroyAll(items, masterKey)
            })
        }).then(function() {
            response.success("Successfully deleted findus item!")
        }),
        function(error) {
            console.log(JSON.stringify(error))
            response.error(error)
        }
})

/* Vote Find Us Report*/
Parse.Cloud.define('AddFindUsReport', function(request, response) {
    console.log('AddFindUsReport')
    var findUsVotesData = request.params.findUsVotes

    if (!findUsVotesData)
        return response.error('findUsVotesData parameter must be provided')

    findUsVotesData.forEach(vote => {
        var fur = new FindUsReport()
        fur.set('name', vote.name)
        fur.set('username', vote.username)
        fur.set('checked', vote.checked)
        fur.save().then(function(result) {
            console.log("Success saving vote")
            response.success("Success saving vote")
        }, function(error) {
            console.log("Error saving vote")
            response.error(error)
        })
    })
})

/* Get Find Us Report for analysis*/
Parse.Cloud.define('GetFindUsReport', function(request, response) {
    console.log('GetFindUsReport')
    new Parse.Query(FindUsReport).descending('createdAt').limit(10000).find().then(function(result) {
        console.log("Successs " + result.length)
        response.success(result)
    }, function(error) {
        console.log("Erroorrr: " + JSON.stringify(error))
        response.error(error)
    })
})

/* Delete Vote Report*/
Parse.Cloud.define('DelFindUsReport', function(request, response) {
    console.log('DelFindUsReport')
    var id = request.params.id
    if (!id) return response.error('id parameter is required')

    var findUsReportQuery = new Parse.Query(FindUsReport);
    findUsReportQuery.get(id, masterKey).then(function(vote) {
            return vote.destroy()
        }).then(function() {
            response.success("Successfully deleted votes!")
        }),
        function(error) {
            console.log(JSON.stringify(error))
            response.error(error)
        }
})

/* Get About Jab*/
Parse.Cloud.define('GetAboutJab', function(request, response) {
    console.log('GetAboutJab')
    new Parse.Query(AboutJab).first().then(function(result) {
        console.log("Successs " + JSON.stringify(result))
        response.success(result.toJSON())
    }, function(error) {
        console.log("Erroorrr: " + JSON.stringify(error))
        response.error(error)
    })
})

/* Add/Edit About Jab */
Parse.Cloud.define('AddAboutJab', function(request, response) {
    console.log('AddAboutJab')
    var aboutData = request.params.about

    if (!aboutData)
        return response.error('aboutData parameter must be provided')

    var about = new AboutJab()
    if (aboutData.id) {
        about.id = aboutData.id
        delete aboutData.id
    }

    about.save(aboutData).then(function(result) {
        console.log("Success saving about JAB")
        response.success("Success saving about JAB")
    }, function(error) {
        console.log("Error saving about JAB")
        response.error(error)
    })
})

/* Get the Number of Matches based on day*/
Parse.Cloud.define('GetMatchesReport', function(request, response) {
    console.log('GetMatchesReport')
    var numDays = request.params.numDays
    var dateCovered = new Date()
    dateCovered.setDate(dateCovered.getDate() - numDays)
    dateCovered.setUTCHours(24, 0, 0, 0)

    var matchesQueryReport = new Parse.Query(Match)
    matchesQueryReport.equalTo('state', 'M')
    matchesQueryReport.greaterThan('matchedDate', dateCovered)
    matchesQueryReport.select('matchedDate')
    matchesQueryReport.ascending('matchedDate')
    matchesQueryReport.limit(1000).find().then(function(result) {
        console.log("Successs " + JSON.stringify(result))
        response.success(result)
    }, function(error) {
        console.log("Erroorrr: " + JSON.stringify(error))
        response.error(error)
    })
})

/* Get the Number of ChatMessages based on day*/
Parse.Cloud.define('GetChatMessageReport', function(request, response) {
    console.log('GetChatMessageReport')
    var numDays = request.params.numDays
    var dateCovered = new Date()
    dateCovered.setDate(dateCovered.getDate() - numDays)
    dateCovered.setUTCHours(24, 0, 0, 0)
    console.log("Dates starting " + numDays + " " + dateCovered.toLocaleString())

    var chatsQueryReport = new Parse.Query(ChatMessage)
    chatsQueryReport.greaterThan('createdAt', dateCovered)
    chatsQueryReport.select('createdAt', 'senderName')
    chatsQueryReport.ascending('createdAt')
    chatsQueryReport.limit(1000).find(masterKey).then(function(result) {
        console.log("Successs " + result.length)
        response.success(result)
    }, function(error) {
        console.log("Erroorrr: " + JSON.stringify(error))
        response.error(error)
    })
})

/**
 * We don't normally delete matches, just mark them as deleted
 * But if we do delete one through the admin dashboad then do the appropriate cleanup
 */
Parse.Cloud.afterDelete("Match", function(request) {
    var match = request.object

    if (match.get('state') === 'M') {
        var query = new Parse.Query(Parse.User)
        query.containedIn('objectId', [match.get('uid1'), match.get('uid2')])
        query.find(masterKey).then(function(users) {
            _.each(users, function(user) {
                user.remove('matches', match.id)
            })
            Parse.Object.saveAll(users, masterKey)
        })
        notifyRemoveMatch(match, [match.get('uid1'), match.get('uid2')])
    }

    var query = new Parse.Query("ChatMessage");

    query.equalTo("match", match);
    query.find(masterKey).then(function(messages) {
        return Parse.Object.destroyAll(messages, masterKey)
    }).then(function(success) {
        // The related comments were deleted
    }, function(error) {
        console.error("Error deleting messages for match " + request.object.id + "  code:" + error.code + ": " + error.message)
    })
})


Parse.Cloud.define('DeleteUnmatched', function(request, response) {
    var user = request.user
    var userId = user.id

    var matches1Query = new Parse.Query("Match")
    matches1Query.equalTo("uid1", userId)
    matches1Query.containedIn('state', ['P', 'R'])
    matches1Query.limit(10000)

    var matches2Query = new Parse.Query("Match")
    matches2Query.equalTo("uid2", userId)
    matches2Query.containedIn('state', ['P', 'R'])
    matches2Query.limit(10000)

    var count = 0
    Parse.Query.or(matches1Query, matches2Query).limit(10000).find().then(function(matches) {
        count = matches.length
        return Parse.Object.destroyAll(matches)
    }).then(function(success) {
        response.success('found ' + count + ' rejected matches to delete')
    }, function(error) {
        response.error(error)
    })
})


/** Delete the current user account */
Parse.Cloud.define('DeleteAccount', function(request, response) {
    deleteUser(response, request.user)
})

/** Delete the account for a particular user. Admin only function */
Parse.Cloud.define('DeleteUser', function(request, response) {
    var user = request.user
    if (!user.get('admin'))
        return response.error('Must be an admin to delete a user')
    var userId = request.params.userId
    if (!userId)
        return response.error('userId parameter must be provided')
    new Parse.Query(Parse.User).get(userId, masterKey).then(function(user) {
        deleteUser(response, user)
    }, function(error) {
        response.error(error)
    })
})

function deleteUser(response, user) {
    var userId = user.id
        // TODO could update the client to accept a user id in a removeMatch notification, then could have one push API call
        //var mutualMatchChannels = []

    var deletedUser = new DeletedUser()

    function sendRemoveMatchPushNotification(matchId, otherUserId) {
        Parse.Push.send({
            channels: ['user_' + otherUserId],
            data: {
                type: "removeMatch",
                matchId: matchId
            }
        }, {
            useMasterKey: true,
            success: function() {},
            error: function(error) { console.error('Error sending push notification for unmatching a deleted account. ' + JSON.stringify(error)) }
        })
    }

    user.set('status', 'deleting')
    return user.save(null, masterKey).then(function(success) {

        var profile = user.get('profile')
            // TODO should delete photo files
        if (profile) {
            profile.fetch(masterKey).then(function(profile) {
                try { deletedUser.set('profile', JSON.stringify(profile)) } catch (e) { console.error('couldnt stringify profile of deleted user') }
                profile.destroy(masterKey)
            }, function(error) {
                // don't return an error if the profile doesnt exist in the database
            })
        }
        return null
    }).then(function(success) {
        console.log('deleted profile')
            // Find the user's mutual match objects
        var match1Query = new Parse.Query(Match)
        match1Query.equalTo('uid1', userId)
        match1Query.equalTo('state', 'M')

        var match2Query = new Parse.Query(Match)
        match2Query.equalTo('uid2', userId)
        match2Query.equalTo('state', 'M')

        return Parse.Query.or(match1Query, match2Query).each(function(match) {

            match.set('state', 'D') // set state to deleted

            var uid1 = match.get('uid1')
            var otherUserId = userId == uid1 ? match.get('uid2') : uid1

            //  Set the state to deleted and remove the users id from the other User.matches
            var otherUser = new Parse.User()
            otherUser.id = otherUserId
            otherUser.remove('matches', match.id)

            sendRemoveMatchPushNotification(match.id, otherUserId)
            return Parse.Promise.when(match.save(null, masterKey), otherUser.save(null, masterKey))
        })
    }).then(function(success) {
        console.log('updated all matches and users')
            // store the user and profile in the DeleteUser table
        try { deletedUser.set('user', JSON.stringify(user)) } catch (e) { console.error('couldnt stringify user of deleted user') }
        deletedUser.set('uid', userId)
        console.log('creating deleted user and destroying user...')
        return Parse.Promise.when(deletedUser.save(null, masterKey), user.destroy(masterKey))

    }).then(function(success) {
        response.success(null)
    }, function(error) {
        response.error(error)
    })
}


Parse.Cloud.define('RebuildMatches', function(request, response) {
    Parse.Cloud.useMasterKey()
    rebuildMatches(request.user).then(function() {
        response.success(null)
    }, function() {
        response.error()
    })
})

/**
 * Convenience function to clear the database, e.g. before running integration tests.
 * To protect against accidentally running it on valuable data it checks for the integrationAppId
 * defined in config.js
 */
Parse.Cloud.define("DeleteAllData", function(request, response) {

    // if( TODO isProduction ) {
    // 	response.error('Cannot delete all data in production')
    // 	return
    // }

    return new Parse.Query(Profile).limit(1000).find(masterKey)
        .then(function(profiles) { return Parse.Object.destroyAll(profiles, masterKey) })

    .then(function() { return new Parse.Query(Match).limit(1000).find(masterKey) })
        .then(function(matches) { return Parse.Object.destroyAll(matches, masterKey) })

    .then(function() { return new Parse.Query(ChatMessage).limit(1000).find(masterKey) })
        .then(function(messages) { return Parse.Object.destroyAll(messages, masterKey) })

    .then(function() { return new Parse.Query(Report).limit(1000).find(masterKey) })
        .then(function(reports) { return Parse.Object.destroyAll(reports, masterKey) })

    .then(function() { return new Parse.Query(Parse.User).limit(1000).find(masterKey) })
        .then(function(users) { return Parse.Object.destroyAll(users, masterKey) })

    .then(function() { response.success('Database truncated') },
        function(error) { response.error(error) })
})


/**
 * Sends a push notification to the current user. Useful for testing if push notifications are configured properly
 */
Parse.Cloud.define('TestPushNotification', function(request, response) {
    console.log('sending push to channel ' + 'user_' + request.user.id)
    Parse.Push.send({
        channels: ['user_' + request.user.id],
        data: {
            alert: 'Test push notification',
            data: {
                type: 'test'
            }
            // title: 'Test push notification',
        }
    }, masterKey).then(
        success => response.success(null),
        error => response.error(error)
    )
})



/**
 * Send the remove match push notification for the given match to the users
 * @param match
 * @param uids array of user ids
 * @returns {Promise<T>}
 */
function notifyRemoveMatch(match, uids) {
    var channels = _.map(uids, function(uid) { return 'user_' + uid })
    return Parse.Push.send({
        channels: channels,
        data: {
            type: 'removeMatch',
            matchId: match.id
        }
    }, masterKey)
}

function rebuildMatches(user) {
    var query1 = new Parse.Query('Match')
        .equalTo('uid1', user.id)
        .equalTo('state', 'M')
        .limit(1000)
    var query2 = new Parse.Query('Match')
        .equalTo('uid2', user.id)
        .equalTo('state', 'M')
        .limit(1000)

    return Parse.Query.or(query2, query1).limit(1000).select('objectId').find().then(function(result) {
        var matches = []
        _.each(result, function(match) { matches.push(match.id) })

        if (!user.get('matches') || arraysEqual(user.get('matches'), matches)) {
            return
        }
        console.log(JSON.stringify(user.get('matches')) + '   ' + JSON.stringify(matches))
        console.log('Updating matches for ' + user.id + '. Length ' + user.get('matches').length + ' -> ' + matches.length)

        user.set('matches', matches)
        return user.save()
    })
}

function arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length != b.length) return false;

    // If you don't care about the order of the elements inside
    // the array, you should sort both arrays here.
    a.sort()
    b.sort()

    for (var i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

//var adminQuery = new Parse.Query(Parse.User)
//adminQuery.equalTo('admin',true)
//adminQuery.find().then(function(users) {
//	consolel.log('found ' + users.length + ' admin users')
//})