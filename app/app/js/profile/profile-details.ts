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
			if (!ionic.Platform.isIOS() && profile.location.latitude && profile.location.longitude) {
				let geocodingAPI = "http://maps.googleapis.com/maps/api/geocode/json?latlng=" + profile.location.latitude + "," + profile.location.longitude + "&sensor=false&language=en";
				let num = 0
				let addArray
				let addComp

				fetch(geocodingAPI)
					.then(res => res.json())
					.then((out) => {
						profile.address = out['results'][0].formatted_address;
						addArray = profile.address.split(',')

						if (out['results'][8]) num = 8
						else if (out['results'][7]) num = 7
						else if (out['results'][6]) num = 6
						else if (out['results'][5]) num = 5
						else if (out['results'][4]) num = 4
						else if (out['results'][3]) num = 3
						else if (out['results'][2]) num = 2
						else if (out['results'][1]) num = 1
						addComp = out['results'][num].address_components

						if (addComp.length == 1)
							profile.country = out['results'][num].formatted_address
						else
							profile.country = addArray.slice(-1).pop().trim()
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
