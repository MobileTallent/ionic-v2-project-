module app {


	/**
	 * Controller
	 */
	export class Service {

		public service

		constructor(private $state, private $stateParams, private $sce) {
			this.service = this.$stateParams.service
			if(this.service.video) this.service.video = this.$sce.trustAsResourceUrl(this.service.video)
  			
			console.log(this.service)
		}
	}

	Service.$inject = ['$state', '$stateParams', '$sce']
	angular.module('controllers').controller('Service', Service)
}
