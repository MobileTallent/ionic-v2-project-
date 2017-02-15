// Callback for push notifications, which passes it into the Angular code
function onNotification(pnObj) {
    var appService = angular.element(document.body).injector().get('AppService')
    var $log = angular.element(document.body).injector().get('$log')
    $log.log("Received push notification: " + JSON.stringify(pnObj))

    if (pnObj.type == 'message')
        appService.synchronizeChatMessages()
    else if (pnObj.type == 'match')
        appService.synchronizeMutualMatches()
    else if (pnObj.type == 'removeMatch')
        appService.removeMatchNotification(pnObj.matchId, pnObj.userId)
    else if (pnObj.type == 'reloadProfile')
        appService.reloadProfile()
    else if (pnObj.type == 'accountBanned')
        appService.logout()
    else if (pnObj.type == 'test')
        $log.log('Test push notification received')
}

function onNotificationOpen(pnObj) {
    var state = angular.element(document.body).injector().get('$state')
    var $log = angular.element(document.body).injector().get('$log')
    $log.log("Opened push notification: " + JSON.stringify(pnObj))

    if (pnObj.type === 'message') {
        $log.log('going to menu.chat ' + pnObj.message.match.id)
        state.go('menu.chat', { matchId: pnObj.message.match.id })
    } else if (pnObj.type === 'match') {
        $log.log('going to menu.match-profile ' + pnObj.matchId)
        state.go('menu.match-profile', { matchId: pnObj.matchId })
    } else if (pnObj.type === 'newLikes') {
        $log.log('going to menu.likedMe')
        state.go('menu.likedMe')
    }
}


(function() {

    angular.module('service.app', ['ngCordova', 'service.parse', 'service.localdb'])
        .factory('AppService', function($rootScope, $timeout, $http, $cordovaFacebook, $cordovaGeolocation, $cordovaMedia,
            $log, $state, $q, $ionicHistory, ParseService, LocalDB, $localStorage, $interval,
            $analytics, $translate, adMob, $cordovaBadge) {

            var server = ParseService

            // keep a reference to the mutual matches so we can update when a push notification arrives for a new match
            var matches = []

            // Contains the match/chat ids which have unread chat messages as properties
            var unreadChats = {}
                // The total number of matches/chats that have unread messages. This must be updated when unreadChats is updated
            var unreadChatsCount = 0

            var profileCache = {}

            // keep a reference to the current chat messages so we can update when a push notification arrives
            var activeChatMatchId = null
            var activeChatMessages = null

            // If true then photos need to be approved by an admin before they are visible on the users public profile
            var MODERATE_PROFILE_PHOTOS = false

            // Variables for the polling when push notifications haven't been detected
            const CHAT_SYNC_INTERVAL = 5000
            const MATCH_SYNC_RATIO = 2 // After how many chat syncs we should also sync the matches
            var syncCount = 0
            var synchronizeInterval = null

            var matchSyncInProgress = false
            var matchSyncInRequested = false
            var chatSyncInProgress = false
            var chatSyncInRequested = false
            var isAcntDelete = false

            var service = {
                // fields
                isLoggedIn: false,
                user: null,
                userId: '',
                fbId: '',
                profile: null,
                profileSearchResults: null,
                twilioAccessToken: null,
                // methods
                init: init,
                facebookLogin: facebookLogin,
                linkedInLogin: linkedInLogin,
                signUp: signUp,
                logIn: logIn,
                autoLogin: autoLogin,
                reloadUser: reloadUser,
                reloadProfile: reloadProfile,
                isEmailVerified: isEmailVerified,
                termsOfUseAgreed: termsOfUseAgreed,
                requestPasswordReset: requestPasswordReset,
                goToNextLoginState: goToNextLoginState,
                loadProfile: loadProfile,
                getProfile: getProfile,
                getProfileById: getProfileById,
                getProfileByUserId: getProfileByUserId,
                getProfileByMatchId: getProfileByMatchId,
                saveBirthdate: saveBirthdate,
                saveProfile: saveProfile,
                saveSettings: saveSettings,
                enableDiscovery: enableDiscovery,
                getCurrentPosition: getCurrentPosition,
                copyFacebookProfile: copyFacebookProfile,
                setPhoto: setPhoto,
                getProfileSearchResults: getProfileSearchResults,
                updateProfileSearchResults: updateProfileSearchResults,
                getProfilesWhoLikeMe: getProfilesWhoLikeMe,
                getProfilesWhoWantsToHaveARelationshipWithMe: getProfilesWhoWantsToHaveARelationshipWithMe,
                clearProfileSearchResults: clearProfileSearchResults,
                removeMatchNotification: removeMatchNotification,
                deleteUnmatched: deleteUnmatched,
                processMatch: processMatch,
                processPregnancy: processPregnancy,
                getMutualMatches: getMutualMatches,
                getMatch: getMatch,
                getActiveChat: getActiveChat,
                setChatRead: setChatRead,
                getUnreadChatsCount: getUnreadChatsCount,
                sendChatMessage: sendChatMessage,
                removeMatch: removeMatch,
                reportProfile: reportProfile,
                synchronizeMutualMatches: synchronizeMutualMatches,
                synchronizeChatMessages: synchronizeChatMessages,
                resetBadge: resetBadge,
                sendContactMessage: sendContactMessage,
                logout: logout,
                deleteAccount: deleteAccount,

                testPushNotification: testPushNotification,

                // Admin functions
                getReportedUsers: getReportedUsers,
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
                delFindUsReport: delFindUsReport
            }

            return service


            function init() {
                return $q.all(
                    LocalDB.init(), server.init()
                )
            }

            function facebookLogin(facebookResponse) {
                $analytics.eventTrack('facebookLogin')
                return server.facebookLogin(facebookResponse).then(user => {
                    service.userId = user.id
                    return postLogin(user)
                })
            }

            function linkedInLogin(authData) {
                $analytics.eventTrack('linkedInLogin')
                return server.linkedInLogin(authData).then(user => {
                    service.userId = user.id
                    return postLogin(user)
                })
            }

            function signUp(email, password) {
                $analytics.eventTrack('signupEmail')
                return server.signUp(email, password).then(user => {
                    service.userId = user.id
                    return postLogin(user)
                })
            }

            function logIn(email, password) {
                $analytics.eventTrack('loginEmail')
                return server.logIn(email, password).then(user => {
                    service.userId = user.id
                    return postLogin(user)
                })
            }

            function autoLogin() {
                // TODO should reload the user and handle errors in the caller
                var user = server.autoLogin()
                reloadUser()
                postLogin(user)
            }

            /**
             * @returns {Promise<IUser>|IUser}
             */
            function postLogin(user) {
                service.user = user
                LocalDB.userId = user.id
                LocalDB.getProfiles().then(profiles => {
                    for (let profile of profiles)
                        profileCache[profile.id] = profile

                    return LocalDB.getMatches()
                }).then(dbMatches => {
                    for (let match of dbMatches) {
                        // TODO GROUP_CHAT for group chat get the profile of the latest sender
                        match.otherProfile = profileCache[match.get('otherProfileId')]
                        if (!getMatch(match.id))
                            matches.push(match)
                        else
                            $log.error('Found duplicate when loading matches from LocalDB')
                    }

                    return refreshUnreadCount()
                }).then(null, error => $log.error('Error loading local db data ' + JSON.stringify(error)))

                if (user.admin)
                    $rootScope.isAdmin = true
                $log.log('logged in with ' + JSON.stringify(user))

                server.getTwilioToken().then(
                    result => {
                        if (result) {
                            $log.info('Aquired twilio token')
                            service.twilioAccessToken = result.token
                            $rootScope.$broadcast('twilioAccessToken', result.token)
                        } else {
                            $log.info('Twilio is not configured. getTwilioToken returned null')
                        }

                    },
                    error => {
                        if (error === 'NOT_CONFIGURED') // This is legacy now. Returns successfull empty/null if not configured
                            $log.info('Twilio not configured')
                        else
                            $log.error('Error getting twilio token ' + JSON.stringify(error))
                    }
                )

                initInAppPurchases()
                initAdMob()

                return user
            }

            function refreshUnreadCount() {
                LocalDB.getUnreadChats().then(function(result) {
                    console.log('LocalDB.getUnreadChats() ' + JSON.stringify(result))
                    unreadChats = result
                    unreadChatsCount = _.keys(unreadChats).length
                    $log.log('unread count ' + unreadChatsCount)
                    $rootScope.$broadcast('unreadChatsCountUpdated')
                    if (typeof cordova !== 'undefined')
                        $cordovaBadge.set(unreadChatsCount).then(null, error => $log.info(error))
                    return unreadChatsCount
                })
            }

            function initAdMob() {
                if (typeof AdMob === 'undefined') {
                    $log.info('AdMob plugin is not installed')
                    return
                }
                // AdMob code
                $log.info('Checking AdMob configuration...')
                    // select the right Ad Id according to platform
                let adMobIds = null
                if (/(android)/i.test(navigator.userAgent)) { // for android & amazon-fireos
                    if (adMob.android && adMob.android.banner && adMob.android.interstitial) {
                        adMobIds = adMob.android
                        $log.info('Using Android AdMob ids')
                    }
                } else if (/(ipod|iphone|ipad)/i.test(navigator.userAgent)) { // for ios
                    if (adMob.ios && adMob.ios.banner && adMob.ios.interstitial) {
                        adMobIds = adMob.ios
                        $log.info('Using iOS AdMob ids')
                    }
                } else { // for windows phone
                    // Possibly support in the future
                    //if (adMob.wp && adMob.wp.banner && adMob.wp.interstitial) {
                    //    adMobIds = adMob.wp
                    //    $log.info('Using WP AdMob ids')
                    //}
                }
                // AdMob is the AdMob plugin variable
                if (adMobIds && AdMob) {
                    $log.info('Creating AdMob banner')
                    AdMob.createBanner({
                        adId: adMobIds.banner,
                        position: AdMob.AD_POSITION.BOTTOM_CENTER,
                        autoShow: true
                    })
                }
            }


            function initInAppPurchases() {
                if (typeof store === 'undefined') {
                    $log.info('In-app purchase plugin is not installed')
                    return
                }

                if (true) return // delete this line one you've configured your in-app purchases

                // A consumable 100 credits product
                store.register({
                    id: 'com.company.product.consumable100',
                    alias: '100 credits',
                    type: store.CONSUMABLE
                })

                // A non-consumable (one-off) 'Full/Pro version' product
                store.register({
                    id: 'com.company.product.pro',
                    alias: 'pro version',
                    type: store.NON_CONSUMABLE
                })

                // A paid subscription 'subscription' product
                store.register({
                    id: 'com.company.product.subscription',
                    alias: 'subscription',
                    type: store.PAID_SUBSCRIPTION
                })

                // Now configure event listeners:
                // ------------------------------

                // When any product gets updated, its details are passed to your app
                store.when('product').updated(product => {
                    $log.log('store when product ' + JSON.stringify(product))
                        // This is a good place to prepare or render the UI based on these refreshed details:
                    if (product.valid) {
                        var productId = product.id // call store.order(productId) to buy this product
                        var title = product.title
                        var description = product.description
                        var canPurchase = product.canPurchase
                        var price = p.price // in the currency of the users App Store account
                    }
                })

                // You can also listen to the 'updated' event for individual products like this
                store.when('subscription').updated(product => {
                    $log.log('store updated subscription ' + JSON.stringify(product))

                    server.setPremium(product.owned, product).then(() => {
                        product.finish()
                    })

                    // the same details as the function above are passed in with the p object
                })

                // When the pro version is purchased
                store.when('pro version').approved(product => {
                    server.setPremium(true, product).then(() => {
                        service.user.premium = true
                        product.finish()
                    })
                    alert("You got an additional 100 coins!")

                })

                // When the purchase of 100 coins is approved, show an alert
                store.when('100 credits').approved(product => {
                    server.addCredits(true, product).then(() => {
                        service.user.credits = service.user.credits + 100
                        product.finish()
                    })
                })

                // When the store is ready all products are loaded and in their "final" state.
                store.ready(() => {
                    $log.log('In-app purchases store is ready')
                })

                store.error(error => {
                    AppUtil.toastSimpleTranslate('IN_APP_PURCHASE_ERROR')
                    $log.error('App Store error ' + error.code + ': ' + error.message)
                })

                // This will contact the server to check all registered products validity and ownership status.
                // It's mostly fine to do this only at application startup but you can refresh it more often.
                store.refresh()
            }


            /**
             * Reload the user object from the server
             * @returns {Promise<User>}
             */
            function reloadUser() {
                return server.reloadUser()
            }

            /**
             * Reload the profile from the server, e.g. for when its been modified server side
             * @returns {Promise<IProfile>}
             */
            function reloadProfile() {
                if (service.profile) {
                    $log.log('reloading profile')
                    return server.reloadProfile(service.profile).then(function(profile) {
                        initCurrentUserProfile(profile)
                        $log.log('reloaded profile to ' + JSON.stringify(profile))
                        server.profile = profile
                        return server.profile
                    })
                }
            }

            function initCurrentUserProfile(profile) {
                // When returning search/match profiles the age is calculated server side and returned
                // For the current user profile we need to calculate the age
                if (profile.birthdate && !profile.age)
                    profile.age = new Date(new Date - new Date(profile.birthdate)).getFullYear() - 1970
            }

            function isEmailVerified() {
                return server.reloadUser().then(function(user) {
                    return user.emailVerified === true
                })
            }


            /**
             * Set that the user has agreed to the terms of use
             * @returns {IPromise<void>}
             */
            function termsOfUseAgreed() {
                $localStorage.termsOfUseAgreed = true
                return $q.when()
            }

            function requestPasswordReset(email) {
                $analytics.eventTrack('passwordReset')
                return server.requestPasswordReset(email)
            }

            /**
             * Loads the profile for the current user. Returns a promise as it will need call the serve the first time.
             * @returns {Promise<IProfile>}
             */
            function loadProfile() {
                if (service.profile)
                    return $q.when(service.profile)

                return server.getProfile()
                    .then(function(result) {
                        if (!result)
                            return null

                        initCurrentUserProfile(result)

                        $log.log('AppService server.getProfile returned ' + JSON.stringify(result))
                        service.profile = result
                        return service.profile
                    })
            }

            /**
             * Get the profile for the current user. loadProfile() must be called before this is called.
             * @returns {IProfile}
             */
            function getProfile() {
                return service.profile
            }


            /**
             * Get the profile for a mutual match
             * @param matchId the mutual match id
             * @returns {Promise<IProfile>}
             */
            function getProfileByMatchId(matchId) {
                $log.debug('getProfileByMatchId ' + matchId)

                let match = _.find(matches, 'id', matchId)
                if (match) {
                    let profileId = match.get('otherProfileId')
                    if (!profileId)
                        profileId = match.profileId
                    let profile = profileCache[profileId]
                    if (profile) {
                        // Refresh the profile asynchronously every hour at most
                        if (!profile.refreshedAt || profile.refreshedAt < Date.now() - 1000 * 60 * 60) {
                            server.getProfileForMatch(matchId).then(refreshedProfile => {
                                $log.debug('refreshed profile ' + refreshedProfile.id + ' from the server')
                                refreshedProfile.refreshedAt = Date.now()
                                profileCache[refreshedProfile.id] = refreshedProfile
                                _.assign(profile, refreshedProfile)
                            })
                        }
                        return $q.when(profile)
                    }
                }

                $log.log('getProfileByMatchId going to the server')
                return server.getProfileForMatch(matchId).then(profile => {
                    profileCache[profile.id] = profile
                    return profile
                })
            }


            function getProfileById(profileId) {
                return profileCache[profileId]
            }

            function getProfileByUserId(userId) {
                return _.find(profileCache, 'uid', userId)
            }


            function goToNextLoginState() {

                var user = service.user

                if (user.status == 'banned') {
                    go('banned')
                    return
                }

                // If users have authenticated with Facebook then don't require email verification
                // Note: there are three states to emailVerified in Parse. undefined means it is not required, eg user signed up before email verification was enabled
                if (!$rootScope.facebookConnected && user.emailVerified === false) {
                    go('emailVerification')
                    return
                }

                if (!isProfileValid()) {
                    go('profileSetup')
                    return
                }

                if (!getProfile().location) {
                    go('locationSetup')
                    return
                }

                if (!$localStorage.termsOfUseAgreed) {
                    go('termsOfUse')
                    return
                }

                // TODO welcome/intro slides

                startSynchronisation()

                go('menu.home')
            }

            function go(state) {
                $ionicHistory.nextViewOptions({
                    historyRoot: true,
                    disableBack: true
                })
                $state.go(state)
            }

            /**
             * Syncs to the server and starts the polling synchronization if required
             */
            function startSynchronisation() {

                var syncFunction = () => {
                    if (++syncCount === MATCH_SYNC_RATIO) {
                        syncCount = 0
                        synchronizeMutualMatches()
                    } else {
                        synchronizeChatMessages()
                    }
                }

                // Sync on startup
                $log.debug('Performing initial data sync')
                synchronizeMutualMatches().finally(synchronizeChatMessages)

                // Check if we need to start polling for updates
                if (!synchronizeInterval) {
                    $log.log('Starting data synchronization timer')
                        // Start an interval timer to sync periodically
                    synchronizeInterval = $interval(syncFunction, CHAT_SYNC_INTERVAL)
                }
            }


            /**
             * @returns {boolean} if the profile contains the all minimum data required to use the main application
             */
            function isProfileValid() {
                return service.profile.birthdate && service.profile.name && service.profile.gender
            }


            function getCurrentPosition() {
                // see http://stackoverflow.com/questions/3397585/navigator-geolocation-getcurrentposition-sometimes-works-sometimes-doesnt
                $log.log('getCurrentPosition()')

                var timeout = 10000
                var q = $q.defer()

                var geolocFail = function() {
                    $log.log('$cordovaGeolocation.getCurrentPosition did not return within the timeout')
                    q.reject('GEO_ERROR')
                }
                var timer = $timeout(geolocFail, timeout + 1000) // wait an extra second longer than the expected geo timeout

                $cordovaGeolocation.getCurrentPosition().then(function(location) {
                    $timeout.cancel(timer)
                    $log.log('location ' + JSON.stringify(location))
                    var geoPoint = server.convertLocation(location.coords.latitude, location.coords.longitude)
                    q.resolve(geoPoint)
                }, function(error) {
                    $timeout.cancel(timer)
                    $log.log('getCurrentPosition error: ' + JSON.stringify(error))

                    //if(error.code == 1){
                    //	alert('You have denied app access to location');
                    //} else {
                    //	alert('code: '    + error.code    + '\n' +
                    //	'message: ' + error.message + '\n');
                    //}

                    q.reject('GEO_ERROR')
                }, { maximumAge: 3600000, timeout: timeout, enableHighAccuracy: true })

                return q.promise

                // simple way without wrapping in a timer
                //return $cordovaGeolocation.getCurrentPosition().then(function(location){
                //	$log.log(JSON.stringify(location))
                //	return server.convertLocation(location.coords.latitude, location.coords.longitude)
                //}, function(error){
                //	$log.log('position error: ' + JSON.stringify(error))
                //	return $q.reject(error)
                //}, { maximumAge: 1000000, timeout: 2000, enableHighAccuracy: true })
            }

            function saveSettings(profile) {
                var mods = { notifyMatch: profile.notifyMatch, notifyMessage: profile.notifyMessage, distanceType: profile.distanceType }
                return server.saveSettings(service.profile, mods)
                    .then(function(result) {
                        $log.log('saveSettings result:' + JSON.stringify(result))
                        return service.profile
                    })
            }

            /**
             * Update the user profile with their Facebook profile data
             * @returns {ng.IPromise<IProfile>} the user profile
             */
            function copyFacebookProfile() {
                return server.copyFacebookProfile().then(profile => {
                    service.profile = profile
                    return service.profile
                })
            }

            function enableDiscovery() {
                return saveProfile({ enabled: true })
            }

            /**
             *
             * @param profileChanges the changes to save, or null if a new profile
             * @returns {IPromise<TResult>}
             */
            function saveProfile(profileChanges) {
                $log.log('saving profile')

                return server.saveProfile(service.profile, profileChanges)
                    .then(function(result) {
                        return service.profile
                    })
            }

            function logout() {
                $analytics.eventTrack('logout')
                service.userId = null
                service.fbId = null
                service.profile = null
                matches = []
                profileCache = {}
                activeChatMatchId = null
                activeChatMessages = null
                unreadChats = {}
                unreadChatsCount = 0
                if (synchronizeInterval) {
                    $interval.cancel(synchronizeInterval)
                    synchronizeInterval = null
                }
                // TODO wait for all the server/fb logout calls to complete before going to sign-in
                server.logout()
                localStorage.clear()
                $localStorage.$reset()
                if (isAcntDelete)
                    LocalDB.deleteDb() //JUS-226
                    // TODO do we need to clear the image cache?
                if ($rootScope.facebookConnected) {
                    $log.log('logging out of Facebook')
                    $cordovaFacebook.logout().then(function(result) {
                        $log.log('logged out of facebook')
                        delete $rootScope.facebookConnected
                        delete $rootScope.fbAccessToken
                    }, function(error) {
                        // possible message from FB JS: FB.logout() called without an access token.
                        $log.log('error logging out of Facebook ' + JSON.stringify(error))
                    })
                }

                $ionicHistory.clearCache()
                $ionicHistory.nextViewOptions({
                    disableBack: true
                })
                $state.go('signin')
            }

            function deleteAccount() {
                $analytics.eventTrack('deleteAccount')
                isAcntDelete = true
                return server.deleteAccount().then(
                    () => {
                        logout() // do a best effort logout now the user object is destroyed
                        return
                    }
                )
            }

            function deleteUnmatched() {
                return server.deleteUnmatched()
            }

            /**
             * Process a like/pass on a profile
             * @param profile
             * @param {boolean} liked
             * @returns {Promise.<T>}
             */
            function processMatch(profile, liked) {
                $analytics.eventTrack('swipe', { liked: liked ? 'true' : 'false' })
                return server.processProfile(profile, liked).then(function(match) {
                    $log.log('processed match action')
                        // If it's a mutual match then run a mutual match sync
                    if (match && match.state === 'M') {
                        synchronizeMutualMatches()
                    }
                }, function(error) {
                    $log.error('error processing match ' + JSON.stringify(error))
                })
            }

            /**
             * Process a pregnancy invitation on a profile
             * @param profile
             * @param {boolean} impregnate
             * @returns {Promise.<T>}
             */
            function processPregnancy(profile, impregnate) {
                $analytics.eventTrack('processPregnancy', { impregnate: impregnate ? 'true' : 'false' })
                return server.processPregnancy(profile, impregnate).then(function(match) {
                    $log.log('processed impregnate action' + match)
                        // If it's a mutual match then run a mutual match sync
                        // if(match && match.state === 'M') {
                        // 	synchronizeMutualMatches()
                        // }
                }, function(error) {
                    $log.error('error processing pregnancy invitation ' + JSON.stringify(error))
                })
            }

            /**
             * Call when the this user removes a matched user
             * @param matchId
             */
            function removeMatch(matchId) {
                $analytics.eventTrack('removeMatch')
                $log.log('removeMatch ' + matchId)
                return server.removeMatch(matchId).then(function(result) {
                    // remove the match from our local db and memory copy
                    LocalDB.deleteMatch(matchId)
                    _.remove(matches, { id: matchId })
                })
            }


            /**
             * Called when the other user removes this user (either via push notification or server sync)
             * Either matchId or userId must be provided
             * @param matchId the id of the match
             * @param userId the user if of the match to remove
             */
            function removeMatchNotification(matchId, userId) {
                $log.log('removeMatchNotification matchId:' + matchId + ' userId:' + userId)
                if (!matches)
                    return
                    // If we have the userId then lookup the matchId
                if (userId && !matchId) {
                    let match = _.find(matches, match => match.uid1 === userId || match.uid2 === userId)
                    if (!match) {
                        $log.error('Could not find match with userId ' + userId + ' to remove from notification')
                        return
                    }
                    matchId = match.id
                }

                _.remove(matches, { id: matchId })
                if (activeChatMatchId == matchId) {
                    activeChatMatchId = null
                    activeChatMessages = null
                    $log.log('cleared active chat from remove notification')
                }
                LocalDB.deleteMatch(matchId)
                $rootScope.$broadcast('chatsUpdated', matchId)
            }


            function getProfileSearchResults() {
                return service.profileSearchResults
            }

            function updateProfileSearchResults() {
                $analytics.eventTrack('searchProfiles')
                return server.searchProfiles(service.profile).then(function(profiles) {
                    service.profileSearchResults = profiles
                    $rootScope.$broadcast('newProfileSearchResults')
                    return service.profileSearchResults
                })
            }

            /**
             *
             * @returns {Promise.<IProfile[]>}
             */
            function getProfilesWhoLikeMe() {
                return server.getProfilesWhoLikeMe()
            }

            /**
             *
             * @returns {Promise.<IProfile[]>}
             */
            function getProfilesWhoWantsToHaveARelationshipWithMe() {
                return server.getProfilesWhoWantsToHaveARelationshipWithMe()
            }

            /**
             * Clear the existing search results, e.g. when changing the search settings
             */
            function clearProfileSearchResults() {
                service.profileSearchResults = null
            }


            function getMutualMatches() {
                $log.log('getMutualMatches()')
                return matches
            }

            /**
             * Load the mutual matches from the server and update our local copy
             * @returns {Promise<IMatch[]> any new mutual matches
             */
            function synchronizeMutualMatches() {

                if (matchSyncInProgress) {
                    $log.debug('Match sync already in progress. requesting...')
                    matchSyncInRequested = true
                    return $q.when()
                }
                matchSyncInProgress = true

                var toAdd
                var matchesChanged = false

                $log.debug('synchronizeMutualMatches()')
                    // Reloading the user refreshes the User.matches property which is the array of the mutual match id's
                return server.reloadUser().then(user => {

                    var localMatchIds = _.pluck(matches, 'id')
                    var serverMatchIds = user.matches
                    var toRemove = _.difference(localMatchIds, serverMatchIds)
                    toAdd = _.difference(serverMatchIds, localMatchIds)
                    matchesChanged = toAdd.length || toRemove.length
                    $log.debug('Found ' + toRemove.length + ' mutual matches to remove')
                    $log.debug('Found ' + toAdd.length + ' mutual matches to add')

                    // Ok to remove these async in the background. It should complete by the following server call anyway.
                    for (let removeId of toRemove)
                        removeMatchNotification(removeId)

                    return server.getMatches(toAdd)

                }).then(newMatches => {
                    $log.debug('loaded ' + newMatches.length + ' matches to sync')

                    if (toAdd.length !== newMatches.length) { // if the User.matches is out of sync, then rebuilt it
                        $log.info('Rebuilding matches')
                        server.rebuildMatches()
                    }

                    for (let match of newMatches) {
                        if (!getMatch(match.id)) {
                            console.log('storing new match ' + match.id)
                            let profile = match.profile
                            match.lastMessage = 'Matched on ' + dateFormat(match.createdAt, 'd mmm')
                            match.read = false
                            matches.unshift(match)
                            LocalDB.saveMatch(match, profile)
                            profileCache[profile.id] = profile
                        } else {
                            $log.info('Match ' + match.id + ' already stored')
                        }
                    }

                    if (newMatches.length) {
                        $log.debug('broadcasting newMatch id:' + newMatches[0].id)
                        $rootScope.$broadcast('newMatch', newMatches[0])

                        if (service.profile.notifyMatch)
                            playSound('audio/match-notification.mp3')
                    }

                    if (matchesChanged) {
                        $rootScope.$broadcast('chatsUpdated')
                        refreshUnreadCount()
                    }

                    return newMatches

                }).then(newMatches => newMatches, error => {
                    $log.error('Error synching matches ' + JSON.stringify(error))
                    return $q.reject(error)
                }).finally(() => {
                    $log.log('Match sync complete')
                    matchSyncInProgress = false
                    if (matchSyncInRequested) {
                        $log.log('Additional match sync requested')
                        matchSyncInRequested = false
                        $timeout(synchronizeMutualMatches)
                    }
                })
            }

            /**
             * Loads the chat messages from the server since the date stored in $localStorage.lastChatSyncTime, or from the
             * beginning if there is no local storage value yet
             */
            function synchronizeChatMessages() {

                if (matches.length === 0)
                    return $q.when()

                if (chatSyncInProgress) {
                    $log.debug('Chat sync already in progress. requesting...')
                    chatSyncInRequested = true
                    return $q.when()
                }
                chatSyncInProgress = true

                let matchesById = _.indexBy(matches, 'id')
                let lastChatSyncTime = $localStorage.lastChatSyncTime

                // On Android lastChatSyncTime was changing from an object to a string, causing the sync query to return no result
                // Merely logging it (investigating my hunch) appears to keep it as an object. Quick fix for now. Needs more investigation.
                $log.info('typeof ' + typeof lastChatSyncTime)

                let newMessage = false // if there are any new messages (which we didn't already have locally) from this sync
                $log.info('synchronizing chat messages' + (lastChatSyncTime ? ' from ' + lastChatSyncTime : ''))

                if (typeof lastChatSyncTime === 'string')
                    lastChatSyncTime = new Date(lastChatSyncTime)

                return server.loadChatMessages(lastChatSyncTime)
                    .then(function(messages) {
                        $log.info('Found ' + messages.length + ' chat messages to synchronize')
                        var saveActions = []
                        for (let message of messages) {
                            // Note: match may be null if its been removed by either user, or if it is a chat message
                            // from a new match which we haven't synced yet.
                            saveActions.push(saveNewMessage(matchesById[message.match.id], message))
                        }

                        $q.all(saveActions).then(results => {
                            // Store where we have synced up to (i.e. the maximum createdAt in the messages array)
                            if (messages.length)
                                $localStorage.lastChatSyncTime = _.max(_.pluck(messages, 'createdAt'))

                            refreshUnreadCount()

                            // see if any of the message were new and saved to the db
                            for (let newMsg of results)
                                newMessage |= newMsg

                            if (newMessage && service.profile.notifyMessage)
                                playSound('audio/chat-notification.mp3')

                        }, error => $log.error('Error saving chat messages ' + JSON.stringify(error)))

                        // Update the active chat messages
                        let newActiveMessage = null
                        let activeMsgsById = _.indexBy(activeChatMessages, 'id')

                        for (let msg of messages) {
                            // If the msg belongs to the active match and not in the active msg array, then add it
                            if (msg.match.id == activeChatMatchId && !activeMsgsById[msg.id]) {
                                activeChatMessages.push(msg)
                                activeChatMessages.sort(
                                    function(msg1, msg2) { return msg1.createdAt.getTime() - msg2.createdAt.getTime() }
                                )
                                newActiveMessage = msg
                            }
                        }
                        // Notify the chat controller to scroll down
                        if (newActiveMessage) {
                            $log.debug('broadcasting newMessage')
                            $rootScope.$broadcast('newMessage', newActiveMessage)
                        }

                    }).finally(() => {
                        $log.log('Chat sync complete')
                        chatSyncInProgress = false
                        if (chatSyncInRequested) {
                            $log.log('Additional chat sync requested')
                            chatSyncInRequested = false
                            $timeout(synchronizeMutualMatches)
                        }
                    })
            }


            /**
             * Saves a new chat message locally, and updates the Match object (lastMessage, lastUpdate, read), and re-sorts the matches
             * @param matchId
             * @param message
             * @returns ng.Promise<boolean> If the message was new inserted into the database
             */
            function saveNewMessage(match, message) {

                return LocalDB.saveChatMessage(message).then(
                    (isNew) => {
                        if (isNew && match) {
                            match.lastMessage = message.lastMessage

                            if (message.createdAt.getTime() > match.updatedAt.getTime())
                                match.lastMessageAt = message.createdAt

                            if (message.sender !== server.getUserId())
                                setChatRead(match.id, false)

                            // Sort the matches by the newest messages at the top
                            matches.sort(function(a, b) {
                                if (a.updatedAt.getTime() === b.updatedAt.getTime()) return 0
                                return a.updatedAt.getTime() > b.updatedAt.getTime() ? -1 : 1
                            })
                        }
                        return isNew
                    })
            }


            /**
             * Get a mutual match
             * @param matchId
             * @returns {IMatch}
             */
            function getMatch(matchId) {
                return _.find(matches, 'id', matchId)
            }



            /**
             * Sets and return the active chat. New messages will be added to the array returned
             * @param matchId
             * @returns {IPromise<IChatMessage[]>}
             */
            function getActiveChat(matchId) {
                $log.log('getActiveChat ' + matchId)

                if (matchId === activeChatMatchId)
                    return $q.when(activeChatMessages)

                return LocalDB.getChatMessages(matchId).then(function(messages) {
                    activeChatMatchId = matchId
                    activeChatMessages = messages
                    return activeChatMessages
                })
            }



            /**
             * Update the read flag on a chat
             * @param matchId the match/chat id
             * @param read {boolean} the new read value
             */
            function setChatRead(matchId, read) {
                if (!_.isBoolean(read))
                    throw 'read must be a boolean'

                var match = _.find(matches, { 'id': matchId })
                if (match != null && match.read != read) {
                    match.read = read
                    LocalDB.setChatRead(matchId, read).then(() => refreshUnreadCount())
                }
            }

            /**
             * Gets the number of chats that have unread messages. Can be used to check if there are any unread chats
             * (for example to change or decorate a chat icon)
             * @returns {number}
             */
            function getUnreadChatsCount() {
                return unreadChatsCount
            }

            /**
             * Reset the notification badge number (for iOS)
             * See http://blog.parse.com/announcements/badge-management-for-ios/
             * @returns
             */
            function resetBadge() {
                return server.resetBadge()
            }


            function sendChatMessage(matchId, text, imageBase64, audioBase64) {
                $analytics.eventTrack('chatMessage')
                var match = _.find(matches, { 'id': matchId })
                match.id = matchId
                var message = new ChatMessage()
                message.match = match
                if (text)
                    message.text = text
                message.senderName = service.profile.name

                return server.sendChatMessage(message, imageBase64, audioBase64).then(function(savedMessage) {
                    $log.log('sent chat message for match ' + matchId)
                    if (activeChatMatchId === matchId) {
                        $log.log('adding to active chat messages')
                        activeChatMessages.push(savedMessage)
                        activeChatMessages.sort(
                            function(msg1, msg2) { return msg1.createdAt.getTime() - msg2.createdAt.getTime() }
                        )
                    }
                    saveNewMessage(match, savedMessage)

                    return savedMessage
                })
            }


            function reportProfile(reason, profile, match) {
                $analytics.eventTrack('reportProfile')
                $log.log('reporting profile ' + JSON.stringify(profile))
                return server.reportProfile(reason, profile, match)
            }



            function sendContactMessage(message) {
                $analytics.eventTrack('contactMessage')
                return server.sendContactMessage(message)
            }


            function setPhoto(base64data) {

                return server.saveFile("photo.png", base64data).then(file => {
                    $log.log('photo saved. saving to profile...')
                    var profileUpdate = {}

                    if (MODERATE_PROFILE_PHOTOS) {
                        profileUpdate.photosInReview = service.profile.photosInReview
                        if (!profileUpdate.photosInReview) {
                            profileUpdate.photosInReview = []
                        }
                        profileUpdate.photosInReview.push(file)
                    } else {
                        profileUpdate.photos = service.profile.photos
                        if (!profileUpdate.photos) {
                            profileUpdate.photos = []
                        }
                        profileUpdate.photos.push(file)
                    }

                    return server.saveProfile(service.profile, profileUpdate)
                }).then(result => {
                    $log.log("saved profile with photo")
                    return result
                }, error => {
                    $log.log("error saving photo file to profile " + JSON.stringify(error))
                    return $q.reject(error)
                })
            }

            function saveBirthdate(birthdate) {
                service.profile.birthdate = birthdate
                service.profile.ageFrom = 18 //service.profile.age - 5
                if (service.profile.ageFrom < 18) service.profile.ageFrom = 18
                service.profile.ageTo = 55 //service.profile.age + 5
                return server.saveProfile(service.profile, service.profile)
            }

            function convertImgToBase64(url, outputFormat) {
                var q = $q.defer()
                var canvas = document.createElement('CANVAS'),
                    ctx = canvas.getContext('2d'),
                    img = new Image
                img.crossOrigin = 'Anonymous'
                img.onload = function() {
                    var dataURL
                    canvas.height = img.height
                    canvas.width = img.width
                    ctx.drawImage(img, 0, 0)
                    dataURL = canvas.toDataURL(outputFormat)
                    canvas = null
                    q.resolve(dataURL)
                }
                img.onerror = function() { q.reject('Failed to load image ' + url) }
                img.src = url
                return q.promise
            }


            function testPushNotification() {
                return server.testPushNotification()
            }

            // Admin user functions

            function getReportedUsers() {
                return server.getReportedUsers()
            }

            function getReportedUserDetails(report) {
                return server.getReportedUserDetails(report)
            }

            function deletePhoto(reportId, photoUrl) {
                return server.deletePhoto(reportId, photoUrl)
            }

            function banUser(userId) {
                return server.banUser(userId)
            }

            function closeReport(reportId, action) {
                return server.closeReport(reportId, action)
            }

            function searchUsersByEmail(email) {
                return server.searchUsersByEmail(email)
            }

            function searchUsersByName(name) {
                return server.searchUsersByName(name)
            }

            function loadUser(userId) {
                return server.loadUser(userId)
            }

            function deleteUser(userId) {
                return server.deleteUser(userId)
            }

            function getProfilesWithPhotosToReview() {
                return server.getProfilesWithPhotosToReview()
            }

            function reviewPhoto(profileId, fileUrl, approved) {
                $log.log('reviewPhoto', profileId, fileUrl, approved)
                if (!profileId) throw 'profileId is required'
                if (!fileUrl) throw 'fileUrl is required'
                return server.reviewPhoto(profileId, fileUrl, approved)
            }

            function addClinicsQuestion(clinicQuestion) {
                return server.addClinicsQuestion(clinicQuestion)
            }

            function getClinicsQuestion() {
                return server.getClinicsQuestion()
            }

            function delClinicsQuestion(id) {
                return server.delClinicsQuestion(id)
            }

            function addFindUs(findUs) {
                return server.addFindUs(findUs)
            }

            function getFindUs() {
                return server.getFindUs()
            }

            function delFindUs(id) {
                return server.delFindUs(id)
            }

            function addFindUsReport(findUsVotes) {
                return server.addFindUsReport(findUsVotes)
            }

            function getFindUsReport() {
                return server.getFindUsReport()
            }

            function delFindUsReport(id) {
                return server.getFindUsReport(id)
            }

            // Util functions

            function filePath(file) {
                if (ionic.Platform.isIOS())
                    return file
                else if (ionic.Platform.isAndroid())
                    return '/android_asset/www/' + file
                else
                    return file
            }

            function playSound(file) {
                if (ionic.Platform.isWebView()) { // Avoid an error when running in a desktop browser
                    var media = new Media(filePath(file), null, null, null)
                    media.play(media)
                }
            }
        })

})(); // end IIFE