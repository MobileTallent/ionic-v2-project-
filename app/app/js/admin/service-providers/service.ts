module app {


	/**
	 * Controller
	 */
	export class Service {

		public service
		public enquiries

		constructor(private $scope, private $state, private $stateParams, private $sce, private $ionicPopup, private AppUtil, private AppService, private $ionicHistory) {
			this.service = this.$stateParams.service
			if(this.service.video) this.service.video = this.$sce.trustAsResourceUrl(this.service.video)
			console.log(this.service)
			$scope.$on('$ionicView.beforeEnter', () => this.refresh())
		}

		public refresh() {
			this.AppUtil.blockingCall(
                this.AppService.getEnquiries(null, this.service.id, false),
                enquiries => {
                    console.log('enquiries', enquiries);
                    this.enquiries = enquiries
            	}
			)

			// let enquire = {		
			// 	'sid':'mALMsFKrCk',
			// 	'pid':'Kq91GI2OHd',
			// 	'uid':'1cEp7yJZnp',
			//  	'message':'I want enquire this service, very good service! i need it.',
			// 	'service_name':'Test service #1',
			// 	'name':'Nick',
			// 	'image_cover':'http://tandemvillas.ru/img/dummy_profile.jpg',
			// 	'has_read':false,
			// 	'u_email':'test@test.com',
			// 	'u_phone':'+79000000000',
			// 	'u_skype':'test.id'
			// }

			// this.AppService.addEnquire(enquire).then(
			// 	() => {
			// 		console.log('added!')
			// 	})
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
	
	Service.$inject = ['$scope', '$state', '$stateParams', '$sce', '$ionicPopup', 'AppUtil', 'AppService', '$ionicHistory']
	angular.module('controllers').controller('Service', Service)
}
