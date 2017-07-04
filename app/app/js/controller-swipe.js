angular.module('controllers')

.controller('ProfileSearch', function($rootScope, $log, $scope, $state, $timeout, $translate, $ionicSideMenuDelegate,
    TDCardDelegate, AppService, AppUtil, $ionicModal, $ionicPopup, $ionicLoading) {

    var translations
    $translate(['MATCHES_LOAD_ERROR']).then(function(translationsResult) {
        translations = translationsResult
    })

    // when $scope.profiles is null then we haven't done a search
    // when $scope.profiles is an empty array then there are no new matches
    $scope.profiles = null
    $scope.noOneAround = false

    var profile = $scope.profile = AppService.getProfile()
    $scope.profilePhoto = profile.photoUrl

    //$scope.cloned_profile = profile.clone()

/**----------------------------------------------
    SEARCH FILTERS
  -----------------------------------------------  
*/
    $scope.isFiltersOpened = false
    $scope.iprofile = profile.clone();
    $scope.showMI = $scope.profile.distanceType === 'mi' ? true : false
    $scope.showKM = $scope.profile.distanceType === 'km' ? true : false
    var dType = $scope.profile.distanceType
     var fields = ['enabled', 'guys', 'girls', 'ageFrom', 'ageTo', 'notifyMatch', 'notifyMessage', 'distanceType', 'distance', 'LFSperm', 'LFEggs', 'LFWomb', 'LFEmbryo', 'LFNot', 'LFHelpM', 'LFHelpO', 'LFSelfId']

    if (!$scope.profile.LFSelfId) {
        $scope.profile.LFSperm = $scope.profile.LFEggs = $scope.profile.LFWomb = $scope.profile.LFEmbryo = true
    }

    $scope.setLanguage = (key) => {
        $log.log('setting language to ' + key)
        $translate.use(key)
    }

    $scope.save = () => {
        $ionicLoading.show({ templateUrl: 'loading.html' })
        AppService.clearProfileSearchResults()
        $scope.iprofile.LFSelfId = true
        if (dType != $scope.profile.distanceType && $scope.iprofile.distanceType == 'mi') {
            $scope.iprofile.distance *= 0.621371
            $scope.iprofile.distance = Math.floor($scope.iprofile.distance)
        } else if (dType != $scope.iprofile.distanceType && $scope.iprofile.distanceType == 'km') {
            $scope.iprofile.distance *= 1.609344
            $scope.iprofile.distance = Math.ceil($scope.iprofile.distance)
        }

        dType = $scope.iprofile.distanceType

        if (!$scope.iprofile.LFSperm && !$scope.iprofile.LFEggs && !$scope.iprofile.LFWomb && !$scope.iprofile.LFEmbryo)
            $scope.iprofile.LFNot = true
        else
            $scope.iprofile.LFNot = false

        AppUtil.blockingCall(
            AppService.saveProfile(_.pick($scope.iprofile, fields)),
            () => {
                
                $ionicLoading.hide()
                $state.go($state.current, {}, {reload: true});
                
            }, 'SETTINGS_SAVE_ERROR'
        )
    }

    $scope.$on('modal.hidden', function(modal) {
        setTimeout(() => {
            if ($scope.searchFiltersModal && $scope.isFiltersOpened)
                $scope.save()
        }, 200);
        
    })
    
    //  //  //  //  //  SEARCH FILTERS  \\  \\  \\  \\  \\


        $scope.changeIndividual = () => {
        if ($scope.profile.LFIndividual === false && $scope.profile.LFCouple === false) {
            $scope.profile.LFCouple = true;
        }
    }

    $scope.changeCouple = () => {
        if ($scope.profile.LFCouple === false && $scope.profile.LFIndividual === false) {
            $scope.profile.LFIndividual = true;
        }
    }

    $scope.changeHelp = () => {
        if ($scope.profile.LFHelp === false && $scope.profile.LFParent === false) {
            $scope.profile.LFParent = true;
        }
    }

    $scope.changeParent = () => {
        if ($scope.profile.LFParent === false && $scope.profile.LFHelp === false) {
            $scope.profile.LFHelp = true;
        }
    }

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

        if ($scope.iprofile.LFSperm === true) {
            $scope.spermImage = 'img/Badges/inactive-Sperm.svg'
            $scope.iprofile.LFSperm = false
        } else {
            $scope.spermImage = 'img/Badges/active-Sperm.svg'
            $scope.iprofile.LFSperm = true
        }
    }

    $scope.eggImage = $scope.iprofile.LFEggs ? 'img/Badges/active-Egg.svg' : 'img/Badges/inactive-Egg.svg'

    $scope.activateEgg = function() {
        if ($scope.iprofile.LFEggs === true) {
            $scope.eggImage = 'img/Badges/inactive-Egg.svg'
            $scope.iprofile.LFEggs = false
        } else {
            $scope.eggImage = 'img/Badges/active-Egg.svg'
            $scope.iprofile.LFEggs = true
        }

    };

    $scope.wombImage = $scope.iprofile.LFWomb ? 'img/Badges/active-Womb.svg' : 'img/Badges/inactive-Womb.svg'

    $scope.activateWomb = function() {
        if ($scope.iprofile.LFWomb === true) {
            $scope.wombImage = 'img/Badges/inactive-Womb.svg'
            $scope.iprofile.LFWomb = false
        } else {
            $scope.wombImage = 'img/Badges/active-Womb.svg'
            $scope.iprofile.LFWomb = true
        }

    };

    $scope.embryoImage = $scope.iprofile.LFEmbryo ? 'img/Badges/active-Frozen-Embryo.svg' : 'img/Badges/inactive-Frozen-Embryo.svg'

    $scope.activateEmbryo = function() {
        if ($scope.iprofile.LFEmbryo === true) {
            $scope.embryoImage = 'img/Badges/inactive-Frozen-Embryo.svg'
            $scope.iprofile.LFEmbryo = false
        } else {
            $scope.embryoImage = 'img/Badges/active-Frozen-Embryo.svg'
            $scope.iprofile.LFEmbryo = true
        }
    }

    $scope.openSearchFilters = function() {
        $scope.searchFiltersModal.show()
            .then(() => $scope.isFiltersOpened = true )
    }

    $scope.hideSearchFilters = function() {
        $scope.searchFiltersModal.hide()
            .then(() => $scope.isFiltersOpened = false )
    }

    $ionicModal.fromTemplateUrl('searchFiltersModal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(searchFiltersModal => $scope.searchFiltersModal = searchFiltersModal)

/**----------------------------------------------
    END OF SEARCH FILTERS
  -----------------------------------------------  
*/
    $scope.deleteUnmatchedSwipes = () => AppUtil.blockingCall(
        AppService.deleteUnmatched(),
        success => $log.log(success),
        error => $log.error(error)
    )

    $scope.$on('$ionicView.enter', () => {
        if (profile.enabled) {
            // Check for any previously search results
            $scope.profiles = AppService.getProfileSearchResults()
                // If we haven't searched yet or we are coming back to the screen and there isn't any results then search for more
            if (!$scope.profiles || $scope.profiles.length === 0)
                $scope.searchAgain()
        }
    })

    $scope.$on('newProfileSearchResults', () => {
        $scope.profiles = AppService.getProfileSearchResults()
    })

    $scope.searchAgain = () => {
        $scope.profiles = null
        $scope.noOneAround = false
        updateProfileSearchResults()
    }

    $rootScope.$on('$stateChangeSuccess', function(ev, to, toParams, from, fromParams) {
        //If card looked - remove and show next
        if (from.name == "menu.info-card-detail" && to.name == "menu.home")
            $timeout(() => $scope.profiles.pop(), 340)
    })

    var MIN_SEARCH_TIME = 2000

    function parseTimeRemaining(duration) {
        var seconds = parseInt((duration / 1000) % 60),
            minutes = parseInt((duration / (1000 * 60)) % 60),
            hours = parseInt((duration / (1000 * 60 * 60)) % 24);

        hours = (hours < 10) ? "0" + hours : hours;
        minutes = (minutes < 10) ? "0" + minutes : minutes;
        seconds = (seconds < 10) ? "0" + seconds : seconds;

        return hours + " hrs : " + minutes + " mins : " + seconds + " sec"
    }

    function checkQuotaTime() {
        var quotaNotReached = false
        if (profile.quotaSearchedDate) {
            var twelveHrsAgo = 43200000 // 43200000-12hrs  Formula: hrs*mins*sec*1000ms  12*60*60*1000
            var now = new Date()
            var now_utc = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds())
            var diff = now_utc - profile.quotaSearchedDate
            var timeRemaining = parseTimeRemaining(twelveHrsAgo - diff)
            if (diff < twelveHrsAgo) {
                $scope.timeRemaining = timeRemaining
                $scope.$broadcast('likeLimitReached')
                quotaNotReached = true
            }
        }
        return quotaNotReached
    }

    function updateProfileSearchResults() {
        var startTime = Date.now()

        if (checkQuotaTime())
            return

        AppService.updateProfileSearchResults()
            .then(result => {
                $log.log('CardsCtrl: found ' + result.length + ' profiles')
                $scope.noOneAround = result.length ? false : true
                result.map(profile => {
                        if (profile.question)
                            profile.info_card = true
                        if (profile.question)
                            profile.flip = false
                        if (!profile.question)
                            profile.image = profile.photoUrl
                    })
                    // Make the search screen show for at least a certain time so it doesn't flash quickly
                var elapsed = Date.now() - startTime
                if (elapsed < MIN_SEARCH_TIME)
                    $timeout(() => $scope.profiles = result, MIN_SEARCH_TIME - elapsed)
                else
                    $scope.profiles = result
            }, error => {
                $log.log('updateProfileSearchResults error ' + JSON.stringify(error))
                $scope.profiles = []
                AppUtil.toastSimple(translations.MATCHES_LOAD_ERROR)
            })
    }


    //Multiple Modal methods

    // Initialise the new match modal
    $ionicModal.fromTemplateUrl('newMatch.html', {
            scope: $scope,
            animation: 'slide-in-up',
            id: 1,
        }).then(modal => $scope.modalNewMatch = modal)
        // Cleanup the modal when we're done with it!
    $scope.$on('$destroy', () => $scope.closeModal(1))

    $scope.$on('newMatch', (event, match) => {
        $log.log('CardsCtrl.newMatch ' + match.id)
        $scope.newMatch = match
        $scope.matchProfile = AppService.getProfileById(match.profileId)
        $scope.openModal(1)
    })

    //Initialise like limit modal
    $ionicModal.fromTemplateUrl('likeLimitModal.html', {
            scope: $scope,
            animation: 'slide-in-up',
            id: 2,
        }).then(modal => $scope.modalLikeLimit = modal)
        // Cleanup the modal when we're done with it!
    $scope.$on('$destroy', () => $scope.closeModal(2))

    $scope.$on('likeLimitReached', (timeRemaining) => {
        $scope.openModal(2)
    })

    $scope.openModal = function(index) {
        if (index == 1) $scope.modalNewMatch.show()
        else $scope.modalLikeLimit.show()
    }

    $scope.closeModal = function(index) {
        if (!AppService.getProfile() || !$scope.modalNewMatch) return
        if (index == 1) $scope.modalNewMatch.hide()
        else {
            $scope.modalLikeLimit.hide()
            $state.go('^.profile-edit')
        }
    }

    $scope.closeNewMatch = () => $scope.closeModal(1)

    $scope.closeLikeLimit = () => $scope.closeModal(2)

    $scope.messageNewMatch = () => {
        $scope.closeModal(1)
        $state.go('^.chat', { matchId: $scope.newMatch.id })
    }

    // a test function for viewing the new match modal screen
    $scope.openNewMatch = () => {
        $scope.newMatch = AppService.getMutualMatches()[0]
        $scope.openModal(1)
    }


    $scope.enableDiscovery = () => {
        AppUtil.blockingCall(
            AppService.enableDiscovery(),
            () => {
                $log.log('discovery enabled. updating search results...')
                updateProfileSearchResults()
            }
        )
    }

    $scope.viewDetails = (profile) => {
        $log.log('view details ' + JSON.stringify(profile))
        $state.go('^.search-profile-view', { profile: profile })
    }

    $scope.accept = (profile) => {
        if (checkQuotaTime()) {
            return
        }
        if (profile.flip === false) {
            profile.flip = true;
            return;
        }
        if (profile.flip === true) {
            //increase one click
            $state.go('^.info-card-detail', { card: profile })
            return;
        }

        $log.log('accept button')
        var topProfile = $scope.profiles[$scope.profiles.length - 1]
        AppService.processMatch(topProfile, true)
        topProfile.accepted = true // this triggers the animation out
        $timeout(() => {
            $scope.profiles.pop()
            $scope.increaseShows()
        }, 340)
    }


    $scope.reject = (profile) => {
        if (profile.flip) {
            profile.flip = false;
            return;
        }

        if (!profile.info_card) {
            $log.log('reject button')
            var topProfile = $scope.profiles[$scope.profiles.length - 1]
            AppService.processMatch(topProfile, false)
            topProfile.rejected = true // this triggers the animation out
        }

        $timeout(() => {
            $scope.profiles.pop()
            $scope.increaseShows()
        }, 340)
    }

    // matches are swiped off from the end of the $scope.profiles array (i.e. popped)
    $scope.cardDestroyed = (index) => {
        $scope.profiles.splice(index, 1)
        $scope.increaseShows()
    }

    $scope.increaseShows = () => {
        $timeout(() => {
            if ($scope.profiles[$scope.profiles.length - 1] && $scope.profiles[$scope.profiles.length - 1].info_card === true) {
                AppService.increaseShowClick({
                    "type": "card",
                    "behavior": "show",
                    "obj": $scope.profiles[$scope.profiles.length - 1].toJSON()
                })
                $scope.profiles[$scope.profiles.length - 1].shows.summary++
            }
        })
    }

    $scope.cardTransitionLeft = (profile) => {
        // var cardT2 = this.valueOf()
        // var card = TDCardDelegate.getSwipeableCard(cardT2.swipeCard)
        // card.snapBack()
        // return
        // if (checkQuotaTime()) {
        //     card.snapBack()
        //     return
        // }
        AppService.processMatch(profile, false)
        if ($scope.profiles.length == 0) {
            // TODO auto-load more?
        }
    }

    $scope.cardTransitionRight = (profile) => {
        if (checkQuotaTime()) {
            return
        }
        AppService.processMatch(profile, true)
        if ($scope.profiles.length == 0) {
            // TODO auto-load more?
        }
    }
})

.directive('readMore', function($timeout) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var getHeightAbout = function() {
                var eleRead = element[0].firstChild
                if (eleRead.scrollHeight <= eleRead.offsetHeight) {
                    var readBtn = element[0].children[1]
                    angular.element(readBtn).addClass('hidden')
                }
            }
            $timeout(getHeightAbout, 0)
        }
    }
})

.controller('MatchProfileCtrl', function($scope, $translate, AppService, AppUtil,
    $state, $stateParams, $ionicHistory, $ionicActionSheet, $ionicPopup,
    matchProfile) {
    //$cordovaFacebook.api()
    //{user-id}?fields=context.fields%28mutual_friends%29
    var translations
    $translate(['REQUEST_FAILED', 'REPORT', 'MATCH_OPTIONS', 'CANCEL', 'WANT_TO_REMOVE_MATCH', 'MATCH_REPORTED']).then(function(translationsResult) {
        translations = translationsResult
    })

    $scope.matchProfile = matchProfile
    $scope.linkToBeShared = ''

    $scope.profileOptions = () => {
        $ionicPopup.show({
            title: "Match Options",
            subTitle: "Press send to confirm with your potential co-parent that you have agreed to try for a baby with each other. Don’t worry, it’s not legally binding. This will be the beginning of your journey. From here we will guide you through best practices around having a                         baby. This feature also aims to reduce the chance of what we call the Genghis Kahn effect. The Kahn family is thought to have over 30 million descendants. We encourage you to use this feature to better inform yourself and others. Best to be open and honest, we’re dealing                     with potential family.",
            cssClass: 'popup-vertical-buttons',
            buttons: [{
                    text: 'We have agreed to try for a baby',
                    type: 'button-positive',
                    onTap: function(e) {
                        impregnate()
                    }
                },
                {
                    text: 'Cancel',
                    type: 'button-assertive text-color-white',
                    onTap: function(e) {
                        AppUtil.toastSimple("No Confirmation Request has been Sent")
                    }
                }
            ]
        });
    }

    function impregnate() {
        AppUtil.blockingCall(
            AppService.processPregnancy($scope.matchProfile, true),
            () => {
                AppUtil.toastSimple("Confirmation Request Sent!")
            }
        )
    }
})