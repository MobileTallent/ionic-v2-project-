module app {
	export class InfoCardDetail {

		public card;
		public services;

		static $inject = ['$stateParams', '$ionicHistory', '$sce']
		constructor(private $stateParams, private $ionicHistory, private $sce) {
			this.card = this.$stateParams.card
			if(this.card.video) this.card.video = this.$sce.trustAsResourceUrl(this.card.video)

			//example services
			this.services = [
				{
							"id":"4598",
							"title": "Service #1",
							"created_at":"11 Apr 2017",
							"active": true,
							"spiel": "Service description and spiel about service",
							"image":"http://mspmentor.net/site-files/mspmentor.net/files/uploads/2014/11/Services.jpg",
							"video":"",
							"price":"180"
						},
						{
							"id":"4199",
							"title": "Service #2",
							"created_at":"10 Apr 2017",
							"active": true,
							"spiel": "Service description and spiel about service",
							"image":"",
							"video":"https://www.youtube.com/embed/4y33h81phKU",
							"price":"280"
						},
						{
							"id":"4529",
							"title": "Service #3",
							"created_at":"10 Apr 2017",
							"active": true,
							"spiel": "Service description and spiel about service",
							"image":"",
							"video":"https://www.youtube.com/embed/4y33h81phKU",
							"price":"280"
						},
						{
							"id":"4539",
							"title": "Service #4",
							"created_at":"10 Apr 2017",
							"active": true,
							"spiel": "Service description and spiel about service",
							"image":"",
							"video":"https://www.youtube.com/embed/4y33h81phKU",
							"price":"280"
						},
						{
							"id":"4597",
							"title": "Service #5",
							"created_at":"10 Apr 2017",
							"active": true,
							"spiel": "Service description and spiel about service",
							"image":"",
							"video":"https://www.youtube.com/embed/4y33h81phKU",
							"price":"280"
						}

			];

		}

		public got_infocard(card) {
			//save card for user profile cards table as readed

			//and go back 
			this.$ionicHistory.goBack();
		}
	}

	angular.module('ionicApp').controller('InfoCardDetail', InfoCardDetail)
}
