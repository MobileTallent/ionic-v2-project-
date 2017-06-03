module app {


	/**
	 * Controller
	 */
	export class Users {

		public users
		public provider_id

		constructor(private $scope, private $state, private $stateParams, private $sce, private $ionicPopup,
		private AppUtil, private AppService, private $ionicHistory) {
			this.provider_id = this.$stateParams.pid
			$scope.$on('$ionicView.beforeEnter', () => this.refresh())
		}

		public refresh() {
			this.AppUtil.blockingCall(
                this.AppService.getEnquiries(this.provider_id, null, 'true'),
                users => {
                    console.log('users', users);
                    this.users = users
            	}
			)
		}

	}

	Users.$inject = ['$scope', '$state', '$stateParams', '$sce', '$ionicPopup', 'AppUtil', 'AppService', '$ionicHistory']
	angular.module('controllers').controller('Users', Users)
}
