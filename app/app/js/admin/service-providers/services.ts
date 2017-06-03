module app {


	/**
	 * Controller
	 */
	export class Services {

		public services
		public provider_id

		constructor(private $scope, private $stateParams, private AppUtil, private AppService) {
			this.provider_id = this.$stateParams.pid
			$scope.$on('$ionicView.beforeEnter', () => this.refresh())
		}

		public refresh() {
			this.AppUtil.blockingCall(
                this.AppService.getPrServices(this.provider_id),
                services => {
                    console.log('services', services);
                    this.services = services
            	}
			)

							// let service = {
							// 	'pid':this.provider_id,
							// 	'title':'test',
							// 	'active': true,
							// 	'spiel': 'spiel about service',
							// 	"audience": {
							// 		"tags":["mens","womens"]
							// 	},
							// 	'image':'http://mspmentor.net/site-files/mspmentor.net/files/uploads/2014/11/Services.jpg',
							// 	'video':'',
							// 	'price': 20,
							//  "clicks":{"summary":0,"by_days":[{"summary":0,"by_days":[]}]},
							// 	"shows":{"summary":0}
							// }

							// this.AppService.addPrService(service).then(
							// 	() => {
							// 		console.log('added!')
							// 	})

		}

	}

	Services.$inject = ['$scope', '$stateParams', 'AppUtil', 'AppService']
	angular.module('controllers').controller('Services', Services)
}
