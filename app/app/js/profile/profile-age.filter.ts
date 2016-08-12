/**
 * Filter which displays the age for a profile
 */
angular.module('ionicApp').filter('profileAge', function() {
	return function(profile:app.IProfile):any {

		// Profiles from other users will have the age
		if(profile.age)
			return profile.age
		// The profile for the current user will have the birthdate
		if(profile.birthdate)
			return new Date(new Date - profile.birthdate).getFullYear()-1970

		return ''
	}
})
