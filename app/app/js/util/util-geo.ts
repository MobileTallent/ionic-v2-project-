class GeoUtils {


	// Credit to http://stackoverflow.com/questions/27928/how-do-i-calculate-distance-between-two-latitude-longitude-points
	static getDistanceFromLatLonInKm(lat1:number, lon1:number, lat2:number, lon2:number):number {
		if(!lat1 || !lon1 || !lat2 || !lon2) {
			console.log('Not all params supplied for getDistanceFromLatLonInKm')
			return null
		}
		var R = 6371 // Radius of the earth in km
		var dLat = this.degreesToRadians(lat2 - lat1)
		var dLon = this.degreesToRadians(lon2 - lon1)
		var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.cos(this.degreesToRadians(lat1)) * Math.cos(this.degreesToRadians(lat2)) *
			Math.sin(dLon / 2) * Math.sin(dLon / 2)
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
		var d = R * c // Distance in km
		return d
	}

	static degreesToRadians(degrees:number):number {
		return degrees * (Math.PI / 180)
	}

}
