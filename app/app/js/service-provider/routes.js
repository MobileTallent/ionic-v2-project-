angular.module('sp.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider

  .state('sp-welcome', {
    url: '/sp-welcome',
    params: { provider:null },
    templateUrl: 'service-provider/welcome/welcome.html',
  })

  .state('sp', {
    url: '/sp',
    abstract: true,
    templateUrl: 'service-provider/layout/menu.html'
  })
  
  .state('sp.home', {
    url: '/home',
    views: {
      'menuContent': {
        templateUrl: 'service-provider/home/home.html'
      }
    }
  })

  //Manage Account
  .state('sp.manage-account', {
    url: '/manage-account',
    views: {
      'menuContent': {
        templateUrl: 'service-provider/account/manage-account.html'
      }
    }
  })
  .state('sp.edit-account', {
    url: '/edit-account',
    views: {
      'menuContent': {
        templateUrl: 'service-provider/account/edit-account.html'
      }
    }
  })
  .state('sp.account-contacts', {
    url: '/account-contacts',
    views: {
      'menuContent': {
        templateUrl: 'service-provider/account/contacts.html'
      }
    }
  })
  .state('sp.account-balance', {
    url: '/account-balance',
    views: {
      'menuContent': {
        templateUrl: 'service-provider/account/balance.html'
      }
    }
  })
  .state('sp.account-branches', {
    url: '/account-branches',
    views: {
      'menuContent': {
        templateUrl: 'service-provider/account/branches.html'
      }
    }
  })
  .state('sp.account-video', {
    url: '/account-video',
    views: {
      'menuContent': {
        templateUrl: 'service-provider/account/video.html'
      }
    }
  })
  .state('sp.edit-branch', {
    url: '/edit-branch',
    views: {
      'menuContent': {
        templateUrl: 'service-provider/account/edit-branch.html'
      }
    }
  })
  .state('sp.add-service-2', {
    url: '/add-service-2',
    views: {
      'menuContent': {
        templateUrl: 'service-provider/account/add-service-2.html'
      }
    }
  })
  .state('sp.edit-user', {
    url: '/edit-user',
    views: {
      'menuContent': {
        templateUrl: 'service-provider/account/edit-user.html'
      }
    }
  })



  // Services
  .state('sp.my-services', {
    url: '/my-services',
    views: {
      'menuContent': {
        templateUrl: 'service-provider/services/services.html'
      }
    }
  })
  .state('sp.view-service', {
    url: '/view-service',
    params: {service:null},
    views: {
      'menuContent': {
        templateUrl: 'service-provider/services/service.html'
      }
    }
  })



  // Info cards
  .state('sp.info-cards', {
    url: '/info-cards',
    views: {
      'menuContent': {
        templateUrl: 'service-provider/info-cards/info-cards.html'
      }
    }
  })
  .state('sp.view-card', {
    url: '/view-card',
    params: {info_card:null},
    views: {
      'menuContent': {
        templateUrl: 'service-provider/info-cards/info-card.html'
      }
    }
  })
 

  // Enquires
  .state('sp.enquiries', {
    url: '/enquiries',
    views: {
      'menuContent': {
        templateUrl: 'service-provider/enquiries/enquiries.html'
      }
    }
  })
  .state('sp.view-enquire', {
    url: '/view-enquire',
    params: {'enquire':null},
    views: {
      'menuContent': {
        templateUrl: 'service-provider/enquiries/view-enquire.html'
      }
    }
  })

  // Users
  .state('sp.users', {
    url: '/users',
    views: {
      'menuContent': {
        templateUrl: 'service-provider/users/users.html'
      }
    }
  })

  //HotBeds
  .state('sp.hot-beds', {
    url: '/hot-beds',
    views: {
      'menuContent': {
        templateUrl: 'service-provider/hot-beds/hot-beds.html'
      }
    }
  })
  .state('sp.view-hotbed', {
    url: '/view-hotbed',
    params: {'hot_bed':null},
    views: {
      'menuContent': {
        templateUrl: 'service-provider/hot-beds/hot-bed.html'
      }
    }
  })


  //Settings
  .state('sp.help-faq', {
    url: '/help-faq',
    views: {
      'menuContent': {
        templateUrl: 'service-provider/help-faq/help-faq.html'
      }
    }
  })

  //Other
  .state('sp.video', {
    url: '/video',
    views: {
      'menuContent': {
        templateUrl: 'service-provider/other/video.html'
      }
    }
  })
  .state('sp.audience', {
    url: '/audience',
    views: {
      'menuContent': {
        templateUrl: 'service-provider/other/audience.html'
      }
    }
  })
  .state('sp.sorting-options', {
    url: '/sorting-options',
    views: {
      'menuContent': {
        templateUrl: 'service-provider/other/sorting-options.html'
      }
    }
  })


  // .state('setLocation', {
  //   url: '/location',
  //   templateUrl: 'templates/setLocation.html',
  //   controller: 'setLocationCtrl'
  // })

  // .state('menu.getACorprorateAccount', {
  //   url: '/get-corporate',
  //   views: {
  //     'side-menu21': {
  //       templateUrl: 'templates/getACorprorateAccount.html',
  //       controller: 'getACorprorateAccountCtrl'
  //     }
  //   }
  // })

  // .state('menu.upgradeAccount', {
  //   url: '/upgrade-account',
  //   views: {
  //     'side-menu21': {
  //       templateUrl: 'templates/upgradeAccount.html',
  //       controller: 'upgradeAccountCtrl'
  //     }
  //   }
  // })
  

});