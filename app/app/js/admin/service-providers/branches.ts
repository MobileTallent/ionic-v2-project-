module app {


	/**
	 * Controller
	 */
	export class Branches {

		public branches
		public provider_id

		constructor(private $scope, private $stateParams, private AppUtil, private AppService) {
			this.provider_id = this.$stateParams.pid
			$scope.$on('$ionicView.beforeEnter', () => this.refresh())
		}

		public refresh() {
			this.AppUtil.blockingCall(
                this.AppService.getBranches(this.provider_id),
                branches => {
                    console.log('branches', branches);
                    this.branches = branches
            	}
			)

							// let branch = {
							// 	'pid':this.provider_id,
							// 	"title":"Branch #1",
							// 	"location": {
							// 		"name":"Thailand - Phuket - Patong",
							// 		"lat":"7.8916256",
							// 		"lon":"98.2986572"
							// 	},
							// 	"location_point": new Parse.GeoPoint({ latitude: 7.8916256, longitude: 98.2986572}),
							// 	"services" : ["xTpGKXk3Lw"]
							// }
							// this.AppService.addBranch(branch).then(
							// 	() => {
							// 		console.log('added!')
							// 	})
		}

	}

	Branches.$inject = ['$scope', '$stateParams', 'AppUtil', 'AppService']
	angular.module('controllers').controller('Branches', Branches)
}
