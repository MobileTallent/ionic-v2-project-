// monkey patch an IOS8 problem
// https://github.com/angular/angular.js/issues/9128#issuecomment-120046653

app.config(['$provide', function($provide){
		'use strict';

		var isSafari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);

		if(isSafari) {
			$provide.decorator('$rootScope', ['$delegate', function($rootScope) {
				var scopePrototype = Object.getPrototypeOf($rootScope);
				var originalScopeNew = scopePrototype.$new;
				scopePrototype.$new = function () {
					try {
						return originalScopeNew.apply(this, arguments);
					} catch(e) {
						console.error(e);
						throw e;
					}
				};
				return $rootScope;
			}]);
		}
	}]);