describe('AppUtil', function() {

	beforeEach(module('AppUtil',function ($provide, $translateProvider) {
		$translateProvider.translations('en', TRANSLATION_EN)
		$translateProvider.preferredLanguage('en')
	}))

	var $q, $log, $rootScope

	beforeEach(inject(function(_$q_, _$log_, _$rootScope_){
		$q = _$q_
		$log = _$log_
		$rootScope = _$rootScope_
	}))


	it('toastSimpleTranslate with a valid translation key calls toastSimple', inject(AppUtil => {
		spyOn(AppUtil, 'toastSimple')
		AppUtil.toastSimpleTranslate('SAVE')
		$rootScope.$digest()
		expect(AppUtil.toastSimple).toHaveBeenCalledWith('Save')
	}))

	it('Invalid translation key to toastSimpleTranslate logs a warning', inject(AppUtil => {
		spyOn($log, 'warn')
		spyOn(AppUtil, 'toastSimple')
		AppUtil.toastSimpleTranslate('JUNK_KEY')
		$rootScope.$digest()
		expect($log.warn).toHaveBeenCalled()
		expect(AppUtil.toastSimple).toHaveBeenCalledWith('JUNK_KEY')
	}))

	it('Custom Parse error translation', inject(AppUtil => {
		let msg = AppUtil.resolveErrorMessage(new Parse.Error(155 , 'message'))
		expect(msg).toBe('Server busy, try again later')
	}))

	it('Blocking call with custom error message', inject(AppUtil => {
		spyOn(AppUtil, 'toastSimple')
		// 155 = Parse.ErrorCode.REQUEST_LIMIT_EXCEEDED
		AppUtil.blockingCall($q.reject(new Parse.Error(155,'')), () => {}, 'JUNK_KEY')
		$rootScope.$digest()
		expect(AppUtil.toastSimple).toHaveBeenCalledWith('Server busy, try again later')
	}))

})