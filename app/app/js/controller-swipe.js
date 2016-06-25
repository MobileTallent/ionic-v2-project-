angular.module('controllers')

    .controller('ProfileSearch', function($log, $scope, $state, $timeout, $translate, $ionicSideMenuDelegate,
                                      TDCardDelegate, AppService, AppUtil, $ionicModal) {

        var translations
        $translate(['MATCHES_LOAD_ERROR']).then(function (translationsResult) {
            translations = translationsResult
        })

        // when $scope.profiles is null then we haven't done a search
        // when $scope.profiles is an empty array then there are no new matches
        $scope.profiles = null

        var profile = $scope.profile = AppService.getProfile()
        $scope.profilePhoto = profile.photoUrl


        $scope.$on('$ionicView.beforeEnter', () => $scope.unreadChats = AppService.getUnreadChatsCount())
        $scope.$on('unreadChatsCountUpdated', () => $scope.unreadChats = AppService.getUnreadChatsCount())

        $scope.$on('$ionicView.enter', () => {
            if(profile.enabled) {
                // Check for any previously search results
                $scope.profiles = AppService.getProfileSearchResults()
                // If we haven't searched yet or we are coming back to the screen and there isn't any results then search for more
                if(!$scope.profiles || $scope.profiles.length === 0)
                    $scope.searchAgain()
            }
        })

        $scope.$on('newProfileSearchResults', () => $scope.profiles = AppService.getProfileSearchResults())

        $scope.searchAgain = () => {
            $scope.profiles = null
            updateProfileSearchResults()
        }


        var MIN_SEARCH_TIME = 2000
        function updateProfileSearchResults() {

            var startTime = Date.now()
            AppService.updateProfileSearchResults()
                .then(result => {
                    $log.log('CardsCtrl: found ' + result.length + ' profiles')
                    result.map(profile => profile.image = profile.photoUrl)
                    // Make the search screen show for at least a certain time so it doesn't flash quickly
                    var elapsed = Date.now() - startTime
                    if(elapsed < MIN_SEARCH_TIME)
                        $timeout(() => $scope.profiles = result, MIN_SEARCH_TIME - elapsed)
                    else
                        $scope.profiles = result
                }, error => {
                    $log.log('updateProfileSearchResults error ' + JSON.stringify(error))
                    $scope.profiles = []
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
                    $log.log('discovery enabled. updating search results...')
                    updateProfileSearchResults()
                }
            )
        }

        $scope.viewDetails = (profile) => {
            $log.log('view details ' + JSON.stringify(profile))
            $state.go('^.search-profile-view', { profile: profile })
        }

        $scope.accept = () => {
            $log.log('accept button')
            var topProfile = $scope.profiles[$scope.profiles.length-1]
            AppService.processMatch(topProfile, true)
            topProfile.accepted = true // this triggers the animation out
            $timeout(() => $scope.profiles.pop(), 340)
        }

        $scope.reject = () => {
            $log.log('reject button')
            var topProfile = $scope.profiles[$scope.profiles.length-1]
            AppService.processMatch(topProfile, false)
            topProfile.rejected = true // this triggers the animation out
            $timeout(() => $scope.profiles.pop(), 340)
        }

        // matches are swiped off from the end of the $scope.profiles array (i.e. popped)

        $scope.cardDestroyed = (index) => $scope.profiles.splice(index, 1)

        $scope.cardTransitionLeft = (profile) => {
            AppService.processMatch(profile, false)
            if($scope.profiles.length == 0) {
                // TODO auto-load more?
            }
        }
        $scope.cardTransitionRight = (profile) => {
            AppService.processMatch(profile, true)
            if($scope.profiles.length == 0) {
                // TODO auto-load more?
            }
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

        $scope.matchProfile = matchProfile

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
                AppService.reportProfile('profile', $scope.matchProfile), // should pass in the match too
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
