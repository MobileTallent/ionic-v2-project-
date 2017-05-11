module app {


	/**
	 * Controller
	 */
	export class Service {

		public service

		constructor(private $state, private $stateParams, private $sce, private $ionicPopup, private AppUtil, private AppService, private $ionicHistory) {
			this.service = this.$stateParams.service
			if(this.service.video) this.service.video = this.$sce.trustAsResourceUrl(this.service.video)
			console.log(this.service)
		}

		public delPrService(service) {
			let myThis = this
			this.$ionicPopup.confirm({
				title: 'Confirm delete',
				okText: 'Delete',
				cancelText: 'Cancel'
			}).then(function (res) {
				if (res)
					myThis.AppUtil.blockingCall(
							myThis.AppService.delPrService(service.id),
								() => {
									myThis.AppUtil.toastSimple('Service deleted')
									myThis.$ionicHistory.goBack();
								}
							)
						
			})
		}
	}
	
	Service.$inject = ['$state', '$stateParams', '$sce', '$ionicPopup', 'AppUtil', 'AppService', '$ionicHistory']
	angular.module('controllers').controller('Service', Service)
}
