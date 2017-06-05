/// <reference path="../../../../../typings/globals/google.maps/index.d.ts" />

module app {


	/**
	 * Controller
	 */
	export class SpHotBed {

		public hot_bed
		public map 

		constructor(private $scope, private $state, private $stateParams, private SpService, private $sce, private $ionicPopup, private AppUtil, private AppService, private $ionicHistory) {
			this.hot_bed = this.$stateParams.hot_bed

			let myLatlng = new google.maps.LatLng(this.hot_bed.location.lat, this.hot_bed.location.lon)
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
                this.map = new google.maps.Map(document.getElementById("map3"), mapOptions)
                this.map.setCenter(myLatlng)
                let marker = new google.maps.Marker({
                    position: myLatlng,
                    map: this.map,
                    title: this.hot_bed.title
                })
			})
		}

	}
	
	SpHotBed.$inject = ['$scope', '$state', '$stateParams', 'SpService', '$sce', '$ionicPopup', 'AppUtil', 'AppService', '$ionicHistory']
	angular.module('controllers').controller('SpHotBed', SpHotBed)
}
