module app {

    export class SpEnquire {
        
        public enquire
        public user

        constructor(private $log, private $scope, public $stateParams, public AppService, public AppUtil, public SpService) {
            this.enquire = this.$stateParams.enquire
            console.log(this.enquire)
            $scope.$on('$ionicView.beforeEnter', () => this.getUserProfile())
            this.markAsRead()
        }

        public getUserProfile() {
            this.AppUtil.blockingCall(
                this.AppService.loadUser(this.enquire.uid),
                (user) => {
                    this.user = user
                }
            )
        }

        public markAsRead() {
            //mark enquire as readed
            let This = this
            This.SpService.markEnquireAsRead(this.enquire.id).then(function(){
               for(var i=0;i<This.SpService.enquiries.length;i++){
                   if(This.SpService.enquiries[i].id==This.enquire.id){
                       This.SpService.enquiries[i].has_read = true                       
                   }
               }
               This.SpService.getUnreadEnquiries()
            })
        }

    }

    SpEnquire.$inject = ['$log', '$scope', '$stateParams', 'AppService', 'AppUtil', 'SpService']
    angular.module('controllers').controller('SpEnquire', SpEnquire)
}
