module app {

    export class SpInfoCards {
        
        public info_cards = []
        public info_card = {}
        private addInfoCardModal
        private modalText = "New "
        private submitted = false;

        constructor(private $log, private $scope, private $ionicModal, private $ionicPopup, public AppService, public AppUtil, public SpService) {
            this.info_cards = this.SpService.info_cards

            // Cleanup the modal when we're done with it
            $scope.$on('$destroy', () => this.addInfoCardModal.remove())

            $ionicModal.fromTemplateUrl('service-provider/info-cards/add-info-card-modal.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(modal => this.addInfoCardModal = modal)
        }

        public doRefresh(){
            console.log('refresh')
            this.SpService.getInfoCards()
            .then(
                (info_cards) => {
                this.info_cards = info_cards
                this.$scope.$broadcast('scroll.refreshComplete');
            })
        }

        public addInfoCard(form) {
            this.submitted = true
            if (form.$valid) {
                this.info_card['pid'] = this.SpService.provider_id
                this.info_card['shows'] = {summary:0}
                this.info_card['clicks'] = {summary:0,by_days:[]}
                if(this.info_card['audience']) {
                    let tags = []
                    if (this.info_card['audience']['LFsperm']) tags.push('LFsperm')
                    if (this.info_card['audience']['LFeggs']) tags.push('LFeggs')
                    if (this.info_card['audience']['LFembryo']) tags.push('LFembryo')
                    if (this.info_card['audience']['LFwomb']) tags.push('LFwomb')
                    this.info_card['audience'] = {"tags":tags}
                } else {
                    this.info_card['audience'] = {"tags":[]}
                }

                
                console.log('infocard before send', this.info_card)
                this.AppUtil.blockingCall(
                    this.SpService.addInfoCard(this.info_card),
                    () => {
                        this.modalText = "New "
                        this.info_card = null
                        this.AppUtil.toastSimple("Saved Successfully")
                        this.doRefresh()
                    })
                setTimeout(this.resetForm(form), 1000)
            }
        }

        public editInfoCard(info_card) {
            this.modalText = "Update "
            this.info_card = info_card.toJSON()
            this.addInfoCardModal.show()
        }

        public deleteInfoCard(id) {
            this.$log.log('Delete info card ' + id)
            var _this = this
            this.$ionicPopup.confirm({
                title: 'Delete Info Card',
                template: 'Are you sure you want to delete this card?'
            }).then(function (res) {
                if (res)
                    _this.deleteQ(id)
            });
        }

        public deleteQ(id) {
            this.AppUtil.blockingCall(
                this.SpService.delInfoCard(id),
                () => {
                    this.AppUtil.toastSimple("Deleted Successfully")
                    this.doRefresh()
                })
        }

        public close() {
            this.modalText = "New "
            this.info_card = {type:'image',options:{frequency:50,age_from:18,age_to:55}}
            this.addInfoCardModal.hide()
        }

        public resetForm(form) {
            this.info_card = {type:'image',options:{frequency:50,age_from:18,age_to:55}}
            this.submitted = false
            this.addInfoCardModal.hide()
            form.$setPristine()
            form.$setUntouched()
        }

    }

    SpInfoCards.$inject = ['$log', '$scope', '$ionicModal', '$ionicPopup', 'AppService', 'AppUtil', 'SpService']
    angular.module('controllers').controller('SpInfoCards', SpInfoCards)
}
