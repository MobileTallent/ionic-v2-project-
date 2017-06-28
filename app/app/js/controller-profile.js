angular.module('controllers')

.controller('EmailVerificationCtrl', function($scope, AppService, AppUtil) {

    // see https://parse.com/docs/js_guide#users-emailverification
    // http://blog.parse.com/2012/04/03/introducing-app-email-settings/

    $scope.isEmailVerified = () =>
        AppUtil.blockingCall(
            AppService.isEmailVerified(),
            verified => verified ? AppService.goToNextLoginState() : AppUtil.toastSimpleTranslate('EMAIL_NOT_VERIFIED')
        )

    $scope.cancel = () => AppService.logout()
})

.controller('ClinicsCtrl', function($scope, AppService, AppUtil, $ionicPopover, $localStorage, $sce) {
    $scope.clinicQuestions = null
    $scope.showcase = "General"

    $scope.$on('$ionicView.beforeEnter', () => $scope.refreshClinics())

    $scope.$on('clinicsUpdated', () => {
        update()
    })

    function update() {
        $scope.showcase = $localStorage.clinicSettings
        console.log('ClinicsCtrl update()' + $scope.showcase)
    }

    $scope.refreshClinics = function() {
        $localStorage.clinicSettings = "General"
        AppUtil.blockingCall(
            AppService.getClinicsQuestion(),
            questions => {
                console.log('loaded ' + questions.length + ' questions')
                $scope.clinicQuestions = questions
            })
    }

    // Show the clinic settings dialog
    $scope.clinicSettings = ($event) => {
        var template = '<ion-popover-view style="height: 250px;"><ion-header-bar><h1 class="title">FAQ Settings</h1></ion-header-bar><ion-content>' +
            '<clinic-settings/>' +
            '</ion-content></ion-popover-view>'
        $scope.popover = $ionicPopover.fromTemplate(template, { scope: $scope })
        $scope.popover.show($event)
        $scope.closePopover = () => $scope.popover.hide()
        $scope.$on('$destroy', () => $scope.popover.remove())
    }

    $scope.trustSrcurl = function(data) {
        if (data)
            return $sce.trustAsResourceUrl('https://www.youtube.com/embed/' + data)
    }
})

.directive('clinicSettings', function($localStorage, $rootScope) {
    return {
        restrict: 'E',
        scope: {},
        template: '<ion-list>' +
            '<div class="item item-divider">Show Questions by:</div>' +
            '<ion-radio ng-model="settings" ng-click="showItem(\'General\')" ng-value="\'General\'">General</ion-radio>' +
            '<ion-radio ng-model="settings" ng-click="showItem(\'Male\')" ng-value="\'Male\'">Male</ion-radio>' +
            '<ion-radio ng-model="settings" ng-click="showItem(\'Female\')" ng-value="\'Female\'">Female</ion-radio>' +
            '</ion-list>',
        controller: function($scope) {
            $scope.settings = $localStorage.clinicSettings || "General"
            $scope.showItem = (itemShown) => {
                $localStorage.clinicSettings = itemShown // persist the settings
                $rootScope.$broadcast('clinicsUpdated')
            }
        }
    }
})

.controller('AboutCtrl', function($scope, AppService, AppUtil, $sce, $ionicModal) {
    $scope.$on('$ionicView.beforeEnter', () => $scope.refreshAbout())

    $scope.refreshAbout = function() {
        AppUtil.blockingCall(
            AppService.getAboutJab(),
            about => {
                $scope.about = about
            })
    }

    $scope.trustSrcurl = function(data) {
        if (data)
            return $sce.trustAsResourceUrl('https://www.youtube.com/embed/' + data)
    }


})

.controller('FindUsCtrl', function($scope, $stateParams, AppService, AppUtil, $ionicModal) {
    $scope.$on('$ionicView.beforeEnter', () => $scope.refreshFindUs())
    $scope.findUsList = null
    $scope.refreshFindUs = function() {
        AppUtil.blockingCall(
            AppService.getFindUs(),
            findUs => {
                $scope.findUsList = []
                console.log('loaded ' + findUs.length + ' find us group')
                findUs.forEach(item => {
                    var findUs = { name: "", username: "", checked: false }
                    findUs.name = item.name
                    findUs.username = $stateParams.username
                    $scope.findUsList.push(findUs)
                });
            })
    }
    $scope.skip = function() {
        AppService.goToNextLoginState()
    }
    $scope.done = function() {
        $scope.votes = $scope.findUsList.filter(function(item) {
            return item.checked;
        });
        AppUtil.blockingCall(
            AppService.addFindUsReport($scope.votes),
            () => {
                AppUtil.toastSimple("Thank You")
                AppService.goToNextLoginState()
            })
    }

    $ionicModal.fromTemplateUrl('introWalkthrough.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modal = modal
        $scope.modal.show()
    })

    $scope.closeModal = function() {
        $scope.modal.hide();
    };
})

.controller('WalkThruCtrl', function($scope, AppService, AppUtil) {
    $scope.closeIntroModal = function() {
        AppService.goToNextLoginState()
    }
})

.controller('ProfileSetupCtrl', function($scope, $state, $ionicHistory, AppService, AppUtil) {
    // The user will be sent here from AppService.goToNextLoginState() if AppService.isProfileValid() returns false
    $scope.$on('$ionicView.beforeEnter', function(event) {
        var profile = AppService.getProfile()

        if (!profile.name) {
            AppService.logout()
        }


        var birthYear = null,
            birthMonth = null,
            birthDay = null
        if (profile.birthdate) {
            birthYear = profile.birthdate.getFullYear()
            birthMonth = profile.birthdate.getMonth()
            birthDay = profile.birthdate.getDay()
        }

        // pre-populate the values we already have on the profile
        $scope.user = { name: profile.name, birthYear: birthYear, birthMonth: birthMonth, birthDay: birthDay, gender: profile.gender }
    })

    // Static data
    $scope.months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    $scope.years = []
        // provide the years for people aged 13 to 100
    var yearsFrom = new Date().getFullYear() - 100
    var yearsTo = new Date().getFullYear() - 13
    for (var i = yearsFrom; i <= yearsTo; i++) {
        $scope.years.push((i))
    }
    $scope.yearFrom = yearsFrom
    $scope.yearTo = yearsTo

    $scope.saveProfile = function() {

        if (!$scope.user.name || $scope.user.name.trim().length < 1) {
            AppUtil.toastSimpleTranslate('FIRST_NAME_REQUIRED')
            return
        }
        if (!$scope.user.birthDay) {
            AppUtil.toastSimpleTranslate('BIRTH_DAY_REQUIRED')
            return
        }
        if (!$scope.user.birthMonth) {
            AppUtil.toastSimpleTranslate('BIRTH_MONTH_REQUIRED')
            return
        }
        if (!$scope.user.birthYear) {
            AppUtil.toastSimpleTranslate('BIRTH_YEAR_REQUIRED')
            return
        }
        if (!$scope.user.gender) {
            AppUtil.toastSimpleTranslate('GENDER_REQUIRED')
            return
        }

        var birthdate = new Date(Date.UTC($scope.user.birthYear, $scope.user.birthMonth, $scope.user.birthDay))
        var changes = { name: $scope.user.name, birthdate: birthdate, gender: $scope.user.gender, enabled: true }

        AppUtil.blockingCall(AppService.saveProfile(changes),
            () => {
                AppService.goToNextLoginState()
            }, 'SETTINGS_SAVE_ERROR')
    }

    $scope.logout = () => AppService.logout()
})

.controller('LocationSetupCtrl', function($scope, $translate, AppService, AppUtil, $ionicPopup, $log) {

    var translations
    $translate(['SETTINGS_SAVE_ERROR', 'GPS_ERROR', 'SET_MAP_LOCATION']).then(function(translationsResult) {
        translations = translationsResult
    })

    // New York
    var latLng = new google.maps.LatLng(-33.865143, 151.209900)

    var mapOptions = {
        center: latLng,
        zoom: 11,
        zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_TOP
        },
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: false,
        streetViewControl: false,
        disableDoubleClickZoom: true
    }

    var map = new google.maps.Map(document.getElementById("map"), mapOptions)
    $scope.map = map
    map.setCenter(latLng)

    var marker = new google.maps.Marker({
        position: latLng,
        map: map,
        title: "My Location",
        draggable: true
    })

    google.maps.event.addListener(map, 'click', function(event) {
        marker.setPosition(event.latLng)
    })

    $scope.setLocation = function() {
        var pos = marker.getPosition()

        AppUtil.blockingCall(
            AppService.saveProfile({ gps: false, location: { latitude: pos.lat(), longitude: pos.lng() } }),
            () => AppService.goToNextLoginState(),
            'SETTINGS_SAVE_ERROR'
        )
    }

    $scope.cancel = () => AppService.logout()

    $scope.$on('$ionicView.afterEnter', function(event) {
        // Instruct the user to set their location on the map
        $ionicPopup.alert({
            title: translations.GPS_ERROR,
            template: translations.SET_MAP_LOCATION
        })
    })

    // On iOS if the user has the location services off, then the initial request to get the location will fail
    // but it will also open the users location settings. If the user then turns on the location services and
    // returns to the app then we should try to get the location again, both when first arrive to this screen
    // i.e. in $ionicView.beforeEnter, and then again on the resume listener
    var checkLocation = function() {
        $log.log('Checking for current position')
        AppService.getCurrentPosition().then(function(location) {
            $log.log('Found location ' + JSON.stringify(location))
            AppUtil.toastSimple('Location found from GPS')
            AppUtil.blockingCall(
                AppService.saveProfile({ gps: false, location: { latitude: location.latitude, longitude: location.longitude } }),
                () => AppService.goToNextLoginState(),
                'SETTINGS_SAVE_ERROR'
            )
        }, function(error) {
            $log.log('Couldn\'t get location on resume ' + error)
        })
    }

    $scope.$on('$ionicView.beforeEnter', function(event) {
        checkLocation()
        document.addEventListener('resume', checkLocation)
    })

    $scope.$on('$ionicView.beforeLeave', function(event) {
        document.removeEventListener('resume', checkLocation)
    })
})

.controller('TermsOfUseCtrl', function($scope, AppService, AppUtil) {

    // Required for Apple store submission when there is user generated content.
    // See the Next Steps in the question at http://www.quora.com/Apple-App-Store-rejection-category-14-3-help-needed

    $scope.agree = () =>
        AppUtil.blockingCall(
            AppService.termsOfUseAgreed(),
            () => AppService.goToNextLoginState()
        )

    $scope.logout = () => AppService.logout()
})

.controller('FbAlbumsCtrl', function($scope, $log, $cordovaFacebook) {
    $scope.albums = null

    // TODO use $iconicLoading instead of the text status
    $cordovaFacebook.api('/me/albums').then(function(result) {
            $scope.albums = result.data
        }, function(error) {
            $log.log('FbAlbumsController error ' + JSON.stringify(error))
        })
        // TODO handle if there are no albums
})

.controller('FbAlbumCtrl', function($log, $rootScope, $state, $scope, $stateParams, $ionicLoading, $cordovaFacebook) {

    $cordovaFacebook.api('/' + $stateParams.albumId + '/photos?fields=id,picture,source,height,width,images&limit=500')
        .then(function(result) {
            $scope.photos = result.data
                // TODO handle if there are no photos
        }, function(error) {
            $log.log('FbAlbumController - error getting album photos ' + JSON.stringify(error))
        })

    $scope.selectPhoto = function(photo) {
        $ionicLoading.show({ templateUrl: 'loading.html' })
        getBase64FromImageUrl(photo.source)
    }

    function getBase64FromImageUrl(URL) {
        var img = new Image()
        img.crossOrigin = "anonymous"
        img.src = URL
        img.onload = function() {
            var canvas = document.createElement("canvas")
            canvas.width = this.width
            canvas.height = this.height

            var ctx = canvas.getContext("2d")
            ctx.drawImage(this, 0, 0)

            var dataURL = canvas.toDataURL("image/png")

            $rootScope.cropPhoto = dataURL
            $ionicLoading.hide()
            $state.go('^.crop')
        }
    }
})

.controller('PhotoCropCtrl', function($log, $scope, $rootScope, $ionicLoading, $state, $stateParams, $ionicHistory, AppService, AppUtil) {
    $scope.myImage = $rootScope.cropPhoto
        // $scope.myImage = $stateParams.imageData TODO try and use a state param instead of rootScoe

    $scope.croppedImage = { data: '' }

    $scope.$on('$ionicView.afterLeave', function(event) {
        $rootScope.cropPhoto = null
    })

    $scope.cancel = function() {
        $ionicHistory.goBack()
    }

    $scope.crop = function() {

        $ionicLoading.show({ templateUrl: 'loading.html' })
        try {
            var dataURI = $scope.croppedImage.data
            var base64
            if (dataURI.split(',')[0].indexOf('base64') >= 0)
                base64 = dataURI.split(',')[1]
            else
                base64 = unescape(dataURI.split(',')[1])

            AppService.setPhoto(base64).then(function(result) {
                $ionicLoading.hide()

                var viewHistory = $ionicHistory.viewHistory()

                if (viewHistory.backView.stateName == 'menu.fb-album') {
                    // pop off the facebook album history items and set the back view to the profile edit page
                    var history = viewHistory.histories[viewHistory.currentView.historyId]
                    history.stack.splice(2, 3)
                    history.cursor = 1
                    viewHistory.backView = history.stack[1]
                    $ionicHistory.goBack()
                } else {
                    // if we came from a camers/gallery photo selection then can just go back
                    $ionicHistory.goBack()
                }
            }, function(error) {
                $ionicLoading.hide()
                $log.error('Error saving cropped image ' + JSON.stringify(error))
                AppUtil.toastSimple('Error saving cropped image')
            })
        } catch (e) {
            // TODO show error
            $ionicLoading.hide()
            $log.error('error getting cropped image data ' + JSON.stringify(e))
            AppUtil.toastSimple('Unable to crop image')
        }
    }
})

// .controller('DiscoveryCtrl', function ($scope, $state, $ionicHistory, AppService, AppUtil) {

//     // The Profile fields on the discover page to save
//     var fields = ['enabled', 'guys', 'girls', 'ageFrom', 'ageTo', 'distance']

//     $scope.$on('$ionicView.beforeEnter', () => {
//         $scope.profile = AppService.getProfile().clone()
//         $scope.showMI = $scope.showKM = true
//     })

//     $scope.$on('$ionicView.enter', function (event) {
//         $scope.showMI = $scope.profile.distanceType === 'mi' ? true : false
//         $scope.showKM = $scope.profile.distanceType === 'km' ? true : false
//     })

//     $scope.save = () => AppUtil.blockingCall(
//         AppService.saveProfile(_.pick($scope.profile, fields)),
//         () => {
//             AppService.clearProfileSearchResults()
//             $ionicHistory.nextViewOptions({
//                 historyRoot: true,
//                 disableBack: true
//             })
//             $state.go('menu.home')
//         }, 'SETTINGS_SAVE_ERROR'
//     )

//     $scope.cancel = () => $scope.profile = AppService.getProfile($scope).clone()
// })

.controller('SettingsCtrl', function($scope, $state, $stateParams, $ionicModal, $ionicPopup, AppService, AppUtil, $log, $rootScope, $translate, $ionicHistory, $ionicActionSheet, env) {

    // The Profile fields on the discover page to save
    var fields = ['enabled', 'guys', 'girls', 'ageFrom', 'ageTo', 'notifyMatch', 'notifyMessage', 'distanceType', 'distance', 'LFSperm', 'LFEggs', 'LFWomb', 'LFEmbryo', 'LFNot', 'LFHelpM', 'LFHelpO', 'LFSelfId']
    var translations
    var isLogout = false

    $translate(['SETTINGS_SAVE_ERROR', 'DELETE', 'DELETE_ACCOUNT', 'CANCEL']).then(function(translationsResult) {
        translations = translationsResult
    })

    $scope.showSearchFilter = !!$stateParams.showFilters;
    $scope.showFiltersOnly = $scope.showSearchFilter;
    $scope.viewTitle = $scope.showFiltersOnly ? "SEARCH_FILTERS" : 'SETTINGS_TITLE';

    $scope.$on('$ionicView.enter', function(event) {
        $scope.showDiscovery = false
        
    })

    $scope.$on('$ionicView.beforeLeave', function() {
        if (!isLogout)
            $scope.save()
    })

    $scope.profile = AppService.getProfile().clone()
        //$scope.profile.LFNot = typeof $scope.profile.LFNot !== 'undefined' ? $scope.profile.LFNot : true
    //$scope.showSearchFilter = false; 
    $scope.showDiscovery = true
    $scope.showMI = $scope.profile.distanceType === 'mi' ? true : false
    $scope.showKM = $scope.profile.distanceType === 'km' ? true : false
    var dType = $scope.profile.distanceType

    if (!$scope.profile.LFSelfId) {
        $scope.profile.LFSperm = $scope.profile.LFEggs = $scope.profile.LFWomb = $scope.profile.LFEmbryo = true
    }

    $scope.setLanguage = (key) => {
        $log.log('setting language to ' + key)
        $translate.use(key)
    }

    $scope.save = () => {
        AppService.clearProfileSearchResults()
        $scope.profile.LFSelfId = true
        if (dType != $scope.profile.distanceType && $scope.profile.distanceType == 'mi') {
            $scope.profile.distance *= 0.621371
            $scope.profile.distance = Math.floor($scope.profile.distance)
        } else if (dType != $scope.profile.distanceType && $scope.profile.distanceType == 'km') {
            $scope.profile.distance *= 1.609344
            $scope.profile.distance = Math.ceil($scope.profile.distance)
        }

        dType = $scope.profile.distanceType

        if (!$scope.profile.LFSperm && !$scope.profile.LFEggs && !$scope.profile.LFWomb && !$scope.profile.LFEmbryo)
            $scope.profile.LFNot = true
        else
            $scope.profile.LFNot = false

        AppUtil.blockingCall(
            AppService.saveProfile(_.pick($scope.profile, fields)),
            () => {
                //$scope.profile = AppService.getProfile().clone()
            }, 'SETTINGS_SAVE_ERROR'
        )
    }

    $scope.cancel = function() {
        $scope.profile = AppService.getProfile($scope).clone()
    }


    $scope.logout = function() {
        isLogout = true
        AppService.logout()
    }

    $scope.inAppPurchasesAvailable = () => typeof store !== 'undefined'

    $scope.buyPro = () => store.order("pro version")

    $scope.buySubscription = () => store.order("subscription")


    $scope.testPushNotification = () => AppService.testPushNotification().then(
        success => AppUtil.toastSimple('Sent'),
        error => AppUtil.toastSimple(JSON.stringify(error))
    )

    $scope.getProfilesWhoAreCurious = (type) => AppService.getProfilesWhoAreCurious(type).then(
        length => console.log("Number of profiles " + length + " Type: " + type),
        error => AppUtil.toastSimple(JSON.stringify(error))
    )


    $scope.deleteUnmatchedSwipes = () => AppUtil.blockingCall(
        AppService.deleteUnmatched(),
        success => $log.log(success),
        error => $log.error(error)
    )


    $scope.deleteAccount = function() {
        $ionicActionSheet.show({
            destructiveText: translations.DELETE,
            titleText: translations.DELETE_ACCOUNT,
            cancelText: translations.CANCEL,
            cancel: function() {},
            destructiveButtonClicked: function(index) {
                doDelete()
                return true
            }
        })
    }

    $scope.debug = () => {
        console.log('debug...')
        $ionicActionSheet.show({
            destructiveText: 'Send Debug Logs',
            titleText: 'UID: ' + AppService.getProfile().uid + ' Env: ' + env,
            cancelText: translations.CANCEL,
            cancel: function() {},
            destructiveButtonClicked: function(index) {
                $log.error('debug log')
                return true
            }
        })
    }

    $scope.getProfilesNew = () => {
        console.log('getProfilesNew...')

        AppUtil.blockingCall(
            AppService.getProfileNew(),
            results => {
                console.log('Results found: ' + results.length)
            })
    }

    $scope.setCountry = () => {
        console.log('setCountry...')

        AppUtil.blockingCall(
            AppService.getProfilesNoCountry(),
            results => {
                console.log('Results found: ' + results.length)
                _.forEach(results, function(profile) {
                    //address and flags
                    if (!ionic.Platform.isIOS() && profile.location.latitude && profile.location.longitude) {
                        let geocodingAPI = "http://maps.googleapis.com/maps/api/geocode/json?latlng=" + profile.location.latitude + "," + profile.location.longitude + "&sensor=false&language=en";
                        let num = 0
                        let addArray
                        let addComp

                        fetch(geocodingAPI)
                            .then(res => res.json())
                            .then((out) => {
                                var profileUpdate = {}
                                if (out['results'][0]) {
                                    profileUpdate.address = out['results'][0].formatted_address
                                    addArray = profileUpdate.address.split(',')

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
                                        profileUpdate.country = out['results'][num].formatted_address
                                    else {
                                        profileUpdate.country = addArray.slice(-1).pop().trim()
                                        let cntParsingNumber = profileUpdate.country.split(' ').pop()
                                        if (cntParsingNumber && !isNaN(cntParsingNumber)) {
                                            let lastIndex = profileUpdate.country.lastIndexOf(" ")
                                            profileUpdate.country = profileUpdate.country.substring(0, lastIndex)
                                        }
                                    }

                                    AppService.saveProfileForSomeReason(profile, profileUpdate)
                                }
                            })
                            .catch(err => console.error(err))
                    }
                })
            })
    }

    function doDelete() {
        AppUtil.blockingCall(
            AppService.deleteAccount()
        )
    }
    //Intro Walkthrough
    $ionicModal.fromTemplateUrl('introWalkthrough.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(introModal) {
        $scope.introModal = introModal;
    })

    $scope.openIntroModal = () => {
        $scope.introModal.show()
    };
    $scope.closeIntroModal = () => {
        $scope.introModal.hide()
    };
    // Terms of Use Modal
    $ionicModal.fromTemplateUrl('termsOfUseModal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(tosModal) {
        $scope.tosModal = tosModal;
    })
    $scope.openTosModal = () => {
        $scope.tosModal.show()
    };
    $scope.closeTosModal = () => {
        $scope.tosModal.hide()
    };
    $scope.openBadgeInfo = () => {
        $ionicPopup.alert({
            title: 'Self Identification Badges',
            templateUrl: 'badgeInfo.html',
            buttons: [{
                text: 'Ok',
                type: 'button-assertive',

            }]
        })
    }



    $scope.debug = () => {
        console.log('debug...')
        $ionicActionSheet.show({
            destructiveText: 'Send Debug Logs',
            titleText: 'UID: ' + AppService.getProfile().uid + ' Env: ' + env,
            cancelText: translations.CANCEL,
            cancel: function() {},
            destructiveButtonClicked: function(index) {
                $log.error('debug log')
                return true
            }
        })
    }

    $scope.filterInfoPopup = () => {
        var infoPopup = $ionicPopup.alert({
            title: 'Advanced Filter Options',
            template: '<p class="center">To use this option you need to finalise your profile. This should take around 15 seconds.</p>'
        });
        infoPopup.then(() => $state.go('menu.profile-edit'));
    }

    $scope.goToEditProfile = () => {
        $state.go('menu.profile-edit');
    }


    //  //  //  //  //  SEARCH FILTERS  \\  \\  \\  \\  \\

    $scope.individualImage = 'img/Badges/inactive-Individual.svg';
    $scope.toggleIndividual = false;

    $scope.activateIndividual = function() {

        if ($scope.toggleIndividual === false) {
            $scope.individualImage = 'img/Badges/active-Individual.svg';
            $scope.toggleIndividual = true;
            return;
        }
        if ($scope.toggleIndividual === true) {
            $scope.individualImage = 'img/Badges/inactive-Individual.svg';
            $scope.toggleIndividual = false;
            return;
        }
    };

    $scope.coupleImage = 'img/Badges/inactive-Couple.svg'
    $scope.toggleCouple = false

    $scope.activateCouple = function() {

        if ($scope.toggleCouple === false) {
            $scope.coupleImage = 'img/Badges/active-Couple.svg';
            $scope.toggleCouple = true;
            return;
        }
        if ($scope.toggleCouple === true) {
            $scope.coupleImage = 'img/Badges/inactive-Couple.svg';
            $scope.toggleCouple = false;
            return;
        }
    };

    $scope.helpImage = 'img/Badges/inactive-Help.svg'
    $scope.toggleHelp = false

    $scope.activateHelp = function() {

        if ($scope.toggleHelp === false) {
            $scope.helpImage = 'img/Badges/active-Help.svg'
            $scope.toggleHelp = true
            return;
        }
        if ($scope.toggleHelp === true) {
            $scope.helpImage = 'img/Badges/inactive-Help.svg'
            $scope.toggleHelp = false
            return;
        }
    };

    $scope.lookingImage = 'img/Badges/inactive-Looking-For-Help.svg'
    $scope.toggleLooking = false;

    $scope.activateLooking = function() {

        if ($scope.toggleLooking === false) {
            $scope.lookingImage = 'img/Badges/active-Looking-For-Help.svg';
            $scope.toggleLooking = true;
            return;
        }
        if ($scope.toggleLooking === true) {
            $scope.lookingImage = 'img/Badges/inactive-Looking-For-Help.svg';
            $scope.toggleLooking = false;
            return;
        }
    };

    $scope.spermImage = $scope.profile.LFSperm ? 'img/Badges/active-Sperm.svg' : 'img/Badges/inactive-Sperm.svg'

    $scope.activateSperm = function() {

        if ($scope.profile.LFSperm === true) {
            $scope.spermImage = 'img/Badges/inactive-Sperm.svg'
            $scope.profile.LFSperm = false
        } else {
            $scope.spermImage = 'img/Badges/active-Sperm.svg'
            $scope.profile.LFSperm = true
        }
    }

    $scope.eggImage = $scope.profile.LFEggs ? 'img/Badges/active-Egg.svg' : 'img/Badges/inactive-Egg.svg'

    $scope.activateEgg = function() {
        if ($scope.profile.LFEggs === true) {
            $scope.eggImage = 'img/Badges/inactive-Egg.svg'
            $scope.profile.LFEggs = false
        } else {
            $scope.eggImage = 'img/Badges/active-Egg.svg'
            $scope.profile.LFEggs = true
        }

    };

    $scope.wombImage = $scope.profile.LFWomb ? 'img/Badges/active-Womb.svg' : 'img/Badges/inactive-Womb.svg'

    $scope.activateWomb = function() {
        if ($scope.profile.LFWomb === true) {
            $scope.wombImage = 'img/Badges/inactive-Womb.svg'
            $scope.profile.LFWomb = false
        } else {
            $scope.wombImage = 'img/Badges/active-Womb.svg'
            $scope.profile.LFWomb = true
        }

    };

    $scope.embryoImage = $scope.profile.LFEmbryo ? 'img/Badges/active-Frozen-Embryo.svg' : 'img/Badges/inactive-Frozen-Embryo.svg'

    $scope.activateEmbryo = function() {
        if ($scope.profile.LFEmbryo === true) {
            $scope.embryoImage = 'img/Badges/inactive-Frozen-Embryo.svg'
            $scope.profile.LFEmbryo = false
        } else {
            $scope.embryoImage = 'img/Badges/active-Frozen-Embryo.svg'
            $scope.profile.LFEmbryo = true
        }
    }
})

.controller('ContactCtrl', function($scope, AppService, AppUtil, $translate) {


    var translations
    $translate(['GIVE_US_FEEDBACK']).then(function(translationsResult) {
        translations = translationsResult
    })

    $scope.contact = { message: '' }

    $scope.sendMessage = function() {
        if ($scope.contact.message.length < 10) {
            AppUtil.toastSimple('Write at least a few words!')
            return
        }

        AppUtil.blockingCall(
            AppService.sendContactMessage($scope.contact.message),
            () => {
                $scope.contact.message = ''
                AppUtil.toastSimple('Message sent')
            }
        )
    }
})

.controller('LocationCtrl', function($scope, $translate, AppService, AppUtil, $ionicLoading) {

        // TODO load the google map script async here when required instead of index.html
        var translations
        $translate(['GPS_ERROR']).then(function(translationsResult) {
            translations = translationsResult
        })

        var profile = AppService.getProfile()
        var location = profile.location

        $scope.location = { useGPS: profile.gps }

        var myLatlng = new google.maps.LatLng(location.latitude, location.longitude)

        var mapOptions = {
            center: myLatlng,
            zoom: 11,
            zoomControlOptions: {
                position: google.maps.ControlPosition.RIGHT_TOP
            },
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            mapTypeControl: false,
            streetViewControl: false,
            disableDoubleClickZoom: true
        }

        var map = new google.maps.Map(document.getElementById("map"), mapOptions)
        $scope.map = map
        map.setCenter(myLatlng)

        var marker = new google.maps.Marker({
            position: myLatlng,
            map: map,
            title: "My Location",
            draggable: !profile.gps
        })

        google.maps.event.addListener(map, 'click', function(event) {
            if (!$scope.location.useGPS)
                marker.setPosition(event.latLng)
        })

        $scope.useGPSchanged = function() {
            marker.setDraggable(!$scope.location.useGPS)
            if ($scope.location.useGPS) {
                AppService.clearProfileSearchResults()
                $ionicLoading.show({ templateUrl: 'loading.html' })
                AppService.getCurrentPosition().then(function(gpsLocation) {
                    return AppService.saveProfile({ gps: true, location: gpsLocation })
                }).then(
                    function(profile) {
                        var gpsLatLng = new google.maps.LatLng(profile.location.latitude, profile.location.longitude)
                        marker.setPosition(gpsLatLng)
                        map.setCenter(gpsLatLng)
                        $ionicLoading.hide()
                    }, error => {
                        $ionicLoading.hide()
                        if (error === 'GPS_ERROR')
                            AppUtil.toastSimple(translations.GPS_ERROR)
                        else
                            AppUtil.toastSimple(translations.SETTINGS_SAVE_ERROR)
                        $scope.location.useGPS = false
                        marker.setDraggable(true)
                    }
                )
            }
        }

        $scope.$on('$ionicView.beforeLeave', function() {
            if (!$scope.location.useGPS) {
                setLocation()
            }
        })

        function setLocation() {
            AppService.clearProfileSearchResults()
            var pos = marker.getPosition()
            AppUtil.blockingCall(
                AppService.saveProfile({ gps: false, location: { latitude: pos.lat(), longitude: pos.lng() } }),
                () => {

                },
                'SETTINGS_SAVE_ERROR'
            )
        }
    })
    .controller('ProfileMainVideoCtrl', function($scope, $http, AppUtil, AppService, $state, $window, VideoService, $cordovaSocialSharing, $rootScope, $cordovaCapture, $cordovaCamera, $ionicModal, $ionicPopup, $ionicLoading, $localStorage, $cordovaFileTransfer) {
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1; //January is 0!

        var yyyy = today.getFullYear();
        if (dd < 10) {
            dd = '0' + dd;
        }
        if (mm < 10) {
            mm = '0' + mm;
        }
        var today = dd + '/' + mm + '/' + yyyy;

        $scope.$on('$ionicView.beforeEnter', () => $scope.refreshProfileMainVideo())

        $scope.refreshProfileMainVideo = function() {

            $scope.profile = AppService.getProfile();
            console.log("scope.profile " + $scope.profile);
            console.log("scope.profile.videos " + $scope.profile.videos);
            console.log("scope.profile.photos " + $scope.profile.photos);

            $scope.video = {
                created_date: today,
                title: "",
                desc: "",
                url: "",
                thumb: ""
            };

            $scope.clip = '';

            if ($localStorage.video_direct)
                $scope.video_direct = $localStorage.video_direct;
            else
                $scope.video_direct = false;

            if (!$scope.video_direct) {
                $scope.openEntryModal();
            } else {
                $scope.recordVideo();
            }
        }

        // Show Entry Modal View
        $scope.openEntryModal = () => {
            $ionicModal.fromTemplateUrl('profile-video-entry.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function(modal) {
                $scope.entryModal = modal;
                $scope.entryModal.show();
            })
        };
        $scope.closeEntryModal = () => {
            $localStorage.video_direct = $scope.video_direct;
            console.log($scope.video_direct);
            $scope.entryModal.hide();
        };
        $scope.entryNext = () => {
            $scope.closeEntryModal();
            $scope.recordVideo();
        }

        $scope.printValue = function() {
            $scope.video_direct = !$scope.video_direct;
            console.log($scope.video_direct);
        }

        $scope.vid_height = ($window.innerHeight / 2);
        $scope.vid_width = $window.innerWidth;

        //Show Main View
        $scope.recordVideo = function() {
            console.log("video capture start.");
            var options = { limit: 1, duration: 30 };

            $cordovaCapture.captureVideo(options).then(function(videoData) {
                $scope.currentVideoPath = videoData[0].fullPath;

                console.log("videoData :" + $scope.currentVideoPath);

                var video = document.getElementById('video_to_upload');
                video.src = videoData[0].fullPath;

                VideoService.saveVideo(videoData).success(function(data) {
                    $scope.clip = data;
                    $scope.$apply();

                    console.log("data :" + data);

                    $window.location.reload(true);

                }).error(function(data) {
                    console.log('ERROR: ' + data);
                });

            }, function(err) {
                console.log("video capture error founded!");
            });
        }

        $scope.goShare = function() {
            $scope.openEditModal();
        }

        // Show Edit Modal View
        $scope.openEditModal = () => {
            $ionicModal.fromTemplateUrl('profile-video-edit.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function(modal) {
                $scope.editModal = modal;
                $scope.editModal.show();
            })
        };
        $scope.closeEditModal = () => {
            $scope.editModal.hide()
        };

        $scope.urlForClipThumb = function(clipUrl) {
            var name = clipUrl.substr(clipUrl.lastIndexOf('/') + 1);
            var trueOrigin = cordova.file.dataDirectory + name;
            var sliced = trueOrigin.slice(0, -4);

            return sliced + '.png';
        };

        $scope.showClip = function(clip) {
            console.log('show clip: ' + clip);
        };

        $scope.saveVideo = () => {

            var filePath = getCorrectFilePath();
            if ($scope.currentVideoPath.length > 0)
                doUploadToYoutube(filePath);
        };

        $scope.readyVideo = () => {
            $ionicLoading.show({
                content: 'Processing please wait',
                animation: 'fade-in',
                showBackdrop: true,
                showDelay: 0
            });
            $http.post("http://sandboxserver.co.za/retrieve_videos_list.php", {}).then(function(res) {
                console.log(res.data);
                // var result = JSON.parse(res.data);
                var result = res.data;
                $ionicLoading.hide();
                if (result.status && result.status == "success") {
                    console.log(result.video_ids);
                    $scope.videoList = result.video_ids;

                    $scope.editModal.hide();
                    $state.go('menu.profile-video-list');
                } else {
                    console.log("error founded in getting video list.");
                }
            });
        }

        $scope.playVideo = function(video_url) {
            window.open('http://' + video_url, '_system', 'location=yes');
            return false;
        }

        // Show Confirm Modal View

        $scope.videoConfirm = function() {
            $ionicModal.fromTemplateUrl('profile-video-confirm.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function(modal) {
                $scope.confirmModal = modal;
                $scope.confirmModal.show()
            })
        };

        $scope.closeConfirmModal = () => {
            $scope.confirmModal.hide();
        };
        $scope.cleanVideo = () => {

            $scope.video = {
                created_date: today,
                title: "",
                desc: "",
                url: "",
                thumb: ""
            };
            $scope.currentVideoPath = '';

            $scope.clip = '';

            $scope.editModal.hide();
            $scope.confirmModal.hide();
        };

        // Media related functions
        function getCorrectFilePath() {
            var fileName = $scope.currentVideoPath;
            if (ionic.Platform.isAndroid()) {
                if (fileName.substring(0, 4) != "file") {

                    fileName = "file:/" + fileName;
                }
            } else if (ionic.Platform.isIOS()) {

            }

            return fileName;
        }

        function doUploadToYoutube(videoPath) {
            $ionicLoading.show({
                content: 'Processing please wait',
                animation: 'fade-in',
                showBackdrop: true,
                showDelay: 0
            });
            var video_param = {};
            video_param.video_title = $scope.video.title;
            video_param.video_description = $scope.video.desc;

            var options = {
                fileKey: "video",
                fileName: "will_be_provided_by_user" + ".mp4",
                chunkedMode: false,
                mimeType: "multipart/form-data",
                params: video_param
            };

            $cordovaFileTransfer.upload("http://sandboxserver.co.za/upload_to_youtube.php", videoPath, options, true)
                .then(function(result) {
                        console.log(result.response);
                        $ionicLoading.hide();
                        var res = JSON.parse(result.response);

                        if (!res.status || res.status != "success") {
                            console.log("res status false");
                            $ionicPopup.alert({
                                title: "Error",
                                template: "wrong status code received. please try again"
                            }).then(function(result) {
                                // $scope.closeEditModal();
                            });
                        } else {
                            //a service will be called here to add user video link to the server, two new column will be added to the database: 
                            // 'youtubeVid' this column is a boolean and will i fthe user has a video or not, 'youtubeVidUrl', this column will contain the youtube url   
                            $scope.video.url = res.video_url;
                            // $scope.video.thumb = isset(res["video_url"]) ? res["video_url"] : ""; //$scope.urlForClipThumb($scope.clip);

                            $ionicPopup.alert({
                                title: "Successfull",
                                template: "Video Successfully uploaded. Thanks you for sharing!<br> Link:<b>" + res.video_url
                            }).then(function(result) {
                                $scope.profile.videos.push({ youtube: $scope.video.url, thumb: $scope.video.thumb });
                                var changes = { videos: $scope.profile.videos };
                                AppUtil.blockingCall(AppService.saveProfile(changes),
                                    () => {
                                        $scope.readyVideo();
                                    }, 'SETTINGS_SAVE_ERROR')
                            });
                        }

                    },
                    function(err) {
                        // Error
                        console.log("ERROR: " + JSON.stringify(err));
                        $ionicPopup.alert({
                            title: "Error",
                            template: "Upload failed please try again"
                        }).then(function(result) {
                            $ionicLoading.hide();
                        });
                    },
                    function(progress) {
                        // constant progress updates
                    });
        }
    });