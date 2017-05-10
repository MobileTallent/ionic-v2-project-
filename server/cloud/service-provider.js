var ServiceProvider = Parse.Object.extend("ServiceProvider")
var InfoCard = Parse.Object.extend("InfoCard")

/* Get Service Providers */
Parse.Cloud.define('GetServiceProviders', function(request, response) {
    new Parse.Query(ServiceProvider)
        .limit(1000)
        .descending('createdAt')
        .find()
        .then(function(result) {
        console.log("Successs " + JSON.stringify(result))
        response.success(result)
    }, function(error) {
        console.log("Erroorrr: " + JSON.stringify(error))
        response.error(error)
    })
})

/* Add/Edit Service Provider */
Parse.Cloud.define('AddServiceProvider', function(request, response) {

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

/* Del Service Provider*/
Parse.Cloud.define('DelServiceProvider', function(request, response) {

    var id = request.params.id
    if (!id) return response.error('id parameter is required')

    new Parse.Query(ServiceProvider)
    .get(id)
    .then(function(provider) {
            return provider.destroy()
        }).then(function() {
            response.success("Successfully deleted provider!")
        }),
        function(error) {
            console.log(JSON.stringify(error))
            response.error(error)
        }
})

/* Set Service Provider */
Parse.Cloud.define('SetServiceProvider', function(request, response) {

    var is_set = request.params.is_set
    var user_data_id
    if(request.params.user.id) user_data_id = request.params.user.id 
    else user_data_id = request.params.user

    if (is_set===undefined || !user_data_id)
        return response.error('is_set and user_data parameter must be provided')

    var selectedUser = new Parse.User()
    selectedUser.id = user_data_id

    var selectedUserQuery = new Parse.Query(Parse.User)
    .include('profile')
    .get(user_data_id)

    Parse.Promise.when(selectedUserQuery).then(function(selectedUser) {
        selectedUser.set('serviceProvider', is_set)
        selectedUser.save()
        response.success(null)
    }, function(error) {
        response.error(error)
    })

})

/* Get Info Cards  */
Parse.Cloud.define('GetInfoCards', function(request, response) {
    var provider_id = request.params.provider_id
    if (!provider_id)
        return response.error('provider_id parameter must be provided')
        
    new Parse.Query(InfoCard)
        .limit(1000)
        .equalTo("pid", provider_id)
        .descending('createdAt')
        .find()
        .then(function(result) {
        console.log("Successs " + JSON.stringify(result))
        response.success(result)
    }, function(error) {
        console.log("Erroorrr: " + JSON.stringify(error))
        response.error(error)
    })
})

/* Add/Edit Info Card */
Parse.Cloud.define('AddInfoCard', function(request, response) {

    var infoCardData = request.params.infoCard

    if (!infoCardData)
        return response.error('InfoCardData parameter must be provided')

    var ic = new InfoCard()
    if (infoCardData.id) {
        ic.id = infoCardData.id
        delete infoCardData.id
    }

    ic.save(infoCardData).then(function(result) {
        console.log("Success saving info card")
        response.success("Success saving info card")
    }, function(error) {
        console.log("Error saving info card")
        response.error(error)
    })
})

/* Del Service Provider*/
Parse.Cloud.define('DelInfoCard', function(request, response) {

    var id = request.params.id
    if (!id) return response.error('id parameter is required')

    new Parse.Query(InfoCard)
    .get(id)
    .then(function(info_card) {
            return info_card.destroy()
        }).then(function() {
            response.success("Successfully deleted info card!")
        }),
        function(error) {
            console.log(JSON.stringify(error))
            response.error(error)
        }
})
