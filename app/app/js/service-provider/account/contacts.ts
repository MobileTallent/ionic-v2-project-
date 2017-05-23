module app {

    export class SpEditContacts {
        
        public service_provider

        constructor(public $scope, public $ionicHistory, public AppService, public AppUtil, public SpService) {
            this.service_provider = this.SpService.service_provider
        }

        public save(form) {
            var This = this
            if (form.$valid) {
                this.AppUtil.blockingCall(
                    this.SpService.addServiceProvider(This.service_provider.toJSON()),
                    () => {
                        This.AppUtil.toastSimple("Saved Successfully")
                        This.$ionicHistory.goBack();
                    })
            }
        }
    }

    SpEditContacts.$inject = ['$scope', '$ionicHistory', 'AppService', 'AppUtil', 'SpService']
    angular.module('controllers').controller('SpEditContacts', SpEditContacts)
}
