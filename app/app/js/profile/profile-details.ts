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
			if (!ionic.Platform.isIOS() && !profile.country && profile.location.latitude && profile.location.longitude) {
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

							if (out['results'][8]) {
								num = 8
							} else {
								if (out['results'][7]) {
									num = 7
								} else {
									if (out['results'][6]) {
										num = 6
									} else {
										if (out['results'][5]) {
											num = 5
										} else {
											if (out['results'][4]) {
												num = 4
											} else {
												if (out['results'][3]) {
													num = 3
												} else {
													if (out['results'][2]) {
														num = 2
													} else {
														if (out['results'][1]) {
															num = 1
														}
													}
												}
											}
										}
									}
								}
							}

							addComp = out['results'][num].address_components

							if (addComp.length === 1) {
								profile.country = out['results'][num].formatted_address
							} else {
								profile.country = addArray.slice(-1).pop().trim()
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

			if (typeof Branch !== 'undefined') {
				// only canonicalIdentifier is required
				var contentDescriptionText = 'Just a Baby is a brand new app connecting people who want to make a baby.'
				contentDescriptionText = contentDescriptionText + ' We can help you find a surrogate, partner, co-parent,'
				contentDescriptionText = contentDescriptionText + ' sperm or egg donor - or find someone that needs your help to have a baby.'
				var properties = {
					canonicalIdentifier: profile.id,
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
						profileId: profile.id
					}
					if (res) {
						res.generateShortUrl(analyticsLink, properties1).then(link => {
							$scope.linkToBeShared = JSON.stringify(link.url)
						}).catch(function (err) {
							alert('Error in Branch URL: ' + JSON.stringify(err))
						})
					}
				}).catch(function (err) {
					alert('Error in creating Uni Obj: ' + JSON.stringify(err))
				})
			}

			$scope.isCurrentUser = profile.id === currentUserProfile.id
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

			$scope.share = () => {
				var profileShare = "This person wants to have or help others make a baby: "
				profileShare = profileShare + "\n\n\"" + profile.about.toString() + "\"\n\nThought they could be a good match for you? \n\n"
				$cordovaSocialSharing.share(profileShare, null, null, $scope.linkToBeShared) // Share via native share sheet
					.then(() => {
						if (typeof analytics !== 'undefined') {
							analytics.trackView('Share This Profile')
						}
						this.$log.debug('Social share action complete')
					}, error => {
						this.$log.error('Social share action error ' + JSON.stringify(error))
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
			}).then(function(modal) {
				$scope.upgradeModal = modal
			})

			$scope.continueUpgrade = function(){
				$scope.upgradeModal.hide()
				$state.go('^.upgrade-profile');
			}

			$scope.currentState = $state.current.name

		}
	}
})
