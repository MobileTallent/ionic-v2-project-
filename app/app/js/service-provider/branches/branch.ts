/// <reference path="../../../../typings/globals/google.maps/index.d.ts" />

module app {

	/**
	 * Controller
	 */
	export class SpBranch {

		public branch
		public services
        public map

		constructor(private $state, private $stateParams, private $scope, private $sce, private $ionicPopup,
		private AppUtil, private AppService, private $ionicHistory) {
			this.branch = this.$stateParams.branch
			console.log(this.branch);

			let myLatlng = new google.maps.LatLng(this.branch.location.lat, this.branch.location.lon)
            let mapOptions = {
                center: myLatlng,
                zoom: 11,
                zoomControlOptions: {
                    position: google.maps.ControlPosition.RIGHT_TOP
                },
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                mapTypeControl: false,
                streetViewControl: false,
                disableDoubleClickZoom: true
            }

            this.$scope.$on('$ionicView.afterEnter', () => {
                this.map = new google.maps.Map(document.getElementById('map2'), mapOptions)
                this.map.setCenter(myLatlng)
                let marker = new google.maps.Marker({
                    position: myLatlng,
                    map: this.map,
                    title: this.branch.title
                })
				
				this.AppUtil.blockingCall(
					this.SpService.getBranchServices(this.branch.services),
						services => {
							this.services = services
						}
				)
			})

		}

	}

	SpBranch.$inject = ['$state', '$stateParams', '$scope', '$sce', '$ionicPopup', 'AppUtil', 'AppService', '$ionicHistory']
	angular.module('controllers').controller('SpBranch', SpBranch)
}
