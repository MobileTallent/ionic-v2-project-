module app {

    export class SpHotBeds {
        
        public hot_beds = []
        public hot_bed = {}
        private addHotBedModal
        private modalText = "New "
        private submitted = false;
        private info_card_my_location = true;
        public userProfile

        constructor(private $log, private $scope, private $ionicModal, private $ionicPopup, public AppService, public AppUtil, public SpService) {
            this.hot_beds = this.SpService.hot_beds
            this.userProfile = this.AppService.profile

            // Cleanup the modal when we're done with it
            $scope.$on('$destroy', () => this.addHotBedModal.remove())

            $ionicModal.fromTemplateUrl('service-provider/hot-beds/add-hot-bed-modal.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(modal => this.addHotBedModal = modal)
        }

        public doRefresh(){
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
                
                //get my location
                this.hot_bed['location'] = {"name":this.userProfile.address, "lat":this.userProfile.location.latitude, "lon":this.userProfile.location.longitude}
                
                console.log('hot_bed before send', this.hot_bed)
                this.AppUtil.blockingCall(
                    this.SpService.addHotBed(this.hot_bed),
                    () => {
                        this.modalText = "New "
                        this.hot_bed = null
                        this.AppUtil.toastSimple("Saved Successfully")
                        this.doRefresh()
                    })
                setTimeout(this.resetForm(form), 1000)
            }
        }

        public editHotBed(hot_bed) {
            this.modalText = "Update "
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
                    this.AppUtil.toastSimple("Deleted Successfully")
                    this.doRefresh()
                })
        }

        public close() {
            this.modalText = "New "
            //this.hot_bed = {type:'image',options:{frequency:50,age_from:18,age_to:55}}
            this.addHotBedModal.hide()
        }

        public resetForm(form) {
            //this.hot_bed = {type:'image',options:{frequency:50,age_from:18,age_to:55}}
            this.submitted = false
            this.addHotBedModal.hide()
            form.$setPristine()
            form.$setUntouched()
        }

    }

    SpHotBeds.$inject = ['$log', '$scope', '$ionicModal', '$ionicPopup', 'AppService', 'AppUtil', 'SpService']
    angular.module('controllers').controller('SpHotBeds', SpHotBeds)
}
