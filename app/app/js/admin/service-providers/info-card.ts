module app {


	/**
	 * Controller
	 */
	export class InfoCard {

		public card

		constructor(private $state, private $stateParams, private $sce, private $ionicPopup, private AppUtil, private AppService, private $ionicHistory) {
			this.card = this.$stateParams.card
			if(this.card.video) 
				this.card.video_url = this.$sce.trustAsResourceUrl(this.card.video)
			console.log(this.card)
		}

		public delInfoCard(card) {
			let myThis = this
			this.$ionicPopup.confirm({
				title: 'Confirm delete',
				okText: 'Delete',
				cancelText: 'Cancel'
			}).then(function (res) {
				if (res)
					myThis.AppUtil.blockingCall(
							myThis.AppService.delInfoCard(card.id),
								() => {
									myThis.AppUtil.toastSimple('Card deleted')
									myThis.$ionicHistory.goBack();
								}
							)
						
			})
		}

	}

	InfoCard.$inject = ['$state', '$stateParams', '$sce', '$ionicPopup', 'AppUtil', 'AppService', '$ionicHistory']
	angular.module('controllers').controller('InfoCard', InfoCard)
}
