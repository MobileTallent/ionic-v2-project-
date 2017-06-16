module app {


	/**
	 * Controller
	 */
	export class Users {

		public users
		public provider_id
		public provider_owner_id

		constructor(private $scope, private $state, private $stateParams, private $sce, private $ionicPopup,
		public AppUtil, public AppService, private $ionicHistory) {
			this.provider_id = this.$stateParams.pid
			this.provider_owner_id = this.$stateParams.uid
			$scope.$on('$ionicView.beforeEnter', () => this.refresh())
		}

		public refresh() {
			this.users = []
			 this.AppUtil.blockingCall(
                this.AppService.getProviderUsers(this.provider_id),
                users => {
                    console.log('users', users);
                    this.users = users
            	}
			)
		}

		public deleteUser(pid,uid) {
			let myThis = this
            this.$ionicPopup.confirm({
				title: 'Remove user from provider',
				okText: 'Remove',
				cancelText: 'Cancel'
			}).then(function (res) {
				if (res) {
                    myThis.AppUtil.blockingCall(
                        myThis.AppService.delProviderUser(pid,uid),
						() => {
							myThis.AppUtil.toastSimple('User deleted')
                            myThis.refresh()
						}
                    )
                }
			})
		}

	}

	Users.$inject = ['$scope', '$state', '$stateParams', '$sce', '$ionicPopup', 'AppUtil', 'AppService', '$ionicHistory']
	angular.module('controllers').controller('Users', Users)
}
