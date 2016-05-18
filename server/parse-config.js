// If you need a more sophisticated configuration setup then consider using https://www.npmjs.com/package/nconf

// Google App Engine requires port 8080 which is set in the app.yaml
var port = process.env.PORT || 1337

var parseConfig = {

	// Config that is common to all environments
	appId: process.env.APP_ID || '<APP_ID>',
	masterKey: process.env.MASTER_KEY || '<MASTER_KEY>', //Add your master key here. Keep it secret!
	serverURL: 'http://localhost:' + port + '/parse',
	cloud: 'cloud/main.js',

	// https://github.com/ParsePlatform/parse-server/wiki/OAuth
	// oauth: {
	// 	facebook: {
	// 		appIds: ''
	// 	}
	// },

	// https://github.com/ParsePlatform/parse-server/wiki/Push
	// pushConfig: {
	// 	android: {
	// 		senderId: '',
	// 		apiKey: ''
	// 	},
	// 	ios: {
	// 		pfx: '/file/path/to/XXX.p12',
	// 		bundleId: '',
	// 		production: false
	// 	}
	// },

	// https://github.com/ParsePlatform/parse-server/wiki/Parse-LiveQuery
	// You will also need to uncomment the line ParseServer.createLiveQueryServer(httpServer) in index.js to enable LiveQuery
	// liveQuery: {
	// 	classNames: ['Match', 'ChatMessage']
	// }
}


// Now configure the environmental specific values

// Google App Engine setup
// GAE_LONG_APP_ID is set to the Project ID associated with your application, which is visible in the Google Cloud Platform Console.
// For GAE specific environmental setup see https://cloud.google.com/appengine/docs/flexible/nodejs/runtime
// GAE sets the NODE_ENV environmental to 'production' but we might be using a project as a QA environment so use the GAE_LONG_APP_ID to distinguish
var QA_ID = '<QA_PROJECT_ID>' // for example 'myapp-qa'
var PROD_ID = '<QA_PROJECT_ID>' // for example 'myapp-prod'

// Default to dev config if no value is provided
var env = process.env.ENV || 'dev'

if(QA_ID === process.env.GAE_LONG_APP_ID)
	env = 'qa'
else if(PROD_ID === process.env.GAE_LONG_APP_ID)
	env = 'prod'

if(process.env.GAE_LONG_APP_ID)
	console.log('process.env.GAE_LONG_APP_ID: ' + process.env.GAE_LONG_APP_ID)
console.log('Using ' + env + ' configuration')

if(env === 'dev') {
	parseConfig.databaseURI = 'mongodb://localhost:27017/mydb'
} else if(env === 'qa') {
	parseConfig.databaseURI = 'mongodb://<QA_DB>:27017/mydb'
} else if(env === 'prod') {
	parseConfig.databaseURI = 'mongodb://<PROD_DB>:27017/mydb'
} else {
	console.error('Invalid env value', env)
}


module.exports = parseConfig
