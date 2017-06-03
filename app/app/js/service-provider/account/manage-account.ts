module app {

    export class SpManageAccount {

        public service_provider

        constructor(public AppService, public AppUtil, public SpService) {
            this.service_provider = this.SpService.service_provider
        }
    }

    SpManageAccount.$inject = ['AppService', 'AppUtil', 'SpService']
    angular.module('controllers').controller('SpManageAccount', SpManageAccount)
}
