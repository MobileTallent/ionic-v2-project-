// If you need a more sophisticated configuration setup then consider using https://www.npmjs.com/package/nconf

var parseConfig = {
	serverURL: 'http://localhost:1337/parse',
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

// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in parseConfig:
// javascriptKey, restAPIKey, dotNetKey, clientKey

// Now configure the environmental specific values

// Default to dev config if no value is provided
var env = process.env.CONFIG || 'dev'


if(env === 'dev') {
	parseConfig.databaseURI = 'mongodb://localhost:27017/devdb'
	parseConfig.appId = '<APP_ID>'
	parseConfig.masterKey = '<MASTER_KEY>'

} else if(env === 'prod') {
	parseConfig.databaseURI = 'mongodb://<PROD_DB>:27017/proddb'
	parseConfig.appId = '<APP_ID>'
	parseConfig.masterKey = '<MASTER_KEY>'

} else {
	console.error('Invalid CONFIG value', env)
}


module.exports = parseConfig
