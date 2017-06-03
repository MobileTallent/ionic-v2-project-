angular.module('ionicApp').config(function($stateProvider, $urlRouterProvider) {

    $stateProvider
        .state('signin', {
            url: '/sign-in',
            templateUrl: 'sign-in.html',
            controller: 'SignInCtrl'
        })
        .state('emailVerification', {
            url: '/emailVerification',
            templateUrl: 'emailVerification.html',
            controller: 'EmailVerificationCtrl'
        })
        .state('profileSetup', {
            url: '/profileSetup',
            templateUrl: 'profileSetup.html',
            controller: 'ProfileSetupCtrl'
        })
        .state('walkthru', {
            url: '/walkthru',
            templateUrl: 'introWalkthrough.html',
            controller: 'WalkThruCtrl'
        })
        .state('findUs', {
            url: '/findUs',
            templateUrl: "findUs.html",
            controller: "FindUsCtrl",
            params: {
                username: null
            }
        })
        .state('locationSetup', {
            url: '/locationSetup',
            templateUrl: 'locationSetup.html',
            controller: 'LocationSetupCtrl'
        })
        .state('termsOfUse', {
            url: '/termsOfUse',
            templateUrl: 'termsOfUse.html',
            controller: 'TermsOfUseCtrl'
        })
        .state('banned', {
            templateUrl: 'banned.html'
        })
        .state('menu', {
            url: "/menu",
            abstract: true,
            templateUrl: "menu.html"
        })
        .state('menu.home', {
            url: "/home",
            views: {
                'menuContent': {
                    templateUrl: "profile-search.html",
                    controller: "ProfileSearch"
                }
            }
        })
        .state('menu.search-profile-view', {
            url: "/search-profile-view",
            views: {
                'menuContent': {
                    templateUrl: "search/search-profile-view.html"
                }
            },
            params: {
                profile: null
            }
        })
        .state('menu.match-profile', {
            url: "/match-profile/:matchId/:profileId",
            views: {
                'menuContent': {
                    templateUrl: "matchProfile.html",
                    controller: "MatchProfileCtrl"
                }
            },
            resolve: {
                matchProfile: function(AppService, $stateParams) {
                    if ($stateParams.matchId)
                        return AppService.getProfileByMatchId($stateParams.matchId)
                    else if ($stateParams.profileId)
                        return AppService.getProfileById($stateParams.profileId)
                }
            }
        })
        .state('menu.chats', {
            url: "/chats",
            views: {
                'menuContent': {
                    templateUrl: "chats.html",
                    controller: "ChatsCtrl"
                }
            }
        })
        .state('menu.chat', {
            url: "/chat/:matchId",
            views: {
                'menuContent': {
                    templateUrl: "chat.html",
                    controller: "ChatCtrl"
                }
            }
        })
        .state('menu.likedMe', {
            url: "/likedMe",
            views: {
                'menuContent': {
                    templateUrl: "likedMe.html",
                    controller: "LikedMe"
                }
            }
        })
        .state('menu.relationship', {
            url: "/relationship",
            views: {
                'menuContent': {
                    templateUrl: "relationship.html",
                    controller: "RelationshipCtrl"
                }
            }
        })
        .state('menu.profile', {
            url: "/profile",
            views: {
                'menuContent': {
                    templateUrl: "profile/profile-view-current-user.html",
                    controller: "ProfileViewCurrentUser"
                }
            }
        })
        .state('menu.profile-edit', {
            url: "/profile-edit",
            views: {
                'menuContent': {
                    templateUrl: "profile/profile-edit.html"
                }
            }
        })
        .state('menu.fb-albums', {
            url: '/fb-albums',
            views: {
                'menuContent': {
                    templateUrl: "fbAlbums.html",
                    controller: "FbAlbumsCtrl"
                }
            }
        })
        .state('menu.fb-album', {
            url: '/fb-album/:albumId',
            views: {
                'menuContent': {
                    templateUrl: "fbAlbum.html",
                    controller: "FbAlbumCtrl"
                }
            }
        })
        .state('menu.crop', {
            url: '/crop',
            views: {
                'menuContent': {
                    templateUrl: 'crop.html',
                    controller: 'PhotoCropCtrl'
                }
            }
        })
        .state('menu.discovery', {
            url: "/discovery",
            views: {
                'menuContent': {
                    templateUrl: "discovery.html",
                    controller: "DiscoveryCtrl"
                }
            }
        })
        .state('menu.location', {
            url: "/location",
            views: {
                'menuContent': {
                    templateUrl: "locationMap.html",
                    controller: "LocationCtrl"
                }
            }
        })
        .state('menu.clinics', {
            url: "/clinics",
            views: {
                'menuContent': {
                    templateUrl: "clinics.html",
                    controller: "ClinicsCtrl"
                }
            }
        })
        .state('menu.about', {
            url: "/about",
            views: {
                'menuContent': {
                    templateUrl: "about.html",
                    controller: "AboutCtrl"
                }
            }
        })
        .state('menu.settings', {
            url: "/settings",
            views: {
                'menuContent': {
                    templateUrl: "settings.html",
                    controller: "SettingsCtrl"
                }
            }
        })
        .state('menu.contact', {
            url: "/contact",
            views: {
                'menuContent': {
                    templateUrl: "contact.html",
                    controller: "ContactCtrl"
                }
            }
        })

        /*
            Info cards routes
        */
        .state('menu.info-card-detail', {
            url: "/info-card-detail/:id",
            views: {
                'menuContent': {
                    templateUrl: "info-cards/info-card-detail.html"
                }
            },
            params: {
                id:null,
                card: null
            }
        })
        .state('menu.service-detail', {
            url: "/service-detail",
            views: {
                'menuContent': {
                    templateUrl: "info-cards/service-detail.html"
                }
            },
            params: {
                service: null
            }
        })
        .state('menu.saved-cards', {
            url: "/saved-cards",
            views: {
                'menuContent': {
                    templateUrl: "info-cards/saved-cards.html"
                }
            }
        })


    $urlRouterProvider.otherwise("/sign-in")
});