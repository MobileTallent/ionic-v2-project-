/// <reference path="../../../../typings/globals/google.maps/index.d.ts" />

module app {

	/**
	 * Controller
	 */
	export class HotBed {

		public hotbed
        public map 

		constructor(private $state, private $stateParams, private $scope) {
			this.hotbed = this.$stateParams.hotbed
			console.log(this.hotbed);

			let myLatlng = new google.maps.LatLng(this.hotbed.location.lat, this.hotbed.location.lon)
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
                this.map = new google.maps.Map(document.getElementById("map2"), mapOptions)
                this.map.setCenter(myLatlng)
                let marker = new google.maps.Marker({
                    position: myLatlng,
                    map: this.map,
                    title: this.hotbed.title
                })
			})

		}
	}

	HotBed.$inject = ['$state', '$stateParams', '$scope']
	angular.module('controllers').controller('HotBed', HotBed)
	
}