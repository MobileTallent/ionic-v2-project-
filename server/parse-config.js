// If you need a more sophisticated configuration setup then consider using https://www.npmjs.com/package/nconf

var GCSAdapter = require('parse-server-gcs-adapter')

var config = require('./config.js')

// Determine which environmental configuration we should be using.
// GAE sets the NODE_ENV environmental to 'production' but we might be using a project as a QA environment
// so use the GAE_LONG_APP_ID environment variable to match the configuration

var env = process.env.ENV || 'dev' // default to dev when ENV or GAE_LONG_APP_ID isn't set

var gaeId = process.env.GAE_LONG_APP_ID
config.environments.forEach(e => {
	if(!config[e]) return console.error(e + ' configuration doesnt exist in config.json. Should be dev, qa, prod etc')
	if(config[e].gcpProjectId && config[e].gcpProjectId === gaeId) {
		env = e
	}
})
var envConfig = config[env]
console.log('Using ' + env + ' configuration')

if(!envConfig.serverUrl)
	throw 'serverUrl is required in ' + env + ' configuration in config.json'

// Google App Engine requires port 8080 which is set in the app.yaml
var port = process.env.PORT || 1337

var parseConfig = {

	// Config that is common to all environments
	appId: config.appId,
	masterKey: config.masterKey,
	serverURL: 'http://localhost:' + port + config.parseMount,
	cloud: 'cloud/main.js',
	databaseURI: envConfig.databaseURI,

	// https://github.com/ParsePlatform/parse-server/wiki/OAuth
	oauth: {},

	// https://github.com/ParsePlatform/parse-server/wiki/Push
	push: {}

	// https://github.com/ParsePlatform/parse-server/wiki/Parse-LiveQuery
	// You will also need to uncomment the line ParseServer.createLiveQueryServer(httpServer) in index.js to enable LiveQuery
	// liveQuery: {
	// 	classNames: ['Match', 'ChatMessage']
	// }
}

// GAE File adapter config https://github.com/ParsePlatform/parse-server/wiki/Configuring-File-Adapters
// App Engine has a default storage bucket which you must enable, and the first 5GB is free
if(gaeId)
	parseConfig.filesAdapter = new GCSAdapter(
		envConfig.gcpProjectId,
		envConfig.gcpKeyFile,
		envConfig.gcpProjectId + '.appspot.com',
		{directAccess: true}
	)

if(config.facebookAppId) {
	console.log('Configuring Facebook authentication for app Id', config.facebookAppId)
	parseConfig.oauth.facebook = { appIds: [config.facebookAppId] }
}

// Configure Push notifications - see https://github.com/ParsePlatform/Parse-Server/wiki/Push for more details
/*
push: {
	android: {
		senderId: '...',
		apiKey: '...'
	},
	ios: {
		pfx: '/file/path/to/XXX.p12',
			passphrase: '', // optional password to your p12/PFX
			bundleId: '',
			production: false
	}
}
*/
// Just use the GCM key from the production project for all environments so we only need the one apiKey
if(config.prod && config.prod.gcpProjectNumber && config.gcpServerKey)
	parseConfig.push.android = {
		senderId: config.prod.gcpProjectNumber,
		apiKey: config.gcpServerKey
	}
else
	console.log('Unable to configure push notification for Android')

if(config.devP12file && config.appId)
	parseConfig.push = {
		pfx: config.devP12file,
		passphrase: config.devP12passphrase, // optional password to your p12/PFX
		bundleId: config.appId,
		production: false
	}
else
	console.log('Unable to configure development push notification for iOS')

if(config.prodP12file && config.appId)
	parseConfig.push = {
		pfx: config.prodP12file,
		passphrase: config.prodP12passphrase, // optional password to your p12/PFX
		bundleId: config.appId,
		production: true
	}
else
	console.log('Unable to configure production push notification for iOS')



module.exports = parseConfig
