module app {

	import ITranslateService = angular.translate.ITranslateService

	class ProfilePhoto {

		selected: boolean
		file: IFile

		constructor(file: IFile) {
			this.file = file
			this.selected = false
		}
	}

	/**
	 * Controller for editing the users profile
	 */
	export class ProfileEdit {

		// If you increase MAX_PHOTOS you will need to update LocalDB to have more photoN columns in the local SQL db
		public MAX_PHOTOS: number = 3
		public NO_IMAGE: string = 'img/add.png'

		public profile: IProfile
		public photos: ProfilePhoto[] = []
		public photosInReview: ProfilePhoto[] = []
		public about: string
		public personCategory: string
		public personType: string
		public personSperm: boolean
		public personEgg: boolean
		public personWomb: boolean
		public personEmbryo: boolean
		public personParent: boolean
		public personHelpLevel: string

		private $log: ng.ILogService
		private $rootScope: app.IAppRootScope
		private $scope: ng.IScope
		private $state
		private $q: ng.IQService
		private $ionicActionSheet
		private $cordovaCamera
		private AppService: IAppService
		private AppUtil
		private $translate: ITranslateService
		private $ionicHistory
		private $ionicPopup

		constructor($log: ng.ILogService, $rootScope: app.IAppRootScope, $scope: ng.IScope, $q: ng.IQService,
			$state, $ionicActionSheet, $cordovaCamera, AppService: IAppService, AppUtil, $translate: ITranslateService,
			$ionicHistory, $ionicPopup) {
			this.$log = $log
			this.$rootScope = $rootScope
			this.$scope = $scope
			this.$q = $q
			this.$state = $state
			this.$ionicActionSheet = $ionicActionSheet
			this.$cordovaCamera = $cordovaCamera
			this.AppService = AppService
			this.AppUtil = AppUtil
			this.$translate = $translate
			this.$ionicHistory = $ionicHistory
			this.$ionicPopup = $ionicPopup
			this.$scope.options = {
				onlyExternal: true,
				speed: 700
			}

			this.$scope.$on('$ionicView.beforeEnter', () => this.refresh())
			this.$scope.$on('$ionicView.enter', () => this.expandText())
			this.$scope.$on('$ionicSlides.sliderInitialized', function (event, data) {
				// data.slider is the instance of Swiper
				$scope.slider = data.slider
				if ((!$scope.vm.profile.about || $scope.vm.profile.about.match(/\S+/g).length < 10) && $scope.vm.profile.hasSelfId)
					$scope.slider.slideTo($scope.slider.slides.length - 1)
			})

			this.$scope.$on('$ionicSlides.slideChangeStart', function (event, data) {
				console.log('Slide change is beginning')
			})
		}

		private refresh() {
			this.profile = this.AppService.getProfile()
			this.about = this.profile.about
			this.personCategory = this.profile.personCategory
			this.personType = this.profile.personType
			this.personSperm = this.profile.personSperm
			this.personEgg = this.profile.personEgg
			this.personWomb = this.profile.personWomb
			this.personEmbryo = this.profile.personEmbryo
			this.personHelpLevel = this.profile.personHelpLevel
			this.personParent = this.profile.personParent
			this.photos = _.map(this.profile.photos, photo => new ProfilePhoto(photo))
			this.photosInReview = this.profile.photosInReview
				? _.map(this.profile.photosInReview, photo => new ProfilePhoto(photo))
				: []

			this.onRedirectToEditProfile(false)
		}

		public changeSperm() {
			if (this.personCategory === "1" && this.personSperm) {
				this.personEgg = false
				this.personWomb = false
			}
		}

		public changeWombEgg() {
			if (this.personCategory === "1" && (this.personWomb || this.personEgg)) {
				this.personSperm = false
			}
		}

		public selectedCount() {
			return _.filter(this.photos, (photo) => photo.selected).length
		}

		public canAddPhoto(): boolean {
			return this.photos.length + this.photosInReview.length < this.MAX_PHOTOS
		}

		/**
		 * @returns {boolean} if any of the photos or photos in review are selected
		 */
		public canDeletePhotos() {
			return _.filter(this.photos, (photo) => photo.selected).length + _.filter(this.photosInReview, (photo) => photo.selected).length > 0
		}

		/**
		 * Deletes the selected photos from the profile
		 */
		public deletePhotos() {
			let profileUpdate = <IProfile>{}

			// Extract the unselected photos and update the profile with those
			let remainingPhotos = _.filter(this.photos, (photo) => !photo.selected)
			profileUpdate.photos = _.map(remainingPhotos, (photo) => photo.file)

			let remainingInReviewPhotos = _.filter(this.photosInReview, (photo) => !photo.selected)
			profileUpdate.photosInReview = _.map(remainingInReviewPhotos, (photo) => photo.file)

			this.AppUtil.blockingCall(
				this.AppService.saveProfile(profileUpdate),
				() => this.refresh()
			)
		}

		/**
		 * Swaps the position of the selected photos. This should only be called when there is two selected.
		 */
		public swapPhotos() {
			// Find the indexes of the two selected photos
			let first = _.findIndex(this.photos, photo => photo.selected)
			let last = _.findLastIndex(this.photos, photo => photo.selected)

			let profileUpdate = <IProfile>{}
			this.swapArrayElements(this.photos, first, last)
			profileUpdate.photos = _.map(this.photos, (photo) => photo.file)

			this.AppUtil.blockingCall(
				this.AppService.saveProfile(profileUpdate),
				() => this.refresh()
			)
		}

		/**
		 * Toggle the selected state of a photo
		 * @param index the photos array index
		 */
		public toggleSelected(photo) {
			photo.selected = !photo.selected
		}

		/**
		 * Add a profile photo
		 */
		public addPhoto() {
			var buttons = [{ text: this.$translate.instant('TAKE_PHOTO') }, { text: this.$translate.instant('GALLERY') }]
			if (this.$rootScope.facebookConnected)
				buttons.push({ text: 'Facebook' })

			this.$ionicActionSheet.show({
				buttons: buttons,
				titleText: this.$translate.instant('SELECT_PHOTO_SOURCE'),
				cancelText: this.$translate.instant('CANCEL'),
				buttonClicked: index => {
					if (index === 2) {
						this.$state.go('^.fb-albums')
					} else {
						if (!ionic.Platform.isWebView()) {
							// TODO implement file upload for normal browsers
							return true
						}

						let sourceType: number = index === 0 ? Camera.PictureSourceType.CAMERA :
							Camera.PictureSourceType.PHOTOLIBRARY

						var options = {
							quality: 70,
							destinationType: Camera.DestinationType.DATA_URL,
							sourceType: sourceType,
							allowEdit: false, // allowEdit allows native cropping. However not all devices
							// support it, so just use JavaScript cropping for now
							encodingType: Camera.EncodingType.PNG,
							targetWidth: 800,
							targetHeight: 800,
							// popoverOptions: new CameraPopoverOptions(300, 300, 200, 200, Camera.PopoverArrowDirection.ARROW_ANY),
							saveToPhotoAlbum: false
						}

						this.$cordovaCamera.getPicture(options).then(imageData => {
							// TODO don't use root scope - pass as param
							var dataUrl = 'data:image/jpeg;base64,' + imageData
							this.$rootScope.cropPhoto = dataUrl
							this.$state.go('^.crop') // , {imageData: 'data:image/jpeg;base64,' + imageData}
						}, error => {
							if (error === 'has no access to assets') {
								this.AppUtil.toastSimple('Access to photo gallery denied')
								this.$log.error('$cordovaCamera.getPicture error ' + JSON.stringify(error))
							} else {
								// this.AppUtil.toastSimpleTranslate('PHOTO_ERROR')
								this.$log.error('$cordovaCamera.getPicture error ' + JSON.stringify(error))
							}

						})
					}

					return true
				}
			})
		}


		private expandText() {
			var element = <HTMLTextAreaElement>document.querySelector('#aboutYou')
			element.style.height = element.scrollHeight + 'px'
		}

		/**
		 * Swap the elements in an array at indexes x and y.
		 *
		 * @param (array) The array.
		 * @param (a) The index of the first element to swap.
		 * @param (b) The index of the second element to swap.
		 */
		private swapArrayElements(array: any[], a, b) {
			var temp = array[a]
			array[a] = array[b]
			array[b] = temp
		}

		public saveProfile() {
			let profileUpdate = <IProfile>{}
			profileUpdate.about = this.about
			profileUpdate.personCategory = this.personCategory ? this.personCategory : '0'

			// Please comment on this logic.
			if (this.personCategory === '3') {
				profileUpdate.personType = '0'
				profileUpdate.personSperm = false
				profileUpdate.personEgg = false
				profileUpdate.personWomb = false
				profileUpdate.personEmbryo = false
				profileUpdate.personParent = false
				profileUpdate.personHelpLevel = '0'
			} else {
				profileUpdate.personType = this.personType ? this.personType : '0'
				profileUpdate.personSperm = this.personSperm ? this.personSperm : false
				profileUpdate.personEgg = this.personEgg ? this.personEgg : false
				profileUpdate.personWomb = this.personWomb ? this.personWomb : false
				profileUpdate.personEmbryo = this.personEmbryo ? this.personEmbryo : false
				profileUpdate.personParent = this.personParent ? this.personParent : false
				profileUpdate.personHelpLevel = this.personHelpLevel ? this.personHelpLevel : '0'
			}
			profileUpdate.hasSelfId = profileUpdate.personCategory !== '0' ? true : false

			let thingsIHave = ''
			if (profileUpdate.personSperm)
				thingsIHave += 'S'

			if (profileUpdate.personEgg)
				thingsIHave += 'E'

			if (profileUpdate.personWomb)
				thingsIHave += 'W'

			if (profileUpdate.personEmbryo)
				thingsIHave += 'Y'

			if (this.personCategory !== '3' && !profileUpdate.personSperm && !profileUpdate.personEgg
				&& !profileUpdate.personWomb && !profileUpdate.personEmbryo)
				thingsIHave += 'X'

			profileUpdate.thingsIHave = thingsIHave

			// if (this.about)
			this.AppUtil.blockingCall(
				this.AppService.saveProfile(profileUpdate),
				() => {
					//this.refresh()
					this.$ionicHistory.nextViewOptions({
						historyRoot: false,
						disableBack: true
					})
					if (this.AppService.redirectToEditProfile) {
						this.AppService.isEditProfileDone = true
						this.AppService.redirectToEditProfile = false
						this.AppService.goToNextLoginState()
					}
					else {
						if (profileUpdate.about)
							this.$state.go('menu.profile')
						else
							this.refresh()
					}
				})
			// else
			// 	this.onRedirectToEditProfile(true);
		}

		/**
		 * Custom go back
		 */
		public myGoBack() {
			// if (this.profile.about)
			this.saveProfile()
			// this.$ionicHistory.goBack()
			// else
			// 	this.onRedirectToEditProfile(false)
		}

		public onRedirectToEditProfile(forceShow) {
			var alertPopup
			if (!this.profile.about || forceShow) {
				var templateText = 'Your "About Me" section is empty.</br> Everyone is looking for someone'
				templateText = templateText + ' with a compatible vision. A deep description adds value to the community, tell us about you.'
				alertPopup = this.$ionicPopup.alert({
					title: 'We need more information',
					cssClass: 'center',
					template: templateText
				})
			} else {
				if (this.profile.about && this.profile.about.match(/\S+/g).length < 10) {
					alertPopup = this.$ionicPopup.alert({
						title: 'We need more information',
						cssClass: 'center',
						template: 'Your profile could be better, please give it some more thought.'
					})
				}
			}
		}

		public onClickBadgeInfo() {
			var alertPopup = this.$ionicPopup.alert({
				title: 'Self Identification Badges',
				templateUrl: 'badgeInfo.html',
				buttons: [{
					text: 'Ok',
					type: 'button-assertive'
				}]
			})
		}
	}

	ProfileEdit.$inject = ['$log', '$rootScope', '$scope', '$q', '$state', '$ionicActionSheet', '$cordovaCamera',
		'AppService', 'AppUtil', '$translate', '$ionicHistory', '$ionicPopup']
	angular.module('controllers').controller('ProfileEdit', ProfileEdit)
}
