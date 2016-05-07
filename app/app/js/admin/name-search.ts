module app {


	/**
	 * Controller
	 */
	export class AdminNameSearch {

		public name: string = '' // search term
		public profiles: IProfile[]
		// selected user for viewing details
		public profile: IProfile

		constructor(private $ionicPopup, private $log:ng.ILogService, private $scope:ng.IScope,
					private $state, private $ionicModal, private AppService:IAppService, private AppUtil:AppUtil) {

			$scope.$on('$ionicView.enter', () => {
				this.search()
			})
		}

		public search() {
			// An elaborate, custom popup
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

	}

	AdminNameSearch.$inject = ['$ionicPopup', '$log', '$scope', '$state', '$ionicModal', 'AppService', 'AppUtil']
	angular.module('controllers').controller('AdminNameSearch', AdminNameSearch)
}
