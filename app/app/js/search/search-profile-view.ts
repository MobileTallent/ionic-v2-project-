import ITranslateService = angular.translate.ITranslateService

module app {
	export class SearchProfileView {

		private translations
		public profile: IProfile
		public profilePointer

		static $inject = ['$log', '$scope', '$stateParams', '$ionicHistory', '$ionicActionSheet', 'AppUtil', 'AppService', '$translate']
		constructor(private $log: ng.ILogService, private $scope: ng.IScope, private $stateParams, private $ionicHistory,
			private $ionicActionSheet, private AppUtil: AppUtil, private AppService: IAppService,
			private $translate: ITranslateService) {

			$translate(['REQUEST_FAILED', 'REPORT', 'INAPPROPRIATE_CONTENT', 'CANCEL']).then(translationsResult => {
				this.translations = translationsResult
			})
			$scope.$on('$ionicView.beforeEnter', (event, data) => this.ionViewWillEnter())
		}

		ionViewWillEnter() {
			this.profile = this.$stateParams['profile']
			this.$scope['profile'] = this.profile
			this.AppService.getProfileOfSelectedUser(this.profile.objectId).then(profilePointer => {
				this.profilePointer = profilePointer
			})
		}

		like() {
			let match = this.AppService.getProfileSearchResults().pop()
			this.AppService.processMatch(match, true)
			this.$ionicHistory.goBack()
		}

		reject() {
			let match = this.AppService.getProfileSearchResults().pop()
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
			let profile = this.AppService.getProfileSearchResults().pop()
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
