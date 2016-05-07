/**
 * Mocks for Angular services. Simple/common methods are stubbed out here.
 * More complex tests should provide their own implementation of functions.
 *
 * As some mocks require $q which isn't available in the $provide setup,
 * then in the test beforeEach inject function it can be injected then.
 *
 * The _test.js extention ensures it's only compiled into to test builds
 */
import IChatMessage = app.IChatMessage;
import IMatch = app.IMatch;
import IPromise = angular.IPromise;

var mock$state = function($provide) {
	var state = {}
	state['go'] = () => {/**/}
	$provide.value('$state', state)
	return state
}

var mock$ionicHistory = function($provide) {
	var ionicHistory = {}
	$provide.value('$ionicHistory', ionicHistory)
	return ionicHistory
}

var mock$localStorage = function($provide) {
	var localStorage = {}
	$provide.value('$localStorage', localStorage)
	return localStorage
}

var mock$analytics = function($provide) {
	var analytics = { eventTrack: () => {/**/}}
	$provide.value('$analytics', analytics)
	return analytics
}

var mock$translate = function($provide) {
	var translate = { instant: (key) => key}
	$provide.value('$translate', translate)
	return translate
}

var mockAppService = function($provide) {
	var AppService = {}

	$provide.value('AppService', AppService)
	return AppService
}

var mockParseService = function($provide) {
	var ParseService = <app.IParseService>{}
	var $q

	ParseService['inject'] = _$q_ => $q = _$q_

	ParseService.init = ():IPromise<void> => $q.when()
	ParseService.getUserId = () => 'uid'

	ParseService.sendChatMessage = (msg: IChatMessage, match:IMatch): ng.IPromise<IChatMessage> => {
		msg.id = ' '
		msg.match = match
		return $q.when(msg)
	}

	ParseService.rebuildMatches = () => {}

	$provide.value('ParseService', ParseService)
	return ParseService
}


var mockLocalDB = function($provide) {
	var LocalDB = <app.ILocalDBService>{}
	var $q
	LocalDB['inject'] = _$q_ => $q = _$q_

	LocalDB.init = ():IPromise<void> => $q.when()
	LocalDB.getUnreadChats = ():IPromise<any> => $q.when({/**/})
	LocalDB.setChatRead = (chatId:string, read:boolean):IPromise<void> => $q.when()
	LocalDB.saveChatMessage = ():IPromise<boolean> => $q.when(true)

	$provide.value('LocalDB', LocalDB)
	return LocalDB
}

var mockAppUtil = function($provide) {
	var AppUtil = <app.AppUtil>{}

	AppUtil.blockingCall = (promise, success, errorKey) => success(promise)
	AppUtil.toastSimpleTranslate = (msgKey) => {/**/}
	AppUtil.toastSimple = (msg) => {/**/}
	$provide.value('AppUtil', AppUtil)
	return AppUtil
}
