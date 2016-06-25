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
			let myLocation = AppService.getProfile().location
			let profile = <IProfile>$scope.profile
			
			if(myLocation && profile.location) {
				let distance = GeoUtils.getDistanceFromLatLonInKm(profile.location.latitude, profile.location.longitude, myLocation.latitude, myLocation.longitude)
				if(AppService.getProfile().distanceType == 'mi')
					distance *= 1.609344
				let distanceString = distance.toFixed(0)
				// Show 1km/1m as a minimum‰
				$scope.distance = distanceString == '0' ? 1 : distance
			}
		}
	}
});
