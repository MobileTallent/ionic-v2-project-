module app {


	/**
	 * Controller
	 */
	export class HotBeds {

		public hotbeds

		constructor(private $stateParams) {

			this.refresh()
		}

		public refresh() {
			this.hotbeds = this.$stateParams.hotbeds;
		}

	}

	HotBeds.$inject = ['$stateParams']
	angular.module('controllers').controller('HotBeds', HotBeds)
}
