module app {

	/**
	 * Controller for viewing the current users profile
	 */
	export class UpgradeProfileCtrl {

		public user 

		constructor(private $rootScope, private $scope, private $state, public $ionicHistory, public $ionicPopup, public AppUtil, private AppService, public ParseService) {
			this.user = this.AppService.user	
		}

		public upgradeToServiceProvider() {
			let myThis = this
			this.$ionicPopup.confirm({
				title: 'Confirm upgrade',
				okText: 'Upgrade',
				cancelText: 'Cancel'
			}).then(function (res) {
				if (res)
					myThis.AppUtil.blockingCall(
						myThis.AppService.setServiceProvider(true, myThis.user.id),
						() => {

							let service_provider = {
								'name': myThis.user.profile.name + '\'s Provider',
								'country': myThis.user.profile.country,
								'uid': myThis.user.id,
								'image_cover' : myThis.user.profile.photos[0]._url,
								'email': myThis.user.getEmail(),
								'phone_number':'',
								'balance': 0
							}

							myThis.AppService.addServiceProvider(service_provider).then(
								() => {
									myThis.$rootScope.serviceProvider = true
									myThis.$ionicHistory.goBack()
									//show popup
									myThis.$ionicPopup.confirm({
										title: 'Succesfull upgraded!',
										okText: 'Switch to corporate app',
										cancelText: 'Stay here'
									}).then(function (res) {
										if(res) {
											myThis.ParseService.getMyServiceProvider(myThis.user.id).then(provider => {
                      							  myThis.AppService.service_provider = provider
												  myThis.$state.go('sp-welcome')
                    						})
										}
									})
								})
						})
			})
		}
	}

	UpgradeProfileCtrl.$inject = ['$rootScope', '$scope', '$state', '$ionicHistory', '$ionicPopup', 'AppUtil', 'AppService', 'ParseService']
	angular.module('ionicApp').controller('UpgradeProfileCtrl', UpgradeProfileCtrl)
}
