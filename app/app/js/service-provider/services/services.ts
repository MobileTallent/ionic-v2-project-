module app {

    export class SpServices {
        
        public services = []
        public service = {}
        private addServiceModal
        private modalText = "New "
        private submitted = false;

        constructor(private $log, private $scope, private $ionicModal, private $ionicPopup, public AppService, public AppUtil, public SpService) {
            this.services = this.SpService.services

            // Cleanup the modal when we're done with it
            $scope.$on('$destroy', () => this.addServiceModal.remove())

            $ionicModal.fromTemplateUrl('service-provider/services/add-service-modal.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(modal => this.addServiceModal = modal)
        }

        public doRefresh(){
            console.log('refresh')
            this.SpService.getPrServices()
            .then(
                (services) => {
                this.services = services
                this.$scope.$broadcast('scroll.refreshComplete');
            })
        }

        public addService(form) {
            this.submitted = true
            if (form.$valid) {
                this.service['pid'] = this.SpService.provider_id
                this.service['shows'] = {summary:0}
                this.service['clicks'] = {summary:0,by_days:[]}
                if(this.service['audience']) {
                    let tags = []
                    if (this.service['audience']['LFsperm']) tags.push('LFsperm')
                    if (this.service['audience']['LFeggs']) tags.push('LFeggs')
                    if (this.service['audience']['LFembryo']) tags.push('LFembryo')
                    if (this.service['audience']['LFwomb']) tags.push('LFwomb')
                    this.service['audience'] = {"tags":tags}
                } else {
                    this.service['audience'] = {"tags":[]}
                }

                
                console.log('service before send', this.service)
                this.AppUtil.blockingCall(
                    this.AppService.addPrService(this.service),
                    () => {
                        this.modalText = "New "
                        this.service = null
                        this.AppUtil.toastSimple("Saved Successfully")
                        this.doRefresh()
                    })
                setTimeout(this.resetForm(form), 1000)
            }
        }

        public editService(service) {
            this.modalText = "Update "
            this.service = service.toJSON()
            this.addServiceModal.show()
        }

        public deleteService(id) {
            this.$log.log('Delete service ' + id)
            var _this = this
            this.$ionicPopup.confirm({
                title: 'Delete Service',
                template: 'Are you sure you want to delete this service?'
            }).then(function (res) {
                if (res)
                    _this.deleteQ(id)
            });
        }

        public deleteQ(id) {
            this.AppUtil.blockingCall(
                this.AppService.delPrService(id),
                () => {
                    this.AppUtil.toastSimple("Deleted Successfully")
                    this.doRefresh()
                })
        }

        public close() {
            this.modalText = "New "
            this.service = null
            this.addServiceModal.hide()
        }

        public resetForm(form) {
            this.service = null
            this.submitted = false
            this.addServiceModal.hide()
            form.$setPristine()
            form.$setUntouched()
        }

    }

    SpServices.$inject = ['$log', '$scope', '$ionicModal', '$ionicPopup', 'AppService', 'AppUtil', 'SpService']
    angular.module('controllers').controller('SpServices', SpServices)
}
