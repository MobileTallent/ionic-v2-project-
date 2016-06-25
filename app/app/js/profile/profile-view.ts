import IProfile = app.IProfile
import IAppService = app.IAppService

/**
 * A directive to display the main details of a profile
 */
angular.module('ionicApp').directive('profileView', function(AppService:IAppService) {
	return {
		restrict: 'E',
		scope: {
			profile: '=',
		},
		templateUrl: "profile/profile-view.html",

		controller: function($scope) {
			let currentUserProfile = AppService.getProfile()
			let myLocation = currentUserProfile.location
			let profile = <IProfile>$scope.profile

			// Calculate the distance between this profile location and the current users profile location
			if(myLocation && profile.location) {
				let distance = GeoUtils.getDistanceFromLatLonInKm(profile.location.latitude, profile.location.longitude, myLocation.latitude, myLocation.longitude)
				if(currentUserProfile.distanceType == 'mi')
					distance *= 1.609344
				let distanceString = distance.toFixed(0)
				// Show 1km/1m as a minimum‰
				$scope.distance = (distanceString == '0' ? 1 : distance) + currentUserProfile.distanceType
			}

			// If you want to display more if displaying the current user then add it here and in the template
			// if(profile.id === AppService.getProfile().id) {
			// }
		}
	}
});
