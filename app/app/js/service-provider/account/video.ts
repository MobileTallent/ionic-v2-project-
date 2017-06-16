module app {

    export class SpAccountVideo {

        public service_provider

        constructor(public AppService, public AppUtil, public SpService, public $ionicHistory, public $sce) {
           this.service_provider = this.SpService.service_provider
           if (this.service_provider.video) this.service_provider.video_url = this.$sce.trustAsResourceUrl(this.service_provider.video)
        }

        public save(form) {
            var This = this
            if (form.$valid) {
                this.AppUtil.blockingCall(
                    this.SpService.addServiceProvider(This.service_provider.toJSON()),
                    () => {
                        This.AppUtil.toastSimple('Saved Successfully')
                        This.service_provider.video_url = this.$sce.trustAsResourceUrl(This.service_provider.video)
                    })
            }
        }
    }

    SpAccountVideo.$inject = ['AppService', 'AppUtil', 'SpService', '$ionicHistory', '$sce']
    angular.module('controllers').controller('SpAccountVideo', SpAccountVideo)
}
