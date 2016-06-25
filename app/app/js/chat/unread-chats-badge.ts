import IProfile = app.IProfile
import IAppService = app.IAppService

/**
 * A directive to display an unread count badge
 */
angular.module('ionicApp').directive('unreadChatsBadge', function(AppService:IAppService) {
	return {
		restrict: 'E',
		scope: {},
		template: '<span ng-show="unreadChats > 0" class="badge badge-assertive nav-icon-badge">{{unreadCount}}</span>',
		replace: true, // Need replace otherwise when its used in the menu bar it doesnt work
		controller: function($scope) {
			$scope.unreadCount = AppService.getUnreadChatsCount()
			$scope.$on('unreadChatsCountUpdated', () => $scope.unreadCount = AppService.getUnreadChatsCount())
		}
	}
});
