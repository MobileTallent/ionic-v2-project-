var ServiceProvider = Parse.Object.extend("ServiceProvider")
var InfoCard = Parse.Object.extend("InfoCard")
var PrService = Parse.Object.extend("PrService")
var HotBed = Parse.Object.extend("HotBed")
var Enquire = Parse.Object.extend("Enquire")
var ProviderQuestion = Parse.Object.extend("ProviderQuestion")
var Profile = Parse.Object.extend("Profile")
var CardsDeckSetting = Parse.Object.extend("CardsDeckSetting")
var SavedInfoCard = Parse.Object.extend("SavedInfoCard")
var PrUser = Parse.Object.extend("PrUser")

function checkAdmin(request, response) {
    if (!request.user.get('admin')) {
        response.error('You do not have admin permission')
        return false
    }
    Parse.Cloud.useMasterKey()
    return true
}

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
    
    var getUsersLength = new Parse.Query(PrUser)
        .limit(1000)
        .equalTo("pid", provider_id)
        .find()
    
    Parse.Promise.when(getInfoCardsLength, getServicesLength, getHotBedsLength, getUsersLength).then(function(infocards, services, hotbeds, users) {
        let result = {infocards:infocards.length, services:services.length, hotbeds:hotbeds.length, users:users.length}
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
        response.success(result.toJSON())
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
    
    if(request.params.provider_id) 
        var provider_id = request.params.provider_id
    if(request.params.service_id) 
        var service_id = request.params.service_id

    if (!provider_id && !service_id)
        return response.error('provider_id or service_id parameter must be provided')

    
    if(provider_id) 
        var queryEnquiries = new Parse.Query(Enquire)
        .limit(1000)
        .equalTo("pid", provider_id)
        .descending('createdAt')
        .find()

    if(service_id) 
        var queryEnquiries = new Parse.Query(Enquire)
        .limit(1000)
        .equalTo("sid", service_id)
        .descending('createdAt')
        .find()
    
    Parse.Promise.when(queryEnquiries).then(function(result) {
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

/* Get Deck Settings */
Parse.Cloud.define('GetCardsDeckSettings', function(request, response) {
    if (!checkAdmin(request, response))
        return
        
    console.log('GetCardsDeckSettings')
    new Parse.Query(CardsDeckSetting).first().then(function(result) {
        console.log("Successs " + JSON.stringify(result))
        response.success(result.toJSON())
    }, function(error) {
        console.log("Erroorrr: " + JSON.stringify(error))
        response.error(error)
    })
})

/* Add/Edit Deck Settings */
Parse.Cloud.define('AddCardsDeckSettings', function(request, response) {
    if (!checkAdmin(request, response))
        return

    console.log('addEditCardsDeckSettings')
    var deckSettingsData = request.params.deckSettings

    if (!deckSettingsData)
        return response.error('deckSettingsData parameter must be provided')

    var deckSettings = new CardsDeckSetting()
    if (deckSettingsData.id) {
        deckSettings.id = deckSettingsData.id
        delete deckSettingsData.id
    }

    deckSettings.save(deckSettingsData).then(function(result) {
        console.log("Success saving deckSettings")
        response.success("Success saving deckSettings")
    }, function(error) {
        console.log("Error saving deckSettings")
        response.error(error)
    })
})

/* Get Saved Info Card for user */
Parse.Cloud.define('GetSavedInfoCards', function(request, response) {
    console.log('GetSavedInfoCards')

    new Parse.Query(SavedInfoCard)
    .limit(1000)
    .equalTo('uid', request.user.id)
    .find()
    .then(function(result) {
            
            var ids = []
            for (var i = 0; i < result.length; i++) {
                var row = result[i].get('cid')
                ids.push(row)
            }

        return new Parse.Query(InfoCard).containedIn('objectId',ids).limit(1000).find()
    }).then(function(results) {
        response.success(results)
    }, function(error) {
        console.log("Erroorrr: " + JSON.stringify(error))
        response.error(error)
    })
})

/* Got Info Card (save as gotted) */
Parse.Cloud.define('GotItInfoCard', function(request, response) {

    console.log('GotItInfoCard')
    var cardSaved = {
        cid:request.params.id,
        uid:request.user.id
    }

    if (!cardSaved.uid || !cardSaved.cid)
        return response.error('cid and uid parameter must be provided')

    new SavedInfoCard().save(cardSaved).then(function(result) {
        console.log("Success saving got card!")
        response.success("Success saving got card!")
    }, function(error) {
        console.log("Error saving got card!")
        response.error(error)
    })
})

/* Increase (card/service)-(showing/click) statistic */
Parse.Cloud.define('IncreaseShowClick', function(request, response) {

    console.log('IncreaseShowClick')

    var increase = request.params.increase
    var increaseQuery
    var curDate = new Date()

    if (!increase.type || !increase.behavior || !increase.obj)
        return response.error('type and behavior and obj parameter must be provided')

    if (increase.type=='card')
            increaseQuery = new InfoCard()
    if (increase.type=='service')
            increaseQuery = new PrService()
    if (increase.behavior=='show') {
         increase.obj.shows.summary++
    }
    if (increase.behavior=='click') {
         increase.obj.clicks.summary++
            //clicks by days
            if(increase.obj.clicks.by_days[0] && increase.obj.clicks.by_days[0].date==curDate.toDateString())
                increase.obj.clicks.by_days[0].summary++
            else 
                increase.obj.clicks.by_days.unshift({
                    "date":curDate.toDateString(),
                    "summary":1
                })
				
    }

    if (increase.obj.objectId) {
        increaseQuery.id = increase.obj.objectId
        delete increase.obj.objectId
    }
    
    increaseQuery.save(increase.obj).then(function(result) {
        console.log("Success increased")
        response.success("Success increased")
    }, function(error) {
        console.log("Error increased")
        response.error(error)
    })

})

/* Get Users for specify provider */
Parse.Cloud.define('GetProviderUsers', function(request, response) {
    var provider_id = request.params.pid
    if (!provider_id)
        return response.error('pid parameter must be provided')

    var getUsersQuery = new Parse.Query(PrUser)
        .limit(1000)
        .equalTo("pid", provider_id)
        .descending('createdAt')
    
    var getProfilesQuery = new Parse.Query(Profile)
        .limit(1000)

    return getUsersQuery.find()
    .then(function(result) {
        var ids = []
            for (var i = 0; i < result.length; i++) {
                var row = result[i].get('uid')
                ids.push(row)
        }

        return getProfilesQuery.containedIn('uid', ids).find()
    }).then(function(results) {
        response.success(results)
    }), function(error) {
        console.log("Erroorrr: " + JSON.stringify(error))
        response.error(error)
    }
})

/* Get Providers for specify user */
Parse.Cloud.define('GetUserProviders', function(request, response) {
    var user_id = request.params.uid
    if (!user_id)
        return response.error('uid parameter must be provided')

    var getUsersQuery = new Parse.Query(PrUser)
        .limit(1000)
        .equalTo("uid", user_id)
        .descending('createdAt')
    
    var getServiceProviderQuery = new Parse.Query(ServiceProvider)
        .limit(1000)

    return getUsersQuery.find()
    .then(function(result) {
        var ids = []
            for (var i = 0; i < result.length; i++) {
                var row = result[i].get('pid')
                ids.push(row)
        }

        return getServiceProviderQuery.containedIn('objectId', ids).find()
    }).then(function(results) {
        response.success(results)
    }), function(error) {
        console.log("Erroorrr: " + JSON.stringify(error))
        response.error(error)
    }
})

/* Remove user allocation from provider */
Parse.Cloud.define('DelProviderUser', function(request, response) {

    console.log('DelProviderUser')
    var pid = request.params.pid
    var uid = request.params.uid
    if (!pid && !uid) return response.error('uid or pid - parameters is required')

    var deletingQuery = new Parse.Query(PrUser)
        if (pid) deletingQuery.equalTo('pid', pid)
        if (uid) deletingQuery.equalTo('uid', uid)
        

    return deletingQuery.limit(1000).find({useMasterKey: true})
        .then(function(results) {
            return Parse.Object.destroyAll(results, {useMasterKey: true})
        }).then(function(success) {
            response.success("Successfully deleted user allocations to provider!")
        }), function(error) {
            console.log(JSON.stringify(error))
            response.error(error)
        }
})

/* Add user allocation to provider */
Parse.Cloud.define('AddProviderUser', function(request, response) {

    console.log('addProviderUser')

    var PrUserSaved = {
        pid:request.params.user.pid,
        uid:request.params.user.uid,
        role:request.params.user.role
    }

    if (!PrUserSaved.pid || !PrUserSaved.uid)
        return response.error('pid and uid parameter must be provided')

    new PrUser().save(PrUserSaved).then(function(result) {
        console.log("Success saving got card!")
        response.success("Success saving got card!")
    }, function(error) {
        console.log("Error saving got card!")
        response.error(error)
    })
})