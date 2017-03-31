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
})