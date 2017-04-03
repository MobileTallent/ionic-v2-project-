module app {


	/**
	 * Controller
	 */
	export class UserAdmin {

		public user: IUser
		public isMatch: Boolean

		constructor(private $ionicPopup, private $log: ng.ILogService, private $scope: ng.IScope, private $ionicHistory,
			private $state, private $stateParams, private AppService: IAppService, private AppUtil: AppUtil) {

			$scope.$on('$ionicView.beforeEnter', () => {
				let userId = this.$stateParams.userId
				this.$log.log('UserAdmin ' + userId)
				this.AppUtil.blockingCall(
					this.AppService.loadUser(userId),
					user => {
						this.user = user
						this.$log.log('loaded user ' + JSON.stringify(user))
						let matches = this.AppService.getMutualMatches()
						let match = _.find(matches, match => match.uid1 === userId || match.uid2 === userId)
						this.isMatch = match ? true : false
					})
			})
		}

		public deleteUser() {
			let myThis = this
			this.$ionicPopup.confirm({
				title: 'Confirm delete',
				okText: 'Delete',
				cancelText: 'Cancel'
			}).then(function (res) {
				if (res)
					myThis.AppUtil.blockingCall(
						myThis.AppService.deleteUser(myThis.user.id),
						() => {
							myThis.AppUtil.toastSimple('User deleted')
							myThis.$log.info('Deleted user ' + myThis.user.id)
							myThis.$ionicHistory.goBack()
						}
					)
			})
		}

		public banUser() {
			let myThis = this
			this.$ionicPopup.confirm({
				title: 'Confirm ban',
				okText: 'Ban',
				cancelText: 'Cancel'
			}).then(function (res) {
				if (res)
					myThis.AppUtil.blockingCall(
						myThis.AppService.reportProfile('admin reporting reasons', myThis.user.profile, null),
						() => {
							myThis.AppService.banUser(myThis.user.id).then(
								() => {
									myThis.AppUtil.toastSimple('User banned')
									myThis.$log.info('Banned user ' + myThis.user.id)
									myThis.$ionicHistory.goBack()
								})
						})
			})
		}

		public connectUser() {
			let myThis = this
			this.$ionicPopup.confirm({
				title: 'Connect to user',
				okText: 'Connect',
				cancelText: 'Cancel'
			}).then(function (res) {
				if (res)
					myThis.AppUtil.blockingCall(
						myThis.AppService.processMatchFromAdmin(myThis.user.profile, true, true),
						() => {
							myThis.AppUtil.toastSimple('User connected')
							myThis.$log.info('Established connection on user' + myThis.user.id)
							myThis.$ionicHistory.goBack()
						})
			})
		}
	}

	UserAdmin.$inject = ['$ionicPopup', '$log', '$scope', '$ionicHistory', '$state', '$stateParams', 'AppService', 'AppUtil']
	angular.module('controllers').controller('UserAdmin', UserAdmin)
}
