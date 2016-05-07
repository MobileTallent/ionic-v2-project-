angular.module('controllers')

    .controller('CardsCtrl', function($log, $scope, $state, $timeout, $translate, $ionicSideMenuDelegate,
                                      TDCardDelegate, AppService, AppUtil, $ionicModal) {

        var translations
        $translate(['MATCHES_LOAD_ERROR']).then(function (translationsResult) {
            translations = translationsResult
        })

        // when $scope.matches is null then we haven't done a search
        // when $scope.matches is an empty array then there are no new matches
        // TODO rename this to profiles as its IProfile and not IMatch objects
        $scope.matches = null

        var profile = $scope.profile = AppService.getProfile()
        $scope.profilePhoto = profile.photoUrl


        $scope.$on('$ionicView.beforeEnter', () => $scope.unreadChats = AppService.getUnreadChatsCount())
        $scope.$on('unreadChatsCountUpdated', () => $scope.unreadChats = AppService.getUnreadChatsCount())

        $scope.$on('$ionicView.enter', () => {
            if(profile.enabled) {
                // Check for any previously loaded matches
                $scope.matches = AppService.getPotentialMatches()
                // If we haven't searched yet or we are coming back to the screen and there isn't any results then search for more
                if(!$scope.matches || $scope.matches.length === 0)
                    $scope.searchAgain()
            }
        })

        $scope.$on('newPotentialMatches', () => $scope.matches = AppService.getPotentialMatches())

        $scope.searchAgain = () => {
            $scope.matches = null
            updatePotentialMatches()
        }


        var MIN_SEARCH_TIME = 2000
        function updatePotentialMatches() {

            var startTime = Date.now()
            AppService.updatePotentialMatches()
                .then(result => {
                    $log.log('CardsCtrl: found ' + result.length + ' potential matches')
                    result.map(profile => profile.image = profile.photoUrl)
                    // Make the search screen show for at least a certain time so it doesn't flash quickly
                    var elapsed = Date.now() - startTime
                    if(elapsed < MIN_SEARCH_TIME)
                        $timeout(() => $scope.matches = result, MIN_SEARCH_TIME - elapsed)
                    else
                        $scope.matches = result
                }, error => {
                    $log.log('updatePotentialMatches error ' + JSON.stringify(error))
                    $scope.matches = []
                    AppUtil.toastSimple(translations.MATCHES_LOAD_ERROR)
                }
            )
        }

        // Initialise the new match modal
        $ionicModal.fromTemplateUrl('newMatch.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(modal => $scope.modal = modal)
        // Cleanup the modal when we're done with it!
        $scope.$on('$destroy', () => $scope.modal.remove())

        $scope.$on('newMatch', (event, match) => {
            $log.log('CardsCtrl.newMatch ' + match.id)
            $scope.newMatch = match
            $scope.matchProfile = AppService.getProfileById(match.profileId)
            $scope.modal.show()
        })
        $scope.closeNewMatch = () => $scope.modal.hide()

        $scope.messageNewMatch = () => {
            $scope.modal.hide()
            $state.go('^.chat',{matchId : $scope.newMatch.id})
        }
        // a test function for viewing the new match modal screen
        $scope.openNewMatch = () => {
            $scope.newMatch = AppService.getMutualMatches()[0]
            $scope.modal.show()
        }

        $scope.enableDiscovery = () => {
            AppUtil.blockingCall(
                AppService.enableDiscovery(),
                () => {
                    $log.log('discovery enabled. updating matches...')
                    updatePotentialMatches()
                }
            )
        }

        $scope.viewDetails = (card) => {
            $log.log('view details ' + JSON.stringify(card))
            $scope.$parent.selectedCard = card
            $state.go('^.card-info')
        }

        $scope.accept = () => {
            $log.log('accept button')
            var matchLength = $scope.matches.length
            var topMatch = $scope.matches[matchLength-1]
            AppService.processMatch(topMatch, true)
            topMatch.accepted = true // this triggers the animation out
            $timeout(() => $scope.matches.pop(), 340)
        }

        $scope.reject = () => {
            $log.log('reject button')
            var matchLength = $scope.matches.length
            var topMatch = $scope.matches[matchLength-1]
            AppService.processMatch(topMatch, false)
            topMatch.rejected = true // this triggers the animation out
            $timeout(() => $scope.matches.pop(), 340)
        }

        // matches are swiped off from the end of the $scope.matches array (i.e. popped)

        $scope.cardDestroyed = (index) => $scope.matches.splice(index, 1)

        $scope.cardTransitionLeft = (match) => {
            AppService.processMatch(match, false)
            if($scope.matches.length == 0) {
                // TODO auto-load more?
            }
        }
        $scope.cardTransitionRight = (match) => {
            AppService.processMatch(match, true)
            if($scope.matches.length == 0) {
                // TODO auto-load more?
            }
        }
    })


    .controller('CardInfoCtrl', function($log, $scope, $cordovaFacebook, $ionicHistory, $ionicActionSheet, AppUtil, $translate, AppService) {

        //$cordovaFacebook.api()
        //{user-id}?fields=context.fields%28mutual_friends%29
        var translations
        $translate(['REQUEST_FAILED', 'REPORT', 'MATCH_OPTIONS', 'CANCEL']).then(function (translationsResult) {
            translations = translationsResult
        })

        $scope.profile = AppService.getProfile()
        var from = $scope.profile.location
        var to = $scope.selectedCard.location

        var distance = getDistanceFromLatLonInKm(from.latitude,from.longitude, to.latitude, to.longitude)

        if($scope.profile.distanceType == 'mi')
            distance *= 1.609344

        distance = distance.toFixed(0)

        $scope.distance = distance == 0 ? 1 : distance

        $scope.like = () => {
            var match = AppService.getPotentialMatches().pop()
             AppService.processMatch(match, true)
             $ionicHistory.goBack()
        }

        $scope.reject = () => {
            var match = AppService.getPotentialMatches().pop()
            AppService.processMatch(match, false)
            $ionicHistory.goBack()
        }


        $scope.profileOptions = () => {
            $ionicActionSheet.show({
                destructiveText: translations.REPORT,
                titleText: translations.MATCH_OPTIONS,
                cancelText: translations.CANCEL,
                cancel: function() {},
                destructiveButtonClicked: function(index) {
                    report()
                    return true
                }
            })
        }

        function report() {
            var profile = AppService.getPotentialMatches().pop()

            AppUtil.blockingCall(
                AppService.reportProfile('profile', profile),
                () => {
                    AppService.processMatch(profile, false)
                    $ionicHistory.goBack()
                }
            )
        }

    })


    .controller('MatchProfileCtrl', function($scope, $translate, AppService, AppUtil,
                                             $state, $stateParams, $ionicHistory, $ionicActionSheet, $ionicPopup,
                                             matchProfile) {
        //$cordovaFacebook.api()
        //{user-id}?fields=context.fields%28mutual_friends%29

        var translations
        $translate(['REQUEST_FAILED', 'REPORT', 'MATCH_OPTIONS', 'CANCEL', 'WANT_TO_REMOVE_MATCH', 'MATCH_REPORTED']).then(function (translationsResult) {
            translations = translationsResult
        })

        $scope.profile = AppService.getProfile()
        $scope.matchProfile = matchProfile

        var from = $scope.profile.location
        var to = matchProfile.location

        var distance = getDistanceFromLatLonInKm(from.latitude,from.longitude, to.latitude, to.longitude)

        if($scope.profile.distanceType == 'mi')
            distance *= 1.609344

        distance = distance.toFixed(0)
        $scope.distance = distance == 0 ? 1 : distance


        $scope.profileOptions = () => {
            $ionicActionSheet.show({
                destructiveText: translations.REPORT,
                titleText: translations.MATCH_OPTIONS,
                cancelText: translations.CANCEL,
                cancel: function() {},
                destructiveButtonClicked: function(index) {
                    report()
                    return true
                }
            })
        }

        function report() {
            AppUtil.blockingCall(
                AppService.reportProfile('profile', $scope.profile), // should pass in the match too
                () => {
                    $ionicPopup.confirm({
                        title: translations.MATCH_REPORTED,
                        template: translations.WANT_TO_REMOVE_MATCH,
                        okText: translations.REMOVE,
                        cancelText: translations.CANCEL
                    }).then(function (res) {
                        if (res)
                            unmatch()
                    })
                }
            )
        }

        function unmatch() {
            AppUtil.blockingCall(
                AppService.removeMatch($stateParams.matchId),
                () => {
                    $ionicHistory.nextViewOptions({
                        historyRoot: true,
                        disableBack: true
                    })
                    $state.go('menu.chats')
                }, 'REMOVE_MATCH_ERROR'
            )
        }

    })
;

// from http://stackoverflow.com/questions/27928/how-do-i-calculate-distance-between-two-latitude-longitude-points
function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
    var R = 6371 // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1)
    var dLon = deg2rad(lon2-lon1)
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    var d = R * c // Distance in km
    return d
}

function deg2rad(deg) {
    return deg * (Math.PI/180)
}

