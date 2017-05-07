module app {


	/**
	 * Controller
	 */
	export class InfoCard {

		public card

		constructor(private $state, private $stateParams, private $sce) {
			this.card = this.$stateParams.card
			if(this.card.video) this.card.video = this.$sce.trustAsResourceUrl(this.card.video)
  			
			console.log(this.card)
		}
	}

	InfoCard.$inject = ['$state', '$stateParams', '$sce']
	angular.module('controllers').controller('InfoCard', InfoCard)
}
