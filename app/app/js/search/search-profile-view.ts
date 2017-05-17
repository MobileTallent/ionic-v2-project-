import ITranslateService = angular.translate.ITranslateService

module app {
	export class SearchProfileView {

		private translations
		public profile: IProfile
		public profilePointer
		public branchUniversalObj
		private $cordovaSocialSharing
		private linkToBeShared
		private branchProfileId

		static $inject = ['$log', '$scope', '$stateParams', '$ionicHistory', '$ionicActionSheet', 'AppUtil', 'AppService', '$translate', '$cordovaSocialSharing']
		constructor(private $log: ng.ILogService, private $scope: ng.IScope, private $stateParams, private $ionicHistory,
			private $ionicActionSheet, private AppUtil: AppUtil, private AppService: IAppService,
			private $translate: ITranslateService, $cordovaSocialSharing) {

			this.$cordovaSocialSharing = $cordovaSocialSharing
			$translate(['REQUEST_FAILED', 'REPORT', 'INAPPROPRIATE_CONTENT', 'CANCEL']).then(translationsResult => {
				this.translations = translationsResult
			})
			if (this.AppService.branchProfileId) {
				this.branchProfileId = this.AppService.branchProfileId
				this.AppService.branchProfileId = ''
			}
			$scope.$on('$ionicView.beforeEnter', (event, data) => this.ionViewWillEnter())
		}

		ionViewWillEnter() {
			this.profile = this.$stateParams['profile']
			this.$scope['profile'] = this.profile
			this.AppService.getProfileOfSelectedUser(this.profile.objectId).then(profilePointer => {
				this.profilePointer = profilePointer

				if (typeof Branch !== 'undefined') {
					// only canonicalIdentifier is required
					var properties = {
						canonicalIdentifier: this.profilePointer.id,
						canonicalUrl: 'https://justababy.com/',
						title: 'A brand new way to make babies. Start your journey today.',
						contentDescription: 'Just a Baby is a brand new app connecting people who want to make a baby. We can help you find a surrogate, partner, co-parent, sperm or egg donor - or find someone that needs your help to have a baby.',
						contentImageUrl: this.profilePointer.photoUrl
					}

					// create a branchUniversalObj variable to reference with other Branch methods
					Branch.createBranchUniversalObject(properties).then(res => {
						this.branchUniversalObj = res

						var analyticsLink = {
							channel: 'facebook',
							feature: 'sharing',
							campaign: 'JustaBaby',
							tags: ['JustaBaby', 'justababy']
						}

						// optional fields
						var properties1 = {
							$desktop_url: 'https://justababy.com/',
							$android_url: 'https://play.google.com/store/apps/details?id=co.justababy.app',
							$ios_url: 'https://itunes.apple.com/us/app/just-a-baby/id1147759844?mt=8',
							profileId: this.profilePointer.id
						}
						if (this.branchUniversalObj) {
							this.branchUniversalObj.generateShortUrl(analyticsLink, properties1).then(res => {
								this.linkToBeShared = JSON.stringify(res.url)
							}).catch(function (err) {
								this.$log.error('Error: ' + JSON.stringify(err))
							})
						}
					}).catch(function (err) {
						this.$log.error('Error: ' + JSON.stringify(err))
					})
				}
			})
		}

		share() {
			var profileShare = "Hey I found this person with the following story on the new App:" + "\n\"" + this.profile.about + "\"\nSee for yourself by clicking here:"
			this.$cordovaSocialSharing.share(profileShare, null, null, this.linkToBeShared) // Share via native share sheet 
				.then(() => {
					if (typeof analytics !== 'undefined') {
						analytics.trackView("Share This Profile")
					}
					this.$log.debug('Social share action complete')
				}, error => {
					this.$log.error('Social share action error ' + JSON.stringify(error))
				})
		}

		checkProfile(profile) {
			return profile.objectId === this
		}

		getMatchProfile(){
			let match = null
			if (this.branchProfileId) {
				let matchIndex = this.AppService.getProfileSearchResults().findIndex(this.checkProfile, this.profilePointer.id)
				match = this.AppService.getProfileSearchResults().splice(matchIndex, 1)[0]
			} else
				match = this.AppService.getProfileSearchResults().pop()
			
			return match
		}

		like() {
			let match = this.getMatchProfile()
			this.AppService.processMatch(match, true)
			this.$ionicHistory.goBack()
		}

		reject() {
			let match = this.getMatchProfile()
			this.AppService.processMatch(match, false)
			this.$ionicHistory.goBack()
		}

		profileOptions() {
			this.$ionicActionSheet.show({
				destructiveText: this.translations.REPORT,
				titleText: this.translations.INAPPROPRIATE_CONTENT,
				cancelText: this.translations.CANCEL,
				cancel: function () {/**/ },
				destructiveButtonClicked: index => {
					this.report()
					return true
				}
			})
		}

		report() {
			let profile = this.getMatchProfile()
			this.AppUtil.blockingCall(
				this.AppService.reportProfile('inappropriate profile content', this.profilePointer, null),
				() => {
					this.AppService.processMatch(profile, false)
					this.$ionicHistory.goBack()
				})
		}
	}
	angular.module('ionicApp').controller('SearchProfileView', SearchProfileView)
}
