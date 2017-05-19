module app {

    export class SpMenu {
        
        public service_provider

        constructor(public AppService, public AppUtil) {
            //real data
            this.service_provider = this.AppService.service_provider
            //test payload
            this.service_provider  = {"name":"Roman's Provider","country":"Thailand","uid":"MXm5iJTI74","image_cover":"https://storage.googleapis.com/justababy-prod.appspot.com/bb3e391d1f21bae10e9f90e01d450d30_profile.png","email":"romwtb@gmail.com","phone_number":"","balance":0,"createdAt":"2017-05-14T14:41:39.315Z","updatedAt":"2017-05-14T14:41:39.315Z","id":"Kq91GI2OHd"}
        }
    }

    SpMenu.$inject = ['AppService', 'AppUtil']
    angular.module('controllers').controller('SpMenu', SpMenu)
}
