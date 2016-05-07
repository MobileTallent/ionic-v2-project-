var platformReady, fbLoaded

var app = angular.module('ionicApp', ['constants', 'ionic', 'AppUtil', 'ImagesUtil', 'templates', 'controllers', 'controllers.share', 'service.app',
        'ui.slider', 'ngImgCrop', 'ngAnimate', 'pascalprecht.translate', 'emoji', 'ImgCache', 'monospaced.elastic',
        'ngStorage', 'angulartics.parse', 'SocialAuth', 'ngCookies', 'filters'])
    .run(function ($ionicPlatform, AppService, ImgCache, $rootScope, $log, appName, buildEnv) {
        $rootScope.appName = appName

        $ionicPlatform.ready(function () {
            $log.log('ionicPlatform.ready')
            $log.log('buildEnv: ' + buildEnv)

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

            // Store the app version in the root scope
            if (window.cordova && window.cordova['getAppVersion'])
                window.cordova['getAppVersion'].getVersionNumber().then(version => {
                    $log.info('App version: ' + version)
                    $rootScope.appVersion = version
                })
            else
                $log.info('cordova.getAppVersion is not available')


            AppService.init()
            platformReady = 'true'
        })
    })

    .config(['$translateProvider', function ($translateProvider) {
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

    .config(function ($compileProvider, buildEnv) {
        // See https://docs.angularjs.org/guide/production
        if(buildEnv === 'prod') {
            console.log('Disabling $compileProvider debug info')
            $compileProvider.debugInfoEnabled(false)
        }
    })

    .config(function ($ionicConfigProvider) {
        $ionicConfigProvider.backButton.text('').previousTitleText(false)

        if(!ionic.Platform.isWebView() || ionic.Platform.isIOS()) {
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

