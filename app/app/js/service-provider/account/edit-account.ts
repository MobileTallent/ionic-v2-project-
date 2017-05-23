module app {

    export class SpEditAccount {
        
        public service_provider
        public countries 

        constructor(public $scope, public $ionicHistory, public AppService, public AppUtil, public SpService) {
            this.service_provider = this.SpService.service_provider
            this.$scope.$on('$ionicView.beforeEnter', () => this.refresh())
        }

        public refresh() {
            fetch('/countries.json')
            .then(res => res.json())
            .then((out) => {
                this.countries = out;
            })
            .catch(err => console.error(err));
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

    SpEditAccount.$inject = ['$scope', '$ionicHistory', 'AppService', 'AppUtil', 'SpService']
    angular.module('controllers').controller('SpEditAccount', SpEditAccount)
}
