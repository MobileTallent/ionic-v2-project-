describe('controllers.SignInCtrl', function() {

	var $log, $q, $rootScope, $ionicPopup, AppService, AppUtil, SignInCtrl, $scope, profile

	beforeEach(function() {
		module('controllers', function($provide) {

			AppService = {
				getProfile: () => profile,
				saveProfile: (profileUpdate) => _.assign(profile, profileUpdate)
			}
			$provide.value('AppService', AppService)

			AppUtil = {
				blockingCall: (promise, success, errorKey) => success(promise)
			}
			$provide.value('AppUtil', AppUtil)

			$provide.value('SocialAuth', {})

			$provide.value('$ionicPopup', { alert: () => $q.when() })
		})

		inject(function($controller, _$log_, _$q_, _$rootScope_, _$ionicPopup_) {
			$log = _$log_
			$q = _$q_
			$rootScope = _$rootScope_
			$ionicPopup = _$ionicPopup_
			$scope = $rootScope.$new()
			SignInCtrl = $controller('SignInCtrl', { $scope: $scope })
		})
	})


	it('Facebook minimum age error alert', inject(() => {
		spyOn($ionicPopup, 'alert').and.callThrough()
		$scope._handleFacebookLoginError({code:'MINIMUM_AGE_ERROR'})
		expect($ionicPopup.alert).toHaveBeenCalled()
	}))


})