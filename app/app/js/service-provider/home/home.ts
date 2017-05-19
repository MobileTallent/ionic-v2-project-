module app {

    export class SpHome {
        
        public info_cards 
        public services 
        public labels
        public cardsSeries
        public servicesSeries
        public cardsData
        public servicesData
        public datasetOverride
        public options
        public chartData
        public colors

        constructor(private $log, private $scope, public AppService, public AppUtil, public SpService) {
            
            this.info_cards = this.SpService.info_cards
            this.services = this.SpService.services

            //common props
                //set arrays with dates
                let curDate = new Date()
                let dateCovered = new Date()
                dateCovered.setDate(dateCovered.getDate() - 7 + 1)
                this.labels = [];
                while(dateCovered <= curDate){
                    this.labels.push(dateCovered.toDateString())
                    dateCovered.setDate(dateCovered.getDate() + 1);
                }
                //settings for chart
                this.datasetOverride = [
                    { 
                        yAxisID: 'y-axis-1',
                        fill:false,
                        borderColor:'#2e8478',
                        pointBorderColor:'#2e8478',
                        pointBackgroundColor: '#2e8478'
                    }, 
                    { 
                        yAxisID: 'y-axis-1',
                        fill:false,
                        borderColor:'#3baa9a',
                        pointBorderColor:'#3baa9a',
                        pointBackgroundColor: '#3baa9a'
                    }, 
                    { 
                        yAxisID: 'y-axis-1',
                        fill:false,
                        borderColor:'#B8F4E1',
                        pointBorderColor:'#B8F4E1',
                        pointBackgroundColor: '#B8F4E1'
                    }
                ];
                //options for charts
                this.options = {
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

            this.getCardsReport()
            this.getServicesReport()
        }

        public getCardsReport() {
            //sort cards by summary
            this.info_cards.sort(function(a, b){
                var keyA = new Date(a.clicks.summary),
                    keyB = new Date(b.clicks.summary);
                // Compare the 2 dates
                if(keyA > keyB) return -1;
                if(keyA < keyB) return 1;
                return 0;
            });
            //take first 3 cards
            this.info_cards = this.info_cards.slice(0, 3);
            //create series for graphs
            this.cardsSeries = [];
            this.info_cards.forEach(element => {
               this.cardsSeries.push(element.title+' clicks');
            });

            this.cardsData = [[],[],[]]
            for (var i=0;i<this.info_cards.length;i++){
                    if(this.info_cards[i].clicks.summary>0) {
                        //have clicks
                        let last_card_clicks = this.info_cards[i].clicks.by_days.slice(0, 7);
                        for(var j=0;j<this.labels.length;j++){
                            let matchedTrue = 0
                            for(let m=0;m<last_card_clicks.length;m++){
                               
                                if(this.labels[j] == (new Date(last_card_clicks[m].date)).toDateString()) {
                                    matchedTrue = last_card_clicks[m].summary
                                }
                                    
                            }
                            this.cardsData[i].push(matchedTrue)
                          

                        }
                    }  else {
                        this.cardsData[i] = [0,0,0,0,0,0,0]
                    } 
            }
        }

        public getServicesReport() {
            //sort services by summary
            this.services.sort(function(a, b){
                var keyA = new Date(a.clicks.summary),
                    keyB = new Date(b.clicks.summary);
                // Compare the 2 dates
                if(keyA > keyB) return -1;
                if(keyA < keyB) return 1;
                return 0;
            });
            //take first 3 services
            this.services = this.services.slice(0, 3);
            //create series for graphs
            this.servicesSeries = [];
            this.services.forEach(element => {
               this.servicesSeries.push(element.title+' clicks');
            });
            this.servicesData = [[],[],[]]
            for (var i=0;i<this.services.length;i++){
                    if(this.services[i].clicks.summary>0) {
                        //have clicks
                        let last_card_clicks = this.services[i].clicks.by_days.slice(0, 7);
                        for(var j=0;j<this.labels.length;j++){
                            let matchedTrue = 0
                            for(let m=0;m<last_card_clicks.length;m++){
                               
                                if(this.labels[j] == (new Date(last_card_clicks[m].date)).toDateString()) {
                                    matchedTrue = last_card_clicks[m].summary
                                }
                                    
                            }
                            this.servicesData[i].push(matchedTrue)
                          

                        }
                    }  else {
                        this.servicesData[i] = [0,0,0,0,0,0,0]
                    } 
            }
        }

        doRefresh(){
            console.log('refresh')
            this.SpService.getInfoCards()
            .then(
                (info_cards) => {
                this.info_cards = info_cards;
                this.getCardsReport();
                return this.SpService.getPrServices()
            }).then(
                (services) => {
                this.services = services;
                this.getServicesReport();
                this.$scope.$broadcast('scroll.refreshComplete');
            })
        }
    }

    SpHome.$inject = ['$log', '$scope', 'AppService', 'AppUtil', 'SpService']
    angular.module('controllers').controller('SpHome', SpHome)
}
