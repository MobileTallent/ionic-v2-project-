/**
 * Filter which encapsulates calculating the image URL for a profile
 */
angular.module('ionicApp').filter('profileImageUrl', function() {
	return function(profile:app.IProfile):string {

		if (!profile) return ''

		if(profile.photos && profile.photos.length) {
			var photo = profile.photos[0]
			// The Parse JSON format converts the the url() functions to the _url field
			if(photo['_url'])
				return photo['_url']
			if(angular.isFunction(photo.url))
				return photo.url()
			if(angular.isString(photo.url))
				return photo['url']
		}

		return 'img/generic_avatar.jpg'
	}
})
