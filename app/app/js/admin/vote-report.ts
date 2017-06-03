module app {

    export class VoteReport {
        public voteReports = null
        public voterReport = null
        public findUs: IFindUs

        constructor(private $log: ng.ILogService, private $scope: ng.IScope,
            private AppService: IAppService, private AppUtil: AppUtil) {

            $scope.$on('$ionicView.beforeEnter', () => this.refresh())

        }

        public refresh() {
            this.voteReports = null
            this.voterReport = null
            this.AppUtil.blockingCall(
                this.AppService.getFindUsReport(),
                items => {
                    this.voterReport = {}
                    this.$log.log('loaded ' + items.length + ' items')
                    this.voteReports = items
                    this.voteReports.forEach(a => {
                        if (a.name in this.voterReport) {
                            this.voterReport[a.name]++
                        } else {
                            this.voterReport[a.name] = 1;
                        }
                    })
                })
        }
    }

    VoteReport.$inject = ['$log', '$scope', 'AppService', 'AppUtil']
    angular.module('controllers').controller('VoteReport', VoteReport)
}
