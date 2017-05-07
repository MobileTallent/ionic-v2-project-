module app {


	/**
	 * Controller
	 */
	export class ServiceProviders {

		public service_providers

		
		constructor(private $scope:ng.IScope, private AppUtil:AppUtil, private AppService:IAppService) {

			$scope.$on('$ionicView.beforeEnter', () => this.refresh())
		}

		public refresh() {

			this.AppUtil.blockingCall(
                this.AppService.getServiceProviders(),
                service_providers => {
                    console.log('service_providers', service_providers);
                    this.service_providers = service_providers
                })
			
		}

	}

	ServiceProviders.$inject = ['$scope', 'AppUtil', 'AppService']
	angular.module('controllers').controller('ServiceProviders', ServiceProviders)
}
