// Cloud code functions which are only run by admin users
var _ = require('underscore')
var parseConfig = require('../parse-config.js')

Parse.Cloud.define('GetServiceProviders', function(request, response) {

    new Parse.Query('ServiceProvider')
        .descending('createdAt')
        .find()
        .then(function(service_providers) {
            response.success(_.map(service_providers, service_provider => service_provider.toJSON()))
        }, function(error) {
            response.error(error)
        })
})


Parse.Cloud.define('AddServiceProviders', function(request, response) {

    var serviceProviderData = request.params.serviceProvider

    if (!serviceProviderData)
        return response.error('serviceProviderData parameter must be provided')

    var sp = new ServiceProvider()
    if (serviceProviderData.id) {
        sp.id = serviceProviderData.id
        delete serviceProviderData.id
    }

    sp.save(serviceProviderData).then(function(result) {
        console.log("Success saving service provider")
        response.success("Success saving service provider")
    }, function(error) {
        console.log("Error saving service provider")
        response.error(error)
    })
})