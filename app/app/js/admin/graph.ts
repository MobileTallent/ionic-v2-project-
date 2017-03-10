module app {

    export class Graph {
        public labels = ["January", "February", "March", "April", "May", "June", "July"]
        public series = ['Series A', 'Series B']
        public numDays = 7
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
        }

        public labels1 = ["January", "February", "March", "April", "May", "June", "July"]
        public series1 = ['Series A']
        public data1 = [28, 48, 40, 19, 86, 27, 90]
        
        public datasetOverride1 = [{ yAxisID: 'y-axis-1' }];
        public options1 = {
            scales: {
                yAxes: [
                    {
                        id: 'y-axis-1',
                        type: 'linear',
                        display: true,
                        position: 'left'
                    }
                ]
            }
        };

        public realData = null



        constructor(private $log: ng.ILogService, private $scope: ng.IScope,
            private AppService: IAppService, private AppUtil: AppUtil) {
            $scope.$on('$ionicView.beforeEnter', () => this.getReport())
        }

        public getReport() {
                // this.AppService.getMatchesReport(this.numDays).then(                
                //     items => {
                //     this.realData = items
                //     this.$log.log('loaded ' + items.length + ' items')
                // })
            this.AppUtil.blockingCall(
                this.AppService.getMatchesReport(this.numDays),
                items => {
                    this.realData = items
                    this.$log.log('loaded ' + items.length + ' items')
                })
        }
    }

    Graph.$inject = ['$log', '$scope', 'AppService', 'AppUtil']
    angular.module('controllers').controller('Graph', Graph)
}
