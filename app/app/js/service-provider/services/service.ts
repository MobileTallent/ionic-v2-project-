module app {


	/**
	 * Controller
	 */
	export class SpViewService {

		public service
		public enquiries

		constructor(private $scope, private $state, private $stateParams, private SpService, private $sce, private $ionicPopup, private AppUtil, private AppService, private $ionicHistory) {
			this.service = this.$stateParams.service
			if(this.service.video) this.service.video = this.$sce.trustAsResourceUrl(this.service.video)
			console.log(this.service)
			$scope.$on('$ionicView.beforeEnter', () => this.refresh())
		}

		public refresh() {
			this.AppUtil.blockingCall(
                this.SpService.getEnquiries(this.service.id, false),
                enquiries => {
                    console.log('enquiries', enquiries);
                    this.enquiries = enquiries
            	}
			)
		}

	}
	
	SpViewService.$inject = ['$scope', '$state', '$stateParams', 'SpService', '$sce', '$ionicPopup', 'AppUtil', 'AppService', '$ionicHistory']
	angular.module('controllers').controller('SpViewService', SpViewService)
}
