import IAppRootScope = app.IAppRootScope

module app {

	/**
	 * Controller for viewing the current users profile
	 */
	export class ProfileViewCurrentUser {

		constructor(private $rootScope:IAppRootScope, private $scope:ng.IScope, private $state,
					private AppService:IAppService) {
			$scope.$on('$ionicView.beforeEnter', () => this.ionViewWillEnter())
		}

		public profile:IProfile

		ionViewWillEnter() {
			this.profile = this.AppService.getProfile()
			this.$scope['profile'] = this.profile
		}
	}

	ProfileViewCurrentUser.$inject = ['$rootScope', '$scope', '$state', 'AppService']
	angular.module('ionicApp').controller('ProfileViewCurrentUser', ProfileViewCurrentUser)
}
