module app {

    export class SpMenu {

        public service_provider

        constructor(public AppService, public $state, public AppUtil, public SpService) {
            // Real data
            this.service_provider = this.SpService.service_provider
        }

        public logout() {
            this.SpService.service_provider = null
			this.SpService.provider_id = null
            this.$state.go('signin')
        }
    }

    SpMenu.$inject = ['AppService', '$state', 'AppUtil', 'SpService']
    angular.module('controllers').controller('SpMenu', SpMenu)
}
