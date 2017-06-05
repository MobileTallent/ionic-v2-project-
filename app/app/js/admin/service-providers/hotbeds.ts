module app {


	/**
	 * Controller
	 */
	export class HotBeds {

		public hotbeds
		public provider_id

		constructor(private $scope, private $stateParams, private AppUtil, private AppService) {
			this.provider_id = this.$stateParams.pid
			$scope.$on('$ionicView.beforeEnter', () => this.refresh())
		}

		public refresh() {
			this.AppUtil.blockingCall(
                this.AppService.getHotBeds(this.provider_id),
                hotbeds => {
                    console.log('hotbeds', hotbeds);
                    this.hotbeds = hotbeds
            	}
			)

							// let hot_bed = {
							// 	'pid':this.provider_id,
							// 	"title":"Hot Bed #1",
							// 	"active":true,
							// 	"comments":"HotBeds comments",
							// 	"location": {
							// 		"name":"Thailand - Phuket - Patong",
							// 		"lat":"7.8916256",
							// 		"lon":"98.2986572"
							// 	}
							// }

							// this.AppService.addHotBed(hot_bed).then(
							// 	() => {
							// 		console.log('added!')
							// 	})
		}

	}

	HotBeds.$inject = ['$scope', '$stateParams', 'AppUtil', 'AppService']
	angular.module('controllers').controller('HotBeds', HotBeds)
}
