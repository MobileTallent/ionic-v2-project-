module app {

    export class WhereUFindUsAdmin {
        private modalText = 'New '
        public findUsGroup
        public findUs: IFindUs
        private findUsModal
        private submitted = false;

        constructor(private $ionicPopup, private $log: ng.ILogService, private $scope: ng.IScope,
            private $state, private $ionicModal, private AppService: IAppService, private AppUtil: AppUtil) {

            $scope.$on('$ionicView.beforeEnter', () => this.refresh())

            // // Cleanup the modal when we're done with it
            $scope.$on('$destroy', () => this.findUsModal.remove())

            $ionicModal.fromTemplateUrl('templates/modal.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(modal => this.findUsModal = modal)
        }

        public refresh() {
            this.AppUtil.blockingCall(
                this.AppService.getFindUs(),
                items => {
                    this.$log.log('loaded ' + items.length + ' items')
                    this.findUsGroup = items
                })
        }

        public addFindUs(form) {
            this.submitted = true
            if (form.$valid) {
                this.AppUtil.blockingCall(
                    this.AppService.addFindUs(this.findUs),
                    () => {
                        this.modalText = 'New '
                        this.findUs = null
                        this.AppUtil.toastSimple('Saved Successfully')
                        this.refresh()
                    })
                setTimeout(this.resetForm(form), 1000)
            }
        }

        public editFindUs(question) {
            this.modalText = 'Update '
            this.findUs = question.toJSON()
            this.findUsModal.show()
        }

        public deleteFindUs(id) {
            this.$log.log('Delete find us name ' + id)
            var _this = this
            this.$ionicPopup.confirm({
                title: 'Delete',
                template: 'Are you sure you want to delete this item?'
            }).then(function (res) {
                if (res)
                    _this.deleteQ(id)
            });
        }

        public deleteQ(id) {
            this.AppUtil.blockingCall(
                this.AppService.delFindUs(id),
                () => {
                    this.AppUtil.toastSimple('Deleted Successfully')
                    this.refresh()
                })
        }

        public close() {
            this.modalText = 'New '
            this.findUs = null
            this.findUsModal.hide()
        }

        public resetForm(form) {
            this.findUs = null
            this.findUsModal.hide()
            form.$setPristine()
            form.$setUntouched()
        }

    }

    WhereUFindUsAdmin.$inject = ['$ionicPopup', '$log', '$scope', '$state', '$ionicModal', 'AppService', 'AppUtil']
    angular.module('controllers').controller('WhereUFindUsAdmin', WhereUFindUsAdmin)
}
