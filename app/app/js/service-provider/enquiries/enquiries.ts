module app {

    export class SpEnquiries {
        
        public enquiries = []
        public keys

        constructor(private $log, private $scope, public AppService, public AppUtil, public SpService) {
            this.enquiries = this.groupByDate(this.SpService.enquiries)
        }

        public groupByDate(array) {
            let grouped = [];
            array.forEach(function(value) {
                var actualDay = new Date(value.createdAt).toJSON().slice(0, 10);
                if (!grouped[actualDay]) {
                    grouped[actualDay] = [];
                }
                grouped[actualDay].push(value);
            });
            this.keys = Object.keys(grouped);
            return grouped;
        }

        doRefresh(){
            console.log('refresh')
            this.SpService.getEnquiries(null,null)
            .then(
                (enquiries) => {
                if(enquiries!==this.enquiries)
                    this.enquiries = this.groupByDate(enquiries);
                this.SpService.getUnreadEnquiries()    
                this.$scope.$broadcast('scroll.refreshComplete');
            })
        }

    }

    SpEnquiries.$inject = ['$log', '$scope', 'AppService', 'AppUtil', 'SpService']
    angular.module('controllers').controller('SpEnquiries', SpEnquiries)
}
