import IProfile = app.IProfile
import IAppService = app.IAppService

/**
 * Displays the appropriate profile image for a chat.
 * If there are two people in a chat, then always display the other person
 * If multiple people show the image of the last person who messaged, excluding the current user.
 * If no messages yet, then the person who last joined the chat
 */
angular.module('ionicApp').directive('chatProfileImage', function(AppService:IAppService) {
	return {
		restrict: 'E',
		scope: {
			chat: '='
		},
		template: '<img ng-src="{{::photoUrl}}" img-cache>',
		replace: true, // Need replace otherwise when its used in the menu bar it doesnt work
		controller: function($scope) {
			let chat:IMatch = $scope.chat

			// TODO
		}
	}
});
