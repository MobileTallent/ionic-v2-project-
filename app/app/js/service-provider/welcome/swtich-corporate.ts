module app {

	/**
	 * Controller viewing the profiles who have liked the user
	 */
	export class SwitchCorporate {

		public service_providers
		public user_id

		constructor(public $rootScope, public $scope, public $ionicPopup, public SpService, public $state, public AppUtil, public AppService) {
			this.user_id = AppService.user.id
			$scope.$on('$ionicView.beforeEnter', () => this.refresh())
		}

		public refresh() {
			this.AppUtil.blockingCall(
                this.AppService.getUserProviders(this.user_id),
                service_providers => {
                    console.log('service_providers', service_providers);
                    this.service_providers = service_providers
                })
		}
	}

	SwitchCorporate.$inject = ['$rootScope', '$scope', '$ionicPopup', 'SpService', '$state', 'AppUtil', 'AppService']
	angular.module('controllers').controller('SwitchCorporate', SwitchCorporate)
}
