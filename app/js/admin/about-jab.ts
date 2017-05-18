module app {

    export class AboutJAB {
        private about : IAboutJab

        constructor(private $ionicPopup, private $log: ng.ILogService, private $scope: ng.IScope,
            private AppService: IAppService, private AppUtil: AppUtil) {

            $scope.$on('$ionicView.beforeEnter', () => this.refreshAbout())
        }

        public refreshAbout() {
            this.AppUtil.blockingCall(
                this.AppService.getAboutJab(),
                about => {
                    this.about = about
                })
        }

        public saveAbout() {
                this.AppUtil.blockingCall(
                    this.AppService.addAboutJab(this.about),
                    () => {
                        this.AppUtil.toastSimple("Saved Successfully")
                        this.refreshAbout()
                    })
        }
    }

    AboutJAB.$inject = ['$ionicPopup', '$log', '$scope', 'AppService', 'AppUtil']
    angular.module('controllers').controller('AboutJAB', AboutJAB)
}
