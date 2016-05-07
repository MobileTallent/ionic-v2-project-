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
			this.$ionicPopup.confirm({
				title: 'Confirm delete',
				okText: 'Delete',
				cancelText: 'Cancel'
			}).then(function (res) {
				if (res)
					this.AppUtil.blockingCall(
						this.AppService.deleteUser(this.user.id),
						() => {
							this.AppUtil.toastSimple('User deleted')
							this.$log.info('Deleted user ' + this.user.id)
							this.$ionicHistory.goBack()
						}
					)
			})
		}

		public banUser() {
			this.$ionicPopup.confirm({
				title: 'Confirm ban',
				okText: 'Ban',
				cancelText: 'Cancel'
			}).then(function (res) {
				if (res)
					this.AppUtil.blockingCall(
						this.AppService.banUser(this.user.id),
						() => {
							this.AppUtil.toastSimple('User banned')
							this.$log.info('Banned user ' + this.user.id)
							this.$ionicHistory.goBack()
						}
					)
			})
		}

	}

	UserAdmin.$inject = ['$ionicPopup', '$log', '$scope', '$ionicHistory', '$state', '$stateParams', 'AppService', 'AppUtil']
	angular.module('controllers').controller('UserAdmin', UserAdmin)
}
