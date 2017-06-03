module app {

    export class SpMenu {

        public service_provider

        constructor(public AppService, public AppUtil, public SpService) {
            // Real data
            this.service_provider = this.SpService.service_provider
        }
    }

    SpMenu.$inject = ['AppService', 'AppUtil', 'SpService']
    angular.module('controllers').controller('SpMenu', SpMenu)
}
