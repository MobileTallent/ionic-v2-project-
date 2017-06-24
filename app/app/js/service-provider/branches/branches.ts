/// <reference path="../../../../typings/globals/google.maps/index.d.ts" />

module app {

    export class SpBranches {

        public branches = []
        public branch = { services : []}
        private addBranchModal
        private addServiceModal
        private modalText = 'New '
        private submitted = false;
        public userProfile
        public map
        public sp_services

        constructor(private $log, private $scope, private $ionicModal, private $ionicPopup,
        public AppService, public AppUtil, public SpService) {
            this.branches = this.SpService.branches
            this.userProfile = this.AppService.profile
            this.sp_services = this.SpService.services

            // Cleanup the modal when we're done with it
            $scope.$on('$destroy', () => this.addBranchModal.remove())

            $ionicModal.fromTemplateUrl('service-provider/branches/add-branch-modal.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(modal => this.addBranchModal = modal)

            $ionicModal.fromTemplateUrl('service-provider/branches/add-service-modal.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(modal => this.addServiceModal = modal)

        }

        public changeSetLoc() {

                if (!this.branch['location']) {
                    this.branch['location'] = {
                        'name': this.userProfile.address,
                        'lat': this.userProfile.location.latitude,
                        'lon': this.userProfile.location.longitude,
                        'manual': false
                    }
                }

                if (this.branch['location']) {
                    // setting map functions
                    let myLatlng = new google.maps.LatLng(this.branch['location'].lat, this.branch['location'].lon)
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
                    this.map = new google.maps.Map(document.getElementById('map5'), mapOptions)
                    this.map.setCenter(myLatlng)
                    let marker = new google.maps.Marker({
                        position: myLatlng,
                        draggable: true,
                        map: this.map,
                        title: this.branch['title']
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
                            This.branch['location'] = {
                                'name': out.results[0].formatted_address,
                                'lat': out.results[0].geometry.location.lat,
                                'lon': out.results[0].geometry.location.lng,
                                'manual': true
                            }
                        })
                        .catch(err => console.error(err));

                    });

                    google.maps.event.trigger(this.map, "mouseup");

                }

        }

        public doRefresh() {
                    console.log('refresh')
                    this.SpService.getBranches()
                    .then(
                        (branches) => {
                        this.branches = branches
                        this.$scope.$broadcast('scroll.refreshComplete');
                    })
        }

        public addBranch(form) {
            this.submitted = true
            if (form.$valid) {
                this.branch['pid'] = this.SpService.provider_id
                this.branch['location_point'] = new Parse.GeoPoint({ latitude: this.branch['location']['lat'], longitude: this.branch['location']['lon']})

                let serv_ids = []
                for (var i = 0; i < this.branch['services'].length; i++) {
                    serv_ids.push(this.branch['services'][i].id)
                }
                this.branch['services'] = serv_ids

                console.log('branch before send', this.branch)
                this.AppUtil.blockingCall(
                    this.SpService.addBranch(this.branch),
                    () => {
                        this.modalText = 'New '
                        this.branch = { services : [] }
                        this.AppUtil.toastSimple('Saved Successfully')
                        this.doRefresh()
                    })
                setTimeout(this.resetForm(form), 1000)
            }
        }

        public editBranch(branch) {
            this.modalText = 'Update '
            this.branch = branch.toJSON()
            this.addBranchModal.show()
            if (this.branch['services'].length) {
                this.AppUtil.blockingCall(
                    this.SpService.getBranchServices(this.branch['services']),
                    services => {
                        this.branch['services'] = services
                        
                    })
            }   
            
        }

        public deleteBranch(id) {
            this.$log.log('Delete branch ' + id)
            var myThis = this
            this.$ionicPopup.confirm({
                title: 'Delete Branch',
                template: 'Are you sure you want to delete this branch?'
            }).then(function (res) {
                if (res)
                    myThis.deleteQ(id)
            });
        }

        public deleteQ(id) {
            this.AppUtil.blockingCall(
                this.SpService.delBranch(id),
                () => {
                    this.AppUtil.toastSimple('Deleted Successfully')
                    this.doRefresh()
                })
        }

        public removeService(service) {
            for (var i = 0; i < this.branch['services'].length; i++){
                if (service.id == this.branch['services'][i].id)
                    this.branch['services'].splice(i,1);
            }
        }

        public chooseService(service) {
            this.branch['services'].push(service)
            this.addServiceModal.hide()
        }

        public close() {
            this.modalText = 'New '
            this.branch = { services : []}
            this.addBranchModal.hide()
        }

        public resetForm(form) {
            this.branch = { services : []}
            this.submitted = false
            this.addBranchModal.hide()
            form.$setPristine()
            form.$setUntouched()
        }


    }

    SpBranches.$inject = ['$log', '$scope', '$ionicModal', '$ionicPopup', 'AppService', 'AppUtil', 'SpService']
    angular.module('controllers').controller('SpBranches', SpBranches)
}
 