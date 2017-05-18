import IProfile = app.IProfile
import IAppService = app.IAppService

/**
 * A directive to display the main details of a profile
 */
angular.module('ionicApp').directive('profileDetails', function (AppService: IAppService) {
	return {
		restrict: 'E',
		scope: {
			profile: '='
		},
		templateUrl: 'profile/profile-details.html',

		controller: function ($scope) {
			let currentUserProfile = AppService.getProfile()
			let myLocation = currentUserProfile.location
			let profile = <IProfile>$scope.profile


			//address and flags
			if(profile.location._latitude && profile.location._longitude) {
				let geocodingAPI = "http://maps.googleapis.com/maps/api/geocode/json?latlng="+profile.location._latitude+","+profile.location._longitude+"&sensor=false&language=en";
				let num;
				
				fetch(geocodingAPI)
				.then(res => res.json())
				.then((out) => {
					profile.address = out['results'][0].formatted_address;
					if (out['results'][6]) num = 6 
					else if (out['results'][5]) num = 5 
					else if (out['results'][4]) num = 4
					profile.country = out['results'][num].formatted_address;
					
				})
				.catch(err => console.error(err));
			}

			// Calculate the distance between this profile location and the current users profile location
			if (myLocation && profile.location) {
				let distance = GeoUtils.getDistanceFromLatLonInKm(profile.location.latitude, profile.location.longitude,
					myLocation.latitude, myLocation.longitude)
				if (currentUserProfile.distanceType === 'mi')
					distance *= 0.621371
				let distanceString = distance.toFixed(0)
				// Show 1km/1m as a minimum‰
				$scope.distance = (distanceString === '0' ? 1 : distanceString) + currentUserProfile.distanceType
			}
			$scope.isCurrentUser = profile.id === currentUserProfile.id
		}
	}
})
