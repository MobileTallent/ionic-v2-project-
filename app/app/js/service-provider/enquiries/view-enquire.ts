module app {

    export class SpEnquire {
        
        public enquire

        constructor(private $log, private $scope, public AppService, public AppUtil, public SpService) {
            //this.enquiries = this.SpService.enquiries
        }

        

       

    }

    SpEnquire.$inject = ['$log', '$scope', 'AppService', 'AppUtil', 'SpService']
    angular.module('controllers').controller('SpEnquire', SpEnquire)
}
