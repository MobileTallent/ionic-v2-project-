(function() {

    angular.module('sp.services', [])
        .factory('SpService', function($rootScope, $timeout, ParseService, $http, $log, $state, $q) {

            var server = ParseService
            var service = {
                // fields
                service_provider: null,
                provider_id: '',
                info_cards: null,
                services: null,
                hot_beds: null,
                enquiries: null,
                // methods
                getMyServiceProvider: getMyServiceProvider,
                getInfoCards: getInfoCards,
                addInfoCard: addInfoCard,
                delInfoCard: delInfoCard,
                getPrServices: getPrServices,
                addPrService: addPrService,
                delPrService: delPrService,
                getHotBeds: getHotBeds,
                addHotBed: addHotBed,
                delHotBed: delHotBed,
                getEnquiries: getEnquiries,
                addEnquire: addEnquire

            }

            return service

            //Service Provider functions
            function getMyServiceProvider(userId) {
                return server.getMyServiceProvider(userId).then(provider => {
                    service.service_provider = provider
                    return service.profile
                })
            }

            function getInfoCards() {
                return server.getInfoCards(service.provider_id)
            }

            function addInfoCard(infoCard) {
                return server.addInfoCard(infoCard)
            }

            function delInfoCard(id) {
                return server.delInfoCard(id)
            }

            function getPrServices() {
                return server.getPrServices(service.provider_id)
            }

            function addPrService(prService) {
                return server.addPrService(prService)
            }

            function delPrService(id) {
                return server.delPrService(id)
            }

            function getHotBeds() {
                return server.getHotBeds(service.provider_id)
            }

            function addHotBed(hotBed) {
                return server.addHotBed(hotBed)
            }

            function delHotBed(id) {
                return server.delHotBed(id)
            }

            function getEnquiries(sid, unique_user) {
                return server.getEnquiries(service.provider_id, sid, unique_user)
            }

            function addEnquire(enquire) {
                return server.addEnquire(enquire)
            }

        })

})();