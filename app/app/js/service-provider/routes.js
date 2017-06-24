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
  .state('sp.account-video', {
    url: '/account-video',
    views: {
      'menuContent': {
        templateUrl: 'service-provider/account/video.html'
      }
    }
  })


  // Branches
  .state('sp.branches', {
    url: '/branches',
    views: {
      'menuContent': {
        templateUrl: 'service-provider/branches/branches.html'
      }
    }
  })
  .state('sp.view-branch', {
    url: '/view-branch',
    params: {'branch':null},
    views: {
      'menuContent': {
        templateUrl: 'service-provider/branches/branch.html'
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

});