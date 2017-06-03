module app {

	/**
	 * Controller viewing the profiles who have liked the user
	 */
	export class SpWelcome {

		public status
		public logo_class
		public provider_id

		constructor(public $rootScope, public $scope, public $ionicPopup, public SpService, public $state, public AppUtil, public AppService) {
			this.logo_class = 'animated jello infinite'
			this.provider_id = this.AppService.service_provider.id
			this.SpService.service_provider = this.AppService.service_provider
			this.SpService.provider_id = this.AppService.service_provider.id
			this.loading()
		}

		public loading() {
			let myThis = this

			this.status = 'Waiting for InfoCards'
			myThis.SpService.getInfoCards()
			.then(function(infocards){
				console.log(infocards)
				myThis.status = 'Waiting for Services'
				myThis.SpService.info_cards = infocards
				return myThis.SpService.getPrServices()

			}).then(function(services){
				console.log(services)
				myThis.status = 'Waiting for HotBeds'
				myThis.SpService.services = services
				return myThis.SpService.getHotBeds()

			}).then(function(hotbeds){
				console.log(hotbeds)
				myThis.status = 'Waiting for Enquiries'
				myThis.SpService.hot_beds = hotbeds
				return myThis.SpService.getEnquiries(null, null)

			}).then(function(enquiries){
				console.log(enquiries)
				myThis.status = 'Waiting for FAQ'
				myThis.SpService.enquiries = enquiries
				myThis.SpService.getUnreadEnquiries()
				return myThis.SpService.getProviderQuestions()

			}).then(function(provider_questions){
				console.log(provider_questions)
				myThis.SpService.provider_questions = provider_questions
				myThis.afterLoading()
			})

		}

		public afterLoading() {
			this.status = 'Loaded!'
			this.$state.go('sp.home')
		}

		public errorHandle = error => {
			this.$ionicPopup.alert({
                    title: 'Error',
                    template: JSON.stringify(error)
                }).then(() => this.$state.go('signin'))
            return
		}

	}

	SpWelcome.$inject = ['$rootScope', '$scope', '$ionicPopup', 'SpService', '$state', 'AppUtil', 'AppService']
	angular.module('controllers').controller('SpWelcome', SpWelcome)
}
