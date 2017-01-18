/**
 * Filter which returns the URL for a File object
 */
angular.module('ionicApp').filter('fileUrl', function() {
	return function(file:any):string {

		if (!file)
			return null
		if (file._url)
			return file._url
		if (angular.isFunction(file.url))
			return file.url()
		if (angular.isString(file.url))
			return file['url']

		throw 'unknown file ' + JSON.stringify(file)
	}
})
