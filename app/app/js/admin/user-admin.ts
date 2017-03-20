module app {


	/**
	 * Controller
	 */
	export class UserAdmin {

		public user: IUser

		constructor(private $ionicPopup, private $log:ng.ILogService, private $scope:ng.IScope, private $ionicHistory,
					private $state, private $stateParams, private AppService:IAppService, private AppUtil:AppUtil) {

			$scope.$on('$ionicView.beforeEnter', () => {
				this.$log.log('UserAdmin ' + this.$stateParams.userId)
				this.AppUtil.blockingCall(
					AppService.loadUser(this.$stateParams.userId),
					user => {
						this.user = user
						this.$log.log('loaded user ' + JSON.stringify(user))
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
						myThis.AppService.banUser(myThis.user.id),
						() => {
							myThis.AppUtil.toastSimple('User banned')
							myThis.$log.info('Banned user ' + myThis.user.id)
							myThis.$ionicHistory.goBack()
						}
					)
			})
		}

	}

	UserAdmin.$inject = ['$ionicPopup', '$log', '$scope', '$ionicHistory', '$state', '$stateParams', 'AppService', 'AppUtil']
	angular.module('controllers').controller('UserAdmin', UserAdmin)
}
