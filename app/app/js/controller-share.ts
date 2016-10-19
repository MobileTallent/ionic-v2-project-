module app {

	/**
	 * Controller for the social sharing action
	 */
	export class ShareController {

		private $log: ng.ILogService
		private $cordovaSocialSharing
		private socialShareMessage: string
		private socialShareSubject: string
		private playStoreUrl: string
		private itunesUrl: string
		private webStoreUrl: string
		private shareStoreUrl: string

		constructor($log: ng.ILogService, $cordovaSocialSharing, socialShareMessage: string,
			socialShareSubject: string, playStoreUrl: string, itunesUrl: string, webStoreUrl: string) {
			this.$log = $log
			this.$cordovaSocialSharing = $cordovaSocialSharing
			this.socialShareMessage = socialShareMessage
			this.socialShareSubject = socialShareSubject
			this.playStoreUrl = playStoreUrl
			this.itunesUrl = itunesUrl
			this.webStoreUrl = webStoreUrl
		}


		public share() {
			this.shareStoreUrl = ionic.Platform.isAndroid() ? this.playStoreUrl : ionic.Platform.isIOS() ? this.itunesUrl : this.webStoreUrl
			this.$cordovaSocialSharing.share(this.socialShareSubject, this.socialShareMessage, null, this.shareStoreUrl) // Share via native share sheet 
				.then(() => {
					this.$log.debug('Social share action complete')
				}, error => {
					this.$log.error('Social share action error ' + JSON.stringify(error))
				})
		}
	}

	ShareController.$inject = ['$log', '$cordovaSocialSharing', 'socialShareMessage', 'socialShareSubject',
			'playStoreUrl', 'itunesUrl', 'webStoreUrl']
	angular.module('controllers.share', ['constants', 'ngCordova.plugins.socialSharing', 'ionic'])
			.controller('ShareController', ShareController)
}