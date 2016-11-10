module app {

	/**
	 * Controller viewing the profiles who have relationships with the user
	 */
	export class RelationshipCtrl {

		private $log:ng.ILogService
		private $rootScope:app.IAppRootScope
		private $scope:ng.IScope
		private $state
		private $ionicModal
		private AppService:IAppService
		private AppUtil:AppUtil

		public profiles:IProfile[]

		private profileModal
		public profile // The profile being viewed
		public profileIndex // The index in profiles of the profile viewed

		constructor($log:ng.ILogService, $rootScope:app.IAppRootScope, $scope:ng.IScope,
					$state, $ionicModal, AppService:IAppService, AppUtil) {
			$log.info('RelationshipCtrl constructor')
			this.$log = $log
			this.$rootScope = $rootScope
			this.$scope = $scope
			this.$state = $state
			this.$ionicModal = $ionicModal
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

			this.AppService.getProfilesWhoWantsToHaveARelationshipWithMe()
				.then(profiles => {
					this.profiles = profiles
					this.$log.log('getProfilesWhoWantsToHaveARelationshipWithMe returned ' + profiles.length + ' profiles')

				}, error => {
					this.$log.error('Error loading profiles who wants to have a relationship with current user ' + JSON.stringify(error))
					this.AppUtil.toastSimple('Unable to load profiles')
				})
				.finally(() => this.$scope.$broadcast('scroll.refreshComplete'))
		}

		public view(index:number) {
			this.$log.debug('viewing profile who wants to have a relationship with me at index ' + index)
			this.profile = this.profiles[index]
			this.profileIndex = index
			this.profileModal.show()
		}

		public like() {
			this.$log.debug('approving relationship invite at index ' + this.profileIndex)
			this.process(true)
		}

		public pass() {
			this.$log.debug('declining relationship invite at index ' + this.profileIndex)
			this.process(false)
		}

		private process(relationship:boolean) {
			this.AppUtil.blockingCall(
				this.AppService.processPregnancy(this.profile, relationship),
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

	}

	RelationshipCtrl.$inject = ['$log', '$rootScope', '$scope', '$state', '$ionicModal', 'AppService', 'AppUtil']
	angular.module('controllers').controller('RelationshipCtrl', RelationshipCtrl)
}
