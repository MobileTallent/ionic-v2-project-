module app {

    export class Graph {
        public labels = ["January", "February", "March", "April", "May", "June", "July"]
        public series = ['Series A', 'Series B']
        public data = [
            [65, 59, 80, 81, 56, 55, 40],
            [28, 48, 40, 19, 86, 27, 90]
        ];
        public onClick = function (points, evt) {
            console.log(points, evt);
        };
        public datasetOverride = [{ yAxisID: 'y-axis-1' }, { yAxisID: 'y-axis-2' }];
        public options = {
            scales: {
                yAxes: [
                    {
                        id: 'y-axis-1',
                        type: 'linear',
                        display: true,
                        position: 'left'
                    },
                    {
                        id: 'y-axis-2',
                        type: 'linear',
                        display: true,
                        position: 'right'
                    }
                ]
            }
        };



        constructor(private $log: ng.ILogService, private $scope: ng.IScope,
            private AppService: IAppService, private AppUtil: AppUtil) {



            $scope.$on('$ionicView.beforeEnter', () => this.refresh())

        }

        public refresh() {
            // this.AppUtil.blockingCall(
            //     this.AppService.getFindUsReport(),
            //     items => {
            //         this.voterReport = {}
            //         this.$log.log('loaded ' + items.length + ' items')
            //         this.voteReports = items
            //         this.voteReports.forEach(a => {
            //             if (a.name in this.voterReport)
            //                 this.voterReport[a.name]++
            //             else
            //                 this.voterReport[a.name] = 1;
            //         })
            //     })
        }
    }

    Graph.$inject = ['$log', '$scope', 'AppService', 'AppUtil']
    angular.module('controllers').controller('Graph', Graph)
}
