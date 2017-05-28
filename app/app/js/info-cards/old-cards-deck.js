angular.module('controllers')

.controller('CardsDeckCtrl', function($log, $scope, $state, $timeout, $translate, $ionicSideMenuDelegate,
    TDCardDelegate, AppService, AppUtil, $ionicModal) {

    var translations
    $translate(['MATCHES_LOAD_ERROR']).then(function(translationsResult) {
        translations = translationsResult
    })

    // when $scope.cards is null then we haven't done a search
    // when $scope.cards is an empty array then there are no new matches
    $scope.cards = null
    $scope.noOneAround = false

    //var profile = $scope.profile = AppService.getProfile()
    
    //For test dev
    var profile = $scope.profile = {"photos":[{"__type":"File","name":null,"url":"https://storage.googleapis.com/justababy-prod.appspot.com/bb3e391d1f21bae10e9f90e01d450d30_profile.png"}],"uid":"MXm5iJTI74","enabled":true,"gps":true,"about":"Test account","distance":20000,"ageFrom":18,"ageTo":55,"distanceType":"km","notifyMatch":true,"notifyMessage":true,"createdAt":"2017-03-22T08:07:16.232Z","updatedAt":"2017-05-26T13:36:37.351Z","fbLikes":[],"birthdate":{"__type":"Date","iso":"1992-06-20T00:00:00.000Z"},"name":"Roman","gender":"M","guys":false,"girls":true,"location":{"__type":"GeoPoint","latitude":14.03,"longitude":100.61},"age":24,"personSperm":true,"personEgg":false,"personWomb":false,"personEmbryo":false,"thingsIHave":"S","hasSelfId":true,"personType":"1","personHelpLevel":"1","personCategory":"1","address":"4/190-4/200 ซอย คลองหลวง 21 Tambon Khlong Nung, Amphoe Khlong Luang, Chang Wat Pathum Thani 12120, Thailand","country":"Thailand","ACL":{"MXm5iJTI74":{"read":true,"write":true}},"objectId":"KX4KuJsQO6"}

    $scope.profilePhoto = profile.photoUrl


    $scope.deleteUnmatchedSwipes = () => AppUtil.blockingCall(
        AppService.deleteUnmatched(),
        success => $log.log(success),
        error => $log.error(error)
    )

    $scope.$on('$ionicView.enter', () => {
        if (profile.enabled) {
            // Check for any previously search results
            $scope.cards = []
                // If we haven't searched yet or we are coming back to the screen and there isn't any results then search for more
            if (!$scope.cards || $scope.cards.length === 0)
                $scope.searchAgain()
        }
    })

    $scope.$on('newProfileSearchResults', () => $scope.cards = AppService.getProfileSearchResults())

    $scope.searchAgain = () => {
        $scope.cards = null
        $scope.noOneAround = false
        updateProfileSearchResults()
    }


    var MIN_SEARCH_TIME = 2000

    function updateProfileSearchResults() {

        var startTime = Date.now()
        AppService.updateProfileSearchResults()
            .then(result => {
                $log.log('CardsCtrl: found ' + result.length + ' cards')
                $scope.noOneAround = result.length ? false : true
                result.map(profile => profile.image = profile.photoUrl)
                    // Make the search screen show for at least a certain time so it doesn't flash quickly
                var elapsed = Date.now() - startTime
                if (elapsed < MIN_SEARCH_TIME)
                    $timeout(() => $scope.cards = result, MIN_SEARCH_TIME - elapsed)
                else
                    //$scope.cards = result

                    //Test info cards push to Deck
                    $scope.cards.push({
                         "id":"557",
                          "info_card":true,
                          "flip":false,
                          "title":"Card #1",
                          "created_at":"10 Apr 2017",
                          "question":"How many peoples around the world ?",
                          "answer": "7000 peoples and this amount growing every day",
                          "image": "https://upload.wikimedia.org/wikipedia/commons/9/9d/HFH_Toronto_logo_cat-Peoples.png",
                          "type":"video",
                          "video": "https://www.youtube.com/embed/4y33h81phKU",
                          "audience": {
                            "tags":["mens", "womens"]
                          },
                          "options": {
                            "frequency":"5",
                            "age_from":"25",
                            "age_to":"35"
                          },
                          "shows":"25",
                          "clicks":"5"
                        });

                    $scope.cards.push({
                          "id":"559",
                          "info_card":true,
                          "flip":false,
                          "title":"Card #2",
                          "created_at":"11 Apr 2017",
                          "question":"What do you know about tigers ?",
                          "answer": "The tiger is the largest cat species, most recognisable for their pattern of dark vertical stripes on reddish-orange fur with a lighter underside.",
                          "image":"https://s-media-cache-ak0.pinimg.com/originals/b8/66/b3/b866b3966a8d45fb0bbfa02e796ee8f4.jpg",
                          "type":"image",
                          "video":"https://www.youtube.com/embed/4y33h81phKU",
                          "audience": {
                            "tags":["mens","womens"]
                          },
                          "options":{
                            "frequency":"15",
                            "age_from":"18",
                            "age_to":"25"
                          },
                          "shows":"55",
                          "clicks":"15"
                    });
                    
                    console.log('CARDSSSS', $scope.cards)
            }, error => {
                $log.log('updateProfileSearchResults error ' + JSON.stringify(error))
                $scope.cards = []
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

    $scope.viewDetails = (card) => {
        $log.log('view details ' + JSON.stringify(card))
        $state.go('^.search-profile-view', { profile: card })
    }

    $scope.accept = (card) => {
         if(card.flip===false) {
            card.flip = true;
            return;
        }
        if(card.flip===true) {
            $state.go('^.info-card-detail', { card: card })
            return;
        }
        
        $log.log('accept button')
        var topProfile = $scope.cards[$scope.cards.length - 1]
        AppService.processMatch(topProfile, true)
        topProfile.accepted = true // this triggers the animation out
        $timeout(() => $scope.cards.pop(), 340)
    }

    $scope.reject = (card) => {
        if(card.flip){
            card.flip = false;
            return;
        }
        $log.log('reject button')
        var topProfile = $scope.cards[$scope.cards.length - 1]
        AppService.processMatch(topProfile, false)
        topProfile.rejected = true // this triggers the animation out
        $timeout(() => $scope.cards.pop(), 340)
    }

    // matches are swiped off from the end of the $scope.cards array (i.e. popped)

    $scope.cardDestroyed = (index) => $scope.cards.splice(index, 1)

    $scope.cardTransitionLeft = (card) => {
        AppService.processMatch(card, false)
        if ($scope.cards.length == 0) {
            // TODO auto-load more?
        }
    }
    $scope.cardTransitionRight = (card) => {
        AppService.processMatch(card, true)
        if ($scope.cards.length == 0) {
            // TODO auto-load more?
        }
    }
});