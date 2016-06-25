import IAppRootScope = app.IAppRootScope


module app {

	interface ProfileViewCurrentUserScope extends ng.IScope {
		profile:IProfile
		likes
		friends
	}

	/**
	 * Controller for viewing the current users profile
	 */
	export class ProfileViewCurrentUser {

		constructor(private $rootScope:IAppRootScope, private $scope:ProfileViewCurrentUserScope, private $state,
					private AppService:IAppService) {
			$scope.$on('$ionicView.beforeEnter', () => this.ionViewWillEnter())
		}

		// public profile:IProfile
		// public likes
		// public friends

		ionViewWillEnter() {
			this.$scope.profile = this.AppService.getProfile()
		}
	}

	ProfileViewCurrentUser.$inject = ['$rootScope', '$scope', '$state', 'AppService']
	angular.module('ionicApp').controller('ProfileViewCurrentUser', ProfileViewCurrentUser)
}
