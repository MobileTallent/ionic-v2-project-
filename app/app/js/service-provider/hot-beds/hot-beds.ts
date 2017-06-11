/// <reference path="../../../../typings/globals/google.maps/index.d.ts" />

module app {

    export class SpHotBeds {

        public hot_beds = []
        public hot_bed = {}
        private addHotBedModal
        private modalText = 'New '
        private submitted = false;
        public userProfile
        public map
        public info_card_my_location = 'true'

        constructor(private $log, private $scope, private $ionicModal, private $ionicPopup,
        public AppService, public AppUtil, public SpService) {
            this.hot_beds = this.SpService.hot_beds
            this.userProfile = this.AppService.profile

            // Cleanup the modal when we're done with it
            $scope.$on('$destroy', () => this.addHotBedModal.remove())

            $ionicModal.fromTemplateUrl('service-provider/hot-beds/add-hot-bed-modal.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(modal => this.addHotBedModal = modal)

        }

        public changeSetLoc() {

                if (!this.hot_bed['location']) {
                    this.hot_bed['location'] = {
                        'name': this.userProfile.address,
                        'lat': this.userProfile.location.latitude,
                        'lon': this.userProfile.location.longitude,
                        'manual': false
                    }
                }

                if (this.hot_bed['location']['manual']) {
                    // setting map functions
                    let myLatlng = new google.maps.LatLng(this.hot_bed['location'].lat, this.hot_bed['location'].lon)
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
                    this.map = new google.maps.Map(document.getElementById('map4'), mapOptions)
                    this.map.setCenter(myLatlng)
                    let marker = new google.maps.Marker({
                        position: myLatlng,
                        draggable: true,
                        map: this.map,
                        title: this.hot_bed['title']
                    })

                    let This = this
                    google.maps.event.addListener(marker, 'mouseup', function(event) {

                        let ltt = this.position.lat();
                        let lgg = this.position.lng();

                        var geocodingAPI = 'http://maps.googleapis.com/maps/api/geocode/json?latlng=' + ltt;
                            geocodingAPI = geocodingAPI + ',' + lgg + '&sensor=false&language=en';

                        fetch(geocodingAPI)
                        .then(res => res.json())
                        .then((out) => {
                            This.hot_bed['location'] = {
                                'name': out.results[0].formatted_address,
                                'lat': out.results[0].geometry.location.lat,
                                'lon': out.results[0].geometry.location.lng,
                                'manual': true
                            }
                        })
                        .catch(err => console.error(err));

                    });

                }
        }

        public doRefresh() {
            console.log('refresh')
            this.SpService.getHotBeds()
            .then(
                (hot_beds) => {
                this.hot_beds = hot_beds
                this.$scope.$broadcast('scroll.refreshComplete');
            })
        }

        public addHotBed(form) {
            this.submitted = true
            if (form.$valid) {
                this.hot_bed['pid'] = this.SpService.provider_id
                this.hot_bed['location_point'] = new Parse.GeoPoint({ latitude: this.hot_bed['location']['lat'], longitude: this.hot_bed['location']['lon']})

                console.log('hot_bed before send', this.hot_bed)
                this.AppUtil.blockingCall(
                    this.SpService.addHotBed(this.hot_bed),
                    () => {
                        this.modalText = 'New '
                        this.hot_bed = null
                        this.AppUtil.toastSimple('Saved Successfully')
                        this.doRefresh()
                    })
                setTimeout(this.resetForm(form), 1000)
            }
        }

        public editHotBed(hot_bed) {
            this.modalText = 'Update '
            this.hot_bed = hot_bed.toJSON()
            this.addHotBedModal.show()
        }

        public deleteHotBed(id) {
            this.$log.log('Delete hot bed ' + id)
            var _this = this
            this.$ionicPopup.confirm({
                title: 'Delete Hot Bed',
                template: 'Are you sure you want to delete this hot bed?'
            }).then(function (res) {
                if (res)
                    _this.deleteQ(id)
            });
        }

        public deleteQ(id) {
            this.AppUtil.blockingCall(
                this.SpService.delHotBed(id),
                () => {
                    this.AppUtil.toastSimple('Deleted Successfully')
                    this.doRefresh()
                })
        }

        public close() {
            this.modalText = 'New '
            this.hot_bed = {}
            this.map = null
            this.addHotBedModal.hide()
        }

        public resetForm(form) {
            this.hot_bed = {}
            this.submitted = false
            this.addHotBedModal.hide()
            form.$setPristine()
            form.$setUntouched()
        }

    }

    SpHotBeds.$inject = ['$log', '$scope', '$ionicModal', '$ionicPopup', 'AppService', 'AppUtil', 'SpService']
    angular.module('controllers').controller('SpHotBeds', SpHotBeds)
}
