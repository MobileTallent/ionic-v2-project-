module app {
	export class InfoCardDetail {

		public card;
		public services;
		public hideGotIt = false;

		static $inject = ['$stateParams', '$state', '$rootScope', '$ionicHistory', '$sce', '$scope', 'AppUtil', 'AppService']
		constructor(private $stateParams, public $state, private $rootScope, private $ionicHistory,
		private $sce, private $scope, private AppUtil, private AppService) {

			this.card = this.$stateParams.card
			if (this.card.video) this.card.new_video = this.$sce.trustAsResourceUrl(this.card.video)

			if (this.$stateParams.id) {
				// if come from saved cards - hide got it
				this.hideGotIt = true
			} else {
				// if come from card deck - increase click
            	AppService.increaseShowClick({'type':'card', 'behavior':'click', 'obj': this.card.toJSON()})
			}

			this.getServices()

		}

		public gotInfoCard(card) {
			// save card for user profile cards table as readed
			this.AppUtil.blockingCall(
				this.AppService.gotItInfoCard(this.card.id),
                () => {
                    console.log('Card saved, user not see anymore.');
                 	this.$ionicHistory.goBack();
            	})
			// and go back

		}

		public getServices() {
			this.AppUtil.blockingCall(
                this.AppService.getPrServices(this.card.pid),
                services => {
                    console.log('services', services);
                    this.services = services

					// if come from card deck - increase shows for services
					if (!this.$stateParams.id) {
						for (var i = 0; i < this.services.length; i++) {
							if (this.services[i].active) {
								this.AppService.increaseShowClick({'type':'service', 'behavior':'show', 'obj': this.services[i].toJSON()})
								this.services[i].shows.summary++
							}
						}
					}
            	})
		}
	}

	angular.module('ionicApp').controller('InfoCardDetail', InfoCardDetail)
}
