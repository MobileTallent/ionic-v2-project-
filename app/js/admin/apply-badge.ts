module app {
	/**
	 * Controller
	 */
	export class ApplyBadges {
		private $log: ng.ILogService
		private $rootScope: app.IAppRootScope
		private $scope: ng.IScope
		private $state
		private $ionicModal
		private $q: ng.IQService
		private AppService: IAppService
		private AppUtil: AppUtil

		public profiles
		public profile // selected profile for viewing details
		public profileModal

		public personCategory: string
		public personType: string
		public personSperm: boolean
		public personEgg: boolean
		public personWomb: boolean
		public personEmbryo: boolean
		public personHelpLevel: string

		constructor($log: ng.ILogService, $rootScope: app.IAppRootScope, $scope: ng.IScope, $q: ng.IQService,
			$state, $ionicModal, AppService: IAppService, AppUtil: AppUtil) {
			this.$log = $log
			this.$rootScope = $rootScope
			this.$scope = $scope
			this.$q = $q
			this.$state = $state
			this.$ionicModal = $ionicModal
			this.AppService = AppService
			this.AppUtil = AppUtil
			this.$scope.options = {
				pagination: false,
				onlyExternal: true
			}

			$ionicModal.fromTemplateUrl('applybadges.html', {
				scope: $scope,
				animation: 'slide-in-up'
			}).then(modal => this.profileModal = modal)
			// Cleanup the modal when we're done with it
			$scope.$on('$destroy', () => this.profileModal.remove())

			this.$scope.$on("$ionicSlides.sliderInitialized", function (event, data) {
				// data.slider is the instance of Swiper
				$scope.slider = data.slider
			})

			this.refresh()
		}

		public refresh() {
			this.AppUtil.blockingCall(
				this.AppService.getApplyBadgeUsers(),
				profiles => {
					this.$log.log('Loaded ' + profiles.length + ' items')
					this.profiles = profiles
				}
			)
		}

		public viewDetails(profile) {
			this.profile = profile
			this.personCategory = this.profile.personCategory
			this.personType = this.profile.personType
			this.personSperm = this.profile.personSperm
			this.personEgg = this.profile.personEgg
			this.personWomb = this.profile.personWomb
			this.personEmbryo = this.profile.personEmbryo
			this.personHelpLevel = this.profile.personHelpLevel
			this.profileModal.show()
		}

		public closeModal() {
			this.refresh()
			this.profile = null
			this.profileModal.hide()
		}

		public applyBadge() {
			let profileUpdate = <IProfile>{}
			profileUpdate.personCategory = this.personCategory ? this.personCategory : '0'
			profileUpdate.hasSelfId = true
			if (this.personCategory === '3') {
				profileUpdate.personType = '0'
				profileUpdate.personSperm = false
				profileUpdate.personEgg = false
				profileUpdate.personWomb = false
				profileUpdate.personEmbryo = false
				profileUpdate.personHelpLevel = '0'
			} else {
				profileUpdate.personType = this.personType ? this.personType : '0'
				profileUpdate.personSperm = this.personSperm ? this.personSperm : false
				profileUpdate.personEgg = this.personEgg ? this.personEgg : false
				profileUpdate.personWomb = this.personWomb ? this.personWomb : false
				profileUpdate.personEmbryo = this.personEmbryo ? this.personEmbryo : false
				profileUpdate.personHelpLevel = this.personHelpLevel ? this.personHelpLevel : '0'
			}

			let thingsIHave = ""
			if (profileUpdate.personSperm)
				thingsIHave += "S"

			if (profileUpdate.personEgg)
				thingsIHave += "E"

			if (profileUpdate.personWomb)
				thingsIHave += "W"

			if (profileUpdate.personEmbryo)
				thingsIHave += "Y"

			if (this.personCategory !== '3' && !profileUpdate.personSperm && !profileUpdate.personEgg && !profileUpdate.personWomb && !profileUpdate.personEmbryo)
				thingsIHave += "X"

			profileUpdate.thingsIHave = thingsIHave

			this.AppUtil.blockingCall(
				this.AppService.saveProfileForApplyBadge(this.profile, profileUpdate),
				() => {
					this.closeModal()
					this.AppUtil.toastSimple("Badge Applied Successfully")
				})
		}
	}

	ApplyBadges.$inject = ['$log', '$rootScope', '$scope', '$q', '$state', '$ionicModal', 'AppService', 'AppUtil']
	angular.module('controllers').controller('ApplyBadges', ApplyBadges)
}
