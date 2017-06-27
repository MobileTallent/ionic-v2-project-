
/**
 * A directive to display an unread count badge
 */

angular.module('ionicApp').directive('unseenLikesBadge', function (AppService: app.IAppService) {
	return {
		restrict: 'E',
		scope: {},
		template: '<span ng-show="likesCount > 0" class="badge badge-assertive nav-icon-badge">{{likesCount}}</span>',
		replace: true, // Need replace otherwise when its used in the menu bar it doesnt work
		controller: function ($scope) {
			AppService.getProfilesWhoLikeMe()
			$scope.$on('getPeopleWhoLikesMeCountUpdated', () => $scope.likesCount = AppService.getPeopleWhoLikesMeCount())
			$scope.$on('getPeopleWhoLikesMeCountDeduced', () => $scope.likesCount--)
		}
	}
});