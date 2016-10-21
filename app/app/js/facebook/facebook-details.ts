
interface FacebookDetailsScope extends ng.IScope {
	likes
	friends
}
/**
 * Display the facebook information for the currenly logged in user
 */
angular.module('ionicApp').directive('facebookDetails', function(AppService:IAppService, $rootScope:app.IAppRootScope, $cordovaFacebook) {
	return {
		restrict: 'E',
		scope: {},
		templateUrl: 'facebook/facebook-details.html',

		controller: function($scope:FacebookDetailsScope) {
			if ($rootScope.facebookConnected) {
				// Load the cached values first for quick update on the UI
				var likes = localStorage.getItem('facebookLikes')
				if (likes)
					$scope.likes = JSON.parse(likes)

				var friends = localStorage.getItem('facebookFriends')
				if (friends)
					$scope.friends = JSON.parse(friends)

				// Update asynchronously
				// Only friends registered with your app will be returned
				// See http://stackoverflow.com/questions/23417356/facebook-graph-api-v2-0-me-friends-returns-empty-or-only-friends-who-also-u
				$cordovaFacebook.api('/me/friends').then(result => {
					$scope.friends = result.data
					localStorage.setItem('facebookFriends', JSON.stringify(result.data))

					$cordovaFacebook.api('/me/likes').then(result => {
						$scope.likes = result.data
						localStorage.setItem('facebookLikes', JSON.stringify(result.data))
					})
				})
			}
		}
	}
})
