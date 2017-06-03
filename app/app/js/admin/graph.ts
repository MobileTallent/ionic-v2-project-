module app {

    export class GraphReport {
        public labels = []
        public voterReport = null
        public series = ['Matches Per Day', 'Series B']
        public numDays = 7
        public matchData = []
        public chatsData = [28, 48, 40, 19, 86, 27, 90]
        public data = [[]]

        // public onClick = function (points, evt) {
        //     console.log(points, evt);
        // };
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

        constructor(private $log: ng.ILogService, private $scope: ng.IScope,
            private AppService: IAppService, private AppUtil: AppUtil) {
            $scope.$on('$ionicView.beforeEnter', () => this.getReport())
        }

        public getReport() {
            var curDate = new Date()
            var dateCovered = new Date()
            dateCovered.setDate(dateCovered.getDate() - this.numDays + 1)
            this.labels = []
            this.matchData = []
            this.voterReport = null
            this.data = [[]]

            while (dateCovered <= curDate) {
                this.labels.push(dateCovered.toDateString())
                dateCovered.setDate(dateCovered.getDate() + 1);
            }
            this.AppUtil.blockingCall(
                this.AppService.getMatchesReport(this.numDays),
                items => {
                    this.voterReport = {}
                    this.$log.log('LOADED ' + items.length + ' items')

                    items.forEach(a => {
                        if (a.matchedDate.toDateString() in this.voterReport) {
                            this.voterReport[a.matchedDate.toDateString()]++
                        } else {
                            this.voterReport[a.matchedDate.toDateString()] = 1;
                        }
                    })
                    this.labels.forEach(a => {
                        if (a in this.voterReport) {
                            this.matchData.push(this.voterReport[a])
                        } else {
                            this.matchData.push(0)
                        }
                    })
                    this.data[0] = this.matchData

                    this.AppService.getChatMessageReport(this.numDays).then(
                        items => {
                            this.$log.log('loaded ' + items.length + ' chats')
                            var groupByDateObj = _.groupBy(items, function(n) {
                                return n.createdAt.toDateString()
                            })


                            for (var item in groupByDateObj) {
                                if (groupByDateObj.hasOwnProperty(item)) {
                                    var arrayOfNames = _.groupBy(item, function(n) {
                                        return n.senderName
                                    })
                                    console.log('Names length: ' + arrayOfNames.length)
                                }
                            }
                    })
            })
        }
    }

    GraphReport.$inject = ['$log', '$scope', 'AppService', 'AppUtil']
    angular.module('controllers').controller('GraphReport', GraphReport)
}
