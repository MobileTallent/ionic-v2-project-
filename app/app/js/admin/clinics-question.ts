module app {

    export class ClinicsQuestion {
        private modalText = "New "
        public clinicQuestions
        public clinicQuestion: IClinicsQuestion
        private clinicsModal
        private submitted = false;

        constructor(private $ionicPopup, private $log: ng.ILogService, private $scope: ng.IScope,
            private $state, private $ionicModal, private AppService: IAppService, private AppUtil: AppUtil) {

            $scope.$on('$ionicView.beforeEnter', () => this.refresh())
            // $ionicModal.fromTemplateUrl('clinicsModal.html', {

            // // Cleanup the modal when we're done with it
            $scope.$on('$destroy', () => this.clinicsModal.remove())

            $ionicModal.fromTemplateUrl('templates/modal.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(modal => this.clinicsModal = modal)
        }

        public refresh() {
            this.AppUtil.blockingCall(
                this.AppService.getClinicsQuestion(),
                questions => {
                    this.$log.log('loaded ' + questions.length + ' questions')
                    this.clinicQuestions = questions
                })
        }

        public addClinicsQuestion(form) {
            this.submitted = true
            if (form.$valid) {
                this.AppUtil.blockingCall(
                    this.AppService.addClinicsQuestion(this.clinicQuestion),
                    () => {
                        this.clinicQuestion = null
                        this.AppUtil.toastSimple("Saved Successfully")
                        this.refresh()
                    })
                setTimeout(this.resetForm(form), 1000)
            }
        }

        public editClinicsQuestion(question) {
            this.modalText = "Update "
            this.clinicQuestion = question.toJSON()
            this.clinicsModal.show()
        }

        public deleteClinicsQuestion(id) {
            this.$log.log('Delete question ' + id)
            var _this = this
            this.$ionicPopup.confirm({
                title: 'Delete Question',
                template: 'Are you sure you want to delete this question?'
            }).then(function (res) {
                if (res)
                    _this.deleteQ(id)
            });
        }

        public deleteQ(id) {
            this.AppUtil.blockingCall(
                this.AppService.delClinicsQuestion(id),
                () => {
                    this.AppUtil.toastSimple("Deleted Successfully")
                    this.refresh()
                })
        }

        public close() {
            this.clinicQuestion = null
            this.clinicsModal.hide()
        }

        public resetForm(form) {
            this.clinicQuestion = null
            this.clinicsModal.hide()
            form.$setPristine()
            form.$setUntouched()
        }

    }

    ClinicsQuestion.$inject = ['$ionicPopup', '$log', '$scope', '$state', '$ionicModal', 'AppService', 'AppUtil']
    angular.module('controllers').controller('ClinicsQuestion', ClinicsQuestion)
}
