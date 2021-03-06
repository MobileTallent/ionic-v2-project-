angular.module('controllers', ['service.app', 'ngAnimate', 'ngCordova', 'ionic.contrib.ui.tinderCards'])

.controller('SignInCtrl', function($scope, $log, $rootScope, $state, $http, $timeout, $cordovaFacebook, $q, $ionicPopup,
    $ionicModal, $ionicLoading, $ionicHistory, AppService, AppUtil, SocialAuth,
    linkedInId, linkedInSecret) {

    /**
     * The SignInCtrl handle the flow for registering and authenticating a user. There are currently three entry points:
     * 1. emailRegister() - registers a new user and logs them in
     * 2. emailLogin() - logs in a previously registered user
     * 3. facebookLogin() - logs in with facebook and creates a user if they didn't already exist
     *
     * All three call checkProfile() which starts the post-authentication login sequence that is mediated by
     * AppService.goToNextLoginState()
     */

    // Data for the username/password form
    $scope.credentials = { email: '', password: '' }

    // These two properties are for dynamically updating the CSS classes on the logo and login form/button
    $scope.logo = { class: '' }
    $scope.showForm = false
    $scope.showLogo = false
    $scope.showResetPassword = false

    // After an error resets the CSS styles so the login form/button displays
    function resetStyles() {
        $scope.showForm = true
        $scope.showLogo = false
        $scope.logo.class = ''
        $scope.status = ''
    }
    // Hides the login form/buttons and displays the animated logo
    function setLoggingInStyles() {
        $scope.showForm = false
        $scope.showLogo = true
        $scope.logo.class = 'animated jello infinite'
        $scope.status = '' // the translation key to display on the login screen
    }


    $scope.showResetPasswordForm = function() {
        $scope.showForm = false
        $scope.showResetPassword = true
    }
    $scope.hideResetPasswordForm = function() {
        $scope.showForm = true
        $scope.showResetPassword = false
    }
    $scope.resetPassword = function() {
        if (validateEmail()) return

        AppUtil.blockingCall(
            AppService.requestPasswordReset($scope.credentials.email),
            () => {
                $scope.hideResetPasswordForm()
                AppUtil.toastSimpleTranslate('PASSWORD_RESET_SENT')
            }
        )
    }

    $scope.emailRegister = function() {
        if (validateEmailPassword()) return
        setLoggingInStyles()
        AppService.signUp($scope.credentials.email, $scope.credentials.password).then(function(result) {
            $log.log('user signed up success')
            checkProfile()
        }, function(error) {
            resetStyles()
            $log.error('user signed up error ' + JSON.stringify(error))
            setTimeout(() => AppUtil.toastSimple(error.message), 10)
        })
    }

    $scope.emailLogin = function() {
        if (validateEmailPassword()) return
        setLoggingInStyles()
        AppService.logIn($scope.credentials.email, $scope.credentials.password).then(function(result) {
            $log.log('user login success')
            checkProfile()
        }, function(error) {
            resetStyles()
            if (error.code && error.code === 101) { // ParseError.OBJECT_NOT_FOUND = 101;. Message is 'invalid login parameters'
                AppUtil.toastSimpleTranslate('INVALID_EMAIL_PASSWORD')
                $log.warn(JSON.stringify(error))
            } else {
                AppUtil.toastSimpleTranslate('LOGIN_ERROR')
                $log.error(JSON.stringify(error))
            }
        })
    }

    function validateEmailPassword() {
        return validateEmail() || validatePassword()
    }

    function validatePassword() {
        if ($scope.credentials.password.length < 6) {
            AppUtil.toastSimpleTranslate('PASSWORD_LENGTH')
            return true
        }
        return false
    }

    function validateEmail() {
        var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        if (!re.test($scope.credentials.email)) {
            AppUtil.toastSimpleTranslate('INVALID_EMAIL')
            return true
        }
        return false
    }


    $scope.linkedInLogin = function() {
        setLoggingInStyles()
        $scope.status = 'LOGGING_IN_TO_LINKEDIN'
        SocialAuth.linkedIn(linkedInId, linkedInSecret, ['r_basicprofile', 'r_emailaddress'], 'rtbwrtusgfxytr')
            .then(httpResponse => AppService.linkedInLogin(httpResponse))
            .then(
                () => checkProfile(null),
                error => {
                    resetStyles()

                    if (error.code && error.code === 203) { // ParseError.EMAIL_TAKEN = 203
                        AppUtil.toastSimple(error.message)
                        $log.warn(JSON.stringify(error))
                    } else {
                        AppUtil.toastSimple('LinkedIn login failed')
                        $log.error(JSON.stringify(error))
                    }
                    AppService.logout()
                }
            )
    }


    $scope.facebookLogin = function() {
        setLoggingInStyles()
        $scope.status = 'LOGGING_IN_TO_FB'

        connectToFacebook().then(function(result) {
            return AppService.facebookLogin(result)
        }).then(function(result) {
            // Load the user profile
            $scope.status = 'LOADING_PROFILE'
            return AppService.loadProfile()
        }).then(function(profile) {
            // If we've logged in for the first time (i.e. profile.name isn't set) then copy the facebook profile
            if (!profile.name) {
                $log.log('Initialising profile with facebook profile')
                $scope.status = 'LOADING_FB_PROFILE'
                return AppService.copyFacebookProfile()
            } else {
                return profile // already logged in with FB
            }
        }).then(() => checkProfile(), $scope._handleFacebookLoginError)
    }

    $scope._handleFacebookLoginError = error => {
        resetStyles()

        if (error.code && error.code === 'MINIMUM_AGE_ERROR') {
            $ionicPopup.alert({
                    title: 'Error',
                    template: 'You do not meet the age requirements for this app.'
                }).then(() => AppService.logout())
                //.then(() => ionic.Platform.exitApp())
            return
        }

        // {"code":251,"message":"The supplied Facebook session token is expired or invalid."}
        $log.error('Facebook login error: ' + JSON.stringify(error))
        AppService.logout()
        AppUtil.toastSimpleTranslate('LOGIN_ERROR')
    }


    /**
     * @param profile {IProfile} The user profile if it has already been loaded, else null
     */
    function checkProfile(profile) {
        $log.log('checkProfile()')

        var profilePromise = profile ? $q.when(profile) : AppService.loadProfile()

        AppService.requestLocationServices()
            .then(function() { return profilePromise })
            .then(function(profile) {
                if (!profile)
                    return $q.reject('Unable to load Profile')

                if (!profile.gps) // If we're not using the GPS for the users location then skip using the location services 
                    return null

                $scope.status = 'WAITING_FOR_GPS'
                return AppService.getCurrentPosition().then(
                    function(result) { return result },
                    function(error) {
                        // if profile.location != null then could have a toast warning that we were unable to update the location
                        return null
                    }
                )
            }).then(function(location) {
                var profile = AppService.getProfile()

                // if the user is using a location from the map, or couldn't get the GPS location then skip trying to save the location
                if (profile.gps === false || location === null) {
                    proceed(profile)
                    return
                }

                $log.log('updating location to ' + JSON.stringify(location))
                AppService.saveProfile({ location: location })
                    .finally(() => proceed(profile))

            }, function(error) {
                resetStyles()
                AppService.logout()
                $log.error('Error loging in: ' + JSON.stringify(error))
                if (error.code === 209) { // Invalid session token
                    AppUtil.toastSimple('Invalid session. Try again')
                    return
                }
                AppUtil.toastSimpleTranslate('LOGIN_ERROR')
            })
    }

    /**
     * After a successful login proceed to the next screen
     * @param profile
     */
    function proceed() {
        $scope.status = ''
        $scope.logo.class = 'animated zoomOutDown'
        AppService.getMutualMatches() // load in the background
            // disable the back button
        $ionicHistory.nextViewOptions({
            historyRoot: true,
            disableBack: true
        })

        // the timeout is to give the drop CSS animation time
        $timeout(() => AppService.goToNextLoginState(), 1000)

        var profile = AppService.getProfile();
        var user = {
            userId: profile.uid,
            name: profile.name,
            custom_attributes: {
                Name: profile.name,
                user_id: profile.uid
            }
        };

        intercom.updateUser(user, function() {
            intercom.displayMessenger();
        });
    }



    var connectToFacebook = function() {
        var deferred = $q.defer()
        $scope.status = 'LOGGING_IN_TO_FB'
        $cordovaFacebook.getLoginStatus()
            .then(function(statusResult) {
                if (statusResult.status === 'connected') {
                    $log.log('setting $rootScope.facebookConnected')
                    $rootScope.facebookConnected = true
                    $rootScope.fbAccessToken = statusResult.authResponse.accessToken
                    deferred.resolve(statusResult)
                } else {
                    // If the user isn't connected then login
                    $log.log('$cordovaFacebook.login')
                    $cordovaFacebook.login(["public_profile", "email", "user_birthday", "user_photos", "user_friends", "user_likes"])
                        .then(function(loginResult) {
                            if (loginResult.status === 'connected') {
                                $log.log('setting $rootScope.facebookConnected')
                                $rootScope.facebookConnected = true
                                $rootScope.fbAccessToken = loginResult.authResponse.accessToken
                                deferred.resolve(loginResult)
                            } else {
                                deferred.reject(loginResult)
                            }
                        }, function(error) {
                            return deferred.reject(error)
                        })
                }
            }, function(error) {
                deferred.reject(error)
            })
        return deferred.promise
    }


    // Waits for the Facebook plugin to be ready, if required
    function ensureFb(callback) {
        // Continue when the Ionic platform has initialised and:
        // - Running in a WebView (i.e. using the native Facebook plugin if configured), or
        // - Facebook authentication is not configured, or
        // - The Facebook JavaScript SDK has loaded
        if (platformReady && (window.cordova || !FACEBOOK_APP_ID || fbJsSdkLoaded)) {
            if (callback) {
                $timeout(callback, 50)
            }
        } else {
            // Otherwise wait for the Facebook JavaScript SDK to load
            console.debug('Waiting for Facebook Javascript SDK to load')
            $timeout(function() { ensureFb(callback) }, 250)
        }
    }

    var autoLogin = function() {
        // TODO change the Parse.User.current() check to an AppService call
        if (Parse.User.current() != null) {
            $log.log('auto login')
            setLoggingInStyles()
            AppService.autoLogin()
            if (Parse.FacebookUtils.isLinked(Parse.User.current())) {
                $log.log('Checking facebook user')
                connectToFacebook().then(function(result) {
                    // TODO check the facebook id matches the cached Parse user, else force logout
                    checkProfile(null)
                }, function(error) {
                    resetStyles()
                    AppUtil.toastSimple('Facebook login error')
                    $log.error('Facebook login error ' + JSON.stringify(error))
                })
            } else {
                checkProfile(null)
            }
        } else {
            resetStyles()
        }
    }

    // Check if we need to wait for the Facebook JS plugin to initialise and then check for doing an auto-login
    ensureFb(autoLogin)


    $scope.feedback = function() {
        intercom.displayMessenger();
    }
});