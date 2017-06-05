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
		private AppService: IAppService
		private AppUtil: AppUtil

		public profiles: IProfile[]

		private profileModal
		public profile // The profile being viewed
		public profileIndex // The index in profiles of the profile viewed

		constructor($log: ng.ILogService, $rootScope: app.IAppRootScope, $scope: ng.IScope,
			$state, $ionicModal, $ionicPopup, AppService: IAppService, AppUtil) {
			$log.info('LikedMe constructor')
			this.$log = $log
			this.$rootScope = $rootScope
			this.$scope = $scope
			this.$state = $state
			this.$ionicModal = $ionicModal
			this.$ionicPopup = $ionicPopup
			this.AppService = AppService
			this.AppUtil = AppUtil

			$ionicModal.fromTemplateUrl('profileModal.html', {
				scope: $scope,
				animation: 'slide-in-up'
			}).then(modal => this.profileModal = modal)
			// Cleanup the modal when we're done with it
			$scope.$on('$destroy', () => this.profileModal.remove())

			this.refresh()
		}

		public refresh() {

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

		private process(liked: boolean) {
			this.AppUtil.blockingCall(
				this.AppService.processMatch(this.profile, liked),
				() => {
					this.profiles.splice(this.profileIndex, 1)
					this.close()
				})
		}

		public close() {
			this.profileModal.hide()
			this.profileIndex = null
			this.profile = null
		}

		public onClickBadgeInfo() {
			var alertPopup = this.$ionicPopup.alert({
				title: 'Self Identification Badges',
				templateUrl: 'badgeInfo.html',
				buttons: [{
					text: 'Ok',
					type: 'button-assertive',

				}]
			})
		}

	}

	LikedMe.$inject = ['$log', '$rootScope', '$scope', '$state', '$ionicModal','$ionicPopup', 'AppService', 'AppUtil']
	angular.module('controllers').controller('LikedMe', LikedMe)
}
