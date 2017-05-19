module app {

    export class SpEnquiries {
        
        public enquiries = []

        constructor(private $log, private $scope, public AppService, public AppUtil, public SpService) {
            this.enquiries['ssf'] = '892';
            this.enquiries['bbe'] = '8924';
        }

        public groupByDate() {
            let grouped = [];
            this.SpService.enquiries.forEach(function(value) {
                var actualDay = new Date(value.createdAt).toJSON().slice(0, 10);
                if (!grouped[actualDay]) {
                    grouped[actualDay] = [];
                }
                grouped[actualDay].push(value);
            });
            this.enquiries = grouped;
        }

    }

    SpEnquiries.$inject = ['$log', '$scope', 'AppService', 'AppUtil', 'SpService']
    angular.module('controllers').controller('SpEnquiries', SpEnquiries)
}
