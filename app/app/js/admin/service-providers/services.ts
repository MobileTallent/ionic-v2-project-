module app {


	/**
	 * Controller
	 */
	export class Services {

		public services

		constructor(private $stateParams) {

			this.refresh()
		}

		public refresh() {
			this.services = this.$stateParams.services;
		}

	}

	Services.$inject = ['$stateParams']
	angular.module('controllers').controller('Services', Services)
}
