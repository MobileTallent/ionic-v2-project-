module app {


	/**
	 * Controller
	 */
	export class UserAdmin {

		public user: IUser
		public isMatch: Boolean
		public service_providers

		constructor(private $ionicPopup, public $ionicModal, private $log: ng.ILogService, private $scope: ng.IScope, private $ionicHistory,
			private $state, private $stateParams, private AppService, private AppUtil) {

			$scope.$on('$ionicView.beforeEnter', () => {
				let userId = this.$stateParams.userId
				this.$log.log('UserAdmin ' + userId)
				this.AppUtil.blockingCall(
					this.AppService.loadUser(userId),
					user => {
						this.user = user
						this.$log.log('loaded user ' + JSON.stringify(user))
						let matches = this.AppService.getMutualMatches()
						let match = _.find(matches, match => match.uid1 === userId || match.uid2 === userId)
						this.isMatch = match ? true : false
					})
			})

			this.AppService.getUserProviders(this.$stateParams.userId).then(function(success){
				$scope.providers = success
			})
			
			$ionicModal.fromTemplateUrl('admin/connectProviderModal.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(modal => $scope.connectModal = modal)
		}	

		public openConnect() {
			this.AppUtil.blockingCall(
                this.AppService.getServiceProviders(),
                service_providers => {
                    console.log('service_providers', service_providers);
                    this.service_providers = service_providers
                })
			this.$scope.connectModal.show()
		}
		public closeConnect() {
			this.$scope.connectModal.hide()
		}

		public chooseProvider(id, role) {
			for (var i = 0; i < this.$scope.providers.length; i++){
                if(this.$scope.providers[i].objectId==id) {
                    this.AppUtil.toastSimple('Provider already connected!')
                    return;
                }
            }

			let PrUser = {
				'pid':id,
				'uid':this.$stateParams.userId,
				'role': role
			}

			this.AppUtil.blockingCall(
                this.AppService.addProviderUser(PrUser).then(
					() => {
						this.AppUtil.toastSimple('User connected to provider!')
						this.$scope.connectModal.hide()
						this.$ionicHistory.goBack()
				}))
		}

		public deleteUser() {
			let myThis = this
			this.$ionicPopup.confirm({
				title: 'Confirm delete',
				okText: 'Delete',
				cancelText: 'Cancel'
			}).then(function (res) {
				if (res)
					myThis.AppUtil.blockingCall(
						myThis.AppService.deleteUser(myThis.user.id),
						() => {
							myThis.AppUtil.toastSimple('User deleted')
							myThis.$log.info('Deleted user ' + myThis.user.id)
							myThis.$ionicHistory.goBack()
						}
					)
			})
		}

		public banUser() {
			let myThis = this
			this.$ionicPopup.confirm({
				title: 'Confirm ban',
				okText: 'Ban',
				cancelText: 'Cancel'
			}).then(function (res) {
				if (res)
					myThis.AppUtil.blockingCall(
						myThis.AppService.reportProfile('admin reporting reasons', myThis.user.profile, null),
						() => {
							myThis.AppService.banUser(myThis.user.id).then(
								() => {
									myThis.AppUtil.toastSimple('User banned')
									myThis.$log.info('Banned user ' + myThis.user.id)
									myThis.$ionicHistory.goBack()
								})
						})
			})
		}

		public connectUser() {
			let myThis = this
			this.$ionicPopup.confirm({
				title: 'Connect to user',
				okText: 'Connect',
				cancelText: 'Cancel'
			}).then(function (res) {
				if (res)
					myThis.AppUtil.blockingCall(
						myThis.AppService.processMatchFromAdmin(myThis.user.profile, true, true),
						() => {
							myThis.AppUtil.toastSimple('User connected')
							myThis.$log.info('Established connection on user' + myThis.user.id)
							myThis.$ionicHistory.goBack()
						})
			})
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
								(sp) => {
									let PrUser = {
										pid:sp.objectId,
										uid:myThis.user.id,
										role:'main'
									}
									myThis.AppService.addProviderUser(PrUser).then(
										() => {
											myThis.AppUtil.toastSimple('User upgraded')
											myThis.$ionicHistory.goBack()
										})
								}) 
						})
			})
		}
	}

	UserAdmin.$inject = ['$ionicPopup', '$ionicModal', '$log', '$scope', '$ionicHistory', '$state', '$stateParams', 'AppService', 'AppUtil']
	angular.module('controllers').controller('UserAdmin', UserAdmin)
}
