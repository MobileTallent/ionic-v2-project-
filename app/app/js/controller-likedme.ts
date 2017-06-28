module app {

	/**
	 * Controller viewing the profiles who have liked the user
	 */
	export class LikedMe {

		private $log: ng.ILogService
		private $rootScope: app.IAppRootScope
		private $scope: ng.IScope
		private $state
		private $ionicModal
		private $ionicPopup
		private $ionicSlideBoxDelegate
		private $cordovaSocialSharing
		private AppService: IAppService
		private AppUtil: AppUtil
		public profiles: IProfile[]
		private linkToBeShared
		public isLoading

		private spermImage
		private eggImage
		private wombImage
		private embryoImage 



		private profileModal
		public profile // The profile being viewed
		public profileIndex // The index in profiles of the profile viewed

		constructor($log: ng.ILogService, $rootScope: app.IAppRootScope, $scope: ng.IScope,
			$state, $ionicModal, $ionicPopup, AppService: IAppService, AppUtil, $ionicSlideBoxDelegate, $cordovaSocialSharing) {
			$log.info('LikedMe constructor')
			this.$log = $log
			this.$rootScope = $rootScope
			this.$scope = $scope
			this.$state = $state
			this.$ionicModal = $ionicModal
			this.$ionicPopup = $ionicPopup
			this.AppService = AppService
			this.AppUtil = AppUtil
			this.$ionicSlideBoxDelegate = $ionicSlideBoxDelegate
			this.$cordovaSocialSharing = $cordovaSocialSharing

			this.$ionicModal.fromTemplateUrl('profileModal.html', {
				scope: $scope,
				animation: 'slide-in-up'
			}).then(modal => this.profileModal = modal)
			// Cleanup the modal when we're done with it
			this.$scope.$on('$destroy', () => this.profileModal.remove())
			this.refresh()
		}

		private refresh() {
			this.AppService.getProfilesWhoLikeMe()
				.then(profiles => {
					this.profiles = profiles
					this.$log.log('getProfilesWhoLikeMe returned ' + profiles.length + ' profiles')
				}, error => {
					this.$log.error('Error loading profiles who liked me ' + JSON.stringify(error))
					this.AppUtil.toastSimple('Unable to load profiles')
				})
				.finally(() => this.$scope.$broadcast('scroll.refreshComplete'))
		}


		public view(index: number) {
			this.$log.debug('viewing profile who liked me at index ' + index)
			this.profile = this.profiles[index]
			this.profileIndex = index

			this.spermImage = this.profile.personSperm ? 'img/Badges/active-Sperm.svg' : 'img/Badges/inactive-Sperm.svg'
    	this.eggImage = this.profile.personEgg ? 'img/Badges/active-Egg.svg' : 'img/Badges/inactive-Egg.svg'
    	this.wombImage = this.profile.personWomb ? 'img/Badges/active-Womb.svg' : 'img/Badges/inactive-Womb.svg'
    	this.embryoImage = this.profile.personEmbryo ? 'img/Badges/active-Frozen-Embryo.svg' : 'img/Badges/inactive-Frozen-Embryo.svg'

			this.profileModal.show()
		}

		public like() {
			this.$log.debug('liking profile at index ' + this.profileIndex)
			this.process(true)
		}

		public pass() {
			this.$log.debug('passing profile at index ' + this.profileIndex)
			this.process(false)
		}

		public share() {
			this.isLoading = true
			if (typeof Branch !== 'undefined') {
				// only canonicalIdentifier is required
				var contentDescriptionText = 'Just a Baby is a brand new app connecting people who want to make a baby.'
				contentDescriptionText = contentDescriptionText + ' We can help you find a surrogate, partner, co-parent,'
				contentDescriptionText = contentDescriptionText + ' sperm or egg donor - or find someone that needs your help to have a baby.'
				var properties = {
					canonicalIdentifier: this.profile.id ? this.profile.id : this.profile.objectId,
					canonicalUrl: 'https://justababy.com/',
					title: 'A brand new way to make babies. Start your journey today.',
					contentDescription: contentDescriptionText,
					contentImageUrl: this.getPhotoUrl(this.profile.photos)
				}

				// create a branchUniversalObj variable to reference with other Branch methods
				Branch.createBranchUniversalObject(properties).then(res => {
					var analyticsLink = {
						channel: 'facebook',
						feature: 'sharing',
						tags: ['JustaBaby', 'justababy']
					}

					// optional fields
					var properties1 = {
						$desktop_url: 'https://justababy.com/',
						$android_url: 'https://play.google.com/store/apps/details?id=co.justababy.app',
						$ios_url: 'https://itunes.apple.com/us/app/just-a-baby/id1147759844?mt=8',
						profileId: this.profile.id ? this.profile.id : this.profile.objectId
					}
					if (res) {
						res.generateShortUrl(analyticsLink, properties1).then(link => {
							this.linkToBeShared = link.url
							var profileShare = "This person wants to have or help others make a baby: "
							profileShare = profileShare + "\n\n\"" + this.profile.about.toString() + "\"\n\nThought they could be a good match for you? \n\n"
							this.isLoading = false
							 
							this.$cordovaSocialSharing.share(profileShare, null, null, this.linkToBeShared) // Share via native share sheet
								.then(() => {
									if (typeof analytics !== 'undefined') {
										analytics.trackView('Share This Profile')
									}
									this.$log.debug('Social share action complete')
								}, error => {
									this.$log.error('Social share action error ' + JSON.stringify(error))
								})
						}).catch(function (err) {
							alert('Error in Branch URL: ' + JSON.stringify(err))
						})
					}
				}).catch(function (err) {
					alert('Error in creating Uni Obj: ' + JSON.stringify(err))
				})
			}
		}

		private process(liked: boolean) {
			this.AppUtil.blockingCall(
				this.AppService.processMatch(this.profile, liked),
				() => {
					this.profiles.splice(this.profileIndex, 1)
					this.$rootScope.$broadcast('getPeopleWhoLikesMeCountDeduced')
					this.close()
				})
		}

		private getPhotoUrl(photos) {
			if (photos && photos.length) {
				var photo = photos[0]
				if (photo._url)
					return photo._url
				if (angular.isFunction(photo.url))
					return photo.url()
				if (angular.isString(photo.url))
					return photo.url
			}

			return 'img/generic_avatar.jpg'
		}

		public close() {
			this.$ionicSlideBoxDelegate.slide(0)
			this.profileIndex = null
			this.profile = null

			this.spermImage = null
    	this.eggImage = null
    	this.wombImage = null
    	this.embryoImage = null

			this.profileModal.hide()
		}

		public onClickBadgeInfo() {
			var alertPopup = this.$ionicPopup.alert({
				title: 'Self Identification Badges',
				templateUrl: 'badgeInfo.html',
				buttons: [{
					text: 'Ok',
					type: 'button-assertive'
				}]
			})
		}

	}


	LikedMe.$inject = ['$log', '$rootScope', '$scope', '$state', '$ionicModal',
		'$ionicPopup', 'AppService', 'AppUtil', '$ionicSlideBoxDelegate', '$cordovaSocialSharing']

	angular.module('controllers').controller('LikedMe', LikedMe)
}
