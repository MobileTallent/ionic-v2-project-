module app {


	/**
	 * Controller
	 */
	export class SavedCards {

		public info_cards

		constructor(private $scope, private $stateParams, private AppUtil, private AppService) {
			$scope.$on('$ionicView.beforeEnter', () => this.refresh())
		}

		public refresh() {
			this.AppUtil.blockingCall(
                this.AppService.getSavedInfoCards(),
                info_cards => {
                    console.log('saved_info_cards', info_cards);
                    this.info_cards = info_cards
            	}
			)

		}

	}

	SavedCards.$inject = ['$scope', '$stateParams', 'AppUtil', 'AppService']
	angular.module('controllers').controller('SavedCards', SavedCards)
}
