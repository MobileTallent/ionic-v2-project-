var platformReady, fbJsSdkLoaded

var app = angular.module('ionicApp', ['constants', 'ionic', 'AppUtil', 'ImagesUtil', 'templates', 'controllers', 'controllers.share', 'service.app', 'service-provider',
        'ui.slider', 'ngImgCrop', 'ngAnimate', 'pascalprecht.translate', 'emoji', 'ImgCache', 'monospaced.elastic',
        'ngStorage', 'SocialAuth', 'ngCookies', 'filters', 'chart.js'
        // Add your own extra dependencies on the line below with the comma first to make merging updates easier

    ])
    .run(function($ionicPlatform, AppService, ImgCache, $rootScope, $log, appName, env, gcpBrowserKey, $state) {
        $rootScope.appName = appName

        $ionicPlatform.ready(function() {
            $log.log('ionicPlatform.ready')
            $log.log('env: ' + env)

            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true)
            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault()
            }

            ImgCache.init(function() {
                $log.log('ImgCache init: success!')
            }, function() {
                $log.warn('ImgCache init: error! Check the log for errors')
            })

            if (typeof analytics !== 'undefined') {
                analytics.startTrackerWithId("UA-94067520-1")
            } else {
                console.log("Google Analytics Unavailable")
            }

            // Branch
            $ionicPlatform.on('deviceready', function() {
                branchInit()
            });

            $ionicPlatform.on('resume', function() {
                branchInit()
            });

            function branchInit() {
                // Branch initialization
                if (typeof Branch !== 'undefined') {
                    Branch.initSession(function(data) {
                        // read deep link data on click
                        if (data && data["+clicked_branch_link"] && data.$canonical_identifier && AppService.getProfile()) {
                            AppService.getProfileOfSelectedUserNoParsing(data.$canonical_identifier).then(profile => {
                                AppService.branchProfileId = data.$canonical_identifier
                                $state.go('menu.search-profile-view', { profile: profile })
                            })
                        } else if (data && data["+clicked_branch_link"] && data.$canonical_identifier && !AppService.getProfile()) {
                            AppService.branchProfileId = data.$canonical_identifier
                        }
                    }).catch(function(err) {
                        alert('Error: ' + JSON.stringify(err))
                    })
                }
            }

            // Store the app version in the root scope
            if (window.cordova && window.cordova['getAppVersion'])
                window.cordova['getAppVersion'].getVersionNumber().then(version => {
                    $log.info('App version: ' + version)
                    $rootScope.appVersion = version
                })
            else
                $log.info('cordova.getAppVersion is not available')

            // In development mode inject the javascript for Browser Sync
            if (env === 'dev') {
                var bsScript = document.createElement('script')
                bsScript.id = '__bs_script__'
                bsScript.src = 'http://HOST:3000/browser-sync/browser-sync-client.2.12.12.js'.replace('HOST', location.hostname)
                bsScript.async = true
                document.body.appendChild(bsScript)
            }

            var googleMapsScript = document.createElement('script')
            googleMapsScript.src = 'https://maps.googleapis.com/maps/api/js?key=' + gcpBrowserKey
            googleMapsScript.async = true
            document.body.appendChild(googleMapsScript)

            AppService.init()
            platformReady = true
        })
    })

.config(['$translateProvider', function($translateProvider) {
    // TRANSLATION_EN etc are the global variables defined in /app/js/translations/
    $translateProvider
        .translations('en', TRANSLATION_EN)
        .translations('de', TRANSLATION_DE)
        .useLocalStorage()
        .fallbackLanguage('en')
        .registerAvailableLanguageKeys(['en', 'de'], {
            'en_*': 'en',
            'de_*': 'de'
        })
        .useSanitizeValueStrategy('sanitizeParameters')
        .determinePreferredLanguage()
}])

.config(function($compileProvider, env) {
    // See https://docs.angularjs.org/guide/production
    if (env === 'prod') {
        console.log('Disabling $compileProvider debug info')
        $compileProvider.debugInfoEnabled(false)
    }
})

.config(function($ionicConfigProvider) {
    $ionicConfigProvider.backButton.text('').previousTitleText(false)

    if (!ionic.Platform.isWebView() || ionic.Platform.isIOS()) {
        // we are using iconicons 2.0 which doesn't include the iOS back button icon used by Ionic beta-14
        $ionicConfigProvider.backButton.text('').icon('ion-ios-arrow-back')
    }

    // Enable native scrolling for Android
    var jsScrolling = ionic.Platform.isAndroid() ? false : true
    $ionicConfigProvider.scrolling.jsScrolling(jsScrolling)
})

.config(function(ImgCacheProvider) {
    ImgCacheProvider.setOptions({
            //debug: true,
            usePersistentCache: true
        })
        // Set this option to init imgcache.js manually after device is ready
    ImgCacheProvider.manualInit = true
})

// TODO this is already in filters-util.js. Need to delete this duplicate and test
.filter('escapeHTML', function() {
    return function(text) {
        if (text) {
            return text.
            replace(/&/g, '&amp;').
            replace(/</g, '&lt;').
            replace(/>/g, '&gt;').
            replace(/'/g, '&#39;').
            replace(/"/g, '&quot;');
        }
        return '';
    }
})

;