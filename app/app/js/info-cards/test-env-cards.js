angular.module('controllers')

/*
//////
//BEFORE THAT WAS SEARCH-PROFILE controller
//////
*/

.controller('TestEnvCards', function($rootScope, $log, $scope, $state, $timeout, $translate, $ionicSideMenuDelegate,
    TDCardDelegate, AppService, AppUtil, $ionicModal, $ionicPopup) {

    var translations
    $translate(['MATCHES_LOAD_ERROR']).then(function(translationsResult) {
        translations = translationsResult
    })

    //
    /////
    ////////
    ///////////
    /////////////////////
    ///////////////////////////
    ////////////////////////////////
    /////////////////////////////////////
    ////////////////////////////////////////////
    ///////////////////////////////////////////////////

    //filters modal for TEST env
    $scope.filters = {
        profile_cards:true,
        info_cards:false,
        deck_size:150,
        cards_ratio:1
    }

    $scope.makeSumarryArray = function(num) {
        var arr = new Array(num)
        
        if($scope.filters.info_cards) {
            var items_marked = $scope.filters.deck_size/($scope.filters.cards_ratio+1);
            for(var j=1;j<items_marked+1;j++) {
                arr[((j*(1+$scope.filters.cards_ratio))-1)] = 'info';
            }
        }
        
        return arr;

    }
    $ionicModal.fromTemplateUrl('info-cards/filters-modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
    }).then(modal => $scope.filtersModal = modal)

    $scope.filtersClose = function (){
        $scope.filtersModal.hide();
        console.log($scope.filters);
        $scope.searchAgain()
    }
    /////////////////////////////////////////////////
    //////////////////////////////////////////////
    ////////////////////////////////////////
    /////////////////////////////////
    //////////////////////////
    ///////////////
    ///////
    ////
    //

    // when $scope.profiles is null then we haven't done a search
    // when $scope.profiles is an empty array then there are no new matches
    $scope.profiles = null
    $scope.noOneAround = false

    var profile = $scope.profile = AppService.getProfile()
    $scope.profilePhoto = profile.photoUrl

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

    var MIN_SEARCH_TIME = 2000

    function updateProfileSearchResults() {
        var startTime = Date.now()
        AppService.TestEnvCards($scope.filters)
            .then(result => {
                console.log('CARDS',result);

                $log.log('CardsCtrl: found ' + result.length + ' profiles')
                $scope.noOneAround = result.length ? false : true
                result.map(profile => profile.image = profile.photoUrl)
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
        $state.go('^.chat', { matchId: $scope.newMatch.id })
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
        var topProfile = $scope.profiles[$scope.profiles.length - 1]
        AppService.processMatch(topProfile, true)
        topProfile.accepted = true // this triggers the animation out
        $timeout(() => $scope.profiles.pop(), 340)
    }

    $scope.reject = () => {
        $log.log('reject button')
        var topProfile = $scope.profiles[$scope.profiles.length - 1]
        AppService.processMatch(topProfile, false)
        topProfile.rejected = true // this triggers the animation out
        $timeout(() => $scope.profiles.pop(), 340)
    }

    // matches are swiped off from the end of the $scope.profiles array (i.e. popped)
    $scope.cardDestroyed = (index) => $scope.profiles.splice(index, 1)

    $scope.cardTransitionLeft = (profile) => {
        AppService.processMatch(profile, false)
        if ($scope.profiles.length == 0) {
            // TODO auto-load more?
        }
    }

    $scope.cardTransitionRight = (profile) => {
        AppService.processMatch(profile, true)
        if ($scope.profiles.length == 0) {
            // TODO auto-load more?
        }
    }
})