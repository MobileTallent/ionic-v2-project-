module app {

    export class SpSeeUsers {

        public users
        public provider_owner_id
        public provider_id
        public name
		public user_role
        public profiles
		public user = null

        constructor(private $log, public $ionicLoading, private $scope, public $timeout,
        public $ionicModal, public $ionicHistory, private $ionicPopup, private AppService, private AppUtil, public SpService) {

            this.provider_owner_id = this.SpService.service_provider.uid
            this.provider_id = this.SpService.service_provider.objectId
			this.user_role = this.SpService.user_role

            $scope.$on('$ionicView.beforeEnter', () => this.doRefresh())

            $ionicModal.fromTemplateUrl('service-provider/users/connectProviderModal.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(modal => $scope.connectModal = modal)
			$ionicModal.fromTemplateUrl('service-provider/users/roleModal.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(modal => $scope.roleModal = modal)
        }

        public openConnect() {
			//get users by name
            this.$scope.connectModal.show()
            
            //searchbyname
			this.$scope['search'] = {name:this.name}
			this.$ionicPopup.show({
				template: '<input type="text" ng-model="search.name">',
				title: 'Enter name to search',
				subTitle: 'Minimum 4 characters. Searches starting with',
				scope: this.$scope,
				buttons: [
					{
						text: '<b>Search</b>',
						type: 'button-positive',
						onTap: e => {
							if (this.$scope['search'].name.length < 2) {
								this.AppUtil.toastSimple('Enter at least 2 characters')
								e.preventDefault()
								return
							}
							return this.$scope['search'].name
						}
					}
				]
			}).then(result => {
				this.$log.log('name search ', result)
				this.name = result
				this.AppUtil.blockingCall(
					this.AppService.searchUsersByName(result),
					profiles => {
						this.profiles = profiles
						this.$log.info('Found ' + profiles.length + ' profiles with name starting with ' + result)
					}
				)
			})
		}

		public closeConnect() {
			this.$scope.connectModal.hide()
		}

		public chooseUser(uid, role) {

            for (var i = 0; i < this.users.length; i++){
                if(this.users[i].uid==uid) {
                    this.AppUtil.toastSimple('User already connected!')
                    return;
                }
            }

			let PrUser = {
				'pid':this.provider_id,
				'uid':uid,
				'role': role
			}

			this.AppUtil.blockingCall(
                this.AppService.addProviderUser(PrUser).then(
					() => {
						this.AppUtil.toastSimple('User connected to provider!')
						this.$scope.connectModal.hide()
                        this.doRefresh()
				}))
		}

        public deleteUser(uid, pid) {
            let myThis = this
            this.$ionicPopup.confirm({
				title: 'Remove user from provider',
				okText: 'Remove',
				cancelText: 'Cancel'
			}).then(function (res) {
				if (res) {
                    myThis.AppUtil.blockingCall(
                        myThis.AppService.delProviderUser(pid,uid),
						() => {
							myThis.AppUtil.toastSimple('User deleted')
                            myThis.doRefresh()
						}
                    )
                }
			})
        }

		public closeRole() {
			this.$scope.roleModal.hide()
			this.user = null
		}

		public editUser(user) {

			
			user = {
				id : user.p_pr_user,
				objectId: user.p_pr_user,
				uid: user.uid,
				pid: this.SpService.provider_id,
				role: user.p_role
			} 

			console.log('!!!user before save!!!', user)

			this.AppUtil.blockingCall(
                this.AppService.addProviderUser(user).then(
					() => {
						this.AppUtil.toastSimple('User edited!')
						this.$scope.roleModal.hide()
                        this.doRefresh()
				}))
		}

        public doRefresh() {
            this.users = []
            this.AppUtil.blockingCall(
                this.AppService.getProviderUsers(this.provider_id),
                users => {
                    console.log('users', users);
                    this.users = users
            	}
			)
        }

    }

    SpSeeUsers.$inject = ['$log', '$ionicLoading', '$scope', '$timeout', '$ionicModal', '$ionicHistory','$ionicPopup', 'AppService', 'AppUtil', 'SpService']
    angular.module('controllers').controller('SpSeeUsers', SpSeeUsers)
}
