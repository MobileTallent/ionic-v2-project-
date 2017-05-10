module app {


	/**
	 * Controller
	 */
	export class InfoCards {

		public info_cards
		public provider_id:string

		constructor(private $scope, private $stateParams, private AppUtil, private AppService) {
			this.provider_id = this.$stateParams.pid
			$scope.$on('$ionicView.beforeEnter', () => this.refresh())
		}

		public refresh() {
			this.AppUtil.blockingCall(
                this.AppService.getInfoCards(this.provider_id),
                info_cards => {
                    console.log('info_cards', info_cards);
                    this.info_cards = info_cards
            	}
			)

							// let info_card = {
							// 	'pid':this.provider_id,
							// 	"title":"Tigers Card #1",
							// 	"question":"How many peoples around the world ?",
							// 	"answer": "7000 peoples and this amount growing every day",
							// 	"image": "https://upload.wikimedia.org/wikipedia/commons/9/9d/HFH_Toronto_logo_cat-Peoples.png",
							// 	"type":"video",
							// 	"video": "https://www.youtube.com/embed/4y33h81phKU",
							// 	"audience": {
							// 		"tags":["mens","womens"]
							// 	},
							// 	"options":{
							// 		"frequency":"5",
							// 		"age_from":"25",
							// 		"age_to":"35"
							// 	},
							// 	"shows":"0",
							// 	"clicks":"0"
							// }

							// this.AppService.addInfoCard(info_card).then(
							// 	() => {
							// 		console.log('added!')
							// 	})


		}

	}

	InfoCards.$inject = ['$scope', '$stateParams', 'AppUtil', 'AppService']
	angular.module('controllers').controller('InfoCards', InfoCards)
}
