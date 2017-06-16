module app {


	/**
	 * Controller
	 */
	export class ServiceProvider {

		public provider
		public lengths

		constructor(private $scope, private $state, private $stateParams, private AppUtil, private AppService,
		private $ionicHistory, private $ionicPopup) {
			this.provider = this.$stateParams.provider
			$scope.$on('$ionicView.beforeEnter', () => this.refresh())
		}

		public refresh() {
			this.AppUtil.blockingCall(
                this.AppService.getServiceProviderLengths(this.provider.id),
                lengths => {
                    console.log('lengths', lengths);
                    this.lengths = lengths
            	}
			)
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
									myThis.AppService.delProviderUser(provider.id, null).then(
										() => {
											myThis.AppUtil.toastSimple('Provider deleted')
											myThis.$ionicHistory.goBack();
										})
								})
						})
			})
		}
	}

	ServiceProvider.$inject = ['$scope', '$state', '$stateParams', 'AppUtil', 'AppService', '$ionicHistory', '$ionicPopup']
	angular.module('controllers').controller('ServiceProvider', ServiceProvider)
}
