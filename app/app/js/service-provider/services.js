(function() {

    angular.module('sp.services', [])
        .factory('SpService', function($rootScope, $timeout, ParseService, $http, $log, $state, $q) {

            var server = ParseService
            var service = {
                // fields
                service_provider: null,
                provider_id: '',
                user_role: '',
                info_cards: null,
                services: null,
                hot_beds: null,
                enquiries: null,
                provider_questions: null,
                branches: null,
                // methods
                addServiceProvider: addServiceProvider,
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
                getUnreadEnquiries: getUnreadEnquiries,
                markEnquireAsRead: markEnquireAsRead,
                addEnquire: addEnquire,
                getProviderQuestions: getProviderQuestions,
                getUsers: getUsers,
                getBranches: getBranches,
                delBranch: delBranch,
                addBranch: addBranch,
                getBranchServices: getBranchServices

            }

            return service

            //Service Provider functions

            function addServiceProvider(service_provider) {
                return server.addServiceProvider(service_provider)
            }

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

            function getUnreadEnquiries() {
                var count = 0
                for (var i=0;i<service.enquiries.length;i++) {
                    if(service.enquiries[i].has_read==false) count ++
                }
                $rootScope.unread_enquiries = count;
            }

            function markEnquireAsRead(eid) {
                return server.markEnquireAsRead(eid)
            }

            function addEnquire(enquire) {
                return server.addEnquire(enquire)
            }

            function getProviderQuestions() {
                return server.getProviderQuestions()
            }
            
            function getUsers(audience) {
                return server.getUsers(audience)
            }

            function getBranches() {
                return server.getBranches(service.provider_id)
            }

            function delBranch(id) {
                return server.delBranch(id)
            }

            function addBranch(branch) {
                return server.addBranch(branch)
            }

            function getBranchServices(services) {
                return server.getBranchServices(services)
            }
        })

})();