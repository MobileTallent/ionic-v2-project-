/**
 * @typedef {Object} User
 * @property {boolean} emailVerified - the match object
 * @property {boolean} admin - if the user is an admin user
 * @property {string} status - the status of the account, e.g. banned
 * @property {string[]} matches - an array of the ids of the Match objects that are a mutual match
 * @property {boolean} premium - if the user has a premium account (e.g. from in-app purchase/subscription)
 * @property {number} credits - the number of credits the user has (e.g. from in-app purchase)
 * @property {boolean} serviceProvider - if the user service provider
 */
var userFields = [
    'emailVerified', 'admin', 'matches', 'profile', 'status', 'premium', 'credits', 'serviceProvider'
]

// See IProfile in data-model.ts
var profileFields = [
    'uid',
    'name',
    'birthdate', 'age',
    'about',
    'photos', 'photosInReview',
    'notifyMatch', 'notifyMessage',
    'distance', 'distanceType',
    'location', 'gps', 'country', 'address',
    'enabled',
    'gender', 'guys', 'girls',
    'ageFrom', 'ageTo',
    'personCategory', 'personType', 'personSperm', 'personEgg', 'personWomb', 'personEmbryo', 'personHelpLevel', 'hasSelfId',
    'LFSperm', 'LFEggs', 'LFWomb', 'LFEmbryo', 'LFNot', 'LFHelpM', 'LFHelpO', 'thingsIHave', 'LFSelfId'
]

var Profile = Parse.Object.extend({
    className: "Profile",
    attrs: profileFields
})


/**
 * @typedef {Object} Match
 * @property {string} uid1 - the id of the user 1 in the match (being the lowest ordered id of the two)
 * @property {string} uid2 - the id of the user 2 in the match (being the highest ordered id of the two)
 * @property {string} uid1action - the action the user with uid1 took. L for like, R for reject, or O if the other user rejected first
 * @property {string} uid2action - the action the user with uid2 took. L for like, R for reject, or O if the other user rejected first
 * @property {string} state - the state of the match. P if one user has liked. R if one user has rejected. M if a mutual match.
 *                           D if one user has removed what was previously a mutual match, or a user has deleted their account
 * @property {Profile} profile1 - if a mutual match then the profile of user with uid1
 * @property {Profile} profile2 - if a mutual match then the profile of user with uid2
 */
var matchFields = ['uid1', 'uid2', 'uid1action', 'uid2action', 'state', 'profile1', 'profile2', 'lastMessage', 'read', 'matchedDate']
var Match = Parse.Object.extend({
        className: "Match",
        attrs: matchFields
    })
    // Match also has the fields lastMessage and read in the local copy

/**
 * @typedef {Object} ChatMessage
 * @property {Object} match - the match object
 * @property {string[]} userIds - an array of the user ids who are in this chat. This allows indexing all chats by user for efficient loading of the latest messages for a user
 * @property {string} text - the message text
 * @property {IFile} image - If an image message then the image file
 * @property {IFile} audio - If an audio message then the image file
 * @property {string} sender - the user id of the sender
 * @property {Date} createdAt - the date this message was created
 */
// senderName is de-normalised here to avoid an API call in the ChatMessage.afterSave hook
var chatMessageFields = ['match', 'userIds', 'text', 'image', 'audio', 'sender', 'senderName']
var ChatMessage = Parse.Object.extend({
    className: "ChatMessage",
    attrs: chatMessageFields
})

/**
 * @typedef {Object} Report
 * @property {Object} reportedBy - the user who submitted the report
 * @property {Object} reportedUser - the user who was reported
 * @property {Object} match - (optional) the Match/Chat being reported about if already a mutual match
 * @property {Object} profile - the Profile being reported
 * @property {string} photo - (optional) the photo being reported
 * @property {string} reason - The reason for reporting ('S' spam, 'O' offensive)
 * @property {string} actionTaken - The action taken from this report (delete item and warn user, suspend/delete user, ignore)
 * @property {Object} actionUser - The admin user who took the action
 * @property {Date} updatedAt - the date this report was last updated
 * @property {Date} createdAt - the date this report was created
 */
var reportFields = ['matchId', 'reportedBy', 'reportedUser', 'match', 'profile', 'photo', 'reason', 'actionTaken', 'actionUser']
var Report = Parse.Object.extend({
    className: "Report",
    attrs: reportFields
})


/**
 * @typedef {Object} ContactMessage
 * @property {Object} user - the user who sent the message
 * @property {string} message - the message
 * @property {Date} updatedAt - the date this message was last updated
 * @property {Date} createdAt - the date this message was created
 */
var contactMessageFields = ['user', 'message']
var ContactMessage = Parse.Object.extend({
    className: "ContactMessage",
    attrs: contactMessageFields
})

/**
 * @typedef {Object} ClinicsQuestion
 * @property {string} answer - the answer
 * @property {string} question - the question
 * @property {number} position - the position of the question
 * @property {string} type - the type if for male , female or generic question
 * @property {string} video - URL of Youtube video
 */
var clinicsQuestionFields = ['answer', 'question', 'position', 'type', 'video']
var ClinicsQuestion = Parse.Object.extend({
    className: "ClinicsQuestion",
    attrs: clinicsQuestionFields
})

/**
 * @typedef {Object} FindUs
 * @property {string} name - the name
 */
var findUsFields = ['name']
var FindUs = Parse.Object.extend({
    className: "FindUs",
    attrs: findUsFields
})

/**
 * @typedef {Object} AboutJab
 * @property {string} message - the message
 * @property {string} videoId - the video ID
 */
var aboutJabFields = ['message', 'videoId']
var AboutJab = Parse.Object.extend({
    className: "AboutJab",
    attrs: aboutJabFields
})

/**
 * @typedef {Object} FindUsReport
 * @property {string} username - the name of the person
 * @property {string} name - the name of the group
 */
var findUsReportFields = ['username', 'name', 'checked']
var FindUsReport = Parse.Object.extend({
    className: "FindUsReport",
    attrs: findUsReportFields
})

/**
 * @typedef {Object} ServiceProvider
 * @property {string} name - the name of Service Provider
 * @property {string} country - the country of Service Provider
 * @property {string} uid - User promary account
 * @property {string} image_cover - Provider main picture
 * @property {string} email - user email
 * @property {string} phone_number - user phone_number
 * @property {number} balance - service provider balance
*/

var ServiceProviderFields = ['name', 'country', 'uid', 'image_cover', 'email', 'balance', 'phone_number']
var ServiceProvider = Parse.Object.extend({
    className: "ServiceProvider",
    attrs: ServiceProviderFields
})

/**
 * @typedef {Object} InfoCard
 * @property {string} pid - service provider id
 * @property {string} title - the title of Info Card
 * @property {string} question - the main question of Info Card
 * @property {string} answer - answer for question
 * @property {string} image - image cover
 * @property {string} video - video cover
 * @property {string} type - type of card
 * @property {object} audience - audiengs object with {tags:[]} array
 * @property {object} options - options object {frequency, age_from, age_to}
 * @property {number} shows - shows 
 * @property {number} clicks - clicks
*/

var InfoCardFields = ['pid', 'title', 'question', 'answer', 'image', 'video', 'type', 'audience', 'options', 'shows', 'clicks']
var InfoCard = Parse.Object.extend({
    className: "InfoCard",
    attrs: InfoCardFields
})

/**
 * @typedef {Object} PrService - service provider internal service
 * @property {string} pid - service provider id
 * @property {string} title - the title of Info Card
 * @property {boolean} active - active/inactive
 * @property {string} spiel - service description
 * @property {object} audience - audiengs object with {tags:[]} array
 * @property {string} image - image cover
 * @property {string} video - video cover
 * @property {number} price - service price 
 * @property {number} shows - shows 
 * @property {number} clicks - clicks
*/

var PrServiceFields = ['pid', 'title', 'active', 'spiel', 'audience', 'image', 'video', 'price', 'shows', 'clicks']
var PrService = Parse.Object.extend({
    className: "PrService",
    attrs: PrServiceFields
})

/**
 * @typedef {Object} HotBed - service provider hotbed
 * @property {string} pid - service provider id
 * @property {string} title - the title of HotBed
 * @property {boolean} active - active/inactive
 * @property {string} comments - hotbeds description
 * @property {object} location - location object with {"name":string, "lat":string, "lon":string}
*/

var HotBedFields = ['pid', 'title', 'active', 'comments', 'location']
var HotBed = Parse.Object.extend({
    className: "HotBed",
    attrs: HotBedFields
})

enhance(Parse.User.prototype, userFields)
enhance(Profile.prototype, profileFields)
enhance(Match.prototype, matchFields)
enhance(ChatMessage.prototype, chatMessageFields)
enhance(Report.prototype, reportFields)
enhance(ContactMessage.prototype, contactMessageFields)
enhance(ClinicsQuestion.prototype, clinicsQuestionFields)
enhance(FindUs.prototype, findUsFields)
enhance(FindUsReport.prototype, findUsReportFields)
enhance(AboutJab.prototype, aboutJabFields)
enhance(ServiceProvider.prototype, ServiceProviderFields)
enhance(InfoCard.prototype, InfoCardFields)
enhance(PrService.prototype, PrServiceFields)
enhance(HotBed.prototype, HotBedFields)

function enhance(prototype, fields) {
    for (var i = 0; i < fields.length; i++) {
        (function() {
            var propName = fields[i]
            var proto = prototype
            Object.defineProperty(proto, propName, {
                get: function() {
                    return this.get(propName)
                },
                set: function(value) {
                    this.set(propName, value)
                }
            })
        })()
    }
}


Object.defineProperty(ChatMessage.prototype, 'lastMessage', {
    get: function() {
        if (this.text)
            return this.text
                // These values will be converted to images by the emoji filter
        if (this.image)
            return ':rice_scene:'
        if (this.audio)
            return ':speaker:'
        return ''
    }
})

Object.defineProperty(Profile.prototype, 'photoUrl', {
    get: function() {
        if (this.photos && this.photos.length) {
            var photo = this.photos[0]
            if (photo._url)
                return photo._url
            if (angular.isFunction(photo.url))
                return photo.url()
            if (angular.isString(photo.url))
                return photo.url
        }

        return 'img/generic_avatar.jpg'
    }
})

Object.defineProperty(Match.prototype, 'profileId', {
    get: function() {
        if (this.otherProfileId != null)
            return this.otherProfileId
        if (this.otherProfile)
            return this.otherProfile.id
        if (this.uid1 == Parse.User.current().id)
            return this.profile2.id
        if (this.uid2 == Parse.User.current().id)
            return this.profile1.id
        return null
    }
})

Object.defineProperty(Match.prototype, 'profile', {
    get: function() {
        if (this.otherProfile)
            return this.otherProfile
        if (this.otherProfileId)
            return this.otherProfileId == this.profile1.id ? this.profile1 : this.profile2
        if (this.uid1 == Parse.User.current().id)
            return this.profile2
        if (this.uid2 == Parse.User.current().id)
            return this.profile1
        return null
    },
    set: function(obj) {
        this.otherProfile = obj
    }
})

// Alias the functions so the Parse promise matches the Angular API
Parse.Promise.prototype.finally = function(callback) {
    return this.always(callback)
}
Parse.Promise.prototype.catch = function(callback) {
    return this.fail(callback)
}


angular.module('service.parse', ['constants', 'parse-angular'])

.factory('ParseService', function($q, $log, parseAppId, serverUrl, parseMount) {

    $log.log('Initializing Parse at ' + serverUrl + parseMount + '  App Id:' + parseAppId)
    Parse.initialize(parseAppId, 'unused')
    Parse.serverURL = serverUrl + parseMount

    var service = {
        // methods
        init: init,
        facebookLogin: facebookLogin,
        linkedInLogin: linkedInLogin,
        signUp: signUp,
        logIn: logIn,
        autoLogin: autoLogin,
        registerPush: registerPush,
        getTwilioToken: getTwilioToken,
        rebuildMatches: rebuildMatches,
        setPremium: setPremium,
        addCredits: addCredits,
        reloadUser: reloadUser,
        reloadProfile: reloadProfile,
        requestPasswordReset: requestPasswordReset,
        copyFacebookProfile: copyFacebookProfile,
        getUserId: getUserId,
        getProfile: getProfile,
        getProfileOfSelectedUser: getProfileOfSelectedUser,
        getProfileForMatch: getProfileForMatch,
        convertLocation: convertLocation,
        saveSettings: saveSettings,
        saveProfile: saveProfile,
        saveProfileForSomeReason: saveProfileForSomeReason,
        saveFile: saveFile,
        searchProfiles: searchProfiles,
        getProfilesWhoLikeMe: getProfilesWhoLikeMe,
        getProfilesWhoWantsToHaveARelationshipWithMe: getProfilesWhoWantsToHaveARelationshipWithMe,
        processProfile: processProfile,
        processPregnancy: processPregnancy,
        deleteUnmatched: deleteUnmatched,
        getMatches: getMatches,
        getChatMessages: getChatMessages,
        loadChatMessages: loadChatMessages,
        sendChatMessage: sendChatMessage,
        removeMatch: removeMatch,
        reportProfile: reportProfile,
        sendContactMessage: sendContactMessage,
        resetBadge: resetBadge,
        logout: logout,
        deleteAccount: deleteAccount,

        testPushNotification: testPushNotification,
        getProfilesNoCountry: getProfilesNoCountry,

        // admin functions
        getReportedUsers: getReportedUsers,
        getBannedUsers: getBannedUsers,
        getApplyBadgeUsers: getApplyBadgeUsers,
        getReportedUserDetails: getReportedUserDetails,
        deletePhoto: deletePhoto,
        banUser: banUser,
        closeReport: closeReport,
        getProfilesWithPhotosToReview: getProfilesWithPhotosToReview,
        reviewPhoto: reviewPhoto,
        searchUsersByEmail: searchUsersByEmail,
        searchUsersByName: searchUsersByName,
        loadUser: loadUser,
        deleteUser: deleteUser,
        addClinicsQuestion: addClinicsQuestion,
        getClinicsQuestion: getClinicsQuestion,
        delClinicsQuestion: delClinicsQuestion,
        getFindUs: getFindUs,
        addFindUs: addFindUs,
        delFindUs: delFindUs,
        addFindUsReport: addFindUsReport,
        getFindUsReport: getFindUsReport,
        delFindUsReport: delFindUsReport,
        addAboutJab: addAboutJab,
        getAboutJab: getAboutJab,
        getMatchesReport: getMatchesReport,
        getChatMessageReport: getChatMessageReport,

        getProfileNew: getProfileNew,

        //service-provider functions
        getServiceProviders: getServiceProviders,
        addServiceProvider: addServiceProvider,
        delServiceProvider: delServiceProvider,
        setServiceProvider: setServiceProvider,
        getInfoCards: getInfoCards,
        addInfoCard: addInfoCard,
        delInfoCard: delInfoCard,
        getPrServices: getPrServices,
        addPrService: addPrService,
        delPrService: delPrService,
        getHotBeds: getHotBeds,
        addHotBed: addHotBed,
        delHotBed: delHotBed
    }

    return service


    // Constructs the argument for the Parse login from the Facebook response
    function parseFbAuth(fbResponse) {
        var parseFbAuth = {}
        parseFbAuth.id = fbResponse.authResponse.userID
        parseFbAuth.access_token = fbResponse.authResponse.accessToken
        var expiryDate = new Date()
        expiryDate.setSeconds(expiryDate.getSeconds() + fbResponse.authResponse.expiresIn)
        parseFbAuth.expiration_date = expiryDate.toISOString()
        return parseFbAuth
    }


    function init() {
        // $log.info('ParseService.init')
    }

    /**
     * Registers a new user with their email and password
     * @param {string} email
     * @param {string} password
     * @returns {Promise} a promise which resolves if the signup is a success
     */
    function signUp(email, password) {
        // we are using email as the username
        // Parse actually has a separate email field, but you can use an email as the username

        var username = email

        return Parse.User.signUp(username, password, { email: email }).then(function(result) {
            registerPush()
            return result
        }, function(error) {
            // {"code":202,"message":"username user@domain.com already taken"}
            // TODO transform to our own app error
            return Parse.Promise.error(error)
        })
    }

    /**
     * Logs in a user with their email and password
     * @param {string} email
     * @param {string} password
     * @returns {Promise} a promise which resolves if the login is a success
     */
    function logIn(email, password) {
        return Parse.User.logIn(email, password).then(function(result) {
            registerPush()
            return result
        }, function(error) {
            // {"code":101,"message":"invalid login parameters"}
            // TODO transform to our own app error
            return Parse.Promise.error(error)
        })
    }

    /**
     *
     * @param facebookResponse the JSON returned from a Facebook call to getLoginStatus() or login()
     * that has a status of 'connected'
     * @returns {Promise} a promise which will resolve if the user is successfully authenticated
     */
    function facebookLogin(facebookResponse) {
        return Parse.FacebookUtils.logIn(parseFbAuth(facebookResponse)).then(function(result) {
            registerPush()
            return result
        })
    }


    function linkedInLogin(authData) {
        return Parse.Cloud.run('LoadLinkedInMember', { authData: authData })
            .then(sessionToken => Parse.User.become(sessionToken))
            .catch(_unwrapError)
    }

    /**
     * Copies the users Facebook profile data to their Profile object
     * @returns {Promise<IProfile>} A promise resolving to the updates to users profile (to update the cached profile without another server call)
     */
    function copyFacebookProfile() {
        return Parse.Cloud.run('CopyFacebookProfile').catch(_unwrapError)
    }

    function autoLogin() {
        registerPush()
        return Parse.User.current()
    }

    function rebuildMatches() {
        return Parse.Cloud.run('RebuildMatches').catch(_unwrapError)
    }

    /**
     * Gets a Twilio access token
     * @returns {Promise<String>} A promise resolving to the Twilio access token
     */
    function getTwilioToken() {
        return Parse.Cloud.run('GetTwilioToken').catch(_unwrapError)
    }

    /**
     * Registers for the Parse Push notifications by subscribing to a channel named user_<user_id>
     */
    function registerPush() {
        // On a successful authentication register the push notifications
        if (typeof ParsePushPlugin === 'undefined') return // ignore when developing in the browser

        ParsePushPlugin.getInstallationId(
            id => $log.log('Parse Push InstallationId ' + id),
            error => $log.error('ParsePushPlugin getInstallationId error ' + error)
        )

        const channel = 'user_' + Parse.User.current().id
        ParsePushPlugin.subscribe(channel,
            () => $log.log('Subscribed to parse push channel ' + channel),
            error => $log.error('Parse Push subscribe error ' + error)
        )

        ParsePushPlugin.on('receivePN', pushNotification => onNotification(pushNotification))
        ParsePushPlugin.on('openPN', pushNotification => onNotificationOpen(pushNotification))
    }

    /**
     * Set (or un-set) the premium account flag on the user from an in-app purchase
     * @param premium boolean - the premium value to set
     * @param product - the product object returned from the app store. Only required if setting premium to true
     */
    function setPremium(premium, product) {
        if (premium && !product)
            throw 'product must be provided if setting premium to true'
        return Parse.Cloud.run('SetPremium', { premium: premium, product: product }).catch(_unwrapError)
    }

    /**
     * Set (or un-set) the premium account flag on the user from an in-app purchase
     * @param premium boolean - the premium value to set
     * @param product - the product object returned from the app store. Only required if setting premium to true
     */
    function addCredits(product) {
        if (!product)
            throw 'product must be provided'
        return Parse.Cloud.run('SetPremium', { premium: premium, product: product }).catch(_unwrapError)
    }


    /**
     * Reload the user from the server
     * @returns {Promise<User>} A promise which resolves to the current user
     */
    function reloadUser() {
        return Parse.User.current().fetch()
    }

    /**
     * Reload the profile from the server
     * @returns {Promise<IProfile>} A promise which resolves to the profile
     */
    function reloadProfile(profile) {
        return profile.fetch()
    }

    /**
     * @param email the email address for the user to lookup to reset, or if null the current users email
     * @returns {Promise} A promise which resolves if the request to the server completed
     */
    function requestPasswordReset(email) {
        if (!email && Parse.User.current() != null)
            email = Parse.User.current().getEmail()
        return Parse.User.requestPasswordReset(email)
    }

    /**
     * @returns {string} the id of the current user
     */
    function getUserId() {
        return Parse.User.current().id
    }

    /**
     * Loads the profile for the current user, and attempts to create one if it doesn't exist by re-saving the user
     * @returns {IPromise<Profile>} A promise which resolves to the profile of the current user, or null if unavailable
     */
    function getProfile() {
        var user = Parse.User.current()
        var profile = user.profile
        if (profile)
            return profile.fetch() // reload from the server (TODO or cache in localStorage for faster login?)

        $log.debug('Calling LinkProfileToUser')

        return Parse.Cloud.run('LinkProfileToUser')
            .then(profile => {
                profile = fromJSON(profile, 'Profile')
                user.profile = profile
                return profile
            }).catch(_unwrapError)
    }

    /**
     * Loads the profile for the selected unmatched user, and attempts to create one if it doesn't exist by re-saving the user
     * @param profileId the profileId to lookup 
     * @returns {IPromise<Profile>} A promise which resolves to the profile of the selected unmatched user, or null if unavailable for reporting
     */
    function getProfileOfSelectedUser(profileId) {
        return Parse.Cloud.run('GetProfileOfSelectedUser', { profileId: profileId })
            .then(profile => {
                profile = fromJSON(profile, 'Profile')
                return profile
            }).catch(_unwrapError)
    }


    /**
     * Loads a profile for a mutual match
     * @param id the mutual match id
     * @returns {Promise<IProfile>} a promise which resolves to the profile
     */
    function getProfileForMatch(matchId) {
        return Parse.Cloud.run('GetProfileForMatch', { matchId: matchId })
            .then(profile => fromJSON(profile, 'Profile'))
            .catch(_unwrapError)
    }

    /**
     * Converts a latitude and longitude into a Geo object used by the backend, and reducing accuracy for privacy
     * @see http://ngcordova.com/docs/plugins/geolocation/
     * @param location
     * @returns {Parse.GeoPoint}
     */
    function convertLocation(latitude, longitude) {
        // Rounds the locations from the GPS service to 2 decimal places (~1km) for privacy
        // http://stackoverflow.com/questions/7167604/how-accurately-should-i-store-latitude-and-longitude
        // http://blog.includesecurity.com/2014/02/how-i-was-able-to-track-location-of-any.html
        return new Parse.GeoPoint({ latitude: Math.round(latitude * 100) / 100, longitude: Math.round(longitude * 100) / 100 })
    }


    function saveSettings(profile, profileChanges) {
        var mods = { notifyMatch: profileChanges.notifyMatch, notifyMessage: profileChanges.notifyMessage, distanceType: profileChanges.distanceType, distance: profileChanges.distance }
        return profile.save(mods)
    }

    function saveProfile(profile, profileChanges) {
        // Workaround for re-saving file objects. Is this still required?
        // See http://stackoverflow.com/questions/25297590/saving-javascript-object-that-has-an-array-of-parse-files-causes-converting-cir
        if (profileChanges && profileChanges.photos) {
            profileChanges.photos = _.map(profileChanges.photos, file => {
                return { name: file.name, url: file.url(), __type: 'File' }
            })
        }
        if (profileChanges && profileChanges.photosInReview) {
            profileChanges.photosInReview = _.map(profileChanges.photosInReview, file => {
                return { name: file.name, url: file.url(), __type: 'File' }
            })
        }

        if (profileChanges && profileChanges.location) {
            // Convert to the Parse GeoPoint type
            profileChanges.location = convertLocation(profileChanges.location.latitude, profileChanges.location.longitude)

            //address and flags
            if (!ionic.Platform.isIOS() && profileChanges.location.latitude && profileChanges.location.longitude) {
                let geocodingAPI = "http://maps.googleapis.com/maps/api/geocode/json?latlng=" + profileChanges.location.latitude + "," + profileChanges.location.longitude + "&sensor=false&language=en";
                let num = 0
                let addArray
                let addComp

                fetch(geocodingAPI)
                    .then(res => res.json())
                    .then((out) => {
                        if (out['results'][0]) {
                            profileChanges.address = out['results'][0].formatted_address
                            addArray = profileChanges.address.split(',')

                            if (out['results'][8]) num = 8
                            else if (out['results'][7]) num = 7
                            else if (out['results'][6]) num = 6
                            else if (out['results'][5]) num = 5
                            else if (out['results'][4]) num = 4
                            else if (out['results'][3]) num = 3
                            else if (out['results'][2]) num = 2
                            else if (out['results'][1]) num = 1
                            addComp = out['results'][num].address_components

                            if (addComp.length == 1)
                                profileChanges.country = out['results'][num].formatted_address
                            else
                                profileChanges.country = addArray.slice(-1).pop().trim()
                        }
                        return profile.save(profileChanges)
                    })
                    .catch(err => console.error(err));
            }
        }
        return profile.save(profileChanges)
    }

    function saveProfileForSomeReason(profile, profileChanges) {
        return Parse.Cloud.run('SaveProfileForSomeReason', { id: profile.id, profileChanges: profileChanges }).catch(_unwrapError)
    }

    /**
     * Saves a file
     * @param filename the name of the file
     * @param base64 the file data encoded with base64
     * @returns {Promise} a promise which resolves to the file object
     */
    function saveFile(filename, base64) {
        var imgFile = new Parse.File(filename, {
            base64: base64
        })
        $log.log('saving file ' + filename)
        return imgFile.save()
    }


    /**
     * Processes a like/pass of a profile. If its a mutual match, then the Match object will be returned
     * @param {Profile} profile
     * @param {boolean} liked true if the user liked the profile, false if the user passed/rejected
     * @param {boolean} forceConnect true if the action is from an admin wishing to establish connection
     * @returns {Promise<Match>} a promise resolving to a Match if it was a mutual match, else null
     */
    function processProfile(profile, liked, forceConnect) {
        // TODO rename cloud function to ProcessProfile
        return Parse.Cloud.run('ProcessMatch', { otherUserId: profile.uid, liked: liked, forceConnect: forceConnect })
            .then(match => fromJSON(match, 'Match')).catch(_unwrapError)
    }

    /**
     * Processes a impregnate action of a profile. If its a mutual match, then the Match object will be returned
     * @param {Profile} profile
     * @param {boolean} impregnate true if the user sends the pregnancy invitation, false if the user passed/rejected
     * @returns {Promise<Match>} a promise resolving to a Match if it was a mutual match, else null
     */
    function processPregnancy(profile, impregnate) {
        return Parse.Cloud.run('ProcessPregnancy', { otherUserId: profile.uid, impregnate: impregnate })
            .then(match => fromJSON(match, 'Match')).catch(_unwrapError)
    }


    /**
     * Queries for profiles which:
     * 1. Match the search criteria from the current users profile
     * 2. Haven't been liked/passed by the current user
     * 3. Haven't been passed by the other user
     * @param {IProfile} searchParameters the search criteria
     * @returns {Promise<Profile[]>} a promise resolving to an array of profiles
     */
    function searchProfiles(searchParameters) {
        if (!searchParameters)
            $log.error('search parameters were not provided')
            // Can't use a Parse object as a param, so copy the fields. Could copy only the required search fields.
        var searchParams = {};
        for (var i = 0; i < profileFields.length; i++)
            searchParams[profileFields[i]] = searchParameters[profileFields[i]]
        return Parse.Cloud.run('GetMatches', searchParams).catch(_unwrapError)
    }

    /**
     * Loads the mutual matches for the given ids
     * @param {string[]} matchIds An array of the match ids
     * @returns {Promise<IMatch[]>} an array of the mutual matches
     */
    function getMatches(matchIds) {
        if (matchIds.length === 0)
            return $q.when([])

        return Parse.Cloud.run('GetMutualMatches', { matchIds: matchIds })
            // Convert the JSON objects into the proper Parse objects
            .then(matches => _.map(matches, match => {
                let profile = fromJSON(match.otherProfile, 'Profile')
                match = fromJSON(match, 'Match')
                match.otherProfile = profile
                return match
            }))
            .catch(_unwrapError)
    }

    /**
     * Loads the mutual matches for the given ids
     * @returns {Promise<IProfile[]>} an array of the mutual matches
     */
    function getProfilesWhoLikeMe() {
        return Parse.Cloud.run('GetProfilesWhoLikeMe').catch(_unwrapError)
    }

    /**
     * Loads the Profiles who wants to have a relationship with current user.
     * @returns {Promise<IProfile[]>} an array of the mutual matches
     */
    function getProfilesWhoWantsToHaveARelationshipWithMe() {
        return Parse.Cloud.run('GetProfilesWhoWantsToHaveARelationshipWithMe').catch(_unwrapError)
    }


    /**
     * Loads the chat message for a mutual match
     * @param {Match} match
     * @returns {Promise<ChatMessage[]>} a promise resolving to an array of the ChatMessage's
     */
    function getChatMessages(matchId) {
        var messagesQuery = new Parse.Query("ChatMessage")
        var match = Match.createWithoutData(matchId)
        messagesQuery.equalTo("match", match.toPointer())
        messagesQuery.ascending('createdAt')
        messagesQuery.limit(1000) // TODO handle more than 1000
        return messagesQuery.find()
    }


    /**
     * Loads all the chat messages for the match/chats the user is a member of.
     * A date can be provided to load the most recent messages
     * @param {Date} from the date to load the latest messages from, or null to load all
     * @returns {Promise<ChatMessage[]>} a promise resolving to an array of the ChatMessage's
     */
    function loadChatMessages(fromDate) {
        var messagesQuery = new Parse.Query("ChatMessage")
        messagesQuery.equalTo('userIds', getUserId()) // Find where the userIds array contains user.id
        if (fromDate)
            messagesQuery.greaterThan('createdAt', fromDate)
        messagesQuery.ascending('createdAt')
        messagesQuery.limit(1000)
            // TODO handle if more than 1000? If a user logs into an existing account then just loading most recent 1000 could be enough
        return messagesQuery.find()
    }


    /**
     * Send a chat message. This sends a push notification to the recipient.
     * @param {ChatMessage} message
     * @param {string} imageBase64 an image in base64 encoding
     * @param {string} audioBase64 an m4a audio file in base64 encoding
     * @returns {Promise<ChatMessage>} a promise which resolves to the saved/sent message
     */
    function sendChatMessage(message, imageBase64, audioBase64) {
        if (imageBase64 && audioBase64)
            $log.error('Can only attach one of image or audio')

        if (imageBase64) {
            return new Parse.File('chat.png', { base64: imageBase64 }).save()
                .then(function(file) {
                    message.image = file
                    return message.save()
                })
        }

        if (audioBase64) {
            $log.log('saving audio file')
            return new Parse.File('chat.m4a', { base64: audioBase64 }).save()
                .then(function(file) {
                    message.audio = file
                    return message.save()
                })
        }

        return message.save() // text only message
    }



    /**
     * Unmatches an existing mutual match.  Sends a push notification to other user so this match can be removed from their matches too
     * @param {string} matchId the id of the match to remove
     * @returns {Promise} a promise which resolves when the remove is complete
     */
    function removeMatch(matchId) {
        return Parse.Cloud.run('RemoveMatch', { matchId: matchId }).catch(_unwrapError)
    }

    /**
     * Reports a match for spam or inappropriate images/chat
     * @param {Object} profile the profile of the user to report
     * @param {Object} match (optional) the related Match to report about
     * @returns {Promise} a promise which resolves when the match has been reported
     */
    function reportProfile(reason, profile, match) {
        var report = new Report()
        report.reportedBy = getUserId()
        report.reportedUser = profile.uid
        report.profile = profile
        report.reason = reason
        report.match = match
            // $log.log('saving report ' + report.toJSON())
        return report.save()
    }

    function getProfileNew(searchParameters) {
        if (!searchParameters)
            $log.error('search parameters were not provided')
            // Can't use a Parse object as a param, so copy the fields. Could copy only the required search fields.
        var searchParams = {};
        for (var i = 0; i < profileFields.length; i++)
            searchParams[profileFields[i]] = searchParameters[profileFields[i]]
        return Parse.Cloud.run('GetProfilesSpecial', searchParams).catch(_unwrapError)
    }

    /**
     * This is only for test purposes.
     * Delete all the Match objects where only one person has liked or either have rejected
     * @returns {Promise} a promise which resolves when the matches have been deleted
     */
    function deleteUnmatched() {
        return Parse.Cloud.run('DeleteUnmatched').catch(_unwrapError)
    }

    /**
     * Sends a message to the admin/staff
     * @param {string} message - the message from the user
     * @returns {Promise} a promise which resolves when the message has been sent
     */
    function sendContactMessage(message) {
        var contactMessage = new ContactMessage()
        contactMessage.message = message
        return contactMessage.save()
    }

    /**
     * Reset the notification badge number (for iOS)
     * See http://blog.parse.com/announcements/badge-management-for-ios/
     * @returns
     */
    function resetBadge() {
        // if (typeof ParsePushPlugin !== 'undefined' && ionic.Platform.isIOS())
        //     ParsePushPlugin.resetBadge(
        //         () => $log.info('notification badge reset'),
        //         error => $log.error('error resetting badge ' + JSON.stringify(error))
        //     )
    }

    /**
     * Deletes all the matches, messages and profile data for this users account
     * @returns {Promise} a promise which resolves when all the data has been deleted
     */
    function deleteAccount() {
        return Parse.Cloud.run('DeleteAccount').catch(_unwrapError)
    }

    /**
     * Logs the user out and un-subscribes from Push notifications
     */
    function logout() {
        if (typeof ParsePushPlugin != 'undefined' && Parse.User.current()) {
            ParsePushPlugin.unsubscribe('user_' + Parse.User.current().id, function(msg) {
                $log.log('ParsePush unsubscribed')
            }, function(e) {
                $log.log('ParsePush unsubscribe error ' + e)
            })
        }
        return Parse.User.logOut()
    }


    // Debug functions

    function testPushNotification() {
        return Parse.Cloud.run('TestPushNotification').catch(_unwrapError)
    }

    function getProfilesNoCountry() {
        return Parse.Cloud.run('GetProfilesNoCountry').then(profiles => _.map(profiles, profile => {
            profile = fromJSON(profile, 'Profile')
            return profile
        })).catch(_unwrapError)
    }


    // Admin user functions

    function getReportedUsers() {
        return Parse.Cloud.run('GetReportedUsers')
            .then(reports => _.map(reports, toId))
            .catch(_unwrapError)
    }

    function getBannedUsers() {
        return Parse.Cloud.run('GetBannedUsers')
            .then(reports => _.map(reports, toId))
            .catch(_unwrapError)
    }

    function getApplyBadgeUsers() {
        return Parse.Cloud.run('GetApplyBadgeUsers')
            .then(profiles => _.map(profiles, profile => {
                let profileLocal = fromJSON(profile, 'Profile')
                return profileLocal
            }))
            .catch(_unwrapError)
    }

    function getReportedUserDetails(report) {
        return Parse.Cloud.run('GetReportedUserDetails', { reportedBy: report.reportedBy.id, reportedUser: report.reportedUser.id })
            .then(report => toId)
            .catch(_unwrapError)
    }

    function deletePhoto(reportId, photoUrl) {
        return Parse.Cloud.run('DeletePhoto', { reportId: reportId, photoUrl: photoUrl }).catch(_unwrapError)
    }

    function banUser(userId) {
        return Parse.Cloud.run('BanUser', { userId: userId }).catch(_unwrapError)
    }

    function closeReport(reportId, action) {
        return Parse.Cloud.run('CloseReport', { reportId: reportId, action: action }).catch(_unwrapError)
    }

    function searchUsersByEmail(email) {
        return Parse.Cloud.run('SearchUsersByEmail', { email: email }).catch(_unwrapError)
    }

    function searchUsersByName(name) {
        return Parse.Cloud.run('SearchUsersByName', { name: name }).catch(_unwrapError)
    }

    function loadUser(userId) {
        return Parse.Cloud.run('LoadUser', { userId: userId }).catch(_unwrapError)
    }

    function deleteUser(userId) {
        return Parse.Cloud.run('DeleteUser', { userId: userId }).catch(_unwrapError)
    }

    function getProfilesWithPhotosToReview() {
        return Parse.Cloud.run('GetProfilesWithPhotosToReview')
            .then(profiles => _.map(profiles, toId))
            .catch(_unwrapError)
    }

    function reviewPhoto(profileId, fileUrl, approved) {
        return Parse.Cloud.run('ReviewPhoto', { profileId: profileId, fileUrl: fileUrl, approved: approved }).catch(_unwrapError)
    }

    function addClinicsQuestion(clinicQuestion) {
        return Parse.Cloud.run('AddClinicsQuestion', { clinicQuestion: clinicQuestion }).catch(_unwrapError)
    }

    function getClinicsQuestion() {
        return Parse.Cloud.run('GetClinicsQuestion').catch(_unwrapError)
    }

    function delClinicsQuestion(id) {
        return Parse.Cloud.run('DelClinicsQuestion', { id: id }).catch(_unwrapError)
    }

    function addFindUs(findUs) {
        return Parse.Cloud.run('AddFindUs', { findUs: findUs }).catch(_unwrapError)
    }

    function getFindUs() {
        return Parse.Cloud.run('GetFindUs').catch(_unwrapError)
    }

    function delFindUs(id) {
        return Parse.Cloud.run('DelFindUs', { id: id }).catch(_unwrapError)
    }

    function addFindUsReport(findUsVotes) {
        return Parse.Cloud.run('AddFindUsReport', { findUsVotes: findUsVotes }).catch(_unwrapError)
    }

    function getFindUsReport() {
        return Parse.Cloud.run('GetFindUsReport').catch(_unwrapError)
    }

    function delFindUsReport(id) {
        return Parse.Cloud.run('DelFindUsReport', { id: id }).catch(_unwrapError)
    }

    function addAboutJab(about) {
        return Parse.Cloud.run('AddAboutJab', { about: about }).catch(_unwrapError)
    }

    function getAboutJab() {
        return Parse.Cloud.run('GetAboutJab').catch(_unwrapError)
    }

    function getMatchesReport(numDays) {
        return Parse.Cloud.run('GetMatchesReport', { numDays: numDays }).catch(_unwrapError)
    }

    function getChatMessageReport(numDays) {
        return Parse.Cloud.run('GetChatMessageReport', { numDays: numDays }).catch(_unwrapError)
    }


    //Service Provider functions
    function getServiceProviders() {
        return Parse.Cloud.run('GetServiceProviders').catch(_unwrapError)
    }

    function addServiceProvider(serviceProvider) {
        return Parse.Cloud.run('AddServiceProvider', { serviceProvider: serviceProvider }).catch(_unwrapError)
    }

    function delServiceProvider(id) {
        return Parse.Cloud.run('DelServiceProvider', { id: id }).catch(_unwrapError)
    }

    function setServiceProvider(is_set, user) {
        return Parse.Cloud.run('SetServiceProvider', { is_set:is_set, user: user }).catch(_unwrapError)
    }

    function getInfoCards(pid) {
        return Parse.Cloud.run('GetInfoCards', { provider_id: pid }).catch(_unwrapError)
    }

    function addInfoCard(infoCard) {
        return Parse.Cloud.run('AddInfoCard', { infoCard: infoCard }).catch(_unwrapError)
    }

    function delInfoCard(id) {
        return Parse.Cloud.run('DelInfoCard', { id: id }).catch(_unwrapError)
    }

    function getPrServices(pid) {
        return Parse.Cloud.run('GetPrServices', { provider_id: pid }).catch(_unwrapError)
    }

    function addPrService(prService) {
        return Parse.Cloud.run('AddPrService', { prService: prService }).catch(_unwrapError)
    }

    function delPrService(id) {
        return Parse.Cloud.run('DelPrService', { id: id }).catch(_unwrapError)
    }

    function getHotBeds(pid) {
        return Parse.Cloud.run('GetHotBeds', { provider_id: pid }).catch(_unwrapError)
    }

    function addHotBed(hotBed) {
        return Parse.Cloud.run('AddHotBed', { hotBed: hotBed }).catch(_unwrapError)
    }

    function delHotBed(id) {
        return Parse.Cloud.run('DelHotBed', { id: id }).catch(_unwrapError)
    }


    // Private functions

    /**
     * Converts a Parse object in the JSON format (i.e. whats returned from ParseObject.toJSON()) back to the
     * full Parse object
     */
    function fromJSON(object, className) {
        if (!object) {
            $log.debug('fromJSON object is null for ' + className)
            return null
        }
        object.className = className
        return Parse.Object.fromJSON(object)
    }

    /**
     * Converts the internal mongo objectId to the Parse id
     * @param object
     * @returns {*}
     */
    function toId(object) {
        object.id = object.objectId
        return object
    }

    /**
     * Parse cloud functions only return a string as an error.  If we have returned a JSON string from response.error()
     * then try to return the parsed object
     * @param error an error from a cloud function
     * @returns {*}
     */
    function _unwrapError(error) {
        $log.debug('unwrapping ' + JSON.stringify(error))

        // 141 is SCRIPT_ERROR, including when response.error() was called
        if (error.code === 141) {
            if (_.isNumber(error.message.code)) {
                // An error object was returned as the message
                error = error.message
            } else if (_.isString(error.message) && error.message.startsWith('{')) {
                // There's an error object as a string
                try {
                    error = JSON.parse(error.message)
                    return $q.reject(error)
                } catch (e) {
                    $log.debug('Error parsing unwrapped error ' + e)
                }
            }
            if (error.message == 'function not found')
                $log.error('Cloud function not found. Is the latest Cloud Code deployed?')
        }
        return $q.reject(error)
    }


});