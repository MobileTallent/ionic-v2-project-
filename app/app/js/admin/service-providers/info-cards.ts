module app {


	/**
	 * Controller
	 */
	export class InfoCards {

		public info_cards

		constructor(private $stateParams) {

			this.refresh()
		}

		public refresh() {
			this.info_cards = this.$stateParams.info_cards;
		}

	}

	InfoCards.$inject = ['$stateParams']
	angular.module('controllers').controller('InfoCards', InfoCards)
}
