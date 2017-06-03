module app {

    export class SpFaq {

        public provider_questions

        constructor(private $scope, public AppService, public AppUtil, public SpService) {
            this.provider_questions = this.SpService.provider_questions
        }

    }

    SpFaq.$inject = ['$scope', 'AppService', 'AppUtil', 'SpService']
    angular.module('controllers').controller('SpFaq', SpFaq)
}
