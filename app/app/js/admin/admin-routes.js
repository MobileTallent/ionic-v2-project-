angular.module('ionicApp').config(function ($stateProvider) {
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
})