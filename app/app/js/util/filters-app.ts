/**
 * Filters which contain app specific functionality
 *
 */
angular.module('ionicApp')


	.filter('distance', ['AppService', function(AppService:app.IAppService) {
		/**
		 * Takes a ILocation and outputs the distance from the current users profile location
		 */
		return function(location:app.ILocation):string {

			if (!location || !angular.isNumber(location.latitude) || !angular.isNumber(location.longitude))
				return ''

			var userProfile = AppService.getProfile()

			var from = userProfile.location
			var to = location

			var distance = getDistanceFromLatLonInKm(from.latitude, from.longitude, to.latitude, to.longitude)

			if (userProfile.distanceType === 'mi')
				distance *= 0.621371

			let output:string = distance.toFixed(0)
			// Always say at least 1km even if less than that
			output = output === '0' ? '1' : output

			output += userProfile.distanceType

			//address and flags
			if(!ionic.Platform.isIOS() && userProfile.location.latitude && userProfile.location.longitude) {
				let geocodingAPI = "http://maps.googleapis.com/maps/api/geocode/json?latlng="+userProfile.location.latitude+","+userProfile.location.longitude+"&sensor=false&language=en";
				let num;
				let addArray;
				
				fetch(geocodingAPI)
				.then(res => res.json())
				.then((out) => {
					userProfile.address = out['results'][0].formatted_address;
					if (out['results'][8]) num = 8 
					else if (out['results'][7]) num = 7 
					else if (out['results'][6]) num = 6 
					else if (out['results'][5]) num = 5 
					else if (out['results'][4]) num = 4
					userProfile.country = out['results'][num].formatted_address;

					userProfile.address = out['results'][0].formatted_address
					addArray = userProfile.address.split(',')
					userProfile.country = addArray.slice(-1).pop().trim()
					
				})
				.catch(err => console.error(err));
			}

			return output


			// from http://stackoverflow.com/questions/27928/how-do-i-calculate-distance-between-two-latitude-longitude-points
			function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2): number {
				var R = 6371 // Radius of the earth in km
				var dLat = deg2rad(lat2 - lat1)
				var dLon = deg2rad(lon2 - lon1)
				var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
					Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
					Math.sin(dLon / 2) * Math.sin(dLon / 2);
				var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
				var d = R * c // Distance in km
				return d
			}

			function deg2rad(deg: number): number {
				return deg * (Math.PI / 180)
			}

		}
	}])
