module app {


	/**
	 * Controller
	 */
	export class CardsDeckSettings {

		public cards_settings

		constructor(private $scope, private $stateParams, public AppUtil, private AppService, public $ionicHistory) {
			$scope.$on('$ionicView.beforeEnter', () => this.refresh())
		}

		public refresh() {
			this.AppUtil.blockingCall(
                this.AppService.getCardsDeckSettings(),
                cards_settings => {
                    console.log('cards_settings', cards_settings);
                    this.cards_settings = cards_settings
            	}
			)
		}

		public makeSumarryArray = function(num) {
			var arr = new Array(num)
			if (this.cards_settings && this.cards_settings.info_cards) {
				var items_marked = this.cards_settings.deck_size / (this.cards_settings.cards_ratio + 1);
				for (var j = 1; j < items_marked + 1; j++) {
					arr[((j * (1 + this.cards_settings.cards_ratio)) - 1)] = 'info';
				}
			}
			return arr;

		}


		public save() {
			let myThis = this
			this.AppUtil.blockingCall(
                this.AppService.addCardsDeckSettings(this.cards_settings),
                () => {
                    console.log('Saved!');
					myThis.AppUtil.toastSimple('Deck settings saved!')
					myThis.$ionicHistory.goBack();
            	}
			)
		}

	}

	CardsDeckSettings.$inject = ['$scope', '$stateParams', 'AppUtil', 'AppService', '$ionicHistory']
	angular.module('controllers').controller('CardsDeckSettings', CardsDeckSettings)
}
