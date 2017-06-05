module app {


	/**
	 * Controller
	 */
	export class AdminEmailSearch {

		public email: string = '' // search term
		public users: IUser[]
		// selected user for viewing details
		public user: IUser

		constructor(private $ionicPopup, private $log:ng.ILogService, private $scope:ng.IScope,
					private $state, private $ionicModal, private AppService:IAppService, private AppUtil:AppUtil) {

			$scope.$on('$ionicView.enter', () => {
				this.$log.debug('AdminEmailSearch $ionicView.enter')
				this.search()
			})
		}

		public search() {
			this.$scope['search'] = {email:this.email}
			this.$ionicPopup.show({
				template: '<input type="text" ng-model="search.email">',
				title: 'Enter email to search',
				subTitle: 'Minimum 4 characters. Searches starting with',
				scope: this.$scope,
				buttons: [
					{
						text: '<b>Search</b>',
						type: 'button-positive',
						onTap: e => {
							if (this.$scope['search'].email.length < 4) {
								this.AppUtil.toastSimple('Enter at least 4 characters')
								e.preventDefault()
								return
							}
							return this.$scope['search'].email
						}
					}
				]
			}).then(result => {
				this.$log.log('email search ', result)
				this.email = result
				this.AppUtil.blockingCall(
					this.AppService.searchUsersByEmail(result),
					users => {
						this.users = users
						this.$log.info('Found ' + users.length + ' users with email starting with ' + result)
					}
				)
			})
		}

	}

	AdminEmailSearch.$inject = ['$ionicPopup', '$log', '$scope', '$state', '$ionicModal', 'AppService', 'AppUtil']
	angular.module('controllers').controller('AdminEmailSearch', AdminEmailSearch)
}
