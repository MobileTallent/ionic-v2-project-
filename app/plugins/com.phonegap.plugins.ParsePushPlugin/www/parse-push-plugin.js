var serviceName = 'ParsePushPlugin';

var _ = window._ ? window._ : Parse._;

var ParsePushPlugin = {
	 _eventKey: null,
	 _onReceive: function(pn){
         console.log('_onReceive ' + JSON.stringify(pn))
		 //
		 // an eventKey can be registered with the register() function. The eventKey 
		 // will be used to trigger additional callbacks for this app. Let's 
		 // say eventKey is 'evt' and we have just received a push notification 
		 // PN {evt: 'chat', foo:'bar'}, _onReceive will then trigger 
		 // 'receivePN' as well as 'receivePN:chat'.
   	 //
		 // This compartmentalizes the event handling task for various parts of your app
   	 // By default, event key is 'event' but it can be overrided via the register function
		 var base = 'receivePN';
		 this.trigger(base, pn);
		 if(this._eventKey && pn[this._eventKey]){
			 this.trigger(base + ':' + pn[this._eventKey], pn);
		 }
	 },
	 
    registerDevice: function(regParams, successCb, errorCb) {
   	 if(regParams.eventKey) this._eventKey = regParams.eventKey;
   	 
   	 var params = _.extend(regParams, {ecb: serviceName + '.receiveNotification', onOpen: serviceName + '.openNotification'});
       cordova.exec(successCb, errorCb, serviceName, 'registerDevice', [params]);
    },

    getInstallationId: function(successCb, errorCb) {
       cordova.exec(successCb, errorCb, serviceName, 'getInstallationId', []);
    },

    getInstallationObjectId: function(successCb, errorCb) {
       cordova.exec(successCb, errorCb, serviceName, 'getInstallationObjectId', []);
    },

    getSubscriptions: function(successCb, errorCb) {
       cordova.exec(successCb, errorCb, serviceName, 'getSubscriptions',[]);
    },

    subscribe: function(channel, successCb, errorCb) {
       cordova.exec(successCb, errorCb, serviceName, 'subscribe', [ channel ]);
    },

    unsubscribe: function(channel, successCb, errorCb) {
       cordova.exec(successCb, errorCb, serviceName, 'unsubscribe', [ channel ]);
    },
	
	receiveNotification: function(message){
        this._onReceive(message)
	},

    openNotification: function(message){
        this.trigger('openPN', message);
    },
	
	resetBadge: function(successCb, errorCb){
        cordova.exec(successCb, errorCb, serviceName, 'resetBadge', []);
	},
	
	setBadgeNumber: function(value, successCb, errorCb){
        cordova.exec(successCb, errorCb, serviceName, 'setBadgeNumber', [value]);
	}
};

//
// give ParsePushPlugin event handling capability so we can use it to trigger
// push notification onReceive events
module.exports = _.extend(ParsePushPlugin, Parse.Events);