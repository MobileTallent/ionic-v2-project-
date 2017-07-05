import ITranslateService = angular.translate.ITranslateService

module app {
	export class SearchProfileView {

		private translations
		public profile: IProfile
		public profilePointer
		private branchProfileId
		public isSameUser: Boolean

		static $inject = ['$log', '$scope', '$stateParams', '$ionicHistory', '$ionicActionSheet',
			'AppUtil', 'AppService', '$translate']
		constructor(private $log: ng.ILogService, private $scope: ng.IScope, private $stateParams,
			private $ionicHistory,
			private $ionicActionSheet, private AppUtil: AppUtil, private AppService: IAppService,
			private $translate: ITranslateService) {

			$translate(['REQUEST_FAILED', 'REPORT', 'INAPPROPRIATE_CONTENT', 'CANCEL']).then(translationsResult => {
				this.translations = translationsResult
			})
			$scope.$on('$ionicView.beforeEnter', (event, data) => this.ionViewWillEnter())
			$scope.$on('$ionicView.beforeLeave', (event, data) => this.ionViewWillLeave())

			this.profile = this.$stateParams['profile']
			this.$scope['profile'] = this.profile
		}

		ionViewWillEnter() {
			this.isSameUser = this.profile.objectId === this.AppService.getProfile().id
			if (this.AppService.branchProfileId) {
				this.branchProfileId = this.AppService.branchProfileId
			}
			this.AppService.getProfileOfSelectedUser(this.profile.objectId).then(profilePointer => {
				this.profilePointer = profilePointer				
			})
		}

		ionViewWillLeave() {
			if (this.AppService.branchProfileId)
				this.AppService.branchProfileId = ''
		}

		checkProfile(profile) {
			return profile.objectId === this
		}

		getMatchProfile() {
			let match = null
			if (this.branchProfileId) {
				let matchIndex = this.AppService.getProfileSearchResults().findIndex(this.checkProfile, this.profilePointer.id)
				if (matchIndex > 0) {
					match = this.AppService.getProfileSearchResults().splice(matchIndex, 1)[0]
				} else {
					match = this.profile
				}
			} else {
				match = this.AppService.getProfileSearchResults().pop()
			}

			return match
		}

		like() {
			let match = this.getMatchProfile()
			this.AppService.processMatch(match, true)
			if (this.AppService.branchProfileId) {
				this.AppService.branchProfileId = ''
				this.AppService.goToNextLoginState()
			} else {
				this.$ionicHistory.goBack()
			}
		}

		reject() {
			let match = this.getMatchProfile()
			this.AppService.processMatch(match, false)
			if (this.AppService.branchProfileId) {
				this.AppService.branchProfileId = ''
				this.AppService.goToNextLoginState()
			} else {
				this.$ionicHistory.goBack()
			}
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
