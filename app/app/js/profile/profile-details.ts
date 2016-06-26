import IProfile = app.IProfile
import IAppService = app.IAppService

/**
 * A directive to display the main details of a profile
 */
angular.module('ionicApp').directive('profileDetails', function(AppService:IAppService) {
	return {
		restrict: 'E',
		scope: {
			profile: '='
		},
		templateUrl: 'profile/profile-details.html',

		controller: function($scope) {
			let currentUserProfile = AppService.getProfile()
			let myLocation = currentUserProfile.location
			let profile = <IProfile>$scope.profile

			// Calculate the distance between this profile location and the current users profile location
			if (myLocation && profile.location) {
				let distance = GeoUtils.getDistanceFromLatLonInKm(profile.location.latitude, profile.location.longitude,
					myLocation.latitude, myLocation.longitude)
				if (currentUserProfile.distanceType === 'mi')
					distance *= 1.609344
				let distanceString = distance.toFixed(0)
				// Show 1km/1m as a minimum‰
				$scope.distance = (distanceString === '0' ? 1 : distance) + currentUserProfile.distanceType
			}

			$scope.isCurrentUser = profile.id === currentUserProfile.id
		}
	}
});
