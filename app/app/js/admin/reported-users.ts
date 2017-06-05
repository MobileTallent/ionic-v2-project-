module app {


	/**
	 * Controller
	 */
	export class ReportedUsers {


		private $log:ng.ILogService
		private $rootScope:app.IAppRootScope
		private $scope:ng.IScope
		private $state
		private $ionicModal
		private $ionicActionSheet
		private $q:ng.IQService
		private AppService:IAppService
		private AppUtil:AppUtil
		private $translate

		public reports
		// selected report for viewing details
		public report
		public reportDetails
		public reportModal

		constructor($log:ng.ILogService, $rootScope:app.IAppRootScope, $scope:ng.IScope, $q:ng.IQService,
					$state, $ionicModal, $ionicActionSheet, AppService:IAppService, AppUtil:AppUtil, $translate) {
			this.$log = $log
			this.$rootScope = $rootScope
			this.$scope = $scope
			this.$q = $q
			this.$state = $state
			this.$ionicModal = $ionicModal
			this.$ionicActionSheet = $ionicActionSheet
			this.AppService = AppService
			this.AppUtil = AppUtil
			this.$translate = $translate

			$ionicModal.fromTemplateUrl('admin/reportDetails.html', {
				scope: $scope,
				animation: 'slide-in-up'
			}).then(modal => this.reportModal = modal)
			// Cleanup the modal when we're done with it
			$scope.$on('$destroy', () => this.reportModal.remove())

			this.refresh()
		}

		public refresh() {
			this.AppUtil.blockingCall(
				this.AppService.getReportedUsers(),
				reports => this.reports = reports
			)
		}

		public viewDetails(report) {
			this.AppUtil.blockingCall(
				this.AppService.getReportedUserDetails(report),
				details => {
					this.report = report
					this.reportDetails = details
					// Extract the messages that were sent to the user who raised the report
					this.reportDetails.recentMessagesToReporter =
							_.filter(details.recentMessages, msg => msg.userIds.indexOf(report.reportedBy.id) > -1)
					if (this.reportDetails.recentMessagesToReporter.length > 6)
						this.reportDetails.recentMessagesToReporter.slice(0, 5)
					this.reportModal.show()
				}
			)
		}

		private fileUrl(photo) {
			if (photo.url)
				return photo.url()
			return photo._url
		}

		public deletePhoto(photoUrl) {
			this.$log.log('deleting photo at ' + photoUrl)
			this.AppUtil.blockingCall(
				this.AppService.deletePhoto(this.report.id, photoUrl),
					// On success remove the photo locally
				() => _.remove(this.report.profile.photos, photo => this.fileUrl(photo) === photoUrl)
			)
		}



		public actionReport() {
			this.$ionicActionSheet.show({
				buttons: [{text: 'Deleted Photo'}, {text: 'None'}],
				destructiveText: 'Ban User',
				titleText: 'Select Report Action',
				cancelText: this.$translate.instant('CANCEL'),
				// cancel: function () {},
				buttonClicked: (index) => {
					switch (index) {
						case 0:
							this.closeReport('deleted photo')
							break
						case 1:
							this.closeReport('none')
							break
					}
					return true
				},
				destructiveButtonClicked: (index) => {
					this.banUserAction()
					return true
				}
			})
		}


		private closeReport(action) {
			this.$log.log('Closing report ' + this.report.id + ' with action ' + action)
			this.AppUtil.blockingCall(
				this.AppService.closeReport(this.report.id, action),
				() => {
					this.closeModal()
					_.remove(this.reports, 'id', this.report.id)
					this.report = null
					this.reportDetails = null
				}
			)
		}

		/**
		 * Closes the report, and all other associated with the reported user, and bans the user.
		 */
		private banUserAction() {
			this.AppUtil.blockingCall(
				this.AppService.banUser(this.report.reportedUser),
				() => {
					this.closeModal()
					this.report = null
					this.reportDetails = null
					this.refresh() // could be multiple reports for the user which are now closed, so just refresh
				}
			)
		}

		public closeModal() {
			this.reportModal.hide()
		}


	}

	ReportedUsers.$inject = ['$log', '$rootScope', '$scope', '$q', '$state', '$ionicModal', '$ionicActionSheet',
		'AppService', 'AppUtil', '$translate']
	angular.module('controllers').controller('ReportedUsers', ReportedUsers)
}
