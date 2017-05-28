module app {
	export class ServiceDetail {

		public service;

		static $inject = ['$stateParams', '$ionicHistory', '$sce', '$ionicLoading', '$timeout', '$ionicPopup']
		constructor(private $stateParams, public $ionicHistory, private $sce, private $ionicLoading, private $timeout, private $ionicPopup) {
			this.service = this.$stateParams.service
			if(this.service.video) this.service.video = this.$sce.trustAsResourceUrl(this.service.video)
		}

		public get_service = () => {
			this.$ionicLoading.show({ templateUrl: 'loading.html' })
			 setTimeout(() => {
				this.$ionicLoading.hide();
				this.$ionicPopup.alert({
					title: 'Success!',
					subTitle: 'Service provider will contact you soon! ',
				}).then((res) => {
					this.$ionicHistory.goBack();
				});    
    		}, 1000);
		};
	}

	angular.module('ionicApp').controller('ServiceDetail', ServiceDetail)
}
