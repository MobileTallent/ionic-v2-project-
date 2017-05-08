module app {


	/**
	 * Controller
	 */
	export class ServiceProvider {

		public provider

		constructor(private $state, private $stateParams, private AppUtil, private AppService, private $ionicHistory, private $ionicPopup) {
			this.provider = this.$stateParams.provider
		}

		public delServiceProvider(provider) {
			let myThis = this
			this.$ionicPopup.confirm({
				title: 'Confirm delete',
				okText: 'Delete',
				cancelText: 'Cancel'
			}).then(function (res) {
				if (res)
					myThis.AppUtil.blockingCall(
						myThis.AppService.setServiceProvider(false, provider.uid),
						() => {		
							myThis.AppService.delServiceProvider(provider.id).then(
								() => {
									myThis.AppUtil.toastSimple('Provider deleted')
									myThis.$ionicHistory.goBack();
								})
						})
			})
		}
	}

	ServiceProvider.$inject = ['$state', '$stateParams', 'AppUtil', 'AppService', '$ionicHistory', '$ionicPopup']
	angular.module('controllers').controller('ServiceProvider', ServiceProvider)
}
