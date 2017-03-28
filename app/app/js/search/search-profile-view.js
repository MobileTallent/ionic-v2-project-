angular.module('ionicApp')
	.controller('SearchProfileView', function ($log, $scope, $stateParams, $ionicHistory, $ionicActionSheet, AppUtil, AppService, $translate) {

		var translations
		$translate(['REQUEST_FAILED', 'REPORT', 'MATCH_OPTIONS', 'CANCEL']).then(translationsResult => {
			translations = translationsResult
		})

		$scope.$on('$ionicView.beforeEnter', (event, data) => {
			let profile = $stateParams['profile']
			$scope['profile'] = profile
		})

		$scope.like = () => {
			let match = AppService.getProfileSearchResults().pop()
			AppService.processMatch(match, true)
			$ionicHistory.goBack()
		}

		$scope.reject = () => {
			let match = AppService.getProfileSearchResults().pop()
			AppService.processMatch(match, false)
			$ionicHistory.goBack()
		}


		$scope.profileOptions = () => {
			$ionicActionSheet.show({
				destructiveText: translations.REPORT,
				titleText: translations.INAPPROPRIATE_CONTENT,
				cancelText: translations.CANCEL,
				cancel: function () { },
				destructiveButtonClicked: function (index) {
					$scope.report()
					return true
				}
			})
		}

		$scope.report = () => {
			let profile = AppService.getProfileSearchResults().pop()

			AppUtil.blockingCall(
				AppService.reportProfile('profile', profile),
				() => {
					AppService.processMatch(profile, false)
					$ionicHistory.goBack()
				}
			)
			console.log(`Reporting User: ${profile.name}`)
		}
	})