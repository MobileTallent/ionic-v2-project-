module app {

    export class SpSeeUsers {

        public users
        public count
        public filter_card

        constructor(private $log, public $ionicLoading, private $scope, public $timeout,
        private $ionicModal, private $ionicPopup, public AppService, public AppUtil, public SpService) {
            this.users = []
            this.count = 0
            this.filter_card = 'all'
            $scope.$on('$ionicView.beforeEnter', () => this.doRefresh())
        }

        public doRefresh() {
            console.log(this.filter_card)
            console.log('refresh')
             this.count = 0;
             var This = this
             this.AppUtil.blockingCall(
                This.SpService.getUsers(this.filter_card)
                    .then(result => {
                        This.users = result
                        console.log('current users', This.users)
                        This.$scope.$broadcast('scroll.refreshComplete');
                    }, error => {
                        console.log(error)
                        This.users = []
                    })
             )

        }

        public next() {
            this.count++;
            let This = this
            This.$ionicLoading.show()
            This.$timeout(function(){
                This.$ionicLoading.hide()
            }, 1000)
        }

    }

    SpSeeUsers.$inject = ['$log', '$ionicLoading', '$scope', '$timeout', '$ionicModal', '$ionicPopup', 'AppService', 'AppUtil', 'SpService']
    angular.module('controllers').controller('SpSeeUsers', SpSeeUsers)
}
