angular.module('ionicApp').config(function($stateProvider) {
    $stateProvider
        .state('menu.adminMenu', {
            url: "/admin",
            views: {
                'menuContent': {
                    templateUrl: "admin/adminMenu.html"
                }
            }
        })
        .state('menu.reportedUsers', {
            url: "/reportedUsers",
            views: {
                'menuContent': {
                    templateUrl: "admin/reportedUsers.html",
                    controller: "ReportedUsers"
                }
            }
        })
        .state('menu.bannedUsers', {
            url: "/bannedUsers",
            views: {
                'menuContent': {
                    templateUrl: "admin/bannedUsers.html",
                    controller: "BannedUsers"
                }
            }
        })
        .state('menu.applyBadges', {
            url: "/applyBadges",
            views: {
                'menuContent': {
                    templateUrl: "admin/applyBadges.html",
                    controller: "ApplyBadges"
                }
            }
        })
        .state('menu.adminEmailSearch', {
            url: "/adminEmailSearch",
            views: {
                'menuContent': {
                    templateUrl: "admin/adminEmailSearch.html"
                }
            }
        })
        .state('menu.adminNameSearch', {
            url: "/adminNameSearch",
            views: {
                'menuContent': {
                    templateUrl: "admin/adminNameSearch.html"
                }
            }
        })
        .state('menu.userAdmin', {
            url: "/userAdmin/:userId",
            views: {
                'menuContent': {
                    templateUrl: "admin/userAdmin.html"
                }
            }
        })
        .state('menu.adminPhotoReview', {
            url: "/adminPhotoReview/",
            views: {
                'menuContent': {
                    templateUrl: "admin/photo-review.html"
                }
            }
        })
        .state('menu.adminClinics', {
            url: "/adminClinics/",
            views: {
                'menuContent': {
                    templateUrl: "admin/clinics-question.html"
                }
            }
        })
        .state('menu.adminAbout', {
            url: "/adminAbout/",
            views: {
                'menuContent': {
                    templateUrl: "admin/about-jab.html"
                }
            }
        })
        .state('menu.adminWhereUHeardUs', {
            url: "/adminWhereUHeardUs/",
            views: {
                'menuContent': {
                    templateUrl: "admin/where-u-heard.html"
                }
            }
        })
        .state('menu.adminVoteReport', {
            url: "/adminVoteReport/",
            views: {
                'menuContent': {
                    templateUrl: "admin/vote-report.html"
                }
            }
        })
        .state('menu.adminGraph', {
            url: "/adminGraph/",
            views: {
                'menuContent': {
                    templateUrl: "admin/graph.html"
                }
            }
        })
        .state('menu.adminServiceProviders', {
            url: "/serviceProviders/",
            views: {
                'menuContent': {
                    templateUrl: "admin/service-providers/service-providers.html"
                }
            }
        })
        .state('menu.adminServiceProvider', {
            url: "/serviceProvider/",
            params: { 'provider':null },
            views: {
                'menuContent': {
                    templateUrl: "admin/service-providers/service-provider.html"
                }
            }
        })
        .state('menu.adminInfoCards', {
            url: "/infoCards/:pid",
            views: {
                'menuContent': {
                    templateUrl: "admin/service-providers/info-cards.html"
                }
            }
        })
        .state('menu.adminInfoCard', {
            url: "/infoCard/",
            params: { 'card':null },
            views: {
                'menuContent': {
                    templateUrl: "admin/service-providers/info-card.html"
                }
            }
        })
        .state('menu.adminServices', {
            url: "/services/",
            params: { 'services':null },
            views: {
                'menuContent': {
                    templateUrl: "admin/service-providers/services.html"
                }
            }
        })
        .state('menu.adminService', {
            url: "/service/",
            params: { 'service':null },
            views: {
                'menuContent': {
                    templateUrl: "admin/service-providers/service.html"
                }
            }
        })
        .state('menu.adminHotBeds', {
            url: "/hotbeds/",
            params: { 'hotbeds':null },
            views: {
                'menuContent': {
                    templateUrl: "admin/service-providers/hotbeds.html"
                }
            }
        })
        .state('menu.adminHotBed', {
            url: "/hotbed/",
            params: { 'hotbed':null },
            views: {
                'menuContent': {
                    templateUrl: "admin/service-providers/hotbed.html"
                }
            }
        })
        .state('menu.adminUsers', {
            url: "/users/",
            params: { 'users':null },
            views: {
                'menuContent': {
                    templateUrl: "admin/service-providers/users.html"
                }
            }
        })
}) 