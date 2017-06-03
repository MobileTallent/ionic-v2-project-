module app {


	/**
	 * Controller
	 */
	export class SpViewCard {

		public card

		constructor(private $scope, private $state, private $stateParams, private SpService, private $sce,
		private $ionicPopup, private AppUtil, private AppService, private $ionicHistory) {
			this.card = this.$stateParams.info_card
			if (this.card.video) this.card.video_url = this.$sce.trustAsResourceUrl(this.card.video)
			console.log(this.card)
		}

	}

	SpViewCard.$inject = ['$scope', '$state', '$stateParams', 'SpService', '$sce', '$ionicPopup', 'AppUtil', 'AppService', '$ionicHistory']
	angular.module('controllers').controller('SpViewCard', SpViewCard)
}
