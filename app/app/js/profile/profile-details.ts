import IProfile = app.IProfile
import IAppService = app.IAppService

/**
 * A directive to display the main details of a profile
 */
angular.module('ionicApp').directive('profileDetails', function (AppService: IAppService, $ionicPopup, $state, $ionicModal, $cordovaSocialSharing) {
	return {
		restrict: 'E',
		scope: {
			profile: '='
		},
		templateUrl: 'profile/profile-details.html',

		controller: function ($scope) {
			let currentUserProfile = AppService.getProfile()
			let myLocation = currentUserProfile.location
			let profile = <IProfile>$scope.profile


			// address and flags
			if (!profile.country && profile.location.latitude && profile.location.longitude) {
				let geocodingAPI = 'http://maps.googleapis.com/maps/api/geocode/json?latlng=' + profile.location.latitude
				geocodingAPI = geocodingAPI + ',' + profile.location.longitude + '&sensor=false&language=en';
				let num = 0
				let addArray
				let addComp

				fetch(geocodingAPI)
					.then(res => res.json())
					.then((out) => {
						if (out['results'][0]) {
							profile.address = out['results'][0].formatted_address;
							addArray = profile.address.split(',')
							if (out['results'][8]) num = 8
							else if (out['results'][7]) num = 7
							else if (out['results'][6]) num = 6
							else if (out['results'][5]) num = 5
							else if (out['results'][4]) num = 4
							else if (out['results'][3]) num = 3
							else if (out['results'][2]) num = 2
							else if (out['results'][1]) num = 1
							addComp = out['results'][num].address_components

							if (addComp.length === 1) {
								profile.country = out['results'][num].formatted_address
							} else {
								profile.country = addArray.slice(-1).pop().trim()
								let cntParsingNumber = profile.country.split(' ').pop()
								if (cntParsingNumber && !isNaN(cntParsingNumber)) {
									let lastIndex = profile.country.lastIndexOf(" ")
									profile.country = profile.country.substring(0, lastIndex)
								}
							}
						}
					})
					.catch(err => console.error(err));
			}

			// Calculate the distance between this profile location and the current users profile location
			if (myLocation && profile.location) {
				let distance = GeoUtils.getDistanceFromLatLonInKm(profile.location.latitude, profile.location.longitude,
					myLocation.latitude, myLocation.longitude)
				if (currentUserProfile.distanceType === 'mi')
					distance *= 0.621371
				let distanceString = distance.toFixed(0)
				// Show 1km/1m as a minimum‰
				$scope.distance = (distanceString === '0' ? 1 : distanceString) + currentUserProfile.distanceType
			}
			
			$scope.isCurrentUser = false
			$scope.onClickBadgeInfo = () => {
				var alertPopup = $ionicPopup.alert({
					title: 'Self Identification Badges',
					templateUrl: 'badgeInfo.html',
					buttons: [{
						text: 'Ok',
						type: 'button-assertive'
					}]
				})
			}

			$scope.onClickHelpBadgeInfo = () => {
				var alertPopup = $ionicPopup.alert({
					title: 'Help Identification Badges',
					templateUrl: 'badgeInfo-Help.html',
					buttons: [{
						text: 'Ok',
						type: 'button-assertive'
					}]
				})
			}


		// // // Self Id Badges \\ \\ \\

		$scope.spermImage = profile.personSperm ? 'img/Badges/active-Sperm.svg' : 'img/Badges/inactive-Sperm.svg'
    $scope.eggImage = profile.personEgg ? 'img/Badges/active-Egg.svg' : 'img/Badges/inactive-Egg.svg'
    $scope.wombImage = profile.personWomb ? 'img/Badges/active-Womb.svg' : 'img/Badges/inactive-Womb.svg'
    $scope.embryoImage = profile.personEmbryo ? 'img/Badges/active-Frozen-Embryo.svg' : 'img/Badges/inactive-Frozen-Embryo.svg'

			var canShare = typeof Branch !== 'undefined';

			$scope.canShare = canShare;
			$scope.share = () => {

				$scope.isLoading = true;

				// only canonicalIdentifier is required
				var contentDescriptionText = 'Just a Baby is a brand new app connecting people who want to make a baby.'
				contentDescriptionText = contentDescriptionText + ' We can help you find a surrogate, partner, co-parent,'
				contentDescriptionText = contentDescriptionText + ' sperm or egg donor - or find someone that needs your help to have a baby.'
				var properties = {
					canonicalIdentifier: profile.id ? profile.id : profile.objectId,
					canonicalUrl: 'https://justababy.com/',
					title: 'A brand new way to make babies. Start your journey today.',
					contentDescription: contentDescriptionText,
					contentImageUrl: getPhotoUrl(profile.photos)
				}

				// create a branchUniversalObj variable to reference with other Branch methods
				Branch.createBranchUniversalObject(properties).then(res => {
					var analyticsLink = {
						channel: 'facebook',
						feature: 'sharing',
						tags: ['JustaBaby', 'justababy']
					}
					
					// optional fields
					var properties1 = {
						$desktop_url: 'https://justababy.com/',
						$android_url: 'https://play.google.com/store/apps/details?id=co.justababy.app',
						$ios_url: 'https://itunes.apple.com/us/app/just-a-baby/id1147759844?mt=8',
						profileId: profile.id ? profile.id : profile.objectId
					}

					if (res) {
						res.generateShortUrl(analyticsLink, properties1).then(link => {
							$scope.linkToBeShared = link.url;
							
							var profileShare = "This person wants to have or help others make a baby: "
							profileShare = profileShare + "\n\n\"" + profile.about.toString() + "\"\n\nThought they could be a good match for you? \n\n"
							$scope.isLoading = false;
							$cordovaSocialSharing.share(profileShare, "test message", null, $scope.linkToBeShared) // Share via native share sheet
								.then(() => {
									if (typeof analytics !== 'undefined') {
										analytics.trackView('Share This Profile')
									}
									this.$log.debug('Social share action complete')
								}, error => {
									this.$log.error('Social share action error ' + JSON.stringify(error))
								})

						}).catch(function (err) {
							//alert('Error in Branch URL: ' + JSON.stringify(err))
						})
					}
				}).catch(function (err) {
					//alert('Error in creating Uni Obj: ' + JSON.stringify(err))
				})
				
			}

			function getPhotoUrl(photos) {
				if (photos && photos.length) {
					var photo = photos[0]
					if (photo._url)
						return photo._url
					if (angular.isFunction(photo.url))
						return photo.url()
					if (angular.isString(photo.url))
						return photo.url
				}

				return 'img/generic_avatar.jpg'
			}

			$ionicModal.fromTemplateUrl('profile/profile-upgrade-modal.html', {
				scope: $scope,
				animation: 'slide-in-up'
			}).then(function (modal) {
				$scope.upgradeModal = modal
			})

			$scope.continueUpgrade = function () {
				$scope.upgradeModal.hide()
				$state.go('^.upgrade-profile');
			}

			$scope.currentState = $state.current.name

		}
	}
})
