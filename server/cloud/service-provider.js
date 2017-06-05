var ServiceProvider = Parse.Object.extend("ServiceProvider")
var InfoCard = Parse.Object.extend("InfoCard")
var PrService = Parse.Object.extend("PrService")
var HotBed = Parse.Object.extend("HotBed")
var Enquire = Parse.Object.extend("Enquire")
var ProviderQuestion = Parse.Object.extend("ProviderQuestion")
var Profile = Parse.Object.extend("Profile")

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

/* Get My Service Provider */
Parse.Cloud.define('GetMyServiceProvider', function(request, response) {
    var userId = request.params.userId

    new Parse.Query(ServiceProvider)
        .equalTo("uid", userId)
        .first()
        .then(function(result) {
            console.log("Successs " + JSON.stringify(result))
            response.success(result)
        }, function(error) {
            console.log("Erroorrr: " + JSON.stringify(error))
            response.error(error)
        })
})

/* Get Service Provider Length of contents */
Parse.Cloud.define('GetServiceProviderLengths', function(request, response) {
    var provider_id = request.params.provider_id

    if (!provider_id)
        return response.error('provider_id parameter must be provided')


    var getInfoCardsLength = new Parse.Query(InfoCard)
        .limit(1000)
        .equalTo("pid", provider_id)
        .find()

    var getServicesLength = new Parse.Query(PrService)
        .limit(1000)
        .equalTo("pid", provider_id)
        .find()

    var getHotBedsLength = new Parse.Query(HotBed)
        .limit(1000)
        .equalTo("pid", provider_id)
        .find()

    var getUsersLength = new Parse.Query(Enquire)
        .limit(1000)
        .equalTo("pid", provider_id)
        .find()

    Parse.Promise.when(getInfoCardsLength, getServicesLength, getHotBedsLength, getUsersLength).then(function(infocards, services, hotbeds, users) {

        var users_array = [];
        for (var i = 0; i < users.length; i++) {
            console.log(users[i]);
            users_array.push(users[i].name);
        }
        //remove dublicates
        var uniqueArray = users_array.filter(function(item, pos) {
            return users_array.indexOf(item) == pos;
        })

        //make users array
        var new_result = [];
        for (var i = 0; i < uniqueArray.length; i++) {
            for (var j = 0; j < users.length; j++) {
                if (users[j].name == uniqueArray[i]) {
                    new_result.push(users[j]);
                    break;
                }
            }
        }
        users = new_result;

        let result = { infocards: infocards.length, services: services.length, hotbeds: hotbeds.length, users: users.length }
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
    if (request.params.user.id) user_data_id = request.params.user.id
    else user_data_id = request.params.user

    if (is_set === undefined || !user_data_id)
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

/* Del Info Card */
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

/* Get Internal Provider Service */
Parse.Cloud.define('GetPrServices', function(request, response) {
    var provider_id = request.params.provider_id
    if (!provider_id)
        return response.error('provider_id parameter must be provided')

    new Parse.Query(PrService)
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

/* Add/Edit Internal Provider Service */
Parse.Cloud.define('AddPrService', function(request, response) {

    var PrServiceData = request.params.prService

    if (!PrServiceData)
        return response.error('PrServiceData parameter must be provided')

    var ps = new PrService()
    if (PrServiceData.id) {
        ps.id = PrServiceData.id
        delete PrServiceData.id
    }

    ps.save(PrServiceData).then(function(result) {
        console.log("Success saving internal service")
        response.success("Success saving internal service")
    }, function(error) {
        console.log("Error saving internal service")
        response.error(error)
    })
})

/* Del Internal Provider Service */
Parse.Cloud.define('DelPrService', function(request, response) {

    var id = request.params.id
    if (!id) return response.error('id parameter is required')

    new Parse.Query(PrService)
        .get(id)
        .then(function(pr_service) {
            return pr_service.destroy()
        }).then(function() {
            response.success("Successfully deleted internal service!")
        }),
        function(error) {
            console.log(JSON.stringify(error))
            response.error(error)
        }
})

/* Get HotBeds */
Parse.Cloud.define('GetHotBeds', function(request, response) {
    var provider_id = request.params.provider_id
    if (!provider_id)
        return response.error('provider_id parameter must be provided')

    new Parse.Query(HotBed)
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

/* Add/Edit HotBed */
Parse.Cloud.define('AddHotBed', function(request, response) {

    var HotBedData = request.params.hotBed

    if (!HotBedData)
        return response.error('HotBedData parameter must be provided')

    var hb = new HotBed()
    if (HotBedData.id) {
        hb.id = HotBedData.id
        delete HotBedData.id
    }

    hb.save(HotBedData).then(function(result) {
        console.log("Success saving hotbed")
        response.success("Success saving hotbed")
    }, function(error) {
        console.log("Error saving internal hotbed")
        response.error(error)
    })
})

/* Del HotBed */
Parse.Cloud.define('DelHotBed', function(request, response) {

    var id = request.params.id
    if (!id) return response.error('id parameter is required')

    new Parse.Query(HotBed)
        .get(id)
        .then(function(hot_bed) {
            return hot_bed.destroy()
        }).then(function() {
            response.success("Successfully deleted Hotbed!")
        }),
        function(error) {
            console.log(JSON.stringify(error))
            response.error(error)
        }
})


/* Get Enguiries */
Parse.Cloud.define('GetEnquiries', function(request, response) {

    if (request.params.provider_id)
        var provider_id = request.params.provider_id
    if (request.params.service_id)
        var service_id = request.params.service_id

    if (!provider_id && !service_id)
        return response.error('provider_id or service_id parameter must be provided')


    if (provider_id)
        var queryEnquiries = new Parse.Query(Enquire)
            .limit(1000)
            .equalTo("pid", provider_id)
            .descending('createdAt')
            .find()

    if (service_id)
        var queryEnquiries = new Parse.Query(Enquire)
            .limit(1000)
            .equalTo("sid", service_id)
            .descending('createdAt')
            .find()

    Parse.Promise.when(queryEnquiries).then(function(result) {
        if (request.params.unique_user) {

            //create array with users
            var users_array = []
            for (var i = 0; i < result.length; i++) {
                console.log(result[i])
                users_array.push(result[i].name)
            }
            //remove dublicates
            var uniqueArray = users_array.filter(function(item, pos) {
                return users_array.indexOf(item) == pos;
            })

            //make users array
            var new_result = [];
            for (var i = 0; i < uniqueArray.length; i++) {
                for (var j = 0; j < result.length; j++) {
                    if (result[j].name == uniqueArray[i]) {
                        new_result.push(result[j])
                        break
                    }
                }
            }
            result = new_result
        }

        console.log("Successs " + JSON.stringify(result))
        response.success(result)
    }, function(error) {
        console.log("Erroorrr: " + JSON.stringify(error))
        response.error(error)
    })
})

/* Add/Edit Enquire */
Parse.Cloud.define('AddEnquire', function(request, response) {

    var EnquireData = request.params.enquire

    if (!EnquireData)
        return response.error('EnquireData parameter must be provided')

    var en = new Enquire()
    if (EnquireData.id) {
        en.id = EnquireData.id
        delete EnquireData.id
    }

    en.save(EnquireData).then(function(result) {
        console.log("Success saving enquire")
        response.success("Success saving enquire")
    }, function(error) {
        console.log("Error saving enquire")
        response.error(error)
    })
})

/* Del Enquire */
Parse.Cloud.define('DelEnquire', function(request, response) {

    var id = request.params.id
    if (!id) return response.error('id parameter is required')

    new Parse.Query(Enquire)
        .get(id)
        .then(function(enquire) {
            return enquire.destroy()
        }).then(function() {
            response.success("Successfully deleted Enquire!")
        }),
        function(error) {
            console.log(JSON.stringify(error))
            response.error(error)
        }
})

/* Set Enquire as readed */
Parse.Cloud.define('MarkEnquireAsRead', function(request, response) {
    var eid = request.params.id
    if (!eid)
        return response.error('Enquire id parameter must be provided')

    var selectedEnquireQuery = new Parse.Query(Enquire)
        .get(eid)

    Parse.Promise.when(selectedEnquireQuery).then(function(selectedEnquire) {
        selectedEnquire.set('has_read', true)
        selectedEnquire.save()
        response.success(null)
    }, function(error) {
        response.error(error)
    })

})

/* Get Provider Question */
Parse.Cloud.define('GetProviderQuestions', function(request, response) {
    new Parse.Query(ProviderQuestion)
        .limit(1000)
        .ascending('position')
        .find()
        .then(function(result) {
            console.log("Successs " + JSON.stringify(result))
            response.success(result)
        }, function(error) {
            console.log("Erroorrr: " + JSON.stringify(error))
            response.error(error)
        })
})

/* Add/Edit Provider Question */
Parse.Cloud.define('AddProviderQuestions', function(request, response) {

    console.log('AddProviderQuestions')
    var providerQuestionData = request.params.question

    if (!providerQuestionData)
        return response.error('providerQuestionData parameter must be provided')

    var pq = new ProviderQuestion()
    if (providerQuestionData.id) {
        pq.id = providerQuestionData.id
        delete providerQuestionData.id
    }

    pq.save(providerQuestionData).then(function(result) {
        console.log("Success saving provider question")
        response.success("Success saving provider question")
    }, function(error) {
        console.log("Error saving provider question")
        response.error(error)
    })
})

/* Del Provider Question */
Parse.Cloud.define('DelProviderQuestions', function(request, response) {

    console.log('DelProviderQuestions')
    var id = request.params.id
    if (!id) return response.error('id parameter is required')

    var providerQuery = new Parse.Query(ProviderQuestion);
    providerQuery.get(id, masterKey).then(function(providerQuestion) {
            return providerQuestion.destroy()
        }).then(function() {
            response.success("Successfully deleted question!")
        }),
        function(error) {
            console.log(JSON.stringify(error))
            response.error(error)
        }
})


/* Get Users */
Parse.Cloud.define("GetUsers", function(request, response) {
    // We need to use the master key to load the other users profiles
    var audience = request.params.audience


    if (audience == 'all') {
        new Parse.Query(Profile)
            .limit(1000)
            .equalTo("enabled", true)
            .find({ useMasterKey: true })
            .then(function(result) {
                console.log("Successs " + JSON.stringify(result))
                response.success(result)
            }, function(error) {
                console.log("Erroorrr: " + JSON.stringify(error))
                response.error(error)
            })
    } else {
        new Parse.Query(Profile)
            .limit(10000)
            .equalTo(audience, true)
            .find({ useMasterKey: true })
            .then(function(result) {
                console.log("Successs " + JSON.stringify(result))
                response.success(result)
            }, function(error) {
                console.log("Erroorrr: " + JSON.stringify(error))
                response.error(error)
            })
    }


});